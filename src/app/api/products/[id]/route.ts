import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const product = await Product.findOne({
      _id: id,
      $or: [{ published: true }, { published: { $exists: false } }],
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("Product GET error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT() {
  return NextResponse.json(
    { error: "Use /api/admin/products/[id] to manage products" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Use /api/admin/products/[id] to manage products" },
    { status: 405 }
  );
}
