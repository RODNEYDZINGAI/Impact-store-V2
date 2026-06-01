"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/quotes", label: "Quotes" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/users", label: "Users" },
];

const plannedAdminLinks = ["Settings", "Reports"];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session?.user?.role !== "admin") router.push("/");
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#1f4f8f]" />
      </div>
    );
  }

  if (!session || session.user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr] lg:gap-8">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 lg:border-r lg:pr-6">
            <div className="flex items-center justify-between gap-3 lg:block">
              <h2 className="text-lg font-bold text-slate-800">Admin</h2>
              <span className="rounded-full bg-steel/10 px-2.5 py-1 text-xs text-steel lg:mt-2 lg:inline-block">
                Operations
              </span>
            </div>
            <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${
                    pathname === link.href
                      ? "bg-[#1f4f8f] text-white shadow-md shadow-[#1f4f8f]/10"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {plannedAdminLinks.map((label) => (
                <span
                  key={label}
                  className="whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-slate-300"
                  title="Planned admin module"
                >
                  {label}
                </span>
              ))}
            </nav>
          </aside>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
