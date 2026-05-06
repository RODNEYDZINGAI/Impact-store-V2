import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  subtitle?: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: "Phones" | "Tablets" | "Laptops" | "Accessories" | "IT Hardware" | "Security & Access Control";
  condition: "New" | "Refurbished" | "Used";
  brand: string;
  images: string[];
  specs: Map<string, string>;
  stock: number;
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sku: { type: String, unique: true, sparse: true },
    subtitle: { type: String },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    category: {
      type: String,
      required: true,
      enum: ["Phones", "Tablets", "Laptops", "Accessories", "IT Hardware", "Security & Access Control"],
    },
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
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
