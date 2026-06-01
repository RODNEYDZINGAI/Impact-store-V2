"use client";

import { Menu, Search, ShoppingBag, UserRound, X, ChevronDown, LayoutDashboard, User, Package, LogOut, Heart } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
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
  { href: "/articles", label: "Articles" },
  { href: "/recycling", label: "Recycling" },
  { href: "/contact", label: "Contact Us" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const isAdmin = session?.user?.role === "admin";

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
          <Link href="/quote?source=top-bar-bulk-orders" className="font-semibold text-[#fbbf24] transition hover:text-[#f59e0b]">
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
              <Image src="/impact/impact-logo.svg" alt="Impact Store" width={40} height={40} className="h-10 w-10 sm:hidden" />
              <Image src="/impact/impact-logo-lockup.svg" alt="Impact Store" width={160} height={40} className="hidden h-10 w-auto sm:block" />
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
              href="/quote?source=navbar"
              className="hidden rounded-full bg-[#fbbf24] px-5 py-2 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f59e0b] lg:inline-flex"
            >
              Request Quote
            </Link>
            <Link
              href="/wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              aria-label="Wishlist"
            >
              <Heart className="h-4 w-4" />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-100 px-1 text-[10px] font-bold text-rose-600">
                  {wishlistCount}
                </span>
              )}
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

            {/* User dropdown */}
            {session ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex h-10 items-center gap-1.5 rounded-full border border-slate-200 pl-3 pr-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                  aria-label="Account menu"
                >
                  <span className="hidden max-w-[100px] truncate text-sm font-medium sm:inline">
                    {session.user?.name?.split(" ")[0] || "Account"}
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1f4f8f] text-xs font-bold text-white">
                    {(session.user?.name?.[0] || "U").toUpperCase()}
                  </div>
                  <ChevronDown className={`h-3 w-3 transition ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
                    {/* User info header */}
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-800">{session.user?.name}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">{session.user?.email}</p>
                      {isAdmin && (
                        <span className="mt-1.5 inline-block rounded-full bg-[#1f4f8f]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#1f4f8f]">
                          Admin
                        </span>
                      )}
                    </div>

                    {/* Menu links */}
                    <div className="mt-1 flex flex-col gap-0.5 px-2">
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          <LayoutDashboard className="h-4 w-4 text-slate-400" />
                          Dashboard
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        Profile
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Package className="h-4 w-4 text-slate-400" />
                        My Orders
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="mt-1 border-t border-slate-100 px-2 pt-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex h-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                aria-label="Sign in"
              >
                <UserRound className="h-4 w-4" />
              </Link>
            )}
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
                href="/wishlist"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
              >
                Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
              </Link>
              {session ? (
                <>
                  <Link
                    href={isAdmin ? "/admin" : "/profile"}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    {isAdmin ? "Dashboard" : "Profile"}
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                    className="rounded-lg px-3 py-2 text-left font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
