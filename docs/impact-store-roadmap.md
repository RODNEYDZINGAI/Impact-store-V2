# Impact Store UX, B2B/B2C, Feature & SEO Roadmap

Date: 2026-05-09
Branch: `hermes`
Repo: `Impact-store-V2`

## Project goal

Make Impact Store a pleasant, trustworthy, high-converting e-commerce experience for both:

- **B2C customers** buying individual devices/accessories online.
- **B2B buyers** procuring devices, ICT hardware, mobile device management, security/access-control products, and business technology solutions.

Every code or content change for this project must be documented in the `docs/` folder before it is considered complete.

## Current repo snapshot

Stack observed during repository analysis:

- Next.js `16.1.6`, React `19.2.3`, TypeScript, Tailwind CSS.
- MongoDB via Mongoose.
- NextAuth authentication.
- BobPay payment integration.
- R2/S3 upload support.
- Existing customer, product, order, cart, checkout, admin, sitemap, and robots routes.

Important existing files:

- `src/models/Product.ts` — product schema currently supports name, slug, SKU, description, single price, category, condition, brand, images, specs, stock, featured, published.
- `src/models/Order.ts` — order schema includes order items, shipping address, subtotal, discount, total, statuses, payment metadata, referral code.
- `src/models/User.ts` — user schema includes admin/customer role and per-customer referral code toggle.
- `src/app/products/page.tsx` and `src/app/products/[slug]/page.tsx` — public catalog and product detail pages.
- `src/app/checkout/page.tsx` — checkout with fixed shipping and referral discount UI.
- `src/app/admin/*` — simple dashboard, products, orders, users.
- `src/app/sitemap.ts` and `src/app/robots.ts` — basic technical SEO exists, but page-level SEO is underdeveloped.

## High-priority findings

### 1. Product variants are missing

Current product model has a single SKU, price, stock, condition, and image list per product. This is not enough for phones, laptops, tablets, and accessories where customers need choices such as:

- Storage/RAM.
- Color.
- Grade/condition.
- Network/carrier.
- Warranty term.
- Bundle options.
- Business pack quantity.

Required work:

- Add product variant schema with variant-level SKU, price, original price, stock, attributes, images, condition/grade, published state.
- Update product admin create/edit forms to manage variants cleanly.
- Update product detail page to select variant before cart/quote.
- Update cart and order item models to store selected variant data.
- Update stock validation and stock deduction to operate at variant level.

### 2. Admin side is too simple for real operations

Admin currently covers dashboard, products, orders, and users, but lacks the workflow depth needed for a serious B2B/B2C store.

Required work:

- Improve dashboard KPIs: conversion, abandoned carts, quote requests, paid/unpaid orders, low stock by variant, revenue by category, B2B vs B2C split.
- Add better product management: draft/published visibility, bulk actions, filters, import/export, media management, SEO fields, variant management.
- Add order management: status update actions, payment status, fulfillment notes, tracking/courier details, refund/cancel flows, customer communication.
- Add customer/business account management: company name, VAT/tax number, procurement contacts, credit/quote preference, account type.
- Add settings area for feature toggles, shipping rules, discounts, referrals, SEO defaults, and store contact details.
- Add audit-friendly UI messages and remove debug console logging from admin APIs/pages.

### 3. Coupons and referral codes need proper on/off controls

Referral support exists per user, and checkout applies a fixed 5% discount after validating enabled referral codes. There is no general coupon model and no global feature toggle.

Required work:

- Add store-level feature toggles for referrals and coupons.
- Add coupon model: code, enabled, discount type, amount/percentage, usage limits, minimum spend, applicable products/categories, start/end dates, B2B/B2C eligibility.
- Add admin coupon management page.
- Make checkout discount calculation server-authoritative. The server must validate code, compute discount, and reject client-tampered totals.
- Support referral analytics: who referred, usage count, total revenue, total discount issued.

### 4. SEO is not strong enough yet

Technical sitemap and robots files exist, plus a single global metadata object in `src/app/layout.tsx`. Product/category pages do not yet have strong unique metadata, canonical URLs, Open Graph, Twitter cards, structured data, or search-intent content.

Required work:

- Add `generateMetadata` for product, category, and key service pages.
- Add product structured data JSON-LD: Product, Offer, AggregateRating if reviews are added later, BreadcrumbList.
- Add Organization/LocalBusiness structured data for Impact Store/Impact Holdings.
- Add canonical URLs and Open Graph/Twitter images.
- Add category landing pages optimized for searches such as refurbished laptops South Africa, business laptops, ICT hardware supplier, MDM solutions, access control/security hardware.
- Add internal linking between home, categories, products, MDM, TAP, contact, quote pages.
- Add image alt text strategy and image dimensions/optimization.
- Add FAQ content for B2B procurement, warranties, delivery, returns, device condition, financing/laybuy, and support.
- Add Search Console monitoring workflow and target keyword tracking.

