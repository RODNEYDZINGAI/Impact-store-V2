# Impact Store SEO Keyword Map

**Date:** 2026-05-09  
**Branch:** `hermes`  
**Status:** Draft — spec only, no app code changes

---

## 1. Purpose

This document maps target keywords to specific pages on Impact Store. It serves as the reference for:

- Writing page-level `generateMetadata()` titles and descriptions.
- Guiding on-page content and heading structure.
- Planning future blog, FAQ, or landing-page content.
- Tracking keyword performance via Google Search Console.

---

## 2. Keyword Research Notes

Impact Store operates in the **South African B2B and B2C ICT hardware market**. Keyword targeting considers:

- **Geographic modifiers:** "South Africa", "Johannesburg", "Gauteng", "ZA" — buyers search with and without these.
- **Intent types:** Transactional ("buy laptops online"), commercial investigation ("refurbished laptops South Africa"), and informational ("what is MDM for business").
- **Condition modifiers:** "refurbished", "second-hand", "used" — significant search volume in the SA market.
- **B2B qualifiers:** "bulk", "wholesale", "business", "corporate", "procurement", "rollout".

Primary domain: `impactholdings.co.za`  
Target market: South Africa  
Language: English (en_ZA)

---

## 3. Keyword-to-Page Map

### 3.1 Home Page (`/`)

| Priority | Keyword | Estimated Intent |
|---|---|---|
| Primary | ICT hardware South Africa | Commercial |
| Primary | buy laptops phones tablets South Africa | Transactional |
| Secondary | business technology solutions South Africa | Commercial |
| Secondary | IT equipment supplier Johannesburg | Local commercial |
| Long-tail | ICT hardware and security solutions South Africa | Commercial |

**Title target:** `"Impact Store — ICT Hardware, Phones, Laptops & Security Solutions South Africa"`

---

### 3.2 All Products (`/products`)

| Priority | Keyword | Estimated Intent |
|---|---|---|
| Primary | buy ICT hardware online South Africa | Transactional |
| Secondary | online tech store South Africa | Commercial |
| Secondary | refurbished electronics South Africa | Commercial |

---

### 3.3 Category: Phones (`/products?category=Phones`)

| Priority | Keyword | Estimated Intent |
|---|---|---|
| Primary | buy smartphones South Africa | Transactional |
| Primary | business phones South Africa | Commercial |
| Secondary | refurbished phones South Africa | Commercial |
| Secondary | buy phones online Johannesburg | Transactional |
| Long-tail | bulk smartphones for business South Africa | Commercial |

**Title target:** `"Business & Personal Phones — Buy Smartphones Online | Impact Store"`

---

### 3.4 Category: Laptops (`/products?category=Laptops`)

| Priority | Keyword | Estimated Intent |
|---|---|---|
| Primary | buy laptops South Africa | Transactional |
| Primary | refurbished laptops South Africa | Commercial |
| Secondary | business laptops Johannesburg | Commercial |
| Secondary | cheap laptops South Africa | Transactional |
| Long-tail | laptops for students South Africa | Commercial |
| Long-tail | bulk laptops for office rollout | Commercial |

**Title target:** `"Laptops for Business & Students — Refurbished & New | Impact Store"`

---

### 3.5 Category: Tablets (`/products?category=Tablets`)

| Priority | Keyword | Estimated Intent |
|---|---|---|
| Primary | buy tablets South Africa | Transactional |
| Primary | business tablets South Africa | Commercial |
| Secondary | iPads South Africa | Transactional |
| Secondary | refurbished tablets South Africa | Commercial |
| Long-tail | tablets for POS and field work South Africa | Commercial |

**Title target:** `"Tablets — iPads, Android & Business Tablets Online | Impact Store"`

---

### 3.6 Category: Accessories (`/products?category=Accessories`)

| Priority | Keyword | Estimated Intent |
|---|---|---|
| Primary | tech accessories South Africa | Commercial |
| Primary | laptop chargers keyboards hubs South Africa | Transactional |
| Secondary | phone accessories Johannesburg | Transactional |
| Long-tail | workplace accessories for office rollout | Commercial |

**Title target:** `"Tech Accessories — Chargers, Cases, Hubs & More | Impact Store"`

---

### 3.7 Category: IT Hardware (`/products?category=IT+Hardware`)

| Priority | Keyword | Estimated Intent |
|---|---|---|
| Primary | IT hardware South Africa | Commercial |
| Primary | networking equipment South Africa | Transactional |
| Secondary | office infrastructure hardware | Commercial |
| Secondary | storage solutions South Africa | Commercial |
| Long-tail | ICT hardware supplier Johannesburg | Commercial |

