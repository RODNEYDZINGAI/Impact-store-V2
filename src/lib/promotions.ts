export type PromotionDiscountType = "percentage" | "fixed";

export interface PromotionLike {
  code: string;
  name?: string;
  discountType: PromotionDiscountType;
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount?: number;
  startsAt?: Date | string | null;
  endsAt?: Date | string | null;
  active?: boolean;
  stackable?: boolean;
  eligibleProductIds?: string[];
  excludedProductIds?: string[];
  eligibleCategorySlugs?: string[];
}

export interface PromotionItemContext {
  productId?: string;
  categorySlug?: string;
}

export interface PromotionEligibilityContext {
  subtotal: number;
  now?: Date;
  existingPromotionCodes?: string[];
  items?: PromotionItemContext[];
}

export interface PromotionDiscountContext {
  subtotal: number;
  currentDiscount?: number;
}

export interface SanitizedPromotionInput {
  code: string;
  name: string;
  description?: string;
  discountType: PromotionDiscountType;
  value: number;
  minOrderAmount: number;
  maxUses?: number;
  startsAt?: Date;
  endsAt?: Date;
  active: boolean;
  stackable: boolean;
  eligibleProductIds: string[];
  excludedProductIds: string[];
  eligibleCategorySlugs: string[];
}

export interface PromotionEligibilityResult {
  eligible: boolean;
  reason?: string;
}

export function normalizePromotionCode(value: unknown): string {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function parseOptionalNumber(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === "") return fallback;
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return Number.NaN;
  return numberValue;
}

function parseOptionalDate(value: unknown, label: string): Date | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  if (!Number.isFinite(date.getTime())) {
    throw new Error(`${label} is invalid`);
  }
  return date;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugArray(value: unknown): string[] {
  return stringArray(value).map((item) => item.toLowerCase());
}

export function sanitizePromotionInput(
  body: Record<string, unknown>
): SanitizedPromotionInput {
  const code = normalizePromotionCode(body.code);
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description =
    typeof body.description === "string" && body.description.trim()
      ? body.description.trim()
      : undefined;
  const discountType = body.discountType;
  const value = Number(body.value);
  const minOrderAmount = parseOptionalNumber(body.minOrderAmount, 0);
  const maxUses = parseOptionalNumber(body.maxUses, Number.NaN);
  const startsAt = parseOptionalDate(body.startsAt, "Start date");
  const endsAt = parseOptionalDate(body.endsAt, "End date");

  if (!code) throw new Error("Promotion code is required");
  if (!name) throw new Error("Promotion name is required");
  if (!["percentage", "fixed"].includes(String(discountType))) {
    throw new Error("Promotion discount type must be percentage or fixed");
  }
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Promotion value must be greater than zero");
  }
  if (discountType === "percentage" && value > 100) {
    throw new Error("Percentage promotions cannot exceed 100%");
  }
  if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0) {
    throw new Error("Minimum order must be zero or greater");
  }
  if (
    body.maxUses !== undefined &&
    body.maxUses !== null &&
    body.maxUses !== "" &&
    (!Number.isInteger(maxUses) || maxUses < 1)
  ) {
    throw new Error("Maximum uses must be a positive whole number");
  }
  if (startsAt && endsAt && endsAt <= startsAt) {
    throw new Error("End date must be after start date");
  }

  return {
    code,
    name,
    description,
    discountType: discountType as PromotionDiscountType,
    value,
    minOrderAmount,
    maxUses: Number.isFinite(maxUses) ? maxUses : undefined,
    startsAt,
    endsAt,
    active: body.active === undefined ? true : Boolean(body.active),
    stackable: body.stackable === undefined ? false : Boolean(body.stackable),
    eligibleProductIds: stringArray(body.eligibleProductIds),
    excludedProductIds: stringArray(body.excludedProductIds),
    eligibleCategorySlugs: slugArray(body.eligibleCategorySlugs),
  };
}

function asDate(value: Date | string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date : undefined;
}

function hasEligibleItem(
  promotion: PromotionLike,
  items: PromotionItemContext[] | undefined
): boolean {
  const eligibleProductIds = promotion.eligibleProductIds ?? [];
  const excludedProductIds = promotion.excludedProductIds ?? [];
  const eligibleCategorySlugs = promotion.eligibleCategorySlugs ?? [];

  if (
    eligibleProductIds.length === 0 &&
    excludedProductIds.length === 0 &&
    eligibleCategorySlugs.length === 0
  ) {
    return true;
  }

  if (!items || items.length === 0) return false;

  return items.some((item) => {
    if (item.productId && excludedProductIds.includes(item.productId)) {
      return false;
    }
    const productAllowed =
      eligibleProductIds.length === 0 ||
      (item.productId ? eligibleProductIds.includes(item.productId) : false);
    const categoryAllowed =
      eligibleCategorySlugs.length === 0 ||
      (item.categorySlug
        ? eligibleCategorySlugs.includes(item.categorySlug.toLowerCase())
        : false);
    return productAllowed && categoryAllowed;
  });
}

export function promotionIsEligible(
  promotion: PromotionLike,
  context: PromotionEligibilityContext
): PromotionEligibilityResult {
  const now = context.now ?? new Date();
  const startsAt = asDate(promotion.startsAt);
  const endsAt = asDate(promotion.endsAt);
  const existingPromotionCodes = context.existingPromotionCodes ?? [];

  if (promotion.active === false) {
    return { eligible: false, reason: "Promotion is inactive" };
  }
  if (startsAt && startsAt > now) {
    return { eligible: false, reason: "Promotion has not started" };
  }
  if (endsAt && endsAt < now) {
    return { eligible: false, reason: "Promotion has ended" };
  }
  if (
    typeof promotion.maxUses === "number" &&
    typeof promotion.usedCount === "number" &&
    promotion.usedCount >= promotion.maxUses
  ) {
    return { eligible: false, reason: "Promotion usage limit reached" };
  }
  if (context.subtotal < (promotion.minOrderAmount ?? 0)) {
    return {
      eligible: false,
      reason: `Promotion requires a minimum order of R${promotion.minOrderAmount ?? 0}`,
    };
  }
  if (promotion.stackable === false && existingPromotionCodes.length > 0) {
    return {
      eligible: false,
      reason: "Promotion cannot be combined with other discounts",
    };
  }
  if (!hasEligibleItem(promotion, context.items)) {
    return { eligible: false, reason: "Promotion is not eligible for these items" };
  }

  return { eligible: true };
}

export function calculatePromotionDiscount(
  promotion: PromotionLike,
  context: PromotionDiscountContext
): number {
  const discountableSubtotal = Math.max(
    0,
    context.subtotal - (context.currentDiscount ?? 0)
  );
  const rawDiscount =
    promotion.discountType === "percentage"
      ? Math.round((discountableSubtotal * promotion.value) / 100)
      : Math.round(promotion.value);

  return Math.min(Math.max(rawDiscount, 0), discountableSubtotal);
}
