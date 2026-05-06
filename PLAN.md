# Megabyte E-Commerce Platform — Implementation Plan

## Context
**MegaByteCo** is a South African technology trading e-commerce store specializing in phones, tablets, laptops, and accessories — with a focus on professionally refurbished devices. Products can be New, Refurbished, or Used. Prices are in ZAR (R). The app runs full-stack in a single Next.js 16 project (App Router) with MongoDB as the database. Both admin and customer authentication are required. Payments are mocked for MVP.

---

## Tech Stack
- **Framework:** Next.js 16 (App Router, `src/app/`)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4
- **Database:** MongoDB + Mongoose
- **Auth:** NextAuth.js (credentials + optional OAuth)
- **State (Cart):** React Context + localStorage persistence

---

## Design System — MegaByteCo Brand

### Brand Identity
- **Name:** MegaByteCo — Technology Trading
- **Logo:** MB monogram with circuit-board accents + swoosh underline (from `images/` folder)
- **Currency:** ZAR (South African Rand, displayed as R1,000)
- **Tone:** Professional, trustworthy, modern — emphasizing "professionally refurbished" and "fully tested & certified"

### Color Palette (extracted from brand materials)

| Role | Color | Hex | Usage |
|---|---|---|---|
| Primary | Deep Navy Blue | `#1B3A5C` | Navbar, headings, primary buttons, footer |
| Secondary | Teal/Cyan Blue | `#2A8FBD` | Logo gradient, links, hover states, accents |
| Accent | Vivid Purple | `#7B2FF2` | Promotional badges, sale tags, splash elements |
| Accent Light | Soft Violet | `#A855F7` | Gradient overlays, category highlights |
| Background | Pure White | `#FFFFFF` | Main page background |
| Surface | Light Gray | `#F8FAFC` | Card backgrounds, section alternates |
| Dark Surface | Dark Navy | `#0F172A` | Hero sections, dark cards (like promo material), footer |
| Text Primary | Charcoal | `#1E293B` | Body text |
| Text Secondary | Slate Gray | `#64748B` | Subtitles, specs, secondary info |
| Success | Teal Green | `#10B981` | "In stock", condition badges, check marks |
| Warning | Amber | `#F59E0B` | "Low stock", refurbished badges |
| Error | Red | `#EF4444` | Out of stock, form errors |

### Typography
- **Headings:** Inter or Geist Sans (already configured) — bold, clean, modern
- **Body:** Geist Sans — regular weight, good readability
- **Mono:** Geist Mono — for specs, prices, technical details
- **Sizes:** Large hero headings (48-64px), section titles (28-36px), card titles (18-20px), body (16px)

### Component Design Patterns

**Navbar**
- Dark navy (`#0F172A`) background with white text
- MB logo on the left, nav links centered, cart icon + auth on the right
- Sticky top, subtle shadow on scroll
- Mobile: hamburger menu slide-in

**Hero Section (Homepage)**
- Full-width dark navy/gradient background (navy → purple subtle gradient)
- Large bold heading: "Quality Tech, Unbeatable Prices"
- Subtext about professionally refurbished devices
- CTA button in teal/cyan blue with white text
- Optional: watercolor/splash accents like the promo materials (purple/blue splashes)

**Product Cards**
- White card with subtle border (`border-gray-200`) and rounded corners (`rounded-xl`)
- Hover: lift shadow (`shadow-lg`) + slight scale
- Product image top (rounded top corners)
- Condition badge: colored pill — Green for "New", Amber for "Refurbished", Slate for "Used"
- Price in bold navy, "Save R___" in green below
- Quick "Add to Cart" button on hover

**Category Cards (Homepage)**
- Large rounded cards with icon/image and gradient overlay
- Categories: Phones, Tablets, Laptops, Accessories
- Navy-to-purple gradient overlay with white text

**Product Detail Page**
- Split layout: large image gallery left, details right
- Specs displayed in a clean grid/table (like the promo flyers)
- Trust badges: "Professionally refurbished", "Fully tested & certified", "3-Month Warranty", "Charger included"
- Prominent "Add to Cart" button in teal blue

