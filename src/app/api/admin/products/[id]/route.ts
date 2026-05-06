import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { pickProductUpdate, validateProductInput } from "@/lib/product-validation";

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Admin product GET error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const existing = await Product.findById(id).lean();
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = pickProductUpdate(await req.json());
    if (!Object.keys(body).length) {
      return NextResponse.json({ error: "No valid product fields provided" }, { status: 400 });
    }

    const merged = {
      ...existing,
      ...body,
      specs: body.specs ?? existing.specs,
      images: body.images ?? existing.images,
    };
    const result = validateProductInput(merged);

    if (!result.product) {
      return NextResponse.json({ errors: result.errors, warnings: result.warnings }, { status: 400 });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: result.product },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ product, warnings: result.warnings });
  } catch (error) {
    const message = duplicateMessage(error);
    if (message) return NextResponse.json({ error: message }, { status: 409 });

    console.error("Admin product PUT error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Admin product DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
