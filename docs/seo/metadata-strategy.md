# Impact Store SEO Metadata Strategy

**Date:** 2026-05-09  
**Branch:** `hermes`  
**Status:** Draft — spec only, no app code changes

---

## 1. Overview

This document defines the metadata strategy for every public page on Impact Store. The goal is to give each page unique, keyword-rich `<title>` and `<meta name="description">` tags, canonical URLs, Open Graph / Twitter Card data, and structured data (JSON-LD) so that Google, Bing, and social platforms can fully understand and rich-display every page.

The site currently has a single global `Metadata` export in `src/app/layout.tsx` and a basic `sitemap.ts` + `robots.ts`. Page-level metadata, canonical tags, and structured data are all absent.

---

## 2. Base Metadata (Root Layout)

The root layout already sets a global fallback:

```ts
// src/app/layout.tsx — current state (keep as fallback)
export const metadata: Metadata = {
  title: "Impact Store | ICT Hardware & Security Solutions",
  description: "Impact Store supplies ICT hardware, mobile devices, accessories, and business technology solutions across South Africa.",
};
```

### Changes needed

Add the following fields to the root layout metadata:

| Field | Value |
|---|---|
| `metadataBase` | `new URL("https://impactholdings.co.za")` |
| `openGraph.siteName` | `"Impact Store"` |
| `openGraph.type` | `"website"` |
| `openGraph.locale` | `"en_ZA"` |
| `twitter.card` | `"summary_large_image"` |
| `robots.index` | `true` |
| `alternates.canonical` | (per-page override only, no global canonical) |

These are fallbacks. Every page below overrides `title`, `description`, and adds its own canonical + OG.

---

## 3. Page-Level Metadata Templates

### 3.1 Home Page (`/`)

| Field | Value |
|---|---|
| `title` | `"Impact Store — ICT Hardware, Phones, Laptops & Security Solutions South Africa"` |
| `description` | `"Shop ICT hardware, business laptops, phones, tablets, accessories, and security solutions. Bulk procurement, nationwide delivery, and B2B support across South Africa."` |
| `canonical` | `https://impactholdings.co.za/` |
| `og:title` | Same as title |
| `og:description` | Same as description |
| `og:image` | `/impact/impact-logo-lockup.svg` or a branded OG hero image (1200×630) |
| `og:url` | `https://impactholdings.co.za/` |

### 3.2 Product Listing (`/products`)

| Field | Value |
|---|---|
| `title` | `"All Products — Phones, Laptops, Tablets, IT Hardware & Accessories | Impact Store"` |
| `description` | `"Browse Impact Store's full catalog of ICT hardware, phones, laptops, tablets, accessories, and security solutions for business and personal use."` |
| `canonical` | `https://impactholdings.co.za/products` |

### 3.3 Category Pages (`/products?category=...`)

Dynamic `generateMetadata()` based on the `category` query param.

| Field | Template |
|---|---|
| `title` | `"{Category Name} — Buy {Category Name} Online | Impact Store"` |
| `description` | `"Shop {category description} at Impact Store. Business-ready stock, nationwide delivery, and bulk pricing across South Africa."` |
| `canonical` | `https://impactholdings.co.za/products?category={encodedCategory}` |

**Category-specific overrides:**

| Category | Title Override |
|---|---|
| Phones | `"Business & Personal Phones — Buy Smartphones Online | Impact Store"` |
| Laptops | `"Laptops for Business & Students — Refurbished & New | Impact Store"` |
| Tablets | `"Tablets — iPads, Android & Business Tablets Online | Impact Store"` |
| Accessories | `"Tech Accessories — Chargers, Cases, Hubs & More | Impact Store"` |
| IT Hardware | `"IT Hardware — Networking, Storage & Office Infrastructure | Impact Store"` |
| Security & Access Control | `"Security & Access Control — Surveillance, Access Systems | Impact Store"` |

### 3.4 Product Detail (`/products/[slug]`)

Dynamic `generateMetadata()` from the Product model.