**Buttons**
- Primary: Teal blue (`#2A8FBD`) with white text, rounded-lg, hover darkens
- Secondary: Navy outline, rounded-lg
- Accent/CTA: Purple gradient for promotional actions
- All buttons: medium padding, font-semibold

**Badges & Tags**
- Condition: pill-shaped, small — color-coded (green/amber/slate)
- Category: navy pill with white text
- "Save R___": green text with money icon
- "Limited Stock": amber with subtle pulse animation

**Footer**
- Dark navy (`#0F172A`) background
- MB logo, quick links, contact info, social icons
- Copyright bar at bottom

### Layout & Spacing
- Max content width: `max-w-7xl` (1280px) centered
- Page padding: `px-4 sm:px-6 lg:px-8`
- Section spacing: `py-12 sm:py-16`
- Card grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` with `gap-6`
- Consistent border radius: `rounded-xl` for cards, `rounded-lg` for buttons/inputs

### Dark Mode
- Toggle in navbar
- Dark mode swaps white backgrounds to `#0F172A`, cards to `#1E293B`
- Text inverts to white/gray-300
- Brand colors (teal, purple) stay the same — they work on both backgrounds

### Responsive Breakpoints
- Mobile first approach
- `sm: 640px` — 2 column product grid
- `md: 768px` — sidebar filters visible
- `lg: 1024px` — 3 column grid, full nav
- `xl: 1280px` — 4 column grid, max width content

---

## Phase 1: Database & Models

### 1.1 Install dependencies
```
npm install mongoose next-auth bcryptjs
npm install -D @types/bcryptjs
```

### 1.2 MongoDB connection utility
- **File:** `src/lib/mongodb.ts` — cached Mongoose connection singleton

### 1.3 Data models
- **`src/models/Product.ts`**
  - `name`, `slug`, `description`, `price`, `category` (enum: Phones, Tablets, Laptops, Accessories)
  - `condition` (enum: New, Refurbished, Used)
  - `brand`, `images: string[]`, `specs: Record<string, string>`
  - `stock`, `featured: boolean`, `createdAt`

- **`src/models/User.ts`**
  - `name`, `email`, `password` (hashed), `role` (enum: admin, customer)
  - `createdAt`

- **`src/models/Order.ts`**
  - `user` (ref), `items: [{product, quantity, price}]`
  - `total`, `status` (enum: pending, confirmed, shipped, delivered)
  - `shippingAddress`, `createdAt`

### 1.4 Seed script
- **File:** `src/lib/seed.ts` — seed sample products (5-10 tech items across categories)
- **Script:** `"seed": "npx tsx src/lib/seed.ts"` in package.json

---

## Phase 2: Authentication

### 2.1 NextAuth setup
- **File:** `src/app/api/auth/[...nextauth]/route.ts` — NextAuth route handler
- **File:** `src/lib/auth.ts` — auth options config (credentials provider, JWT strategy)
- Passwords hashed with bcryptjs
- JWT includes `role` field for admin vs customer

### 2.2 Auth pages
- **`src/app/login/page.tsx`** — login form
- **`src/app/register/page.tsx`** — customer registration form

### 2.3 Auth utilities
- **`src/lib/auth-helpers.ts`** — `getCurrentUser()`, `requireAdmin()` helpers for route protection

---

## Phase 3: API Routes (Route Handlers)

All under `src/app/api/`:

| Route | Method | Purpose |
|---|---|---|
| `/api/products` | GET | List products (filter by category, condition, search) |
| `/api/products` | POST | Create product (admin only) |
| `/api/products/[id]` | GET | Single product detail |
| `/api/products/[id]` | PUT | Update product (admin only) |
| `/api/products/[id]` | DELETE | Delete product (admin only) |
| `/api/orders` | GET | User's orders / all orders (admin) |
| `/api/orders` | POST | Place order (mock checkout) |
| `/api/users/register` | POST | Customer registration |

---

## Phase 4: Frontend — Storefront Pages

