import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IRefundNote {
  text: string;
  createdAt: Date;
}

export interface IRefundOrderSnapshot {
  total: number;
  subtotal: number;
  discount: number;
  items: Array<{
    name: string;
    sku?: string;
    price: number;
    quantity: number;
    image?: string;
    variantTitle?: string;
  }>;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    phone: string;
  };
  status: string;
  paymentStatus: string;
  paymentId?: string;
  couponCode?: string;
  orderCreatedAt: Date;
}

export interface IRefundCase extends Document {
  order: Types.ObjectId;
  status: "open" | "resolved" | "denied";
  reason?: string;
  noteEntries: IRefundNote[];
  orderSnapshot: IRefundOrderSnapshot;
  initiatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RefundNoteSchema = new Schema<IRefundNote>(
  { text: { type: String, required: true }, createdAt: { type: Date, required: true } },
  { _id: false }
);

const RefundCaseSchema = new Schema<IRefundCase>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    status: {
      type: String,
      enum: ["open", "resolved", "denied"],
      default: "open",
    },
    reason: { type: String },
    noteEntries: [RefundNoteSchema],
    orderSnapshot: {
      total: Number,
      subtotal: Number,
      discount: Number,
      items: [
        {
          _id: false,
          name: String,
          sku: String,
          price: Number,
          quantity: Number,
          image: String,
          variantTitle: String,
        },
      ],
      shippingAddress: {
        _id: false,
        fullName: String,
        address: String,
        city: String,
        province: String,
        postalCode: String,
        phone: String,
      },
      status: String,
      paymentStatus: String,
      paymentId: String,
      couponCode: String,
      orderCreatedAt: Date,
    },
    initiatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const RefundCase: Model<IRefundCase> =
  mongoose.models.RefundCase ||
  mongoose.model<IRefundCase>("RefundCase", RefundCaseSchema);

export default RefundCase;
