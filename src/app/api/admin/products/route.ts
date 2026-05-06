import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { validateProductInput } from "@/lib/product-validation";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return Boolean(session && session.user.role === "admin");
}

function duplicateMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  ) {
    const keyPattern = (error as { keyPattern?: Record<string, number> }).keyPattern;
    const field = keyPattern ? Object.keys(keyPattern)[0] : "field";
    return `A product with this ${field} already exists.`;
  }
  return undefined;
}

export async function GET(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const condition = searchParams.get("condition");
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (status === "published") filter.published = { $ne: false };
    if (status === "unpublished") filter.published = false;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Admin products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const result = validateProductInput(body);

    if (!result.product) {
      return NextResponse.json({ errors: result.errors, warnings: result.warnings }, { status: 400 });
    }

    const product = await Product.create(result.product);
    return NextResponse.json({ product, warnings: result.warnings }, { status: 201 });
  } catch (error) {
    const message = duplicateMessage(error);
    if (message) return NextResponse.json({ error: message }, { status: 409 });

    console.error("Admin products POST error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
