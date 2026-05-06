"use client";

import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const productLinks = [
  { href: "/products", label: "All Products" },
  { href: "/products?category=Phones", label: "Mobile Phones" },
  { href: "/products?category=Laptops", label: "Laptops" },
  { href: "/products?category=Tablets", label: "Tablets" },
  { href: "/products?category=IT+Hardware", label: "IT Hardware" },
  { href: "/products?category=Accessories", label: "Accessories" },
  { href: "/products?category=Security+%26+Access+Control", label: "Security & Access Control" },
];

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact Us" },
];

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const isAdmin = session?.user.role === "admin";

  useEffect(() => {
    const closeAccountMenu = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountOpen(false);
    };

    document.addEventListener("mousedown", closeAccountMenu);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeAccountMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const openSearch = () => {
    setSearchOpen(true);
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearch("");
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    if (!query) {
      openSearch();
      return;
    }

    setSearchOpen(false);
    setMenuOpen(false);
    router.push(`/products?search=${encodeURIComponent(query)}`);
  };

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
            <div className="relative hidden sm:block">
              {searchOpen ? (
                <form onSubmit={submitSearch} className="flex h-10 items-center rounded-full border border-slate-200 bg-white shadow-sm">
                  <Search className="ml-3 h-4 w-4 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") closeSearch();
                    }}
                    placeholder="Search products..."
                    className="h-full w-56 bg-transparent px-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={closeSearch}
                    className="mr-1 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                    aria-label="Close search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={openSearch}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                  aria-label="Search products"
                >
                  <Search className="h-4 w-4" />
                </button>
              )}
            </div>
            <Link
              href="/contact"
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
            {session ? (
              <div ref={accountMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((value) => !value)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                >
                  <UserRound className="h-4 w-4" />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-slate-900">{session.user.name || "Account"}</p>
                      <p className="truncate text-xs text-slate-500">{session.user.email}</p>
                    </div>
                    <div className="p-2 text-sm">
                      <Link
                        href="/profile"
                        onClick={() => setAccountOpen(false)}
                        className="block rounded-xl px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                      >
                        Profile
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setAccountOpen(false)}
                          className="block rounded-xl px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                        >
                          Admin
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="block w-full rounded-xl px-3 py-2 text-left font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
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
              <form onSubmit={submitSearch} className="mb-2 flex h-11 items-center rounded-full border border-slate-200 bg-white px-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products..."
                  className="h-full flex-1 bg-transparent px-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                <button type="submit" className="rounded-full bg-[#fbbf24] px-3 py-1.5 text-xs font-semibold text-[#1f2937]">
                  Search
                </button>
              </form>
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
              {session ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-lg px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="rounded-lg px-3 py-2 text-left font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Logout
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
