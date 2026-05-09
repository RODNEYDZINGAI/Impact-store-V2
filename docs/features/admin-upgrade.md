# Admin Upgrade

Date: 2026-05-09
Status: planning/spec only

## Purpose

The current admin area is useful for basic products, orders, users, and dashboard visibility, but it does not yet support the operational depth required for B2B/B2C commerce. Admin needs richer information architecture, safer workflows, product variants, quotes, coupons, settings, order actions, and business customer management.

## Implementation Sequence

1. Redesign admin navigation to include Dashboard, Products, Orders, Customers, Quotes, Coupons, Settings, and Reports.
2. Add shared admin layout patterns for filters, tables, detail pages, status badges, empty states, and destructive/action confirmations.
3. Upgrade dashboard data to include paid/unpaid orders, revenue by period/category, low stock by variant, quote volume, promo usage, and B2B/B2C split.
4. Upgrade product management with variant editor, draft/published filters, bulk actions, media handling, SEO fields, and import/export planning.
5. Upgrade order management with status updates, payment status, fulfillment notes, tracking/courier fields, cancellation/refund states, and customer communication.
6. Add quote queue and coupon/settings modules after their data contracts are finalized.
7. Upgrade customer management with business account fields, procurement contacts, referral status, order/quote history, and account notes.
8. Remove debug logging from admin APIs and add audit-friendly server responses.

## Affected Files

- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/products/page.tsx`
- `src/app/admin/products/new/page.tsx`
- `src/app/admin/products/[id]/edit/page.tsx`
- `src/app/admin/orders/page.tsx`
- `src/app/admin/users/page.tsx`
- `src/app/admin/users/[id]/page.tsx`
- `src/app/api/admin/dashboard/route.ts`
- `src/app/api/products/*`
- `src/app/api/orders/route.ts`
- `src/app/api/users/route.ts`
- New admin routes for quotes, coupons, settings, and reports.
- Models: `Product`, `Order`, `User`, plus future `QuoteRequest`, `Coupon`, and settings models.

## Dependencies

- Product variants spec for product and inventory admin.
- Quote system spec for quote queue.
- Coupons/referrals spec for promo and settings admin.
- B2B customer fields on `User`.
- Authorization middleware or consistent server-side admin checks.
- A clear decision on whether admin pages remain client-heavy or move more reads/actions server-side.

## Risks

- Admin changes can touch many operational workflows and create regressions if shipped as one large rewrite.
- Client-only admin pages depend on API behavior and need strong loading/error states.
- Bulk actions and imports can corrupt data without validation and preview steps.
- Debug logging in `src/app/api/users/route.ts` should be removed before expanding admin user operations.
- Dashboard revenue currently sums all orders, not necessarily paid orders, which can mislead operations.

## Verification and Testing

- Admin navigation renders only for authenticated admins.
- Non-admin users are redirected or rejected by every admin API route.
- Product, order, user, quote, coupon, and settings pages handle empty, loading, error, and populated states.
- Dashboard totals match agreed definitions, especially paid revenue vs gross order total.
- Order status transitions are valid and audited.
- Bulk actions require confirmation and report partial failures.
- Run lint/build and targeted API tests before handoff.

## Rollback

- Ship admin modules in incremental routes rather than replacing all pages at once.
- Keep existing Dashboard, Products, Orders, and Users routes available until replacements are verified.
- Feature-toggle Quotes, Coupons, Settings, and Reports navigation until backing APIs are stable.
- Avoid destructive migration for admin data fields; add optional fields first.

## Recommended Boundaries: Claude Code vs Codex

- Claude Code: implement admin UI modules, shared components, filters, forms, and CRUD flows once model/API contracts are stable.
- Codex: review operational workflow definitions, authorization checks, dashboard metric correctness, logging hygiene, and regression coverage.
- Codex should handle small hardening patches around admin APIs before broad UI expansion.
