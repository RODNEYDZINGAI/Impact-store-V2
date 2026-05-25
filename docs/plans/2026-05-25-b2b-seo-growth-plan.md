# B2B-First SEO Growth Implementation Plan

> **For Hermes:** Use `subagent-driven-development`, `claude-code`, `codex`, and `kanban-orchestrator` skills to execute this plan task-by-task. Coding work must be routed to Claude Code CLI first and Codex CLI second. Hermes may directly edit only planning/docs, orchestration, monitoring, or emergency fallback when both coding agents are unavailable.

**Goal:** Reposition Impact Store as a South African B2B technology supplier while preserving B2C ecommerce traffic through product/category pages.

**Architecture:** Use the existing Next.js App Router app, MongoDB product/category data, `/quote` lead flow, dynamic product/category metadata, sitemap, robots, and structured data. Start with conversion and SEO foundations, then expand into category FAQs, B2B landing pages, product SEO cleanup, and content marketing.

**Tech Stack:** Next.js App Router, TypeScript/React, MongoDB/Mongoose, existing quote API/email flow, R2-hosted media, Cloudflare/Coolify deployment.

---

## Operating Rules

1. Work on branch `hermes` unless user explicitly approves merge to `main`.
2. Use Claude Code CLI for most coding tasks. Use Codex CLI as secondary fallback.
3. Use GLM/Hermes subagents for research, audits, content drafts, and QA where appropriate.
4. Keep products unpublished until reviewed/approved.
5. Prioritize B2B lead conversion through `/quote` over immediate checkout, because payments are currently disabled pending live BobPay.
6. Keep the user informed with recurring progress checks.

---

## Priority Keyword Map

### Homepage
- Primary: `IT hardware supplier South Africa`
- Secondary: `business technology supplier South Africa`, `office technology supplier South Africa`, `ICT equipment supplier South Africa`
- CTA intent: request quote, bulk orders, business procurement

### Laptops
- Primary: `business laptops South Africa`
- Secondary: `corporate laptop supplier South Africa`, `bulk laptops for business South Africa`, `HP business laptops South Africa`, `Dell business laptops South Africa`, `Lenovo ThinkPad South Africa`

### IT Hardware / Networking
- Primary: `IT equipment supplier South Africa`
- Secondary: `networking equipment supplier South Africa`, `business routers South Africa`, `office WiFi solutions South Africa`, `PoE switch South Africa`, `NAS supplier South Africa`

### Security and Access Control
- Primary: `security equipment supplier South Africa`
- Secondary: `CCTV supplier South Africa`, `CCTV systems for business`, `access control systems South Africa`, `biometric access control South Africa`, `time attendance systems South Africa`

### UPS / Backup Power
- Primary: `UPS supplier South Africa`
- Secondary: `UPS for business South Africa`, `UPS for office computers`, `server UPS South Africa`, `backup power for office IT`

### Phones / Tablets / Accessories
- Primary: `business phones South Africa`, `tablets for business South Africa`, `computer accessories South Africa`
- Secondary B2C: `buy smartphones online South Africa`, `buy tablets online South Africa`, `laptop accessories South Africa`

---

## Phase 0 — Project Setup and Visibility

### Task 0.1: Create SEO Kanban board/backlog

**Objective:** Track all B2B SEO work visibly.

**Files:**
- Reference: `docs/plans/2026-05-25-b2b-seo-growth-plan.md`

**Steps:**
1. Create or reuse Impact Store V2 Kanban board.
2. Add cards for phases below.
3. Assign coding cards to Claude/Codex-capable workers.
4. Assign research/writing cards to GLM/Hermes subagents where available.
5. Add dependencies: research/copy before landing page implementation; implementation before QA; QA before deploy.

**Acceptance:** Board has implementation, research, content, QA, and monitoring tasks with owners.

---

## Phase 1 — Conversion and SEO Foundation

### Task 1.1: Fix quote CTA routing and quote data capture

