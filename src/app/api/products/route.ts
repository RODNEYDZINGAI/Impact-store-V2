import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { buildTaxonomyProductFilter, mergeMongoFilters } from "@/lib/product-filters";
import { getCategoryTaxonomy } from "@/models/CategoryTaxonomy";
import Product from "@/models/Product";
import { generateProductSku, generateVariantSku } from "@/lib/sku";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const categorySlug = searchParams.get("categorySlug");
    const subcategory = searchParams.get("subcategory");
    const condition = searchParams.get("condition");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");

    const taxonomy = await getCategoryTaxonomy();
    const filters: Record<string, unknown>[] = [
      buildTaxonomyProductFilter(taxonomy, { category, categorySlug, subcategory }),
    ];

    if (condition) filters.push({ condition });
    if (featured === "true") filters.push({ featured: true });
    if (search) {
      filters.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
          { subcategory: { $regex: search, $options: "i" } },
        ],
      });
    }

    const products = await Product.find(mergeMongoFilters(...filters)).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    // Auto-generate SKU if not provided
    if (!body.sku || !body.sku.trim()) {
      body.sku = await generateProductSku();
    }

    // Auto-generate variant SKUs if any are missing
    if (Array.isArray(body.variants)) {
      for (let i = 0; i < body.variants.length; i++) {
        if (!body.variants[i].sku || !body.variants[i].sku.trim()) {
          body.variants[i].sku = await generateVariantSku(body.sku, i);
        }
      }
    }

    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Products POST error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
