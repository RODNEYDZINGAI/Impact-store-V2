import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import StoreSettings from "@/models/StoreSettings";
import User from "@/models/User";
import Coupon from "@/models/Coupon";
import { createPayFastRedirectUrl } from "@/lib/payfast";
import {
  calculateCheckoutPricing,
  CheckoutPricingError,
} from "@/lib/checkout-pricing";

function getPublicBaseUrl(req: NextRequest) {
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || req.headers.get("host")?.split(",")[0]?.trim();
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto = forwardedProto || (host?.startsWith("localhost") ? "http" : "https");

  if (!host) {
    return process.env.NEXT_PUBLIC_BASE_URL?.trim();
  }

  return `${proto}://${host}`;
}

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
      resolveCoupon: async (code) => {
        const coupon = await Coupon.findOne({ code });
        if (!coupon) return null;

        return {
          code: coupon.code,
          discountType: coupon.discountType,
          value: coupon.value,
          minOrderAmount: coupon.minOrderAmount,
          maxUses: coupon.maxUses,
          usedCount: coupon.usedCount,
          expiresAt: coupon.expiresAt,
          active: coupon.active,
        };
      },
    });

    const deductedItems: { product: string; quantity: number }[] = [];
    for (const item of pricing.orderItems) {
      const result = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!result) {
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
      paymentId: "payfast",
      referralCode: pricing.referralCode,
      couponCode: pricing.couponCode,
      notes: "Payment method: PayFast",
    });
    await order.save();

    const orderId = String(order._id);
    const paymentUrl = createPayFastRedirectUrl({
      orderId,
      amount: pricing.total,
      email: session.user.email,
      name: session.user.name,
      itemName: `Impact Store Order #${orderId.slice(-6).toUpperCase()}`,
      itemDescription: pricing.itemNames,
      baseUrl: getPublicBaseUrl(req),
    });

    return NextResponse.json({
      orderId: order._id,
      paymentUrl,
      pricing: {
        subtotal: pricing.subtotal,
        shipping: pricing.shipping,
        discount: pricing.discount,
        total: pricing.total,
        referralCode: pricing.referralCode,
        couponCode: pricing.couponCode,
      },
    });
  } catch (error) {
    if (error instanceof CheckoutPricingError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error("PayFast payment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
