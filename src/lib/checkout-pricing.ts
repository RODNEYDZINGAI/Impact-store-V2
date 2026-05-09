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
  [key: string]: unknown;
}

export interface ProductSnapshot {
  _id: unknown;
  name: string;
  sku?: string;
  price: number;
  stock: number;
  images?: string[];
  published?: boolean;
}

export interface ReferralValidationResult {
  id: string;
  code: string;
  enabled: boolean;
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
}

export interface CheckoutOrderItem {
  product: string;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CheckoutPricingResult {
  orderItems: CheckoutOrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  referralCode?: string;
  itemNames: string;
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

export async function calculateCheckoutPricing({
  items,
  products,
  currentUserId,
  referralCode,
  couponCode,
  settings,
  shippingCost = DEFAULT_SHIPPING_COST,
  resolveReferral,
}: CheckoutPricingInput): Promise<CheckoutPricingResult> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new CheckoutPricingError("Cart is empty");
  }

  if (normalizeCode(couponCode)) {
    if (settings?.couponsEnabled === false) {
      throw new CheckoutPricingError("Coupons are currently disabled");
    }

    throw new CheckoutPricingError("Coupons are not available yet");
  }

  const productMap = new Map(
    products.map((product) => [stringifyId(product._id), product])
  );
  const requested = new Map<string, number>();

  for (const item of items) {
    const productId = stringifyId(item.product);
    if (!productId) {
      throw new CheckoutPricingError("Invalid product");
    }

    const quantity = normalizeQuantity(item.quantity);
    requested.set(productId, (requested.get(productId) || 0) + quantity);
  }

  const unavailable: string[] = [];
  const insufficient: { name: string; available: number; requested: number }[] =
    [];

  for (const [productId, quantity] of requested.entries()) {
    const product = productMap.get(productId);
    if (!product || product.published === false) {
      unavailable.push(productId);
      continue;
    }

    if (product.stock < quantity) {
      insufficient.push({
        name: product.name,
        available: product.stock,
        requested: quantity,
      });
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

  const orderItems = Array.from(requested.entries()).map(
    ([productId, quantity]) => {
      const product = productMap.get(productId)!;
      return {
        product: productId,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity,
        image: product.images?.[0] || "",
      };
    }
  );

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const normalizedReferralCode = normalizeCode(referralCode);
  let validatedReferralCode: string | undefined;

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
  }

  const discount = validatedReferralCode
    ? Math.round(subtotal * REFERRAL_DISCOUNT_RATE)
    : 0;
  const total = subtotal + shippingCost - discount;

  if (total <= 0) {
    throw new CheckoutPricingError("Invalid checkout total");
  }

  return {
    orderItems,
    subtotal,
    shipping: shippingCost,
    discount,
    total,
    referralCode: validatedReferralCode,
    itemNames: orderItems.map((item) => item.name).join(", "),
  };
}
