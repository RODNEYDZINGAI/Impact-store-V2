import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const condition = searchParams.get("condition");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");

    const filter: Record<string, unknown> = {
      $or: [{ published: true }, { published: { $exists: false } }],
    };
    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (featured === "true") filter.featured = true;
    if (search) {
      filter.$and = [
        { $or: [{ published: true }, { published: { $exists: false } }] },
        {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { brand: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        },
      ];
      delete filter.$or;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json(
    { error: "Use /api/admin/products to manage products" },
    { status: 405 }
  );
}
