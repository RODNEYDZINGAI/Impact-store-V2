import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  image: string;
  variantId?: string;
  variantTitle?: string;
}

export interface IShippingAddress {
  fullName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
}

export interface IOrderNote {
  text: string;
  createdAt: Date;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  discount: number;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  paymentStatus: "unpaid" | "paid" | "failed" | "cancelled" | "refunded";
  paymentId: string;
  bobpayUuid: string;
  referralCode?: string;
  referrer?: Types.ObjectId;
  referralDiscount: number;
  couponCode?: string;
  couponDiscount: number;
  promotionsRecorded: boolean;
  notes?: string;
  noteEntries: IOrderNote[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        sku: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String },
        variantId: { type: String },
        variantTitle: { type: String },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed", "cancelled", "refunded"],
      default: "unpaid",
    },
    paymentId: { type: String },
    bobpayUuid: { type: String },
    referralCode: { type: String },
    referrer: { type: Schema.Types.ObjectId, ref: "User" },
    referralDiscount: { type: Number, default: 0 },
    couponCode: { type: String },
    couponDiscount: { type: Number, default: 0 },
    promotionsRecorded: { type: Boolean, default: false },
    notes: { type: String },
    noteEntries: [
      new Schema<IOrderNote>(
        { text: { type: String, required: true }, createdAt: { type: Date, required: true } },
        { _id: false }
      ),
    ],
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
