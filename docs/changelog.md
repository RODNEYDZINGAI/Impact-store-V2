# Impact Store Changelog

All Impact Store project changes should be documented here or in linked feature docs under `docs/`.

## 2026-05-09

### Changed

- Added a server-authoritative checkout pricing helper for BobPay order creation.
- BobPay checkout now recalculates product names, prices, subtotal, referral discount, shipping, and total on the server before creating orders or payment links.
- Added store-level promo settings defaults so referrals and future coupons can be globally guarded without trusting checkout client state.
- Added deterministic checkout pricing verification and removed checkout/referral/email debug logs that exposed operational details.

### Added

- Created `docs/impact-store-roadmap.md` after initial repository analysis.
- Captured project goal: a pleasant, high-converting B2B and B2C user experience with strong SEO.
- Documented initial backlog for variants management, admin upgrades, coupons/referrals toggles, SEO foundation, and request-a-quote functionality.
- Added planning/spec recovery docs:
  - `docs/technical-discovery.md`
  - `docs/features/product-variants.md`
  - `docs/features/request-a-quote.md`
  - `docs/features/coupons-referrals.md`
  - `docs/features/admin-upgrade.md`

### Added (phase 2 — product variants)

- Product model now supports an optional `variants` array (`IProductVariant`): variantId, sku, title, price, originalPrice, stock, condition, attributes, images, published. Products without variants continue to work exactly as before.
- Product detail page shows a variant selector when variants exist, with dynamic price/stock display and a "From R…" label when no variant is selected.
- New `ProductDetailActions` component handles variant selection UI.
- Cart now distinguishes variants of the same product using a composite `cartKey` (`productId|variantId`). Backward-compatible migration for existing stored carts.
- `AddToCartButton` accepts optional `variantId` and `variantTitle`.
- Checkout pricing helper (`checkout-pricing.ts`) is now variant-aware: resolves variant price/stock when `variantId` is provided, aggregates quantities per variant, validates variant availability.
- Order model includes optional `variantId`/`variantTitle` on line items.
- `ProductCard` shows "From R…" pricing when product has multiple published variants.

### Notes

- Repository is on the `hermes` branch.
- Future implementation changes should include documentation updates in `docs/` before handoff.
- Admin variant management UI not yet implemented (planned for admin UX phase).
- Product API routes already accept/preserve variant data via Mongoose schema.
