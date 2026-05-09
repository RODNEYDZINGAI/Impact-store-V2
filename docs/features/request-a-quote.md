# Request a Quote

Date: 2026-05-09
Status: planning/spec only

## Purpose

Impact Store needs a dedicated quote flow for B2B buyers and customers who need bulk pricing, procurement terms, product-specific assistance, or solution bundles. Current quote buttons link to `/contact`, so quote intent, product context, variant context, admin follow-up, and conversion tracking are lost.

## Implementation Sequence

1. Define `QuoteRequest` model fields: requester, email, phone, company, account type, product, variant, quantity, budget, timeline, notes, source, status, assigned admin, and timestamps.
2. Add public `/request-quote` or `/quote` route for general and product-specific quotes.
3. Update product cards, product detail, and cart to send product/variant/quantity context into quote flow.
4. Add API routes for quote creation, admin listing, status updates, notes, and conversion metadata.
5. Add email notifications to Impact Store staff and confirmation emails to the requester.
6. Add admin quote queue with statuses: `new`, `contacted`, `quoted`, `won`, `lost`, `archived`.
7. Add conversion path from quote request to order or manual order draft once order drafting exists.
8. Add analytics fields for quote source, category, product, and B2B/B2C split.

## Affected Files

- New `src/models/QuoteRequest.ts`
- New public quote page under `src/app/quote/page.tsx` or `src/app/request-quote/page.tsx`
- New API routes under `src/app/api/quotes`
- New admin pages under `src/app/admin/quotes`
- `src/components/ProductCard.tsx`
- `src/app/products/[slug]/page.tsx`
- `src/app/cart/page.tsx`
- `src/app/admin/layout.tsx`
- `src/lib/email.ts`
- `src/models/Product.ts`
- `src/models/User.ts`
- Future order conversion work in `src/models/Order.ts` and `src/app/api/orders/route.ts`

## Dependencies

- Product variant selection contract if quotes can be variant-specific.
- Email delivery configuration and templates.
- Admin authorization and audit behavior.
- B2B account fields on `User` for company and procurement contacts.
- Optional store settings for quote notifications and quote feature toggles.

## Risks

- Quote forms can attract spam without rate limiting, validation, or bot protection.
- Product context can become stale if quoted products or variants are unpublished after submission.
- Email failures should not lose quote requests.
- Admin statuses need clear semantics or the queue will become unreliable.
- Quote-to-order conversion can create pricing ambiguity if manual discounts are not recorded.

## Verification and Testing

- Guest and signed-in users can submit a general quote request.
- Product detail and cart quote CTAs preserve product, selected variant, and quantity.
- Admin users can list, filter, and update quote statuses.
- Non-admin users cannot access quote administration routes.
- Email failure is logged without exposing secrets and without dropping the saved quote.
- Required fields, invalid quantities, long notes, and missing product IDs are handled cleanly.

## Rollback

- Keep quote CTAs configurable so they can return to `/contact` if the quote system is disabled.
- Store quote requests independently from orders until conversion rules are stable.
- If admin quote pages are not ready, keep quote capture enabled only if email notification is reliable.
- Preserve submitted quote data even if status workflows are reverted.

## Recommended Boundaries: Claude Code vs Codex

- Claude Code: implement the model, public form, API routes, admin queue, and email templates.
- Codex: define/review the quote lifecycle, validation rules, product/variant context contract, and tests for authorization and email failure handling.
- Codex should verify no secrets are printed in quote/email logs before handoff.
