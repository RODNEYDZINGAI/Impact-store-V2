import assert from "node:assert/strict";
import { evaluatePromotions, PromoEngineError } from "../src/lib/promo-engine";

async function main() {
  const activeCoupon = {
    code: "SAVE10",
    active: true,
    discountType: "percentage" as const,
    value: 10,
    minOrderAmount: 100,
    maxUses: 5,
    usedCount: 2,
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  };

  const stacked = await evaluatePromotions({
    subtotal: 1000,
    currentUserId: "buyer-1",
    referralCode: " ref123 ",
    couponCode: " save10 ",
    settings: { referralsEnabled: true, couponsEnabled: true },
    resolveReferral: async (code) =>
      code === "REF123" ? { id: "referrer-1", code: "REF123", enabled: true } : null,
    resolveCoupon: async (code) => (code === "SAVE10" ? activeCoupon : null),
  });

  assert.deepEqual(stacked.appliedPromotions.map((promo) => promo.type), ["referral", "coupon"]);
  assert.equal(stacked.referralCode, "REF123");
  assert.equal(stacked.referrerId, "referrer-1");
  assert.equal(stacked.referralDiscount, 50);
  assert.equal(stacked.couponCode, "SAVE10");
  assert.equal(stacked.couponDiscount, 95);
  assert.equal(stacked.discount, 145);

  const fixed = await evaluatePromotions({
    subtotal: 80,
    currentUserId: "buyer-1",
    couponCode: "TAKE500",
    resolveReferral: async () => null,
    resolveCoupon: async () => ({
      code: "TAKE500",
      active: true,
      discountType: "fixed" as const,
      value: 500,
    }),
  });
  assert.equal(fixed.couponDiscount, 80);
  assert.equal(fixed.discount, 80);

  await assert.rejects(
    evaluatePromotions({
      subtotal: 100,
      currentUserId: "buyer-1",
      referralCode: "SELF",
      resolveReferral: async () => ({ id: "buyer-1", code: "SELF", enabled: true }),
    }),
    (error) => error instanceof PromoEngineError && error.message === "You cannot use your own referral code"
  );

  await assert.rejects(
    evaluatePromotions({
      subtotal: 99,
      currentUserId: "buyer-1",
      couponCode: "MIN100",
      resolveReferral: async () => null,
      resolveCoupon: async () => ({
        code: "MIN100",
        active: true,
        discountType: "fixed" as const,
        value: 10,
        minOrderAmount: 100,
      }),
    }),
    (error) => error instanceof PromoEngineError && error.message === "Coupon requires a minimum order of R100"
  );

  await assert.rejects(
    evaluatePromotions({
      subtotal: 100,
      currentUserId: "buyer-1",
      couponCode: "BADPCT",
      resolveReferral: async () => null,
      resolveCoupon: async () => ({
        code: "BADPCT",
        active: true,
        discountType: "percentage" as const,
        value: 101,
      }),
    }),
    (error) => error instanceof PromoEngineError && error.message === "Invalid coupon discount"
  );

  await assert.rejects(
    evaluatePromotions({
      subtotal: 100,
      currentUserId: "buyer-1",
      couponCode: "NEGATIVE",
      resolveReferral: async () => null,
      resolveCoupon: async () => ({
        code: "NEGATIVE",
        active: true,
        discountType: "fixed" as const,
        value: -10,
      }),
    }),
    (error) => error instanceof PromoEngineError && error.message === "Invalid coupon discount"
  );

  await assert.rejects(
    evaluatePromotions({
      subtotal: 100,
      currentUserId: "buyer-1",
      couponCode: "UNKNOWN",
      resolveReferral: async () => null,
      resolveCoupon: async () => ({
        code: "UNKNOWN",
        active: true,
        discountType: "bogus" as "fixed",
        value: 10,
      }),
    }),
    (error) => error instanceof PromoEngineError && error.message === "Invalid coupon discount"
  );

  console.log("promo engine verification passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
