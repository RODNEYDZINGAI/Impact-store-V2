"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight, Share2, Check } from "lucide-react";
import ProductGallery from "@/components/ProductGallery";
import ProductDetailActions from "@/components/ProductDetailActions";
import ProductCard from "@/components/ProductCard";

interface ProductVariant {
  variantId: string;
  sku: string;
  title: string;
  price: number;
  originalPrice?: number;
  stock: number;
  condition?: string;
  attributes: Record<string, string>;
  images?: string[];
  published: boolean;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  subtitle?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category: string;
  categorySlug?: string;
  subcategory?: string;
  condition: string;
  brand: string;
  images: string[];
  specs?: Record<string, string>;
  stock: number;
  featured: boolean;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

interface Props {
  product: Product;
  relatedProducts: Product[];
}

type TabId = "description" | "specs" | "shipping" | "support";

const TABS: { id: TabId; label: string }[] = [
  { id: "description", label: "Description" },
  { id: "specs", label: "Specifications" },
  { id: "shipping", label: "Shipping & Returns" },
  { id: "support", label: "Support" },
];

const TRUST_SIGNALS = [
  { icon: "✅", title: "Authorized Dealer", description: "Official authorized dealer for leading brands" },
  { icon: "🛡️", title: "Quality Checked", description: "Every product inspected and quality assured" },
  { icon: "📦", title: "Nationwide Delivery", description: "Delivered across South Africa with tracking" },
  { icon: "🏢", title: "Business Support", description: "Dedicated B2B account management" },
  { icon: "🔒", title: "Secure Payment", description: "Protected by bank-grade encryption" },
  { icon: "♻️", title: "E-Waste Compliant", description: "Responsible recycling and disposal" },
];

const CONDITION_COLORS: Record<string, string> = {
  New: "bg-[#fbbf24] text-[#1f2937]",
  Refurbished: "bg-emerald-100 text-emerald-700",
  Used: "bg-slate-200 text-slate-700",
};

const SUPPLIER_ONLY_SPEC_KEYS = new Set([
  "supplier category",
  "supplier sub category",
  "supplier code",
]);

function normalizeSpecKey(key: string) {
  return key.trim().toLowerCase().replace(/[\s_-]+/g, " ");
}

function isStorefrontSpecVisible(key: string) {
  return !SUPPLIER_ONLY_SPEC_KEYS.has(normalizeSpecKey(key));
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value.trim());
}

function isDownloadableSpec(key: string) {
  return /download/i.test(key);
}

