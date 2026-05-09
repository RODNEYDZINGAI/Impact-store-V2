import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = body as { code?: string; subtotal?: number };

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { valid: false, reason: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (typeof subtotal !== "number" || subtotal < 0) {
      return NextResponse.json(
        { valid: false, reason: "Valid subtotal is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
    }).lean();

    if (!coupon) {
      return NextResponse.json({ valid: false, reason: "Invalid coupon code" });
    }

    if (!coupon.active) {
      return NextResponse.json({ valid: false, reason: "Invalid coupon code" });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, reason: "Invalid coupon code" });
    }

    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, reason: "Invalid coupon code" });
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return NextResponse.json({ valid: false, reason: "Invalid coupon code" });
    }

    const discount =
      coupon.discountType === "percentage"
        ? Math.round((subtotal * coupon.value) / 100)
        : coupon.value;

    return NextResponse.json({
      valid: true,
      discount: Math.min(discount, subtotal),
      discountType: coupon.discountType,
      discountValue: coupon.value,
      code: coupon.code,
    });
  } catch (error) {
    console.error("[Coupons] Validate error:", error);
    return NextResponse.json(
      { valid: false, reason: "Invalid coupon code" },
      { status: 500 }
    );
  }
}
