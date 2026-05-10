import mongoose, { Document, Model, Schema } from "mongoose";
import {
  CategoryTaxonomyItem,
  DEFAULT_CATEGORY_TAXONOMY,
  normalizeTaxonomy,
} from "@/lib/category-taxonomy";

export interface ICategoryTaxonomy extends Document {
  key: "default";
  categories: CategoryTaxonomyItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CategorySubcategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    legacyCategory: { type: String, trim: true },
  },
  { _id: false }
);

const CategoryTaxonomyItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    legacyCategories: [{ type: String, trim: true }],
    defaultLegacyCategory: { type: String, required: true, trim: true },
    subcategories: { type: [CategorySubcategorySchema], default: [] },
  },
  { _id: false }
);

const CategoryTaxonomySchema = new Schema<ICategoryTaxonomy>(
  {
    key: { type: String, enum: ["default"], default: "default", unique: true },
    categories: { type: [CategoryTaxonomyItemSchema], default: DEFAULT_CATEGORY_TAXONOMY },
  },
  { timestamps: true }
);

const CategoryTaxonomy: Model<ICategoryTaxonomy> =
  mongoose.models.CategoryTaxonomy ||
  mongoose.model<ICategoryTaxonomy>("CategoryTaxonomy", CategoryTaxonomySchema);

export async function getCategoryTaxonomy() {
  const doc = await CategoryTaxonomy.findOne({ key: "default" }).lean<{ categories?: CategoryTaxonomyItem[] }>();
  return normalizeTaxonomy(doc?.categories?.length ? doc.categories : DEFAULT_CATEGORY_TAXONOMY);
}

export async function saveCategoryTaxonomy(categories: CategoryTaxonomyItem[]) {
  const normalized = normalizeTaxonomy(categories);
  const doc = await CategoryTaxonomy.findOneAndUpdate(
    { key: "default" },
    { $set: { categories: normalized } },
    { new: true, upsert: true }
  );
  return normalizeTaxonomy(doc.categories);
}

export default CategoryTaxonomy;