**Objective:** Make B2B traffic convert to quote requests instead of leaking to generic contact pages.

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/Footer.tsx`
- Modify: `src/components/Navbar.tsx`
- Modify: `src/components/ProductCard.tsx`
- Modify: `src/app/api/quotes/route.ts`
- Modify: `src/app/quote/page.tsx`
- Modify if needed: `src/lib/email.ts`

**Implementation notes:**
- Change quote-related CTAs from `/contact` to `/quote`.
- Product cards should link to `/quote?product=<id>&productName=<encoded>&source=product-card`.
- Homepage/footer/nav bulk quote CTAs should link to `/quote?source=homepage` or suitable source.
- Save `budget`, `timeline`, and `source` in quote API.
- Include budget/timeline/source in admin email if low-risk.

**Verification:**
- Submit quote form locally and confirm MongoDB stores budget/timeline/source.
- Confirm product card quote links include product context.
- Run lint/build.

---

### Task 1.2: Add quote page metadata

**Objective:** Make `/quote` an intentional B2B lead-generation page with SEO-safe metadata.

**Files:**
- Refactor: `src/app/quote/page.tsx`
- Create if needed: `src/components/QuoteForm.tsx`

**Implementation notes:**
- Because current quote page is client-only, split form into a client component.
- Make `src/app/quote/page.tsx` a server component exporting `metadata`.
- Title target: `Request a Business Technology Quote | Impact Store South Africa`
- Meta description: `Request a quote for business laptops, IT hardware, networking equipment, CCTV, access control, phones, tablets and office technology in South Africa.`

**Verification:**
- `/quote` still works with query prefill.
- Metadata renders.
- Run lint/build.

---

### Task 1.3: Homepage B2B SEO rewrite

**Objective:** Reposition homepage around B2B supplier intent.

**Files:**
- Modify: `src/app/page.tsx`
- Modify if needed: `src/components/HeroSlider.tsx`

**Implementation notes:**
- Add page-level metadata.
- Ensure H1/hero copy targets `IT hardware supplier South Africa` / `business technology supplier South Africa`.
- Add copy blocks for businesses, SMEs, schools, offices, security providers, and procurement teams.
- Include strong `/quote` CTA.
- Preserve B2C shopping path.

**Verification:**
- Homepage remains visually consistent.
- No duplicate H1 problems.
- Lighthouse/metadata smoke check.

---

## Phase 2 — Category SEO MVP

### Task 2.1: Category SEO content helper

**Objective:** Add B2B category intro/FAQ metadata without DB/admin schema churn yet.

**Files:**
- Create: `src/lib/category-seo.ts`
- Modify: `src/app/products/page.tsx`

**Implementation notes:**
- Hardcode approved SEO content for priority category slugs.
- Include: SEO title, meta description, intro, B2B benefit bullets, FAQs.
- Initial priority categories: laptops, IT hardware, security/access control, phones, tablets, accessories.

**Verification:**
- Category pages render correct content.
- Search/filter pages remain noindex where appropriate.
- Run lint/build.

---

### Task 2.2: FAQPage JSON-LD for indexable categories

**Objective:** Give Google structured FAQ data for category pages.

**Files:**
- Modify: `src/app/products/page.tsx`
- Use: `src/lib/category-seo.ts`

**Implementation notes:**
- Render FAQ section visibly.
- Add FAQPage JSON-LD only on indexable category pages.
- Do not render FAQ schema on search/filter permutations.

**Verification:**
- Validate JSON-LD shape.
- No console errors.

---

## Phase 3 — B2B Landing Pages

### Task 3.1: Create B2B landing page template/components

**Objective:** Build reusable landing-page structure for supplier/solution pages.

**Files:**
- Create/modify route pattern under `src/app/` as agreed by coding agent.
- Prefer static routes initially for top pages.

**Landing pages to create first:**
1. `/business-laptops-south-africa`
2. `/it-hardware-supplier-south-africa`
3. `/cctv-for-business`
4. `/business-wifi-solutions`
5. `/ups-for-business`

**Verification:**
- Metadata/canonical present.
- Pages link to relevant categories/products and `/quote`.
- Sitemap includes pages.

---

## Phase 4 — Product SEO Cleanup

### Task 4.1: Product SEO audit script

**Objective:** Find weak titles/descriptions/images and prioritize product cleanup.

**Files:**
- Create: `scripts/audit-product-seo.mjs`
- Output: console report and/or CSV under ignored temp path.

**Checks:**
- missing/short descriptions
- missing specs
- missing image
- generic title
- suspicious image size
- product published state

**Verification:**
- Script runs safely read-only.

---

### Task 4.2: Improve first B2B product batch

**Objective:** Prepare first publishable B2B product set.

**Initial product groups:**
- business laptops
- networking equipment
- CCTV/security
- access control
- UPS/NAS

**Steps:**
1. Improve title and description.
2. Confirm image accuracy.
3. Confirm price/category/specs.
4. Keep unpublished until admin review.

---

## Phase 5 — Technical SEO and Measurement

### Task 5.1: Sitemap/indexability audit and fixes

**Objective:** Ensure important pages are indexable and unpublished products are excluded.

**Files:**
- Modify: `src/app/sitemap.ts`
- Review: `src/app/robots.ts`
- Review: `src/app/products/page.tsx`

**Implementation notes:**
- Confirm sitemap includes published-visible products correctly.
- Confirm draft/unpublished products are excluded.
- Include B2B landing pages.

---

### Task 5.2: Structured data polish

**Objective:** Improve Product/Organization/Breadcrumb schema.

**Files:**
- Modify: `src/app/products/[slug]/page.tsx`
- Modify/create helpers: `src/lib/seo.ts`
- Modify: `src/app/layout.tsx` or homepage for Organization/WebSite schema if appropriate.

---

## Phase 6 — Content Marketing

### Task 6.1: Create content calendar

**Objective:** Plan B2B buying guides and comparison articles.

**First 10 topics:**
1. Best Business Laptops for SMEs in South Africa
2. How to Choose CCTV Cameras for Your Business
3. Access Control vs Time Attendance Systems
4. Best Networking Equipment for Small Offices
5. Why Every Business Needs a UPS in South Africa
6. Laptop Procurement Guide for Growing Companies
7. Best Tablets for Field Teams and Sales Staff
8. How to Set Up Secure Office WiFi
9. Synology vs QNAP NAS for Small Businesses
10. CCTV and Access Control Checklist for New Offices

---

## Phase 7 — QA, Deployment, and Monitoring

### Task 7.1: SEO QA gate

**Objective:** Verify implementation before merge/deploy.

**Checks:**
- `npm run lint` if configured
- `npm run build`
- homepage/category/quote pages load locally
- metadata present
- quote submit still works
- sitemap/robots load

---

### Task 7.2: Progress watchdog

**Objective:** Keep following up while work is active.

**Checks every 15–30 minutes:**
- git status
- background Claude/Codex process status
- Kanban/card progress
- dev server health
- live/lab site health
- blockers needing user input

---

## Current First Sprint Recommendation

Start immediately with:

1. Task 1.1 — Quote CTA routing and capture fixes
2. Task 1.2 — Quote page metadata
3. Task 1.3 — Homepage B2B SEO rewrite
4. Task 2.1 — Category SEO content helper
5. Task 7.1 — QA gate

This gives the store a B2B SEO/conversion foundation before publishing more products or building long-form content.
