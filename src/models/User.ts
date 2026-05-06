import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "customer";
  address?: IAddress;
  resetToken?: string;
  resetTokenExpiry?: Date;
  emailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  referralCode?: string;
  referralEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: "South Africa" },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "customer"], default: "customer" },
    address: { type: AddressSchema, required: false },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    emailVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationCodeExpiry: { type: Date },
    referralCode: { type: String, unique: true, sparse: true },
    referralEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
