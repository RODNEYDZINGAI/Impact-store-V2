const REFERRAL_DISCOUNT_RATE = 0.05;

export class PromoEngineError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "PromoEngineError";
    this.status = status;
  }
}

export interface ReferralValidationResult {
  id: string;
  code: string;
  enabled: boolean;
}

export interface CouponValidationResult {
  code: string;
  active?: boolean;
  isActive?: boolean;
  discountType: "percentage" | "fixed";
  value?: number;
  discountValue?: number;
  minOrderAmount?: number;
  minimumOrder?: number;
  maxUses?: number;
  usedCount?: number;
  expiresAt?: Date | string | null;
}

export interface PromotionSettings {
  couponsEnabled?: boolean;
  referralsEnabled?: boolean;
}

export interface PromoEngineInput {
  subtotal: number;
  currentUserId: string;
  referralCode?: unknown;
  couponCode?: unknown;
  settings?: PromotionSettings | null;
  resolveReferral: (code: string) => Promise<ReferralValidationResult | null>;
  resolveCoupon?: (code: string) => Promise<CouponValidationResult | null>;
}

export interface AppliedPromotion {
  type: "referral" | "coupon";
  code: string;
  discount: number;
}

export interface PromoEngineResult {
  discount: number;
  referralDiscount: number;
  couponDiscount: number;
  referralCode?: string;
  referrerId?: string;
  couponCode?: string;
  appliedPromotions: AppliedPromotion[];
}

function normalizeCode(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const code = value.trim().toUpperCase();
  return code || undefined;
}

function isExpired(value: Date | string | null | undefined): boolean {
  if (!value) return false;
  const expiresAt = value instanceof Date ? value : new Date(value);
  return Number.isFinite(expiresAt.getTime()) && expiresAt.getTime() < Date.now();
}

function assertValidSubtotal(subtotal: number) {
  if (!Number.isFinite(subtotal) || subtotal < 0) {
    throw new PromoEngineError("Invalid promotion subtotal");
  }
}

export async function evaluatePromotions({
  subtotal,
  currentUserId,
  referralCode,
  couponCode,
  settings,
  resolveReferral,
  resolveCoupon,
}: PromoEngineInput): Promise<PromoEngineResult> {
  assertValidSubtotal(subtotal);

  const appliedPromotions: AppliedPromotion[] = [];
  const normalizedReferralCode = normalizeCode(referralCode);
  let validatedReferralCode: string | undefined;
  let referrerId: string | undefined;

  if (normalizedReferralCode) {
    if (settings?.referralsEnabled === false) {
      throw new PromoEngineError("Referrals are currently disabled");
    }

    const referral = await resolveReferral(normalizedReferralCode);
    if (!referral || !referral.enabled) {
      throw new PromoEngineError("Invalid referral code");
    }

    if (referral.id === currentUserId) {
      throw new PromoEngineError("You cannot use your own referral code");
    }

    validatedReferralCode = referral.code.toUpperCase();
    referrerId = referral.id;
  }

  const referralDiscount = validatedReferralCode
    ? Math.round(subtotal * REFERRAL_DISCOUNT_RATE)
    : 0;

  if (validatedReferralCode && referralDiscount > 0) {
    appliedPromotions.push({
      type: "referral",
      code: validatedReferralCode,
      discount: referralDiscount,
    });
  }

  const normalizedCouponCode = normalizeCode(couponCode);
  let couponDiscount = 0;
  let validatedCouponCode: string | undefined;

  if (normalizedCouponCode) {
    if (settings?.couponsEnabled === false) {
      throw new PromoEngineError("Coupons are currently disabled");
    }

    if (!resolveCoupon) {
      throw new PromoEngineError("Coupons are not available");
    }

    const coupon = await resolveCoupon(normalizedCouponCode);

    if (!coupon || (coupon.active ?? coupon.isActive) !== true) {
      throw new PromoEngineError("Invalid coupon code");
    }

    if (isExpired(coupon.expiresAt)) {
      throw new PromoEngineError("Coupon has expired");
    }

    if (
      typeof coupon.maxUses === "number" &&
      typeof coupon.usedCount === "number" &&
      coupon.usedCount >= coupon.maxUses
    ) {
      throw new PromoEngineError("Coupon usage limit reached");
    }

    const minOrderAmount = coupon.minOrderAmount ?? coupon.minimumOrder ?? 0;
    if (subtotal < minOrderAmount) {
      throw new PromoEngineError(
        `Coupon requires a minimum order of R${minOrderAmount}`
      );
    }

    const discountableSubtotal = Math.max(0, subtotal - referralDiscount);
    const couponValue = coupon.value ?? coupon.discountValue;
    if (
      typeof couponValue !== "number" ||
      !Number.isFinite(couponValue) ||
      couponValue < 0
    ) {
      throw new PromoEngineError("Invalid coupon discount");
    }

    if (coupon.discountType === "percentage") {
      if (couponValue > 100) {
        throw new PromoEngineError("Invalid coupon discount");
      }
      couponDiscount = Math.round((discountableSubtotal * couponValue) / 100);
    } else if (coupon.discountType === "fixed") {
      couponDiscount = Math.round(couponValue);
    } else {
      throw new PromoEngineError("Invalid coupon discount");
    }

    couponDiscount = Math.min(couponDiscount, discountableSubtotal);
    validatedCouponCode = coupon.code.toUpperCase();

    if (couponDiscount > 0) {
      appliedPromotions.push({
        type: "coupon",
        code: validatedCouponCode,
        discount: couponDiscount,
      });
    }
  }

  const discount = referralDiscount + couponDiscount;

  return {
    discount,
    referralDiscount,
    couponDiscount,
    referralCode: validatedReferralCode,
    referrerId,
    couponCode: validatedCouponCode,
    appliedPromotions,
  };
}
