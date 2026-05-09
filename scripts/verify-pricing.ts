import assert from "node:assert/strict";
import {
  calculateCheckoutPricing,
  CheckoutPricingError,
} from "../src/lib/checkout-pricing";

const products = [
  {
    _id: "p1",
    name: "Laptop",
    sku: "LAP-1",
    price: 10_000,
    stock: 3,
    images: ["/laptop.jpg"],
    published: true,
  },
  {
    _id: "p2",
    name: "Mouse",
    sku: "MOU-1",
    price: 500,
    stock: 10,
    images: ["/mouse.jpg"],
    published: true,
  },
];

async function expectPricingError(
  message: string,
  fn: () => Promise<unknown>,
  status: number
) {
  await assert.rejects(
    fn,
    (error) =>
      error instanceof CheckoutPricingError &&
      error.status === status &&
      error.message === message
  );
}

const noCoupon = async () => null;

async function main() {
  // --- Existing tests ---

  const tamperedItems = [
    { product: "p1", price: 1, quantity: 2 },
    { product: "p2", price: 0, quantity: 1 },
  ];

  const result = await calculateCheckoutPricing({
    items: tamperedItems,
    products,
    referralCode: "meg123",
    currentUserId: "buyer",
    settings: { couponsEnabled: false, referralsEnabled: true },
    resolveReferral: async (code) => ({
      id: "referrer",
      code,
      enabled: true,
    }),
    resolveCoupon: noCoupon,
  });

  assert.equal(result.subtotal, 20_500);
  assert.equal(result.shipping, 99);
  assert.equal(result.discount, 1_025);
  assert.equal(result.total, 19_574);
  assert.equal(result.referralCode, "MEG123");
  assert.deepEqual(
    result.orderItems.map(({ product, name, price, quantity, sku, image }) => ({
      product,
      name,
      price,
      quantity,
      sku,
      image,
    })),
    [
      {
        product: "p1",
        name: "Laptop",
        price: 10_000,
        quantity: 2,
        sku: "LAP-1",
        image: "/laptop.jpg",
      },
      {
        product: "p2",
        name: "Mouse",
        price: 500,
        quantity: 1,
        sku: "MOU-1",
        image: "/mouse.jpg",
      },
    ]
  );

  await expectPricingError(
    "Invalid referral code",
    () =>
      calculateCheckoutPricing({
        items: [{ product: "p1", quantity: 1 }],
        products,
        referralCode: "bad",
        currentUserId: "buyer",
        settings: { referralsEnabled: true },
        resolveReferral: async () => null,
        resolveCoupon: noCoupon,
      }),
    400
  );

  await expectPricingError(
    "Referrals are currently disabled",
    () =>
      calculateCheckoutPricing({
        items: [{ product: "p1", quantity: 1 }],
        products,
        referralCode: "meg123",
        currentUserId: "buyer",
        settings: { referralsEnabled: false },
        resolveReferral: async (code) => ({
          id: "referrer",
          code,
          enabled: true,
        }),
        resolveCoupon: noCoupon,
      }),
    400
  );

  await expectPricingError(
    "Coupons are currently disabled",
    () =>
      calculateCheckoutPricing({
        items: [{ product: "p1", quantity: 1 }],
        products,
        couponCode: "SAVE10",
        currentUserId: "buyer",
        settings: { couponsEnabled: false },
        resolveReferral: async () => null,
        resolveCoupon: async () => null,
      }),
    400
  );

  await expectPricingError(
    "Insufficient stock: Laptop (only 3 left, you requested 4)",
    () =>
      calculateCheckoutPricing({
        items: [
          { product: "p1", quantity: 2 },
          { product: "p1", quantity: 2 },
        ],
        products,
        currentUserId: "buyer",
        resolveReferral: async () => null,
        resolveCoupon: noCoupon,
      }),
    400
  );

  // --- Coupon tests ---

  // Test: valid percentage coupon (10% off)
  const percentResult = await calculateCheckoutPricing({
    items: [{ product: "p1", quantity: 1 }],
    products,
    couponCode: "SAVE10",
    currentUserId: "buyer",
    settings: { couponsEnabled: true },
    resolveReferral: async () => null,
    resolveCoupon: async (code) => {
      if (code === "SAVE10") {
        return {
          code: "SAVE10",
          discountType: "percentage",
          discountValue: 10,
          usedCount: 0,
          isActive: true,
        };
      }
      return null;
    },
  });
  assert.equal(percentResult.subtotal, 10_000);
  assert.equal(percentResult.discount, 1_000);
  assert.equal(percentResult.total, 10_000 + 99 - 1_000);
  assert.equal(percentResult.couponCode, "SAVE10");

  // Test: valid fixed coupon (R500 off)
  const fixedResult = await calculateCheckoutPricing({
    items: [{ product: "p1", quantity: 1 }],
    products,
    couponCode: "FLAT500",
    currentUserId: "buyer",
    settings: { couponsEnabled: true },
    resolveReferral: async () => null,
    resolveCoupon: async (code) => {
      if (code === "FLAT500") {
        return {
          code: "FLAT500",
          discountType: "fixed",
          discountValue: 50_000,
          usedCount: 0,
          isActive: true,
        };
      }
      return null;
    },
  });
  assert.equal(fixedResult.subtotal, 10_000);
  assert.equal(fixedResult.discount, 10_000); // capped at subtotal
  assert.equal(fixedResult.total, 99); // only shipping remains
  assert.equal(fixedResult.couponCode, "FLAT500");

  // Test: expired coupon rejection
  await expectPricingError(
    "Coupon has expired",
    () =>
      calculateCheckoutPricing({
        items: [{ product: "p1", quantity: 1 }],
        products,
        couponCode: "EXPIRED",
        currentUserId: "buyer",
        settings: { couponsEnabled: true },
        resolveReferral: async () => null,
        resolveCoupon: async () => ({
          code: "EXPIRED",
          discountType: "percentage",
          discountValue: 10,
          usedCount: 0,
          expiresAt: new Date("2020-01-01"),
          isActive: true,
        }),
      }),
    400
  );

  // Test: coupon with minimum order not met
  await expectPricingError(
    "Coupon requires a minimum order of R50000",
    () =>
      calculateCheckoutPricing({
        items: [{ product: "p2", quantity: 1 }], // subtotal = 500
        products,
        couponCode: "MIN1000",
        currentUserId: "buyer",
        settings: { couponsEnabled: true },
        resolveReferral: async () => null,
        resolveCoupon: async () => ({
          code: "MIN1000",
          discountType: "fixed",
          discountValue: 100,
          minimumOrder: 50_000, // R500.00 in cents
          usedCount: 0,
          isActive: true,
        }),
      }),
    400
  );

  // Test: coupon stacking with referral (both applied)
  const stackedResult = await calculateCheckoutPricing({
    items: [{ product: "p1", quantity: 1 }], // subtotal = 10_000
    products,
    couponCode: "SAVE10",
    referralCode: "REFER",
    currentUserId: "buyer",
    settings: { couponsEnabled: true, referralsEnabled: true },
    resolveReferral: async (code) => ({
      id: "referrer",
      code,
      enabled: true,
    }),
    resolveCoupon: async () => ({
      code: "SAVE10",
      discountType: "percentage",
      discountValue: 10,
      usedCount: 0,
      isActive: true,
    }),
  });
  // referral discount = 500, coupon discount = 950 on the remaining subtotal
  assert.equal(stackedResult.discount, 1_450);
  assert.equal(stackedResult.total, 10_000 + 99 - 1_450);
  assert.equal(stackedResult.couponCode, "SAVE10");
  assert.equal(stackedResult.referralCode, "REFER");

  // Test: coupon disabled by settings
  await expectPricingError(
    "Coupons are currently disabled",
    () =>
      calculateCheckoutPricing({
        items: [{ product: "p1", quantity: 1 }],
        products,
        couponCode: "SAVE10",
        currentUserId: "buyer",
        settings: { couponsEnabled: false },
        resolveReferral: async () => null,
        resolveCoupon: async () => ({
          code: "SAVE10",
          discountType: "percentage",
          discountValue: 10,
          usedCount: 0,
          isActive: true,
        }),
      }),
    400
  );

  console.log("Pricing verification passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
