# Impact Store B2B SEO Growth Project

> **Project owner/orchestrator:** Hermes Agent  
> **Primary coding executor:** Claude Code CLI where available  
> **Secondary coding executor:** Codex CLI fallback  
> **Human owner:** Impact Store / Impact Holdings  
> **Working branch:** `hermes`  
> **Production branch:** `main`  
> **Kanban board:** `impact-store-v2-seo`  
> **Main implementation plan:** `docs/plans/2026-05-25-b2b-seo-growth-plan.md`

---

## 1. Project Summary

Impact Store is being repositioned from a general ecommerce catalogue into a **B2B-first South African technology supplier**, while still retaining B2C product discovery and online shopping traffic.

The SEO and conversion strategy is to make the site rank and convert for business procurement searches such as:

- IT hardware supplier South Africa
- business laptops South Africa
- networking equipment supplier South Africa
- CCTV supplier South Africa
- access control systems South Africa
- UPS supplier South Africa
- office technology supplier South Africa

The site should continue to support consumer searches for phones, tablets, laptops, accessories, and individual product models, but the homepage, category copy, quote flow, and landing pages should be written primarily for business buyers.

---

## 2. Why This Project Matters

B2B buyers behave differently from normal ecommerce shoppers. They often need:

- quotes before buying
- bulk pricing
- availability confirmation
- VAT/business documentation
- product sourcing advice
- supplier credibility
- procurement-friendly communication
- delivery/support reassurance

Because online payments are currently disabled until the live BobPay account is ready, the best conversion path right now is **Request a Quote**, not immediate checkout.

This project therefore focuses on two outcomes:

1. **SEO visibility** for South African B2B technology procurement keywords.
2. **Lead generation** through a stronger quote request journey.

---

## 3. Strategic Positioning

Recommended positioning statement:

> Impact Store supplies South African businesses with IT hardware, business laptops, networking equipment, security systems, access control, phones, tablets, and office technology.

This positioning should be reflected in:

- homepage hero copy
- homepage metadata
- category page descriptions
- product page CTAs
- quote page metadata and form context
- footer/navigation CTAs
- landing pages
- blog/content topics
- structured data and sitemap strategy

---

## 4. Target Audience

### Primary Audience: B2B

- SMEs
- offices and branches
- schools and training providers
- security companies
- IT managers
- procurement teams
- facilities managers
- remote/hybrid teams
- resellers and bulk buyers

### Secondary Audience: B2C

- individual shoppers buying laptops, phones, tablets, accessories, storage, power, and security products
- price-comparison shoppers
- product-model searchers

---

## 5. Core SEO Keyword Clusters

### Homepage / Broad Supplier Keywords

- IT hardware supplier South Africa
- IT equipment supplier South Africa
- business technology supplier South Africa
- office technology supplier South Africa
- ICT equipment supplier South Africa

### Business Laptops

- business laptops South Africa
- corporate laptop supplier South Africa
- bulk laptops for business South Africa
- laptop supplier South Africa
- HP business laptops South Africa
- Dell business laptops South Africa
- Lenovo ThinkPad South Africa

### IT Hardware and Networking

- networking equipment supplier South Africa
- business routers South Africa
- office WiFi solutions South Africa
- network switches supplier South Africa
- PoE switch South Africa
- NAS supplier South Africa
- Synology NAS South Africa
- Ubiquiti supplier South Africa
- MikroTik supplier South Africa
- TP-Link Omada supplier South Africa

### Security and Access Control

- security equipment supplier South Africa
- CCTV supplier South Africa
- CCTV systems for business South Africa
- access control systems South Africa
- biometric access control South Africa
- time attendance systems South Africa
- Hikvision CCTV supplier South Africa
- Dahua CCTV supplier South Africa
- ZKTeco supplier South Africa

### Power, Backup, and Storage

- UPS supplier South Africa
- UPS for business South Africa
- UPS for office computers
- backup power for office IT
- server UPS South Africa
- NAS storage for business South Africa

### B2C Supporting Keywords