```ts
// Pseudocode for generateMetadata in src/app/products/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await Product.findOne({ slug: params.slug }).lean();
  const title = `${product.name} — ${product.brand} ${product.category} | Impact Store`;
  const description = product.subtitle
    ?? `${product.name} — ${product.condition} ${product.brand} ${product.category}. R${product.price.toLocaleString()}. Available at Impact Store with nationwide delivery.`;

  return {
    title,
    description,
    alternates: { canonical: `https://impactholdings.co.za/products/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `https://impactholdings.co.za/products/${product.slug}`,
      images: product.images.length
        ? [{ url: product.images[0], width: 1200, height: 630, alt: product.name }]
        : [],
      type: "website",
    },
  };
}
```

### 3.5 Service / Landing Pages

| Page | Path | Title | Description |
|---|---|---|---|
| About | `/about` | `"About Impact Store — ICT Procurement for Teams & Businesses"` | `"Impact Store is the technology retail arm of Impact Holdings, helping customers source ICT hardware, devices, and business solutions across South Africa."` |
| TAP | `/tap` | `"Technology Access Program (TAP) — Priority Device Procurement | Impact Store"` | `"TAP gives businesses, schools, and teams priority pricing, lifecycle planning, and fast fulfilment for bulk device orders."` |
| MDM | `/mdm` | `"Mobile Device Management — Business Device Deployment & Security | Impact Store"` | `"Impact Store helps teams source and prepare phones, tablets, and laptops for managed business environments with MDM support."` |
| Contact | `/contact` | `"Contact Impact Store — Quotes, Orders & Support"` | `"Get in touch with Impact Store for product advice, bulk quotes, order support, or device procurement assistance."` |

### 3.6 Policy Pages

| Page | Path | Title |
|---|---|---|
| Privacy Policy | `/privacy-policy` | `"Privacy Policy | Impact Store"` |
| Terms of Service | `/terms-of-service` | `"Terms of Service | Impact Store"` |
| Shipping | `/shipping-policy` | `"Shipping Policy — Delivery Across South Africa | Impact Store"` |
| Refund | `/refund-policy` | `"Refund & Returns Policy | Impact Store"` |
| Warranty | `/warranty-policy` | `"Warranty Policy | Impact Store"` |
| Laybuy | `/laybuy-policy` | `"Laybuy Payment Policy | Impact Store"` |

---

## 4. Canonical URL Strategy

### Rules

1. **Every public page must have exactly one canonical URL.** Set via `alternates.canonical` in the Next.js `Metadata` object.
2. **Category pages canonicalize to the category URL**, not the bare `/products` path. Example: `/products?category=Laptops` canonicalizes to `https://impactholdings.co.za/products?category=Laptops`.
3. **Product detail pages canonicalize to their slug URL.** If a product is accessible via multiple URLs (e.g., filtered category + direct link), the canonical always points to `/products/{slug}`.
4. **Query params not part of the canonical.** For filtered/sorted views (`?condition=Refurbished`, `?search=...`), set canonical to the base page without those params. This prevents duplicate-content signals from filter permutations.
5. **Trailing slash consistency.** All canonical URLs use no trailing slash. Next.js `trailingSlash: false` (default) matches this.
6. **HTTPS only.** All canonicals use `https://impactholdings.co.za`.

### Implementation

- Set `metadataBase` in root layout so Next.js can resolve relative canonicals.
- For dynamic pages, compute canonicals in `generateMetadata()`.
- Verify canonicals match `sitemap.ts` entries exactly.

---

## 5. Open Graph & Twitter Card Strategy

### Open Graph

Every page sets:

```ts
openGraph: {
  title,          // same as page title
  description,    // same as meta description
  url: canonicalUrl,
  siteName: "Impact Store",
  locale: "en_ZA",
  type: "website",   // or "product" for product detail pages
  images: [{ url, width: 1200, height: 630, alt }],
}
```

For product detail pages, set `type: "product"` and include `product:price:amount` and `product:price:currency` as additional OG meta via the `openGraph` object.

### Twitter Cards

```ts
twitter: {
  card: "summary_large_image",
  title,
  description,
  images: [ogImage],
}
```

---

## 6. JSON-LD Structured Data Plan

