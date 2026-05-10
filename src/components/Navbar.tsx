"use client";

import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import Link from "next/link";

const productLinks = [
  { href: "/products", label: "All Products" },
  { href: "/products?categorySlug=mobile-devices", label: "Mobile Devices" },
  { href: "/products?categorySlug=mobile-devices&subcategory=phones", label: "Phones" },
  { href: "/products?categorySlug=mobile-devices&subcategory=tablets", label: "Tablets" },
  { href: "/products?categorySlug=it-hardware", label: "IT Hardware" },
  { href: "/products?categorySlug=it-hardware&subcategory=laptops-desktops", label: "Laptops & Desktops" },
  { href: "/products?categorySlug=security-access-control", label: "Security & Access Control" },
];

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/recycling", label: "Recycling" },
  { href: "/contact", label: "Contact Us" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="sticky inset-x-0 top-0 z-50">
      <div className="hidden bg-[#1f4f8f] text-white sm:block">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-2 text-xs">
          <div className="flex items-center gap-6">
            <a href="tel:+27100013608" className="transition hover:text-white/80">
              +27 10 001 3608
            </a>
            <a href="mailto:info@impactholdings.co.za" className="transition hover:text-white/80">
              info@impactholdings.co.za
            </a>
          </div>
          <Link href="/contact" className="font-semibold text-[#fbbf24] transition hover:text-[#f59e0b]">
            Bulk orders? Get up to 25% off!
          </Link>
        </div>
      </div>

      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 text-slate-600">
          <div className="flex flex-1 items-center gap-4">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50 md:hidden"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" className="flex items-center gap-2 text-slate-900">
              <img src="/impact/impact-logo.svg" alt="Impact Store" className="h-10 w-10 sm:hidden" />
              <img src="/impact/impact-logo-lockup.svg" alt="Impact Store" className="hidden h-10 w-auto sm:block" />
            </Link>
          </div>

          <div className="hidden items-center gap-6 text-sm md:flex">
            <Link href="/" className="font-medium transition hover:text-slate-950">
              Home
            </Link>
            <div className="group relative">
              <Link href="/products" className="flex items-center gap-2 font-medium transition hover:text-slate-950">
                Products
                <span className="transition group-hover:rotate-180">⌄</span>
              </Link>
              <div className="invisible absolute left-0 top-full z-10 w-56 rounded-2xl border border-slate-200 bg-white p-3 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                <div className="flex flex-col gap-2 text-xs">
                  {productLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-lg px-3 py-2 font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link href="/tap" className="flex items-center gap-2 font-medium transition hover:text-slate-950">
              TAP
              <span className="rounded-full bg-[#fbbf24] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#1f2937]">
                New
              </span>
            </Link>
            <Link href="/mdm" className="font-medium transition hover:text-slate-950">
              MDM
            </Link>
            {navLinks.slice(1).map((link) => (
              <Link key={link.href} href={link.href} className="font-medium transition hover:text-slate-950">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 sm:flex"
              aria-label="Search products"
            >
              <Search className="h-4 w-4" />
            </Link>
            <Link
              href="/quote"
              className="hidden rounded-full bg-[#fbbf24] px-5 py-2 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f59e0b] lg:inline-flex"
            >
              Request Quote
            </Link>
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              aria-label="Cart"
            >
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#fbbf24] px-1 text-[10px] font-bold text-[#1f2937]">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link
              href={session ? (session.user.role === "admin" ? "/admin" : "/profile") : "/login"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              aria-label="Account"
            >
              <UserRound className="h-4 w-4" />
            </Link>
          </div>
        </nav>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-6 py-4 md:hidden">
            <div className="mx-auto flex max-w-[1440px] flex-col gap-2 text-sm">
              {[...navLinks, { href: "/tap", label: "TAP" }, { href: "/mdm", label: "MDM" }, ...productLinks].map((link) => (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={session ? "/profile" : "/login"}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
              >
                {session ? "Account" : "Sign In"}
              </Link>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
