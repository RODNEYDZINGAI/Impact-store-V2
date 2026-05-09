import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IQuoteProduct {
  product: Types.ObjectId;
  name: string;
  quantityMin?: number;
  quantityMax?: number;
}

export interface IQuoteRequest extends Document {
  products: IQuoteProduct[];
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  status: "new" | "contacted" | "quoted" | "won" | "lost" | "archived";
  source?: string;
  variant?: string;
  budget?: string;
  timeline?: string;
  assignedAdmin?: Types.ObjectId;
  quotedPrice?: number;
  quotedNotes?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuoteProductSchema = new Schema<IQuoteProduct>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    quantityMin: { type: Number, min: 1 },
    quantityMax: { type: Number, min: 1 },
  },
  { _id: false }
);

const QuoteRequestSchema = new Schema<IQuoteRequest>(
  {
    products: { type: [QuoteProductSchema], default: [] },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true, maxlength: 120 },
    message: { type: String, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["new", "contacted", "quoted", "won", "lost", "archived"],
      default: "new",
    },
    source: { type: String, trim: true },
    variant: { type: String, trim: true },
    budget: { type: String, trim: true },
    timeline: { type: String, trim: true },
    assignedAdmin: { type: Schema.Types.ObjectId, ref: "User" },
    quotedPrice: { type: Number, min: 0 },
    quotedNotes: { type: String, trim: true, maxlength: 4000 },
    adminNotes: { type: String, trim: true, maxlength: 4000 },
  },
  { timestamps: true }
);

const QuoteRequest: Model<IQuoteRequest> =
  mongoose.models.QuoteRequest ||
  mongoose.model<IQuoteRequest>("QuoteRequest", QuoteRequestSchema);

export default QuoteRequest;
