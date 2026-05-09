# Product Variants

Date: 2026-05-09
Status: planning/spec only

## Purpose

Impact Store needs product variants for phones, laptops, tablets, accessories, IT hardware, and security devices where SKU, price, stock, condition, images, and attributes can differ by option. The current model has one SKU, one price, one condition, and one stock count per product, which blocks accurate catalog, cart, checkout, and order operations.

## Implementation Sequence

1. Define a variant subdocument contract on `Product` with `variantId`, SKU, title, price, original price, stock, condition/grade, attributes, images, published state, and optional warranty fields.
2. Add backward-compatible reads that derive a default variant from existing product-level fields when `variants` is missing.
3. Update product APIs to validate unique product slugs and unique variant SKUs.
4. Update admin create/edit forms to manage variants with add/remove/reorder, per-variant media, and per-variant stock.
5. Update product cards and detail pages to show "from" pricing, option selectors, selected variant images, stock, and add-to-cart disabled states.
6. Change cart identity from product `_id` to product plus selected variant ID.
7. Update checkout/payment/order creation to validate variant stock and persist an immutable selected variant snapshot.
8. Add migration/backfill for existing products and document rollback.

## Affected Files

- `src/models/Product.ts`
- `src/models/Order.ts`
- `src/context/CartContext.tsx`
- `src/components/ProductCard.tsx`
- `src/components/AddToCartButton.tsx`
- `src/components/ProductGallery.tsx`
- `src/app/products/page.tsx`
- `src/app/products/[slug]/page.tsx`
- `src/app/cart/page.tsx`
- `src/app/checkout/page.tsx`
- `src/app/api/products/route.ts`
- `src/app/api/products/[id]/route.ts`
- `src/app/api/payments/bobpay/route.ts`
- `src/app/api/orders/route.ts`
- `src/app/admin/products/page.tsx`
- `src/app/admin/products/new/page.tsx`
- `src/app/admin/products/[id]/edit/page.tsx`

## Dependencies

- Server-authoritative checkout pricing and stock validation.
- A cart migration strategy for old `localStorage` entries.
- Admin media upload behavior in `src/components/ImageUpload.tsx`.
- Order item schema changes that preserve historical order display.
- Product search/filter changes if attributes become filterable.

## Risks

- Existing product-level stock and new variant-level stock can diverge during transition.
- Cart quantity limits can be wrong if they still compare against product-level stock.
- Product cards may show the wrong price unless "from price" and selected/default variant rules are explicit.
- SKU uniqueness needs to be enforced across variants, not only top-level products.
- Existing BobPay orders should keep old item data readable after the schema evolves.

## Verification and Testing

- Product model accepts existing products with no variants and new products with multiple variants.
- Admin can create and edit a product with at least two variants and unique SKUs.
- Product detail requires/selects a variant before add-to-cart when multiple variants exist.
- Cart supports two variants of the same product as separate lines.
- Checkout rejects stale price, stale stock, missing variant ID, and unpublished variant submissions.
- BobPay payment amount equals the server-calculated total for selected variants.

## Rollback

- Keep product-level fields until the variant rollout is stable.
- Add feature flag or admin setting to hide variant selectors and use default variants if needed.
- Do not delete or overwrite existing product-level `sku`, `price`, `stock`, `condition`, or `images` during first migration.
- If checkout fails after rollout, disable variant-aware add-to-cart and restore product-level cart behavior while preserving variant data.

## Recommended Boundaries: Claude Code vs Codex

- Claude Code: implement schema migration, admin variant editor, product UI, cart shape changes, and API updates as a coordinated feature branch.
- Codex: review and tighten variant data contracts, checkout integrity, stock race handling, and regression tests; write follow-up docs when behavior changes.
- Avoid splitting product model and checkout stock work across separate agents unless the API contract is frozen first.