### 5. Request-a-quote functionality is not implemented

Product cards currently link the Quote button to `/contact`. There is no dedicated quote request flow, quote model, admin queue, or B2B quote workflow.

Required work:

- Add quote request model for product-specific and general B2B quotes.
- Add public `/quote` or `/request-quote` page.
- Add quote CTA on product detail and cart pages.
- Support selected product/variant, quantity, company details, budget, timeline, and notes.
- Add admin quote queue with statuses: new, contacted, quoted, won, lost, archived.
- Send quote notifications by email to Impact Store team and confirmation email to customer.
- Allow conversion of quote request into order where possible.

### 6. B2B and B2C user journeys need clearer separation

The site currently behaves mostly like a standard B2C catalog/checkout. It mentions business procurement but does not have B2B-specific account, quote, bulk order, or procurement UX.

Required work:

- Add B2C journey: browse, filter, compare, select variant, checkout, track order, review/support.
- Add B2B journey: request quote, bulk quantity, company account, procurement contact, SLA/warranty/support expectations, MDM/security/ICT solution pages.
- Add account type field: individual vs business.
- Add company profile fields: company name, registration/VAT number, billing details, procurement contact, delivery sites.
- Add CTAs that guide users: “Buy Now” for B2C, “Request Bulk Quote”/“Talk to Sales” for B2B.

## Recommended phased roadmap

### Phase 0 — Project foundations and documentation

- Keep all work on `hermes` branch.
- Maintain a documentation file per feature in `docs/`.
- Add `docs/changes.md` or `docs/changelog.md` for every project change.
- Add planning documents before implementation.
- Run lint/build checks before handoff.

### Phase 1 — SEO foundation

- Add page-level metadata and canonical URLs.
- Add product/category/service JSON-LD.
- Improve sitemap base URL and product inclusion logic.
- Create SEO content structure for categories and B2B solution pages.
- Add keyword-to-page map.

### Phase 2 — Product variants and catalog UX

- Extend product model and APIs for variants.
- Update admin product editor for variants.
- Update product detail, cart, checkout, and order logic to handle selected variant.
- Improve filters and product discovery: brand, price range, condition, stock, category, use-case.

### Phase 3 — Quote system for B2B

- Add request quote model/API/pages.
- Add product/cart quote CTAs.
- Add admin quote queue and notifications.
- Add B2B-focused fields and status workflow.

### Phase 4 — Coupons/referrals and promotion controls

- Add coupon model and admin page.
- Add global feature toggles.
- Make checkout discount calculations server-authoritative.
- Add analytics for promo usage and referrals.

### Phase 5 — Admin experience upgrade

- Redesign admin IA and navigation.
- Add product filters/search/bulk actions.
- Add order status actions and tracking fields.
- Add quote, coupon, settings, and analytics pages.
- Improve user/business customer management.

### Phase 6 — UX polish and conversion optimization

- Add comparison, recently viewed, wishlist/save for later, stock urgency, warranty badges, financing/laybuy messaging, trust panels.
- Improve checkout: guest checkout or clearer account requirement, address autocomplete/province selector, shipping options, better error handling.
- Improve mobile UI and accessibility.
- Add analytics events for product views, add-to-cart, checkout, quote requests, and completed payments.

## Documentation standard for all future changes

For every feature/change, create or update a file in `docs/` that includes:

1. Purpose and business reason.
2. User journey affected: B2B, B2C, admin, SEO, or operations.
3. Files changed.
4. Data model/API changes.
5. Admin/customer UI changes.
6. SEO impact, if relevant.
7. Test/verification steps.
8. Deployment notes and rollback considerations.

Suggested docs structure:

```text
docs/
  impact-store-roadmap.md
  changelog.md
  features/
    product-variants.md
    request-a-quote.md
    coupons-referrals.md
    admin-upgrade.md
    seo-foundation.md
  seo/
    keyword-map.md
    metadata-strategy.md
  qa/
    regression-checklist.md
```

## Initial implementation backlog

### Must-have before serious launch

1. Product variants management.
2. Request-a-quote system.
3. SEO metadata + structured data foundation.
4. Admin product/order/customer usability upgrade.
5. Coupon/referral global toggles and server-side validation.
6. B2B account/profile fields.
7. Documentation/changelog discipline.

### Should-have next

1. Category landing pages for SEO.
2. B2B bulk quote cart.
3. Admin settings page.
4. Order tracking/fulfillment notes.
5. Better filtering/search/sorting.
6. Analytics events and conversion reporting.
7. Email templates for orders, quotes, referrals, and contact.

### Nice-to-have later

1. Reviews/ratings.
2. Wishlist/save for later.
3. Product comparison.
4. Abandoned cart recovery.
5. Inventory import/export.
6. Customer segmentation and B2B pricing rules.
7. CRM/ERP integration.
