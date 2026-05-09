# Coupons and Referrals

Date: 2026-05-09
Status: planning/spec only

## Purpose

Impact Store currently supports per-user referral codes with a fixed 5% checkout discount, but there is no global feature toggle, no coupon model, and checkout totals are partially client-calculated. Coupons and referrals need server-authoritative validation, admin controls, usage limits, and reporting.

## Implementation Sequence

1. Create store settings for global `couponsEnabled` and `referralsEnabled` toggles.
2. Create `Coupon` model with code, enabled state, discount type, amount, percentage, start/end dates, minimum spend, usage limits, customer eligibility, product/category eligibility, and audit timestamps.
3. Create a dedicated promotion validation API separate from `src/app/api/users/route.ts`.
4. Move subtotal, shipping, discount, and total calculation into a server-side checkout/pricing helper.
5. Update BobPay creation to use server-calculated totals and reject client-supplied totals, stale prices, invalid codes, and disabled promotions.
6. Add admin coupon management and referral controls.
7. Add referral analytics fields: referrer, referred order, usage count, revenue, and discount issued.
8. Update checkout UI to display server-returned promotion results and failure reasons.

## Affected Files

- New `src/models/Coupon.ts`
- New store settings model or config under `src/models`
- `src/models/User.ts`
- `src/models/Order.ts`
- `src/app/checkout/page.tsx`
- `src/app/api/payments/bobpay/route.ts`
- `src/app/api/users/route.ts`
- `src/app/api/user/affiliate/route.ts`
- New API routes under `src/app/api/promotions` or `src/app/api/coupons`
- New admin pages under `src/app/admin/coupons` and/or `src/app/admin/settings`
- `src/app/admin/users/page.tsx`
- `src/app/admin/users/[id]/page.tsx`
- `src/app/admin/layout.tsx`

## Dependencies

- Server-authoritative pricing helper shared by checkout preview and payment creation.
- Product/variant pricing contract.
- Store settings and admin permissions.
- Usage recording tied to successful payment or paid order status.
- Clear policy for stacking coupons and referrals.

## Risks

- Payment integrity risk remains until server ignores client-supplied totals and discounts.
- Promo usage can be double-counted if usage is recorded before payment success and not reconciled.
- Referral codes generated from a small random range can collide at higher scale.
- Combining coupons and referrals without explicit stacking rules can create unintended discounts.
- Public validation endpoints need rate limiting and generic errors to reduce code enumeration.

## Verification and Testing

- Checkout preview and BobPay creation return matching totals for valid promotions.
- Disabled referrals and disabled coupons are rejected even if codes exist.
- Coupon constraints are enforced: date window, minimum spend, usage limits, eligibility, products/categories, and enabled state.
- Referral analytics update only when the order becomes paid or the chosen lifecycle event is reached.
- Client-tampered total, discount, item price, and quantity payloads are rejected or recalculated.
- Admin-only coupon routes reject non-admin users.

## Rollback

- Add global toggles so coupons and referrals can be disabled without code rollback.
- Keep existing referral fields on `User` during migration.
- Do not remove old referral validation until checkout and BobPay paths use the new promotion service.
- If coupon logic causes checkout errors, disable `couponsEnabled` and keep referrals-only behavior while investigating.

## Recommended Boundaries: Claude Code vs Codex

- Claude Code: implement coupon CRUD, settings UI, promotion APIs, checkout UI wiring, and analytics persistence.
- Codex: own pricing/security review, server-authoritative calculation contract, edge-case tests, and rollback checklist.
- Treat `src/app/api/payments/bobpay/route.ts` as a high-risk file that should get focused review before merge.