**Title target:** `"IT Hardware — Networking, Storage & Office Infrastructure | Impact Store"`

---

### 3.8 Category: Security & Access Control (`/products?category=Security+%26+Access+Control`)

| Priority | Keyword | Estimated Intent |
|---|---|---|
| Primary | access control systems South Africa | Commercial |
| Primary | security hardware South Africa | Commercial |
| Secondary | CCTV surveillance Johannesburg | Transactional |
| Secondary | workplace security equipment | Commercial |
| Long-tail | business security and access control solutions South Africa | Commercial |

**Title target:** `"Security & Access Control — Surveillance, Access Systems | Impact Store"`

---

### 3.9 Product Detail Pages (`/products/[slug]`)

Dynamic per product. General keyword template:

| Priority | Keyword Pattern | Example |
|---|---|---|
| Primary | `{brand} {product name} South Africa` | `"Samsung Galaxy A15 South Africa"` |
| Primary | `buy {product name} online South Africa` | `"buy HP EliteBook 840 online South Africa"` |
| Secondary | `{product name} price South Africa` | `"Lenovo Tab M10 price South Africa"` |
| Secondary | `refurbished {product name}` | `"refurbished iPhone 13"` |

**Title template:** `"{product.name} — {brand} {category} | Impact Store"`

**Meta description template:** `"{product.name} — {condition} {brand} {category}. R{price}. Available at Impact Store with nationwide delivery."`

---

### 3.10 TAP — Technology Access Program (`/tap`)

| Priority | Keyword | Estimated Intent |
|---|---|---|
| Primary | technology procurement South Africa | Commercial |
| Primary | bulk device procurement South Africa | Commercial |
| Secondary | bulk laptops phones for business | Transactional |
| Secondary | device rollout planning South Africa | Commercial |
| Long-tail | priority technology procurement for schools and teams | Commercial |

**Title target:** `"Technology Access Program (TAP) — Priority Device Procurement | Impact Store"`

---

### 3.11 MDM — Mobile Device Management (`/mdm`)

| Priority | Keyword | Estimated Intent |
|---|---|---|
| Primary | mobile device management South Africa | Commercial |
| Primary | MDM solutions South Africa | Commercial |
| Secondary | business device management Johannesburg | Commercial |
| Secondary | device enrolment and security South Africa | Commercial |
| Long-tail | MDM for schools and field teams South Africa | Commercial |

**Title target:** `"Mobile Device Management — Business Device Deployment & Security | Impact Store"`

---

### 3.12 About (`/about`)

| Priority | Keyword | Estimated Intent |
|---|---|---|
| Primary | ICT procurement South Africa | Commercial |
| Secondary | Impact Holdings technology store | Navigational |
| Secondary | business technology partner Johannesburg | Commercial |

**Title target:** `"About Impact Store — ICT Procurement for Teams & Businesses"`

---

### 3.13 Contact (`/contact`)

| Priority | Keyword | Estimated Intent |
|---|---|---|
| Primary | ICT hardware quote South Africa | Transactional |
| Secondary | contact Impact Store | Navigational |
| Secondary | bulk tech quote Johannesburg | Transactional |

**Title target:** `"Contact Impact Store — Quotes, Orders & Support"`

---

### 3.14 Policy Pages (low SEO priority, navigational only)

| Page | Primary Keyword |
|---|---|
| `/shipping-policy` | Impact Store shipping policy South Africa |
| `/refund-policy` | Impact Store returns and refund policy |
| `/warranty-policy` | Impact Store warranty policy |
| `/privacy-policy` | Impact Store privacy policy |
| `/terms-of-service` | Impact Store terms of service |
| `/laybuy-policy` | laybuy payment South Africa |

These pages exist for trust, compliance, and footer internal links. They are not keyword-targeted for acquisition.

---

## 4. Content Gap Keywords (Future Pages)

These keywords represent search demand that Impact Store does not yet have dedicated pages for. Consider creating dedicated landing pages or blog posts:

| Keyword | Suggested Page Type | Priority |
|---|---|---|
| refurbished laptops Johannesburg | Category landing page (enhanced) | High |
| bulk laptops for schools South Africa | Dedicated landing page | High |
| laptop deals South Africa | Deals/featured landing page | Medium |
| ICT hardware for schools | Dedicated landing page | Medium |
| POS tablets South Africa | Category landing page (enhanced) | Medium |
| CCTV installation Johannesburg | Service landing page | Medium |
| access control systems Johannesburg | Service landing page | Medium |
| device lifecycle management South Africa | Blog/guide page | Low |
| how to choose business laptops | Blog/guide page | Low |
| what is MDM and does my business need it | Blog/FAQ page | Low |

---

## 5. Internal Linking Strategy