### 4.1 Layout & shared components
- **`src/components/Navbar.tsx`** — logo, nav links, cart icon with count, auth status
- **`src/components/Footer.tsx`** — simple footer
- **`src/components/ProductCard.tsx`** — product thumbnail card (image, name, price, condition badge)
- **`src/components/CategoryFilter.tsx`** — category/condition filter sidebar or bar
- **`src/app/layout.tsx`** — update root layout with Navbar, Footer, cart provider

### 4.2 Pages

| Page | File | Description |
|---|---|---|
| Home | `src/app/page.tsx` | Hero banner, featured products, category cards |
| Products | `src/app/products/page.tsx` | Product grid with filters (category, condition, search) |
| Product Detail | `src/app/products/[slug]/page.tsx` | Full product info, specs, add to cart |
| Cart | `src/app/cart/page.tsx` | Cart items, quantities, total, checkout button |
| Checkout | `src/app/checkout/page.tsx` | Shipping form, order summary, mock "Place Order" |
| Orders | `src/app/orders/page.tsx` | Customer order history |
| Login | `src/app/login/page.tsx` | Login form |
| Register | `src/app/register/page.tsx` | Registration form |

### 4.3 Cart state
- **`src/context/CartContext.tsx`** — React Context for cart state
- Stores items in localStorage for persistence
- Provides `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`

---

## Phase 5: Admin Dashboard

### 5.1 Admin pages (protected by role check)

| Page | File | Description |
|---|---|---|
| Dashboard | `src/app/admin/page.tsx` | Overview stats (product count, order count) |
| Products | `src/app/admin/products/page.tsx` | Product list with edit/delete |
| Add Product | `src/app/admin/products/new/page.tsx` | Product creation form |
| Edit Product | `src/app/admin/products/[id]/edit/page.tsx` | Product edit form |
| Orders | `src/app/admin/orders/page.tsx` | All orders, update status |

### 5.2 Admin layout
- **`src/app/admin/layout.tsx`** — admin sidebar nav, role-gate (redirect non-admins)

---

## Phase 6: Product Images

- Store product images in `public/products/` for MVP
- Products reference image filenames in the `images` array
- Admin upload via form input (save to public directory via API route)

---

## Implementation Order

1. **MongoDB connection + Models** (Product, User, Order)
2. **Seed script** — populate sample data
3. **API routes** — products CRUD first, then orders
4. **Auth** — NextAuth setup, login/register pages
5. **Storefront components** — Navbar, ProductCard, Footer
6. **Cart context** — add/remove/persist
7. **Storefront pages** — Home → Products → Product Detail → Cart → Checkout
8. **Admin dashboard** — products management → orders management
9. **Polish** — responsive design, loading states, error handling

---

## Key Files Summary

```
src/
├── app/
│   ├── layout.tsx                          (root layout)
│   ├── page.tsx                            (home)
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── products/
│   │   ├── page.tsx                        (product listing)
│   │   └── [slug]/page.tsx                 (product detail)
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   ├── orders/page.tsx
│   ├── admin/
│   │   ├── layout.tsx                      (admin layout + guard)
│   │   ├── page.tsx                        (dashboard)
│   │   ├── products/
│   │   │   ├── page.tsx                    (manage products)
│   │   │   ├── new/page.tsx                (add product)
│   │   │   └── [id]/edit/page.tsx          (edit product)
│   │   └── orders/page.tsx                 (manage orders)
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── products/
│       │   ├── route.ts                    (GET list, POST create)
│       │   └── [id]/route.ts               (GET, PUT, DELETE)
│       ├── orders/route.ts
│       └── users/register/route.ts
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   └── CategoryFilter.tsx
├── context/
│   └── CartContext.tsx
├── lib/
│   ├── mongodb.ts
│   ├── auth.ts
│   ├── auth-helpers.ts
│   └── seed.ts
└── models/
    ├── Product.ts
    ├── User.ts
    └── Order.ts
```

---

## Verification

1. Run `npm run seed` — confirm products appear in MongoDB
2. Run `npm run dev` — visit `localhost:3000`
3. Browse home page → see featured products
4. Navigate to `/products` → filter by category and condition
5. Click a product → see detail page, add to cart
6. Go to `/cart` → adjust quantities, proceed to checkout
7. Register a customer account → place a mock order
8. Login as admin → manage products and view orders at `/admin`