### 6.1 Organization (All Pages)

Inject a `Organization` + `LocalBusiness` schema in the root layout, available on every page:

```json
{
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  "@id": "https://impactholdings.co.za/#organization",
  "name": "Impact Store",
  "legalName": "Impact Holdings",
  "url": "https://impactholdings.co.za",
  "logo": "https://impactholdings.co.za/impact/impact-logo-lockup.svg",
  "description": "ICT hardware, mobile devices, accessories, and business technology solutions across South Africa.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "16 Baker St, Rosebank",
    "addressLocality": "Johannesburg",
    "addressRegion": "Gauteng",
    "postalCode": "2196",
    "addressCountry": "ZA"
  },
  "telephone": "+27100013608",
  "email": "info@impactholdings.co.za",
  "priceRange": "R100 - R50000+",
  "areaServed": {
    "@type": "Country",
    "name": "South Africa"
  },
  "sameAs": []
}
```

### 6.2 Product (Product Detail Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{product.name}",
  "description": "{product.subtitle or product.description excerpt}",
  "image": "{product.images array}",
  "brand": {
    "@type": "Brand",
    "name": "{product.brand}"
  },
  "sku": "{product.sku}",
  "category": "{product.category}",
  "offers": {
    "@type": "Offer",
    "url": "https://impactholdings.co.za/products/{product.slug}",
    "priceCurrency": "ZAR",
    "price": "{product.price}",
    "priceValidUntil": "{ISO date 1 year out}",
    "itemCondition": "https://schema.org/{NewCondition|RefurbishedCondition|UsedCondition}",
    "availability": "https://schema.org/{InStock|OutOfStock}",
    "seller": { "@id": "https://impactholdings.co.za/#organization" }
  }
}
```

Condition mapping:

| Product condition | Schema.org itemCondition |
|---|---|
| New | `https://schema.org/NewCondition` |
| Refurbished | `https://schema.org/RefurbishedCondition` |
| Used | `https://schema.org/UsedCondition` |

Availability mapping:

| Stock | Schema.org availability |
|---|---|
| `stock > 0` | `https://schema.org/InStock` |
| `stock === 0` | `https://schema.org/OutOfStock` |

### 6.3 BreadcrumbList (Product Detail Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://impactholdings.co.za/" },
    { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://impactholdings.co.za/products" },
    { "@type": "ListItem", "position": 3, "name": "{product.category}", "item": "https://impactholdings.co.za/products?category={encoded}" },
    { "@type": "ListItem", "position": 4, "name": "{product.name}", "item": "https://impactholdings.co.za/products/{product.slug}" }
  ]
}
```

### 6.4 WebPage (Service / Static Pages)

For TAP, MDM, About, Contact:

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "{page title}",
  "description": "{page description}",
  "url": "{canonical URL}",
  "isPartOf": { "@id": "https://impactholdings.co.za/#organization" }
}
```

### 6.5 FAQ (Future)

When FAQ sections are added to product, TAP, or MDM pages, wrap each FAQ block in:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "...",
      "acceptedAnswer": { "@type": "Answer", "text": "..." }
    }
  ]
}
```

### 6.6 Rendering Strategy

- Use a `<Script>` component with `type="application/ld+json"` injected server-side.
- Place Organization schema in root layout (every page).
- Place Product + BreadcrumbList schemas in `src/app/products/[slug]/page.tsx`.
- Place WebPage schema in each service page.

---

## 7. Image SEO Strategy

| Rule | Implementation |
|---|---|
| Every `<img>` needs descriptive `alt` | Product images: `alt="{product.name} — {brand} {category}"`. Category images: use category description. |
| Serve WebP where possible | Configure Next.js `<Image>` component with automatic format optimization. |
| Specify `width` and `height` | Prevents CLS; use actual image dimensions or aspect ratios. |
| OG image per page | Product detail pages use first product image (1200×630). Other pages use a branded default. |
| File names | Store uploaded images with descriptive slugs, not random UUIDs. (Future improvement for R2 uploads.) |

---

## 8. Sitemap Enhancements

The existing `src/app/sitemap.ts` already covers static pages and dynamic product pages. Enhancements:

1. **Add category pages** to the static list: `/products?category=Phones`, `/products?category=Laptops`, etc.
2. **Add service pages** to the static list: `/about`, `/tap`, `/mdm`.
3. **Set correct `lastModified`** for static pages (use file mtime or a fixed recent date).
4. **Add `images` extension** to product entries per the [Google Sitemap Image Extension](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps).

---

## 9. Robots.txt

The existing `src/app/robots.ts` correctly allows public pages and blocks admin/auth/cart/checkout routes. No changes needed beyond verifying that new public service pages are included in the `allow` list.

---

## 10. Monitoring & Verification

### Google Search Console

1. Verify ownership of `impactholdings.co.za` via DNS TXT record or HTML meta tag.
2. Submit sitemap URL: `https://impactholdings.co.za/sitemap.xml`.
3. Monitor coverage: check for crawl errors, duplicate pages, canonical issues.
4. Set up monthly review of search performance (impressions, clicks, average position for target keywords).

