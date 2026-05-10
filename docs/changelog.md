# Impact Store Changelog

All Impact Store project changes should be documented here or in linked feature docs under `docs/`.

## 2026-05-10 (phase 8 — admin light theme)

### Changed

- Admin section pages now use a light professional theme with slate backgrounds, white panels, slate borders/text, light form controls, light status badges, and a royal active navigation state while preserving existing admin functionality.

## 2026-05-10 (phase 7 — recycling page)

### Added

- **Electronics recycling page** (`/recycling`): full marketing page for business e-waste collection services with hero, stats bar, accepted items grid, benefits section, 4-step process, collection request form (submits via `/api/contact`), environmental impact section with SA e-waste statistics, and CTA banner.
- Navbar updated with Recycling link between About and Contact.

## 2026-05-09 (phase 6 — category taxonomy and product discovery)

### Added

- Main category taxonomy for Mobile Devices, IT Hardware, and Security and Access Control with practical subcategories documented in `docs/features/category-taxonomy.md`.
- `/api/category-taxonomy` admin API and `CategoryTaxonomy` model for saving editable category/subcategory settings.
- `/admin/categories` management screen for adding, removing, and editing categories and subcategories.
- Optional `categorySlug` and `subcategory` product fields with backward-compatible legacy `category` support.

### Changed

- `/products` now supports categorySlug/subcategory discovery and filtering while preserving existing `?category=` links.
- Product create/edit screens now capture main category, subcategory, and legacy category values.

## 2026-05-09 (phase 5 — coupons and referrals)

### Added (phase 5 — coupons and referrals)

- **Coupon model** (`src/models/Coupon.ts`): Mongoose schema with code (unique, indexed, uppercase), discountType (percentage/fixed), discountValue, minimumOrder, maxUses, usedCount, expiresAt, isActive, timestamps.
- **Coupon admin API** (`/api/coupons`): GET (list all, admin-only), POST (create with validation — code uniqueness, discountValue bounds, admin-only).
- **Coupon detail API** (`/api/coupons/[id]`): GET (single coupon), PATCH (update fields), DELETE (soft delete via isActive=false). All admin-only.
- **Coupon validation API** (`/api/coupons/validate`): POST (public) — accepts `{ code, subtotal }`, validates existence, active status, expiry, usage limits, minimum order. Returns discount details or generic "Invalid coupon code" to prevent enumeration.
- **Admin coupons page** (`/admin/coupons`): client component listing all coupons in a table (Code, Type, Value, Min Order, Uses, Expires, Active, Actions) with a "Create Coupon" form. Dark theme, rounded borders, steel/royal gradients.
- **Admin coupon edit page** (`/admin/coupons/[id]`): client component with readonly code, editable discountType, discountValue, minimumOrder, maxUses, expiresAt, isActive toggle, and deactivate button.
- **Checkout pricing coupon support** (`checkout-pricing.ts`): added `resolveCoupon` callback and `CouponValidationResult` interface. Coupon validation checks active, not expired, under max uses, meets minimum order. Applies percentage or fixed discount, caps at subtotal. Both coupon and referral discounts stack. `couponCode` added to result interface.
- **Referral tracking**: `User` model now has `referredBy` field (string, default null) to track which user referred this user.
- **Admin navigation**: Coupons link moved from planned items to active admin sidebar navigation.
- **Coupon test coverage** in `scripts/verify-pricing.ts`: validates percentage coupon, fixed coupon (with subtotal cap), expired coupon rejection, minimum order not met, coupon+referral stacking, and coupons disabled by settings.

## 2026-05-09 (phase 4 — admin UX upgrade)

### Added

- **Coupon model** with code, percentage/fixed discount type, value, minimum order, maximum uses, expiry date, active state, usage count, and timestamps.
- **Admin coupon CRUD** at `/admin/coupons` with create, edit, delete, active toggle, expiry, minimum spend, and usage-limit controls.
- **Coupon APIs** under `/api/coupons` and `/api/coupons/[id]`, restricted to admins.
- Checkout pricing now validates coupon codes server-side and combines coupon discounts with existing referral discounts.
- Orders now store coupon code/discount, referral discount, referrer, and a promotion-recorded flag for paid-order reconciliation.
- BobPay webhook now records coupon usage and referral analytics only when an order transitions to paid.
- User referral analytics now track usage count, referred revenue, discount issued, and referred order IDs; admin user screens display referral usage metrics.

### Changed

- Referral code generation now uses a larger random code space to reduce collisions.
- Public referral validation respects the store-level referrals toggle.
- Checkout includes a coupon code field while preserving server-authoritative payment totals.

## 2026-05-09 (phase 4 — admin UX upgrade)

### Added

- **Admin dashboard metrics**: quote request count card added alongside revenue, orders, and customers cards. Recent quote requests section added below recent orders, linking to each quote detail page.
- **Dashboard API** (`/api/admin/dashboard`): includes `counts.quotes` (total quote requests) and `recentQuotes` (5 most recent, with name, email, company, status, products).
- **Variant management** on product create (`/admin/products/new`) and product edit (`/admin/products/[id]/edit`) pages: inline add/remove variant rows with fields for title, SKU, price, stock, and condition. Variants are serialized and submitted alongside the product on save.
- **Orders status filter tabs** (`/admin/orders`): tab bar for All / Pending / Confirmed / Shipped / Delivered with live counts. Each tab filters the displayed order list.
- **Quick order status update and notes** (`/admin/orders`): per-order status `<select>` plus internal notes editor that PATCH `/api/orders/[id]` inline without a page reload; spinner shown while the request is in-flight.
- **`PATCH /api/orders/[id]`**: new admin-only route for updating order status and internal order notes. Validates that the supplied status is one of `pending | confirmed | shipped | delivered`.
- **Order notes**: `Order` model now stores optional internal admin notes for fulfillment and customer follow-up context.

### Changed

- Admin layout now uses a more responsive sidebar/top-scroll navigation and shows planned Coupons, Settings, and Reports modules as disabled items to avoid broken links.
- Edit product page now includes a Cancel button returning to the product list.

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