- buy laptops online South Africa
- buy smartphones online South Africa
- Samsung phones South Africa
- iPhone South Africa
- buy tablets online South Africa
- computer accessories South Africa

---

## 6. Page Strategy

### Homepage

Purpose: rank for broad B2B supplier intent and direct visitors toward quote or category pages.

Needs:

- B2B-first title and meta description
- clear supplier-focused H1/hero copy
- quote CTA above the fold
- category links for laptops, IT hardware, networking, CCTV/access control, UPS, phones/tablets, accessories
- trust copy for businesses, schools, offices, SMEs, and procurement teams

### Category Pages

Purpose: rank for mid-funnel category keywords and guide users to products/quote requests.

Priority categories:

1. Laptops
2. IT Hardware
3. Security and Access Control
4. Phones
5. Tablets
6. Accessories

Each priority category needs:

- title/meta description
- intro copy
- B2B benefit bullets
- visible FAQ section
- FAQPage JSON-LD where indexable
- product grid
- quote CTA

### Product Pages

Purpose: capture long-tail brand/model searches and convert product interest into quote requests.

Each product should have:

- accurate product title
- strong description
- specs/use cases
- correct image
- alt text
- Product structured data
- quote CTA for bulk/business buyers

### B2B Landing Pages

Purpose: target high-intent supplier/service keywords that do not fit neatly into product categories.

Initial landing page ideas:

1. Business Laptops South Africa
2. IT Hardware Supplier South Africa
3. CCTV for Business
4. Business WiFi Solutions
5. UPS for Business
6. Access Control Systems South Africa
7. ICT Equipment Supplier South Africa
8. Office Technology Supplier South Africa

---

## 7. Conversion Strategy

The primary conversion event is a **quote request**.

The quote flow should capture:

- name
- email
- phone
- company
- products of interest
- quantities
- budget
- timeline
- source/context
- message/notes

Quote source tracking matters because it tells us whether leads came from:

- homepage
- navbar
- footer
- product card
- product page
- category page
- future landing page
- future blog article

---

## 8. Current Implementation Status

### Completed

#### Planning and orchestration

- Created B2B SEO growth implementation plan:
  - `docs/plans/2026-05-25-b2b-seo-growth-plan.md`
- Updated changelog with planning addition:
  - `docs/changelog.md`
- Created Kanban board tasks under:
  - `impact-store-v2-seo`
- Set watchdog cron for sprint monitoring:
  - `Impact Store B2B SEO sprint watchdog`

#### Quote conversion slice

Commit:

- `c5379d9 — feat: improve B2B quote conversion flow`

Changed files:

- `src/app/api/quotes/route.ts`
- `src/app/page.tsx`
- `src/app/quote/page.tsx`
- `src/components/Footer.tsx`
- `src/components/Navbar.tsx`
- `src/components/ProductCard.tsx`
- `src/lib/email.ts`

Implemented:

- homepage/footer/navbar quote CTAs now point to `/quote` with source context
- ProductCard quote link includes product ID, product name, and `source=product-card`
- quote API validates and stores budget, timeline, and source
- quote page submits source query value
- admin quote email includes budget/timeline/source context

Verification:

- targeted ESLint passed with warnings only
- `npm run build` passed

#### Quote page metadata slice

Local commit awaiting orchestration review/push:

- `d807061 — Add quote page metadata`

Changed files:

- `src/app/quote/page.tsx`
- `src/components/QuoteForm.tsx`

Implemented:

- `/quote` refactored into a server component with metadata
- existing client quote form moved into `QuoteForm`
- query prefill and submit payload behavior preserved
- title/meta description verified in generated HTML

Verification reported by worker:

- `npx eslint src/app/quote/page.tsx src/components/QuoteForm.tsx` passed
- `npm run build` passed
- generated quote HTML metadata verified

Known caveat:

- full `npm run lint` is currently blocked by unrelated untracked legacy/monitor scripts using `require()` imports, not by the quote metadata changes.

---

## 9. Active Kanban Tasks

