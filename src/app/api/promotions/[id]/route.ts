import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { sanitizePromotionInput } from "@/lib/promotions";
import Promotion from "@/models/Promotion";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user.role === "admin";
}

function normalizePromotionUpdate(
  body: Record<string, unknown>,
  existing: {
    code: string;
    name: string;
    discountType: string;
    value: number;
    minOrderAmount?: number;
    maxUses?: number;
    startsAt?: Date;
    endsAt?: Date;
    active?: boolean;
    stackable?: boolean;
    description?: string;
    eligibleProductIds?: string[];
    excludedProductIds?: string[];
    eligibleCategorySlugs?: string[];
  }
) {
  const sanitized = sanitizePromotionInput({
    code: body.code ?? existing.code,
    name: body.name ?? existing.name,
    discountType: body.discountType ?? existing.discountType,
    value: body.value ?? existing.value,
    minOrderAmount: body.minOrderAmount ?? existing.minOrderAmount,
    maxUses: body.maxUses === undefined ? existing.maxUses : body.maxUses,
    startsAt: body.startsAt === undefined ? existing.startsAt : body.startsAt,
    endsAt: body.endsAt === undefined ? existing.endsAt : body.endsAt,
    active: body.active ?? existing.active,
    stackable: body.stackable ?? existing.stackable,
    description:
      body.description === undefined ? existing.description : body.description,
    eligibleProductIds: body.eligibleProductIds ?? existing.eligibleProductIds,
    excludedProductIds: body.excludedProductIds ?? existing.excludedProductIds,
    eligibleCategorySlugs:
      body.eligibleCategorySlugs ?? existing.eligibleCategorySlugs,
  });

  const set: Record<string, unknown> = {};
  const unset: Record<string, ""> = {};

  for (const key of [
    "code",
    "name",
    "discountType",
    "value",
    "minOrderAmount",
    "active",
    "stackable",
    "eligibleProductIds",
    "excludedProductIds",
    "eligibleCategorySlugs",
  ] as const) {
    if (body[key] !== undefined) set[key] = sanitized[key];
  }

  for (const key of ["description", "maxUses", "startsAt", "endsAt"] as const) {
    if (body[key] !== undefined) {
      if (sanitized[key] === undefined) unset[key] = "";
      else set[key] = sanitized[key];
    }
  }

  const update: Record<string, unknown> = {};
  if (Object.keys(set).length > 0) update.$set = set;
  if (Object.keys(unset).length > 0) update.$unset = unset;
  return update;
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
    const existingPromotion = await Promotion.findOne({ _id: id });

    if (!existingPromotion) {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
    }

    const update = normalizePromotionUpdate(body, existingPromotion);
    const promotion = await Promotion.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(promotion);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update promotion";
    if (message.includes("duplicate key")) {
      return NextResponse.json(
        { error: "Promotion code already exists" },
        { status: 409 }
      );
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
    const promotion = await Promotion.findByIdAndDelete(id);
    if (!promotion) {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Promotion deleted" });
  } catch (error) {
    console.error("Promotion DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete promotion" },
      { status: 500 }
    );
  }
}
