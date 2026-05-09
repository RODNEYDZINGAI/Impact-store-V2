import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Coupon, { CouponDiscountType } from "@/models/Coupon";

function normalizeCouponBody(body: Record<string, unknown>) {
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const discountType = body.discountType;
  const value = Number(body.value);
  const minOrderAmount = Number(body.minOrderAmount ?? 0);
  const maxUses =
    body.maxUses === undefined || body.maxUses === "" || body.maxUses === null
      ? undefined
      : Number(body.maxUses);
  const expiresAt =
    typeof body.expiresAt === "string" && body.expiresAt
      ? new Date(body.expiresAt)
      : undefined;
  const active = body.active === undefined ? true : Boolean(body.active);

  if (!code) throw new Error("Coupon code is required");
  if (!["percentage", "fixed"].includes(String(discountType))) {
    throw new Error("Discount type must be percentage or fixed");
  }
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Coupon value must be greater than zero");
  }
  if (discountType === "percentage" && value > 100) {
    throw new Error("Percentage coupons cannot exceed 100%");
  }
  if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0) {
    throw new Error("Minimum order must be zero or greater");
  }
  if (maxUses !== undefined && (!Number.isInteger(maxUses) || maxUses < 1)) {
    throw new Error("Maximum uses must be a positive whole number");
  }
  if (expiresAt && !Number.isFinite(expiresAt.getTime())) {
    throw new Error("Expiry date is invalid");
  }

  return {
    code,
    discountType: discountType as CouponDiscountType,
    value,
    minOrderAmount,
    maxUses,
    expiresAt,
    active,
  };
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user.role === "admin";
}

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    return NextResponse.json(coupons);
  } catch (error) {
    console.error("Coupons GET error:", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const coupon = await Coupon.create(normalizeCouponBody(body));
    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create coupon";
    if (message.includes("duplicate key")) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
