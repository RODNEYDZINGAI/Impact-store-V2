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

async function main() {
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
      }),
    400
  );

  await expectPricingError(
    "Coupons are not available yet",
    () =>
      calculateCheckoutPricing({
        items: [{ product: "p1", quantity: 1 }],
        products,
        couponCode: "SAVE10",
        currentUserId: "buyer",
        settings: { couponsEnabled: true },
        resolveReferral: async () => null,
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
      }),
    400
  );

  console.log("Pricing verification passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
