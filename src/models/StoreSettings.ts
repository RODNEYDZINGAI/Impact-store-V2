import mongoose, { Document, Model, Schema } from "mongoose";

export interface IStoreSettings extends Document {
  key: "default";
  couponsEnabled: boolean;
  referralsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    key: {
      type: String,
      enum: ["default"],
      default: "default",
      required: true,
      unique: true,
    },
    couponsEnabled: { type: Boolean, default: false },
    referralsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const StoreSettings: Model<IStoreSettings> =
  mongoose.models.StoreSettings ||
  mongoose.model<IStoreSettings>("StoreSettings", StoreSettingsSchema);

export default StoreSettings;