### Rich Results Testing

- Use [Google Rich Results Test](https://search.google.com/test/rich-results) to validate Product and BreadcrumbList JSON-LD on sample product pages.
- Use [Schema Markup Validator](https://validator.schema.org/) for Organization and WebPage schemas.

### Lighthouse SEO Audits

- Target SEO score ≥ 95 on all public pages.
- Key checks: `document has a <title>`, meta description present, canonical present, structured data valid, images have alt text, links are crawlable.

---

## 11. Implementation Task Summary

Tasks below are for a future coding sprint (via Claude Code or Codex CLI on the `hermes` branch):

| # | Task | Files Affected |
|---|---|---|
| 1 | Add `metadataBase`, OG defaults, and Twitter card defaults to root layout | `src/app/layout.tsx` |
| 2 | Add `generateMetadata` to product listing page (`/products`) | `src/app/products/page.tsx` |
| 3 | Add `generateMetadata` to product detail page with dynamic product data | `src/app/products/[slug]/page.tsx` |
| 4 | Add `generateMetadata` to all service pages (about, tap, mdm, contact) | `src/app/about/page.tsx`, `src/app/tap/page.tsx`, `src/app/mdm/page.tsx`, `src/app/contact/page.tsx` |
| 5 | Add `generateMetadata` to all policy pages | `src/app/privacy-policy/page.tsx`, `src/app/terms-of-service/page.tsx`, `src/app/shipping-policy/page.tsx`, `src/app/refund-policy/page.tsx`, `src/app/warranty-policy/page.tsx`, `src/app/laybuy-policy/page.tsx` |
| 6 | Inject Organization/LocalBusiness JSON-LD in root layout | `src/app/layout.tsx` or a shared `<JsonLd>` component |
| 7 | Inject Product + BreadcrumbList JSON-LD on product detail pages | `src/app/products/[slug]/page.tsx` |
| 8 | Inject WebPage JSON-LD on service pages | Each service page |
| 9 | Add image `alt` attributes to all pages (product gallery, hero slider, category cards) | `src/components/ProductGallery.tsx`, `src/components/HeroSlider.tsx`, `src/app/page.tsx` |
| 10 | Enhance sitemap with category and service pages | `src/app/sitemap.ts` |
| 11 | Add Google Search Console verification meta tag | `src/app/layout.tsx` |
| 12 | Create a shared `<JsonLd>` utility component for clean structured data rendering | `src/components/JsonLd.tsx` |

---

## 12. File References

- `src/app/layout.tsx` — root layout with global metadata
- `src/app/page.tsx` — home page
- `src/app/products/page.tsx` — product listing
- `src/app/products/[slug]/page.tsx` — product detail
- `src/app/about/page.tsx` — about page
- `src/app/tap/page.tsx` — Technology Access Program
- `src/app/mdm/page.tsx` — Mobile Device Management
- `src/app/contact/page.tsx` — contact/quote form
- `src/app/robots.ts` — robots.txt
- `src/app/sitemap.ts` — XML sitemap
- `src/models/Product.ts` — product schema (source for structured data fields)