Board: `impact-store-v2-seo`

| Task ID | Status | Owner | Task |
|---|---:|---|---|
| `t_8a4ddbd1` | Done | researcher | SEO research: validate B2B keyword map and page priorities |
| `t_4f76d364` | Done | backend-dev | Implement quote CTA routing and quote data capture |
| `t_7bfb9b8c` | Review/blocked | frontend-dev | Implement quote page metadata server wrapper |
| `t_79e90808` | Running | writer | Draft category SEO copy and FAQs |
| `t_ecb1f8c4` | Todo | frontend-dev | Implement homepage B2B SEO rewrite |
| `t_d405bb76` | Todo | frontend-dev | Implement category SEO content helper and FAQ rendering |
| `t_dd949983` | Todo | backend-dev | Create product SEO audit script |
| `t_e6f7a179` | Todo | frontend-dev | Audit sitemap, robots, and structured data |
| `t_e3964860` | Todo | default | Final SEO QA gate for first sprint |

---

## 10. Execution Rules

1. Work on `hermes` unless the user explicitly approves merge/deploy to `main`.
2. Use Claude Code CLI first for coding work.
3. Use Codex CLI as secondary fallback if Claude Code is unavailable.
4. Use Hermes/GLM-style subagents for research, copywriting, auditing, QA, and documentation.
5. Do not publish unpublished products without review.
6. Do not modify secrets or `.env` files.
7. Run targeted checks for changed files.
8. Run `npm run build` before considering a coding slice complete.
9. Record major project changes in `docs/changelog.md`.
10. Keep the Kanban board updated so progress is visible.

---

## 11. Immediate Next Steps

### Step 1: Review and close quote metadata task

- Review commit `d807061`
- Confirm quote page still works
- Push to `hermes` if accepted
- Mark `t_7bfb9b8c` complete

### Step 2: Finish category copy task

- Collect writer output for category intros and FAQs
- Save approved copy into the category SEO helper implementation task

### Step 3: Homepage B2B rewrite

- Update homepage metadata
- Rewrite hero and business sections
- Preserve shopping path for B2C users
- Strengthen quote CTAs

### Step 4: Category SEO MVP

- Add category SEO content helper
- Render visible category intros and FAQs
- Add FAQPage JSON-LD for indexable category pages

### Step 5: Product SEO audit

- Create read-only product SEO audit script
- Report weak titles, descriptions, images, specs, and publish readiness
- Use audit results to prepare first B2B publishing batch

### Step 6: Technical SEO QA

- Confirm sitemap excludes unpublished products
- Confirm new landing/category pages are indexable where appropriate
- Check robots rules
- Validate structured data

---

## 12. Success Criteria

The first sprint is successful when:

- quote flow captures source/budget/timeline/product context
- `/quote` has proper SEO metadata
- homepage communicates B2B supplier positioning
- priority category pages have SEO copy and FAQs
- product SEO audit script exists and runs read-only
- sitemap/robots/schema are checked
- build passes
- Kanban QA task passes
- user receives progress updates through the watchdog

Longer term, the broader project succeeds when:

- Impact Store ranks for B2B supplier keywords in South Africa
- category/product pages attract both B2B and B2C traffic
- quote requests increase from business visitors
- first B2B product batches are reviewed and published
- Search Console shows growing impressions/clicks for priority keywords

---

## 13. Monitoring and Reporting

A sprint watchdog is scheduled to report progress back to Discord.

The watchdog checks:

- repo status
- Kanban status
- running/blocked/crashed tasks
- site health
- dev/lab/live availability
- uncommitted changes
- next required action

Reports should be concise and action-oriented.

---

## 14. Related Documentation

- `docs/plans/2026-05-25-b2b-seo-growth-plan.md`
- `docs/seo/keyword-map.md`
- `docs/seo/metadata-strategy.md`
- `docs/features/request-a-quote.md`
- `docs/features/category-taxonomy.md`
- `docs/impact-store-roadmap.md`
- `docs/changelog.md`
