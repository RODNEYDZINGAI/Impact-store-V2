import mongoose, { Schema, Document, Model } from "mongoose";

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export interface IProductVariant {
  variantId: string;
  sku: string;
  title: string;
  price: number;
  originalPrice?: number;
  stock: number;
  condition?: "New" | "Refurbished" | "Used";
  attributes: Record<string, string>;
  images?: string[];
  published: boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  subtitle?: string;
  sourceUrl?: string;
  supplier?: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  categorySlug?: string;
  subcategory?: string;
  condition: "New" | "Refurbished" | "Used";
  brand: string;
  images: string[];
  specs: Map<string, string>;
  stock: number;
  featured: boolean;
  published: boolean;
  variants?: IProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    variantId: { type: String, required: true },
    sku: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    stock: { type: Number, required: true, default: 0 },
    condition: { type: String, enum: ["New", "Refurbished", "Used"] },
    attributes: { type: Map, of: String, default: {} },
    images: [{ type: String }],
    published: { type: Boolean, default: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sku: { type: String, unique: true, sparse: true },
    subtitle: { type: String },
    sourceUrl: {
      type: String,
      trim: true,
      validate: {
        validator: (value?: string) => !value || isValidHttpUrl(value),
        message: "Source URL must be a valid HTTP or HTTPS URL",
      },
    },
    supplier: { type: String, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    category: { type: String, required: true, trim: true },
    categorySlug: { type: String, trim: true, index: true },
    subcategory: { type: String, trim: true, index: true },
    condition: {
      type: String,
      required: true,
      enum: ["New", "Refurbished", "Used"],
    },
    brand: { type: String, required: true },
    images: [{ type: String }],
    specs: { type: Map, of: String, default: {} },
    stock: { type: Number, required: true, default: 0 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    variants: [ProductVariantSchema],
  },
  { timestamps: true }
);

ProductSchema.index({ category: 1, categorySlug: 1, subcategory: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
