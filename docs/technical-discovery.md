# Technical Discovery

Date: 2026-05-09
Branch: `hermes`
Scope: planning/spec recovery only; no production implementation.

## Purpose

This discovery captures the current Impact Store implementation hotspots that block product variants, request-a-quote, coupons/referrals, and admin upgrade planning. It should be used as the shared baseline before implementation work starts.

## Current Architecture Snapshot

- Next.js App Router pages live under `src/app`.
- Data models use Mongoose in `src/models`.
- Customer cart state is client-side in `src/context/CartContext.tsx` and persisted to `localStorage`.
- Product browsing uses `src/app/products/page.tsx`, `src/app/products/[slug]/page.tsx`, `src/components/ProductGrid.tsx`, `src/components/ProductCard.tsx`, and `src/components/AddToCartButton.tsx`.
- Checkout is client-driven in `src/app/checkout/page.tsx` and starts BobPay payment through `src/app/api/payments/bobpay/route.ts`.
- Admin currently includes dashboard, products, orders, and users under `src/app/admin`.

## Source Hotspots

- `src/models/Product.ts`: single SKU, price, stock, condition, and image list per product. No variant subdocuments, SEO fields, quote eligibility, or per-variant inventory.
- `src/models/Order.ts`: order items store product, name, SKU, price, quantity, and image. No selected variant ID or immutable variant attribute snapshot.
- `src/models/User.ts`: supports `role`, address, `referralCode`, and `referralEnabled`. No global referral toggle, business account fields, or customer segmentation fields.
- `src/context/CartContext.tsx`: cart identity is the product `_id`, so multiple variants of the same product cannot coexist.
- `src/app/checkout/page.tsx`: calculates referral discount and final total on the client before sending payment data to the server.
- `src/app/api/payments/bobpay/route.ts`: validates product-level stock and deducts product-level inventory, but trusts request totals and discounts.
- `src/app/api/users/route.ts`: mixes admin user listing/updating with public referral validation; includes debug logging in the admin update path.
- `src/components/ProductCard.tsx`: quote CTA links to `/contact`; add-to-cart uses product-level price and identity.
- `src/app/admin/layout.tsx`: admin IA currently exposes Dashboard, Products, Orders, and Users only.
- `src/app/api/admin/dashboard/route.ts`: aggregates basic counts, revenue, order status, recent orders, and low-stock products.

## Implementation Sequence

1. Stabilize server-side pricing and discount calculation before expanding promos or variants.
2. Add data model changes behind backward-compatible defaults and migrations.
3. Update APIs to accept new fields while preserving existing product/order reads.
4. Update customer-facing UI for variant selection, quote capture, and discount entry.
5. Add admin UI modules for variants, quotes, coupons, settings, and richer operations.
6. Backfill documentation and regression checklists for each implementation phase.

## Affected Files

- Models: `src/models/Product.ts`, `src/models/Order.ts`, `src/models/User.ts`, new quote/coupon/settings models.
- Public UI: `src/app/products/page.tsx`, `src/app/products/[slug]/page.tsx`, `src/app/cart/page.tsx`, `src/app/checkout/page.tsx`, new quote routes.
- Components: `src/components/ProductCard.tsx`, `src/components/AddToCartButton.tsx`, `src/components/ProductGallery.tsx`, cart/checkout components if extracted.
- APIs: `src/app/api/products/*`, `src/app/api/orders/route.ts`, `src/app/api/payments/bobpay/route.ts`, `src/app/api/users/route.ts`, new quote/coupon/settings APIs.
- Admin: `src/app/admin/*`, especially products, orders, users, dashboard, and new quotes/coupons/settings pages.
- Libraries: `src/lib/email.ts`, `src/lib/bobpay.ts`, `src/lib/mongodb.ts`, `src/lib/auth.ts`.

## Dependencies

- MongoDB migration/backfill strategy for existing product and order documents.
- Server-authoritative pricing service or helper shared by checkout, BobPay creation, and future order creation.
- Admin authorization checks through NextAuth.
- Email configuration for quote and promo notifications.
- BobPay amount creation must receive trusted server-calculated totals only.

## Risks

- Existing cart payloads in customer browsers may not match new variant-aware cart shape.
- Stock deduction can oversell if product and variant inventory paths coexist without a clear migration boundary.
- Client-supplied totals and discounts are currently a payment integrity risk.
- Referral validation is coupled to the users API, which complicates future coupon/referral separation.
- Admin API debug logging can leak operational details to logs and should be removed during admin hardening.

## Verification and Testing

- Add model validation tests for variants, coupons, quotes, settings, and user business fields.
- Add API tests for server-calculated checkout totals, invalid discounts, insufficient stock, and unauthorized admin access.
- Add cart regression tests for same product with different selected variants.
- Add admin smoke tests for navigation, create/edit flows, and list filters.
- Run `npm run lint` and `npm run build` before implementation handoff.

## Rollback

- Keep initial schema changes backward-compatible, with optional new fields.
- Preserve product-level `price`, `stock`, `sku`, `condition`, and `images` until all reads use variants safely.
- Gate new quote/coupon/referral behavior behind store settings so it can be disabled without reverting code.
- For migrations, keep reversible scripts or documented manual rollback steps before production deployment.

## Recommended Boundaries: Claude Code vs Codex

- Claude Code: broad implementation slices that require coordinated model, API, UI, and migration edits; long-running test repair; repetitive admin CRUD generation.
- Codex: spec refinement, architecture review, small targeted patches, security review of checkout/promo calculation, regression checklist updates, and final verification.
- Shared boundary: Codex should review pricing, stock, and authorization-sensitive changes before merge; Claude Code can own bulk UI/admin implementation once the data contracts are agreed.
