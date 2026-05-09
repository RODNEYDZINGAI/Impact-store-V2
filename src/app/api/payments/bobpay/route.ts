import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import StoreSettings from "@/models/StoreSettings";
import User from "@/models/User";
import { createPaymentLink } from "@/lib/bobpay";
import {
  calculateCheckoutPricing,
  CheckoutPricingError,
} from "@/lib/checkout-pricing";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    const items = Array.isArray(body.items) ? body.items : [];
    const productIds = [...new Set<string>(
      items
        .map((item: { product?: unknown }) =>
          typeof item.product === "string" ? item.product : ""
        )
        .filter((productId: string) => Types.ObjectId.isValid(productId))
        .filter(Boolean)
    )];
    const [products, settings] = await Promise.all([
      Product.find({ _id: { $in: productIds } }),
      StoreSettings.findOne({ key: "default" }),
    ]);

    const pricing = await calculateCheckoutPricing({
      items,
      products,
      currentUserId: session.user.id,
      referralCode: body.referralCode,
      couponCode: body.couponCode,
      settings,
      resolveReferral: async (code) => {
        const user = await User.findOne({
          referralCode: code,
          referralEnabled: true,
        }).select("_id referralCode referralEnabled");

        if (!user) return null;

        return {
          id: user._id.toString(),
          code: user.referralCode!,
          enabled: user.referralEnabled,
        };
      },
    });

    // Deduct stock using atomic operations
    const deductedItems: { product: string; quantity: number }[] = [];
    for (const item of pricing.orderItems) {
      const result = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!result) {
        // Race condition: stock changed between check and update. Roll back prior deductions.
        for (const prevItem of deductedItems) {
          await Product.findByIdAndUpdate(prevItem.product, {
            $inc: { stock: prevItem.quantity },
          });
        }
        return NextResponse.json(
          { error: `${item.name} just went out of stock. Please try again.` },
          { status: 409 }
        );
      }
      deductedItems.push({ product: item.product, quantity: item.quantity });
    }

    // Create the order
    const order = new Order({
      user: session.user.id,
      items: pricing.orderItems.map((item) => ({
        ...item,
        product: new Types.ObjectId(item.product),
      })),
      shippingAddress: body.shippingAddress,
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      total: pricing.total,
      status: "pending",
      paymentStatus: "unpaid",
      referralCode: pricing.referralCode,
    });
    await order.save();

    const orderId = String(order._id);

    const payment = await createPaymentLink({
      orderId,
      amount: pricing.total,
      email: session.user.email!,
      itemName: `Megabyte Order #${orderId.slice(-6).toUpperCase()}`,
      itemDescription: pricing.itemNames,
    });

    return NextResponse.json({
      orderId: order._id,
      paymentUrl: payment.url,
      pricing: {
        subtotal: pricing.subtotal,
        shipping: pricing.shipping,
        discount: pricing.discount,
        total: pricing.total,
        referralCode: pricing.referralCode,
      },
    });
  } catch (error) {
    if (error instanceof CheckoutPricingError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
