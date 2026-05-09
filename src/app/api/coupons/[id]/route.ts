import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

function normalizeCouponUpdate(body: Record<string, unknown>) {
  const set: Record<string, unknown> = {};
  const unset: Record<string, ""> = {};

  if (body.code !== undefined) {
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    if (!code) throw new Error("Coupon code is required");
    set.code = code;
  }

  if (body.discountType !== undefined) {
    if (!["percentage", "fixed"].includes(String(body.discountType))) {
      throw new Error("Discount type must be percentage or fixed");
    }
    set.discountType = body.discountType;
  }

  if (body.value !== undefined) {
    const value = Number(body.value);
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error("Coupon value must be greater than zero");
    }
    if ((body.discountType ?? set.discountType) === "percentage" && value > 100) {
      throw new Error("Percentage coupons cannot exceed 100%");
    }
    set.value = value;
  }

  if (body.minOrderAmount !== undefined) {
    const minOrderAmount = Number(body.minOrderAmount);
    if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0) {
      throw new Error("Minimum order must be zero or greater");
    }
    set.minOrderAmount = minOrderAmount;
  }

  if (body.maxUses !== undefined) {
    if (body.maxUses === "" || body.maxUses === null) {
      unset.maxUses = "";
    } else {
      const maxUses = Number(body.maxUses);
      if (!Number.isInteger(maxUses) || maxUses < 1) {
        throw new Error("Maximum uses must be a positive whole number");
      }
      set.maxUses = maxUses;
    }
  }

  if (body.expiresAt !== undefined) {
    if (!body.expiresAt) {
      unset.expiresAt = "";
    } else {
      const expiresAt = new Date(String(body.expiresAt));
      if (!Number.isFinite(expiresAt.getTime())) {
        throw new Error("Expiry date is invalid");
      }
      set.expiresAt = expiresAt;
    }
  }

  if (body.active !== undefined) {
    set.active = Boolean(body.active);
  }

  const update: Record<string, unknown> = {};
  if (Object.keys(set).length > 0) update.$set = set;
  if (Object.keys(unset).length > 0) update.$unset = unset;
  return update;
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user.role === "admin";
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const update = normalizeCouponUpdate(body);
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      update,
      { new: true }
    );

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update coupon";
    if (message.includes("duplicate key")) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Coupon deleted" });
  } catch (error) {
    console.error("Coupon DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
