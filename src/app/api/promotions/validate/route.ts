import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import {
  calculatePromotionDiscount,
  normalizePromotionCode,
  promotionIsEligible,
} from "@/lib/promotions";
import Promotion from "@/models/Promotion";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = normalizePromotionCode(body.code);
    const subtotal = Number(body.subtotal);
    const currentDiscount = Number(body.currentDiscount ?? 0);
    const existingPromotionCodes = Array.isArray(body.existingPromotionCodes)
      ? body.existingPromotionCodes.filter(
          (item: unknown): item is string => typeof item === "string"
        )
      : [];
    const items = Array.isArray(body.items) ? body.items : [];

    if (!code) {
      return NextResponse.json(
        { valid: false, reason: "Promotion code is required" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(subtotal) || subtotal < 0) {
      return NextResponse.json(
        { valid: false, reason: "Valid subtotal is required" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(currentDiscount) || currentDiscount < 0) {
      return NextResponse.json(
        { valid: false, reason: "Valid current discount is required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const promotion = await Promotion.findOne({ code }).lean();

    if (!promotion) {
      return NextResponse.json({ valid: false, reason: "Invalid promotion code" });
    }

    const eligibility = promotionIsEligible(promotion, {
      subtotal,
      existingPromotionCodes,
      items,
    });

    if (!eligibility.eligible) {
      return NextResponse.json({
        valid: false,
        reason: eligibility.reason ?? "Invalid promotion code",
      });
    }

    const discount = calculatePromotionDiscount(promotion, {
      subtotal,
      currentDiscount,
    });

    return NextResponse.json({
      valid: true,
      discount,
      discountType: promotion.discountType,
      discountValue: promotion.value,
      code: promotion.code,
      stackable: promotion.stackable,
    });
  } catch (error) {
    console.error("[Promotions] Validate error:", error);
    return NextResponse.json(
      { valid: false, reason: "Invalid promotion code" },
      { status: 500 }
    );
  }
}
