# Impact Store Changelog

All Impact Store project changes should be documented here or in linked feature docs under `docs/`.

## 2026-05-09

### Added (phase 3 — request-a-quote)

- **QuoteRequest model** updated: status enum changed to `new/contacted/quoted/won/lost/archived`; added `source`, `variant`, `budget`, `timeline`, `assignedAdmin`, `quotedPrice`, `quotedNotes` fields; `products` array is now optional to support general enquiries.
- **POST /api/quotes**: accepts general enquiries (empty products array); validates `name`, `email`, `message`; sends admin notification + requester confirmation emails; defaults status to `new`.
- **GET /api/quotes**: server-side pagination (`page`, `limit`) and `status` filter; populates product references.
- **GET/PATCH /api/quotes/[id]**: updated valid statuses to new enum; PATCH supports `quotedPrice` and `quotedNotes` in addition to `status` and `adminNotes`.
- **DELETE /api/quotes/[id]**: soft-archives a quote (sets `status=archived`).
- `/quote` page: added `budget` and `timeline` fields; products section is optional; `message` is required.
- Cart page: "Request Bulk Quote" link added to the order summary panel.
- **Admin `/admin/quotes`**: list page updated to new status tabs (All / New / Contacted / Quoted / Won / Lost) with colour-coded badges; server-side pagination.
- **Admin `/admin/quotes/[id]`**: detail page updated to new status enum; adds `quotedPrice` and `quotedNotes` inputs; displays budget/timeline/source when present.
- Admin layout: added Quotes link to the sidebar navigation.
- `sendQuoteNotificationEmail` and `sendQuoteConfirmationEmail` exported from `src/lib/email.ts` as named aliases.

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

### Added (phase 3 — request-a-quote)

- QuoteRequest Mongoose model: products (with product ref, name, quantity range), contact info (name, email, phone, company), message, status workflow (pending → reviewed → quoted → accepted → declined), admin notes, timestamps.
- Public quote request page at `/quote` with multi-product form, pre-fill support via query params (`?product=...&productName=...`), and success confirmation.
- "Request Quote" button on product detail pages (`ProductDetailActions`) linking to `/quote` with pre-filled product.
- Navbar "Request Quote" button now links to `/quote` instead of `/contact`.
- API routes: `POST /api/quotes` (public submit with server-side validation), `GET /api/quotes` (admin list), `GET/PATCH /api/quotes/[id]` (admin view/update).
- Admin quotes dashboard: `/admin/quotes` (filterable list with status tabs), `/admin/quotes/[id]` (detail view with status update, admin notes, reply link).
- Admin sidebar updated with Quotes link.
- Email notifications: admin notification + customer acknowledgment on new quote submission via `sendQuoteRequestEmail` and `sendQuoteAcknowledgmentEmail`.
