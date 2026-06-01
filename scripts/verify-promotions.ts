import assert from "node:assert/strict";

import {
  calculatePromotionDiscount,
  normalizePromotionCode,
  promotionIsEligible,
  sanitizePromotionInput,
} from "../src/lib/promotions";

const now = new Date("2026-05-28T12:00:00.000Z");

const activePercentPromotion = sanitizePromotionInput({
  code: " summer-10 ",
  name: "Summer promo",
  discountType: "percentage",
  value: 10,
  minOrderAmount: 500,
  startsAt: "2026-05-01T00:00:00.000Z",
  endsAt: "2026-06-01T00:00:00.000Z",
  stackable: false,
  active: true,
});

assert.equal(normalizePromotionCode(" summer-10 "), "SUMMER-10");
assert.equal(activePercentPromotion.code, "SUMMER-10");
assert.equal(activePercentPromotion.minOrderAmount, 500);
assert.equal(activePercentPromotion.stackable, false);
assert.deepEqual(activePercentPromotion.eligibleCategorySlugs, []);

assert.deepEqual(
  promotionIsEligible(activePercentPromotion, {
    subtotal: 600,
    now,
    existingPromotionCodes: [],
  }),
  { eligible: true }
);

assert.equal(
  calculatePromotionDiscount(activePercentPromotion, {
    subtotal: 600,
    currentDiscount: 50,
  }),
  55
);

assert.deepEqual(
  promotionIsEligible(activePercentPromotion, {
    subtotal: 600,
    now: new Date("2026-06-02T00:00:00.000Z"),
    existingPromotionCodes: [],
  }),
  { eligible: false, reason: "Promotion has ended" }
);

assert.deepEqual(
  promotionIsEligible(activePercentPromotion, {
    subtotal: 400,
    now,
    existingPromotionCodes: [],
  }),
  { eligible: false, reason: "Promotion requires a minimum order of R500" }
);

assert.deepEqual(
  promotionIsEligible(activePercentPromotion, {
    subtotal: 600,
    now,
    existingPromotionCodes: ["WELCOME"],
  }),
  { eligible: false, reason: "Promotion cannot be combined with other discounts" }
);

assert.deepEqual(
  promotionIsEligible(
    sanitizePromotionInput({
      code: "category",
      name: "Category promo",
      discountType: "fixed",
      value: 100,
      eligibleCategorySlugs: [" Laptops "],
    }),
    {
      subtotal: 600,
      now,
      items: [{ categorySlug: "laptops" }],
    }
  ),
  { eligible: true }
);

assert.throws(
  () =>
    sanitizePromotionInput({
      code: "bad",
      name: "Bad promo",
      discountType: "percentage",
      value: 101,
    }),
  /Percentage promotions cannot exceed 100%/
);

assert.throws(
  () =>
    sanitizePromotionInput({
      code: "date",
      name: "Bad dates",
      discountType: "fixed",
      value: 50,
      startsAt: "2026-06-01T00:00:00.000Z",
      endsAt: "2026-05-01T00:00:00.000Z",
    }),
  /End date must be after start date/
);

console.log("Promotion verification checks passed");
