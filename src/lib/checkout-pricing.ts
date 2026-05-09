const DEFAULT_SHIPPING_COST = 99;
const REFERRAL_DISCOUNT_RATE = 0.05;

export class CheckoutPricingError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CheckoutPricingError";
    this.status = status;
  }
}

export interface CheckoutItemInput {
  product?: unknown;
  quantity?: unknown;
  variantId?: unknown;
  [key: string]: unknown;
}

export interface ProductVariantSnapshot {
  variantId: string;
  sku?: string;
  price: number;
  stock: number;
  images?: string[];
  published?: boolean;
  title?: string;
}

export interface ProductSnapshot {
  _id: unknown;
  name: string;
  sku?: string;
  price: number;
  stock: number;
  images?: string[];
  published?: boolean;
  variants?: ProductVariantSnapshot[];
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

export interface CheckoutPromotionSettings {
  couponsEnabled?: boolean;
  referralsEnabled?: boolean;
}

export interface CheckoutPricingInput {
  items: CheckoutItemInput[];
  products: ProductSnapshot[];
  currentUserId: string;
  referralCode?: unknown;
  couponCode?: unknown;
  settings?: CheckoutPromotionSettings | null;
  shippingCost?: number;
  resolveReferral: (
    code: string
  ) => Promise<ReferralValidationResult | null>;
  resolveCoupon?: (
    code: string
  ) => Promise<CouponValidationResult | null>;
}

export interface CheckoutOrderItem {
  product: string;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  image: string;
  variantId?: string;
  variantTitle?: string;
}

export interface CheckoutPricingResult {
  orderItems: CheckoutOrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  referralDiscount: number;
  couponDiscount: number;
  total: number;
  referralCode?: string;
  referrerId?: string;
  couponCode?: string;
  itemNames: string;
}

interface AggregatedItem {
  productId: string;
  variantId: string | undefined;
  quantity: number;
}

function stringifyId(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toString" in value) {
    return String(value);
  }
  return "";
}

function normalizeCode(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const code = value.trim().toUpperCase();
  return code || undefined;
}

function normalizeQuantity(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new CheckoutPricingError("Invalid item quantity");
  }
  return value;
}

function isExpired(value: Date | string | null | undefined): boolean {
  if (!value) return false;
  const expiresAt = value instanceof Date ? value : new Date(value);
  return Number.isFinite(expiresAt.getTime()) && expiresAt.getTime() < Date.now();
}

