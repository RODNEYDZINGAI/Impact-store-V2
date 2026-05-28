import mongoose, { Document, Model, Schema } from "mongoose";

export type PromotionDiscountType = "percentage" | "fixed";

export interface IPromotion extends Document {
  code: string;
  name: string;
  description?: string;
  discountType: PromotionDiscountType;
  value: number;
  minOrderAmount: number;
  maxUses?: number;
  usedCount: number;
  startsAt?: Date;
  endsAt?: Date;
  active: boolean;
  stackable: boolean;
  eligibleProductIds: string[];
  excludedProductIds: string[];
  eligibleCategorySlugs: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PromotionSchema = new Schema<IPromotion>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator(this: unknown, value: number) {
          const promotion = this as Partial<IPromotion>;
          return promotion.discountType !== "percentage" || value <= 100;
        },
        message: "Percentage promotions cannot exceed 100%",
      },
    },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxUses: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    startsAt: { type: Date, index: true },
    endsAt: {
      type: Date,
      index: true,
      validate: {
        validator(this: unknown, value?: Date) {
          const promotion = this as Partial<IPromotion>;
          return !value || !promotion.startsAt || value > promotion.startsAt;
        },
        message: "End date must be after start date",
      },
    },
    active: { type: Boolean, default: true, index: true },
    stackable: { type: Boolean, default: false },
    eligibleProductIds: [{ type: String, trim: true }],
    excludedProductIds: [{ type: String, trim: true }],
    eligibleCategorySlugs: [{ type: String, trim: true, lowercase: true }],
  },
  { timestamps: true }
);

PromotionSchema.index({ active: 1, startsAt: 1, endsAt: 1 });

const Promotion: Model<IPromotion> =
  mongoose.models.Promotion ||
  mongoose.model<IPromotion>("Promotion", PromotionSchema);

export default Promotion;
