import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadToR2, getR2KeyFromUrl } from "@/lib/r2";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const slug = formData.get("slug") as string;
    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    const files = formData.getAll("files") as File[];
    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Count existing images for this slug in R2 to continue numbering
    await dbConnect();
    const existingProducts = await Product.find({ slug }).lean();
    const existingImageCount = existingProducts.reduce(
      (acc, p) => acc + (p.images?.length || 0),
      0
    );

    const urls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed: JPG, PNG, WebP` },
          { status: 400 }
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${file.name} (max 5MB)` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";

      // Sequential numbering: 001, 002, 003…  — keeps images ordered
      const number = String(existingImageCount + i + 1).padStart(3, "0");
      const key = `products/${slug}/${number}.${ext}`;

      const url = await uploadToR2(buffer, key, file.type);
      urls.push(url);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