function SpecValue({ specKey, value }: { specKey: string; value: string }) {
  if (isDownloadableSpec(specKey) && isHttpUrl(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-[#1f4f8f] hover:underline"
      >
        link
      </a>
    );
  }

  return <>{value}</>;
}

export default function ProductDetailClient({ product, relatedProducts }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const [copied, setCopied] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = actionsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleShare = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const specs = product.specs ? Object.entries(product.specs).filter(([key]) => isStorefrontSpecVisible(key)) : [];

  const stickyPrice =
    product.variants && product.variants.filter((v) => v.published !== false).length > 0
      ? `From R${Math.min(...product.variants.filter((v) => v.published !== false).map((v) => v.price)).toLocaleString()}`
      : `R${product.price.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 md:pb-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-sm">
          <Link href="/" className="text-slate-400 transition hover:text-slate-600">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <Link href="/products" className="text-slate-400 transition hover:text-slate-600">Products</Link>
          {product.category && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <Link
                href={`/products?category=${encodeURIComponent(product.category)}`}
                className="text-slate-400 transition hover:text-slate-600"
              >
                {product.category}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="max-w-[200px] truncate font-medium text-slate-700">{product.name}</span>
        </nav>

        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <ProductGallery images={product.images || []} name={product.name} />

          {/* Product info panel */}
          <div>
            {/* Brand + Condition badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-600">
                {product.brand}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ${
                  CONDITION_COLORS[product.condition] ?? "bg-slate-200 text-slate-700"
                }`}
              >
                {product.condition}
              </span>
            </div>

            {/* Product name */}
            <h1 className="mt-3 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
              {product.name}
            </h1>
            {product.subtitle && (
              <p className="mt-2 text-slate-500">{product.subtitle}</p>
            )}

            {/* SKU + Share */}
            <div className="mt-3 flex items-center justify-between gap-3">
              {product.sku ? (
                <p className="text-xs text-slate-400">SKU: {product.sku}</p>
              ) : (
                <span />
              )}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Share2 className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied!" : "Share"}
              </button>
            </div>

            <div className="mt-4 border-t border-slate-100" />

            {/* Price, variants, quantity, add-to-cart */}
            <div ref={actionsRef}>
              <ProductDetailActions product={product} />
            </div>
          </div>
        </div>

        {/* Tabbed content */}
        <div className="mt-14">
          <div className="flex overflow-x-auto border-b border-slate-200">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 border-b-2 -mb-px px-5 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-[#1f4f8f] text-[#1f4f8f]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="rounded-b-2xl border border-t-0 border-slate-200 bg-white p-6 shadow-sm">
            {activeTab === "description" && (
              <p className="whitespace-pre-wrap leading-relaxed text-slate-700">
                {product.description || "No description available."}
              </p>
            )}

            {activeTab === "specs" && (
              specs.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-sm">
                    <tbody>
                      {specs.map(([key, value], i) => (
                        <tr key={key} className={i % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                          <td className="w-1/3 px-4 py-2.5 font-medium text-slate-700">{key}</td>
                          <td className="px-4 py-2.5 text-slate-600">
                            <SpecValue specKey={key} value={value} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500">No specifications available.</p>
              )
            )}

            {activeTab === "shipping" && (
              <div className="space-y-6 text-sm">
                <div>
                  <h3 className="mb-2 font-semibold text-slate-900">Delivery</h3>
                  <ul className="space-y-1.5 text-slate-600">
                    <li>• Nationwide delivery across South Africa</li>
                    <li>• 2–3 business days (Gauteng)</li>
                    <li>• 3–5 business days (other provinces)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-slate-900">Returns & Warranty</h3>
                  <ul className="space-y-1.5 text-slate-600">
                    <li>• 30-day return policy for unused items in original packaging</li>
                    <li>• Manufacturer warranty applies (varies by product)</li>
                    <li>
                      Contact{" "}
                      <a
                        href="mailto:support@impactstore.co.za"
                        className="text-[#1f4f8f] hover:underline"
                      >
                        support@impactstore.co.za
                      </a>{" "}
                      for returns
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "support" && (
              <div className="space-y-6 text-sm">
                <div>
                  <h3 className="mb-2 font-semibold text-slate-900">Business Hours</h3>
                  <p className="text-slate-600">Monday – Friday, 08:00 – 17:00 SAST</p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-slate-900">Contact Us</h3>
                  <ul className="space-y-1.5 text-slate-600">
                    <li>
                      Email:{" "}
                      <a
                        href="mailto:info@impactstore.co.za"
                        className="text-[#1f4f8f] hover:underline"
                      >
                        info@impactstore.co.za
                      </a>
                    </li>
                    <li>
                      Phone:{" "}
                      <a href="tel:+27785229194" className="text-[#1f4f8f] hover:underline">
                        +27 78 522 9194
                      </a>
                    </li>
                    <li>
                      Landline:{" "}
                      <a href="tel:+27100013608" className="text-[#1f4f8f] hover:underline">
                        +27 10 001 3608
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://wa.me/27785229194"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1f4f8f] hover:underline"
                      >
                        WhatsApp available
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trust signals */}
        <div className="mt-10">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {TRUST_SIGNALS.map((signal) => (
              <div
                key={signal.title}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <span className="text-2xl" aria-hidden="true">{signal.icon}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800">{signal.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{signal.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Related Products</h2>
              <Link
                href={`/products?category=${encodeURIComponent(product.category)}`}
                className="text-sm font-medium text-[#1f4f8f] hover:underline"
              >
                View All {product.category} →
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} {...p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky mobile CTA bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-4 border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] md:hidden">
          <div className="flex-shrink-0">
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Price</p>
            <p className="text-lg font-bold text-[#1f4f8f]">{stickyPrice}</p>
          </div>
          <button
            onClick={() =>
              actionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className="flex-1 rounded-xl bg-[#1f4f8f] py-3 text-sm font-semibold text-white transition hover:bg-[#173b6b]"
          >
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
}