Internal links reinforce keyword relevance. The following linking structure should be implemented:

### 5.1 Footer Links (Already Present)

The footer already links to:
- All product categories
- TAP, MDM service pages
- Policy pages
- Contact

**Enhancement:** Add descriptive `title` attributes to footer links for additional keyword signals.

### 5.2 Home Page Cross-Links

- "Shop by Category" section links to `/products?category=...` (exists).
- "Featured Products" section links to individual products (exists).
- **Add:** Cross-link to TAP, MDM, and Contact from the home page body with keyword-rich anchor text.

### 5.3 Product-to-Product Links

- Product detail pages show "Related Products" from the same category (exists).
- **Add:** Breadcrumb navigation that links Home > Products > {Category} > {Product} for both UX and internal link equity.

### 5.4 Service Page Cross-Links

- TAP page should link to `/contact` (quote) and `/products` (browse catalog) — already present.
- MDM page should link to `/contact` (MDM support) and `/products?category=Phones` + `/products?category=Tablets` — partially present.
- **Add:** MDM page should cross-link to TAP for procurement support, and vice versa.
- **Add:** About page should link to TAP, MDM, and all product categories.

### 5.5 Anchor Text Guidelines

| Context | Anchor Text Pattern | Example |
|---|---|---|
| Navigation to category | Category name + keyword | "Business Laptops" not just "Laptops" |
| Link to product detail | Brand + product name | "Samsung Galaxy A15" not "click here" |
| Link to TAP | Descriptive phrase | "priority device procurement" or "Technology Access Program" |
| Link to MDM | Descriptive phrase | "mobile device management" or "MDM solutions" |
| Link to contact/quote | Action phrase | "request a bulk quote" or "get a quote" |

---

## 6. Heading Structure Guidelines

Each page should follow a logical H1 → H2 → H3 hierarchy that incorporates target keywords:

### Product Detail Page

```
H1: {product.name}                         ← primary keyword
H2: Specifications                         ← natural
H2: Related Products in {category}         ← category keyword
```

### Category Page

```
H1: {Category Name} — Buy Online           ← primary keyword
H2: {category description with keywords}   ← secondary keywords
```

### Service Page (TAP, MDM)

```
H1: {Service Name}                         ← primary keyword
H2: {Benefit/Feature with keyword}         ← secondary keywords
H2: {Process/How it works}
```

---

## 7. Keyword Performance Tracking

Once Google Search Console is configured, track the following metrics monthly:

| Metric | Target |
|---|---|
| Impressions for primary keywords | Growing month-over-month |
| Average position for "buy laptops South Africa" | Top 10 within 6 months |
| Average position for "refurbished laptops South Africa" | Top 10 within 6 months |
| Average position for "ICT hardware South Africa" | Top 10 within 6 months |
| Click-through rate for product pages | > 3% from search |
| Pages indexed | All public pages indexed within 2 weeks of launch |

### Tracking Spreadsheet Columns

| Column | Description |
|---|---|
| Keyword | The target keyword phrase |
| Page URL | The page targeting this keyword |
| Monthly Search Volume | From keyword tool (Ahrefs, SEMrush, etc.) |
| Current Position | From Search Console |
| Previous Position | From last month's report |
| Impressions | From Search Console |
| Clicks | From Search Console |
| Priority | Primary / Secondary / Long-tail |

---

## 8. Implementation Task Summary

| # | Task | Depends On |
|---|---|---|
| 1 | Implement `generateMetadata()` for all pages using keyword titles/descriptions from this map | metadata-strategy.md task #1 |
| 2 | Add keyword-rich breadcrumb navigation to product detail pages | New component |
| 3 | Add cross-links between TAP, MDM, About, and product categories | Content update |
| 4 | Update footer link anchor text with keyword-rich labels | Footer component update |
| 5 | Create dedicated landing pages for high-priority content gap keywords | New pages |
| 6 | Write FAQ content for product, TAP, and MDM pages targeting informational keywords | New content |
| 7 | Set up Google Search Console and keyword tracking spreadsheet | Account setup |
| 8 | Monthly review and keyword position tracking | Ongoing |

---

## 9. File References

- `docs/seo/metadata-strategy.md` — companion document with technical metadata implementation details
- `src/app/page.tsx` — home page (category section)
- `src/app/products/page.tsx` — product listing
- `src/app/products/[slug]/page.tsx` — product detail
- `src/app/tap/page.tsx` — Technology Access Program
- `src/app/mdm/page.tsx` — Mobile Device Management
- `src/app/about/page.tsx` — about page
- `src/app/contact/page.tsx` — contact page
- `src/components/Footer.tsx` — footer with category links
- `src/components/Navbar.tsx` — navigation links
