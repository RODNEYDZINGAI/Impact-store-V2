import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { normalizeTaxonomy } from "@/lib/category-taxonomy";
import { getCategoryTaxonomy, saveCategoryTaxonomy } from "@/models/CategoryTaxonomy";

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ categories: await getCategoryTaxonomy() });
  } catch (error) {
    console.error("Category taxonomy GET error:", error);
    return NextResponse.json({ error: "Failed to fetch category taxonomy" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!Array.isArray(body.categories)) {
      return NextResponse.json({ error: "categories must be an array" }, { status: 400 });
    }

    const categories = normalizeTaxonomy(body.categories);
    const categorySlugs = new Set<string>();
    for (const category of categories) {
      if (categorySlugs.has(category.slug)) {
        return NextResponse.json({ error: `Duplicate category slug: ${category.slug}` }, { status: 400 });
      }
      categorySlugs.add(category.slug);

      const subcategorySlugs = new Set<string>();
      for (const subcategory of category.subcategories) {
        if (subcategorySlugs.has(subcategory.slug)) {
          return NextResponse.json({ error: `Duplicate subcategory slug in ${category.name}: ${subcategory.slug}` }, { status: 400 });
        }
        subcategorySlugs.add(subcategory.slug);
      }
    }

    await dbConnect();
    return NextResponse.json({ categories: await saveCategoryTaxonomy(categories) });
  } catch (error) {
    console.error("Category taxonomy PUT error:", error);
    return NextResponse.json({ error: "Failed to update category taxonomy" }, { status: 500 });
  }
}