export async function calculateCheckoutPricing({
  items,
  products,
  currentUserId,
  referralCode,
  couponCode,
  settings,
  shippingCost = DEFAULT_SHIPPING_COST,
  resolveReferral,
  resolveCoupon,
}: CheckoutPricingInput): Promise<CheckoutPricingResult> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new CheckoutPricingError("Cart is empty");
  }

  const productMap = new Map(
    products.map((product) => [stringifyId(product._id), product])
  );
  const requested = new Map<string, AggregatedItem>();

  for (const item of items) {
    const productId = stringifyId(item.product);
    if (!productId) {
      throw new CheckoutPricingError("Invalid product");
    }

    const variantId =
      typeof item.variantId === "string" && item.variantId ? item.variantId : undefined;
    const key = variantId ? `${productId}|${variantId}` : productId;
    const quantity = normalizeQuantity(item.quantity);
    const existing = requested.get(key);
    requested.set(key, {
      productId,
      variantId,
      quantity: (existing?.quantity ?? 0) + quantity,
    });
  }

  const unavailable: string[] = [];
  const insufficient: { name: string; available: number; requested: number }[] = [];

  for (const [, { productId, variantId, quantity }] of requested.entries()) {
    const product = productMap.get(productId);
    if (!product || product.published === false) {
      unavailable.push(productId);
      continue;
    }

    if (variantId) {
      const variant = product.variants?.find((v) => v.variantId === variantId);
      if (!variant || variant.published === false) {
        unavailable.push(`${product.name} (variant unavailable)`);
        continue;
      }
      if (variant.stock < quantity) {
        insufficient.push({
          name: `${product.name} — ${variant.title ?? variantId}`,
          available: variant.stock,
          requested: quantity,
        });
      }
    } else {
      if (product.stock < quantity) {
        insufficient.push({
          name: product.name,
          available: product.stock,
          requested: quantity,
        });
      }
    }
  }

  if (unavailable.length > 0) {
    throw new CheckoutPricingError(
      `Product(s) no longer available: ${unavailable.join(", ")}`
    );
  }

  if (insufficient.length > 0) {
    const details = insufficient
      .map(
        (item) =>
          `${item.name} (only ${item.available} left, you requested ${item.requested})`
      )
      .join("; ");
    throw new CheckoutPricingError(`Insufficient stock: ${details}`);
  }

  const orderItems: CheckoutOrderItem[] = Array.from(requested.entries()).map(
    ([, { productId, variantId, quantity }]) => {
      const product = productMap.get(productId)!;
      if (variantId) {
        const variant = product.variants!.find((v) => v.variantId === variantId)!;
        return {
          product: productId,
          name: product.name,
          sku: variant.sku,
          price: variant.price,
          quantity,
          image: variant.images?.[0] ?? product.images?.[0] ?? "",
          variantId,
          variantTitle: variant.title,
        };
      }
      return {
        product: productId,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity,
        image: product.images?.[0] ?? "",
      };
    }
  );

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // --- Referral validation ---
  const normalizedReferralCode = normalizeCode(referralCode);
  let validatedReferralCode: string | undefined;
  let referrerId: string | undefined;

  if (normalizedReferralCode) {
    if (settings?.referralsEnabled === false) {
      throw new CheckoutPricingError("Referrals are currently disabled");
    }

    const referral = await resolveReferral(normalizedReferralCode);
    if (!referral || !referral.enabled) {
      throw new CheckoutPricingError("Invalid referral code");
    }

    if (referral.id === currentUserId) {
      throw new CheckoutPricingError("You cannot use your own referral code");
    }

    validatedReferralCode = referral.code.toUpperCase();
    referrerId = referral.id;
  }

  const referralDiscount = validatedReferralCode
    ? Math.round(subtotal * REFERRAL_DISCOUNT_RATE)
    : 0;

  // --- Coupon validation ---
  const normalizedCouponCode = normalizeCode(couponCode);
  let couponDiscount = 0;
  let validatedCouponCode: string | undefined;

  if (normalizedCouponCode) {
    if (settings?.couponsEnabled === false) {
      throw new CheckoutPricingError("Coupons are currently disabled");
    }

    if (!resolveCoupon) {
      throw new CheckoutPricingError("Coupons are not available");
    }

    const coupon = await resolveCoupon(normalizedCouponCode);

    if (!coupon || (coupon.active ?? coupon.isActive) !== true) {
      throw new CheckoutPricingError("Invalid coupon code");
    }

    if (isExpired(coupon.expiresAt)) {
      throw new CheckoutPricingError("Coupon has expired");
    }

    if (
      typeof coupon.maxUses === "number" &&
      typeof coupon.usedCount === "number" &&
      coupon.usedCount >= coupon.maxUses
    ) {
      throw new CheckoutPricingError("Coupon usage limit reached");
    }

    const minOrderAmount = coupon.minOrderAmount ?? coupon.minimumOrder ?? 0;
    if (subtotal < minOrderAmount) {
      throw new CheckoutPricingError(
        `Coupon requires a minimum order of R${minOrderAmount}`
      );
    }

    const discountableSubtotal = Math.max(0, subtotal - referralDiscount);
    const couponValue = coupon.value ?? coupon.discountValue;
    if (typeof couponValue !== "number" || !Number.isFinite(couponValue)) {
      throw new CheckoutPricingError("Invalid coupon discount");
    }

    if (coupon.discountType === "percentage") {
      if (couponValue > 100) {
        throw new CheckoutPricingError("Invalid coupon discount");
      }
      couponDiscount = Math.round((discountableSubtotal * couponValue) / 100);
    } else {
      couponDiscount = Math.round(couponValue);
    }

    // Cap discount at discountable subtotal
    couponDiscount = Math.min(couponDiscount, discountableSubtotal);
    validatedCouponCode = coupon.code.toUpperCase();
  }

  const discount = couponDiscount + referralDiscount;
  const total = subtotal + shippingCost - discount;

  if (total <= 0) {
    throw new CheckoutPricingError("Invalid checkout total");
  }

  return {
    orderItems,
    subtotal,
    shipping: shippingCost,
    discount,
    referralDiscount,
    couponDiscount,
    total,
    referralCode: validatedReferralCode,
    referrerId,
    couponCode: validatedCouponCode,
    itemNames: orderItems.map((item) => item.name).join(", "),
  };
}
