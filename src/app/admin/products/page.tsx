"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  applyAdminProductFilters,
  buildAdminProductFilterOptions,
  createDefaultAdminProductFilters,
  hasActiveAdminProductAttributeFilters,
  isAdminProductPublished,
  type AdminProductFilters,
  type AdminProductStatusFilter,
  type AdminProductStockFilter,
} from "@/lib/admin-product-filters";

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  categorySlug?: string;
  subcategory?: string;
  condition: string;
  stock: number;
  brand: string;
  supplier?: string;
  published: boolean;
}

type FilterTab = AdminProductStatusFilter;

const STOCK_FILTER_LABELS: Record<AdminProductStockFilter, string> = {
  all: "All stock",
  "in-stock": "In stock",
  "out-of-stock": "Out of stock",
};

const formatFilterLabel = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ");

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<AdminProductFilters>(createDefaultAdminProductFilters());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const fetchProducts = useCallback((showLoading = true) => {
    if (showLoading) setLoading(true);
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchProducts(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchProducts]);

  const updateFilter = <K extends keyof AdminProductFilters>(
    key: K,
    value: AdminProductFilters[K]
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const setActiveTab = (status: FilterTab) => updateFilter("status", status);
  const activeTab = filters.status;

  const filterOptions = useMemo(() => buildAdminProductFilterOptions(products), [products]);
  const filteredProducts = useMemo(
    () => applyAdminProductFilters<Product>(products, filters),
    [products, filters]
  );
  const visibleSelectedCount = filteredProducts.filter((p: Product) => selectedIds.has(p._id)).length;
  const hasActiveAttributeFilters = hasActiveAdminProductAttributeFilters(filters);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (visibleSelectedCount === filteredProducts.length) {
      setSelectedIds((current) => {
        const next = new Set(current);
        filteredProducts.forEach((product) => next.delete(product._id));
        return next;
      });
    } else {
      setSelectedIds((current) => {
        const next = new Set(current);
        filteredProducts.forEach((product) => next.add(product._id));
        return next;
      });
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} product(s)?`)) return;
    setBulkActionLoading(true);

    const promises = Array.from(selectedIds).map((id) =>
      fetch(`/api/products/${id}`, { method: "DELETE" })
    );

    await Promise.all(promises);
    setSelectedIds(new Set());
    fetchProducts();
    setBulkActionLoading(false);
  };

  const handleBulkUnpublish = async () => {
    setBulkActionLoading(true);

    const promises = Array.from(selectedIds).map((id) =>
      fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: false }),
      })
    );

    await Promise.all(promises);
    setSelectedIds(new Set());
    fetchProducts();
    setBulkActionLoading(false);
  };

  const handleBulkPublish = async () => {
    setBulkActionLoading(true);

    const promises = Array.from(selectedIds).map((id) =>
      fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: true }),
      })
    );

    await Promise.all(promises);
    setSelectedIds(new Set());
    fetchProducts();
    setBulkActionLoading(false);
  };

  const publishedCount = products.filter((p: Product) => isAdminProductPublished(p)).length;
  const unpublishedCount = products.filter((p: Product) => !isAdminProductPublished(p)).length;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-[#1f4f8f]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Products</h1>
        <Button
          asChild
          className="bg-[#1f4f8f] text-white hover:bg-[#1f4f8f]/90"
        >
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === "all"
              ? "border-b-2 border-steel text-steel"
              : "text-slate-500 hover:text-slate-600"
          }`}
        >
          All ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("published")}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === "published"
              ? "border-b-2 border-emerald text-emerald-700"
              : "text-slate-500 hover:text-slate-600"
          }`}
        >
          Published ({publishedCount})
        </button>
        <button
          onClick={() => setActiveTab("unpublished")}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === "unpublished"
              ? "border-b-2 border-amber text-amber"
              : "text-slate-500 hover:text-slate-600"
          }`}
        >
          Unpublished ({unpublishedCount})
        </button>
      </div>

      {/* Attribute Filters */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Search
            <input
              type="search"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Name, brand, category..."
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 placeholder-slate-400 focus:border-[#1f4f8f] focus:outline-none"
            />
          </label>

          <label className="flex min-w-[160px] flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Category
            <select
              value={filters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 focus:border-[#1f4f8f] focus:outline-none"
            >
              <option value="all">All categories</option>
              {filterOptions.categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-[150px] flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Brand
            <select
              value={filters.brand}
              onChange={(e) => updateFilter("brand", e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 focus:border-[#1f4f8f] focus:outline-none"
            >
              <option value="all">All brands</option>
              {filterOptions.brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-[150px] flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Condition
            <select
              value={filters.condition}
              onChange={(e) => updateFilter("condition", e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 focus:border-[#1f4f8f] focus:outline-none"
            >
              <option value="all">All conditions</option>
              {filterOptions.conditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-[140px] flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
            Stock
            <select
              value={filters.stock}
              onChange={(e) => updateFilter("stock", e.target.value as AdminProductStockFilter)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 focus:border-[#1f4f8f] focus:outline-none"
            >
              {(Object.keys(STOCK_FILTER_LABELS) as AdminProductStockFilter[]).map((stockFilter) => (
                <option key={stockFilter} value={stockFilter}>
                  {STOCK_FILTER_LABELS[stockFilter]}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setFilters(createDefaultAdminProductFilters())}
            disabled={!hasActiveAttributeFilters && activeTab === "all"}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset filters
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-500">
          Showing {filteredProducts.length} of {products.length} products
          {hasActiveAttributeFilters
            ? ` matching ${[
                filters.search && `search "${filters.search}"`,
                filters.category !== "all" && `category ${filters.category}`,
                filters.brand !== "all" && `brand ${filters.brand}`,
                filters.condition !== "all" && `condition ${filters.condition}`,
                filters.stock !== "all" && formatFilterLabel(filters.stock),
              ]
                .filter(Boolean)
                .join(", ")}`
            : ""}
          .
        </p>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="mt-4 flex items-center gap-4 rounded-xl border border-steel/30 bg-steel/10 px-4 py-3">
          <span className="text-sm text-slate-600">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            {activeTab !== "published" && (
              <button
                onClick={handleBulkPublish}
                disabled={bulkActionLoading}
                className="rounded-lg bg-emerald/20 px-3 py-1.5 text-sm text-emerald hover:bg-emerald/30 disabled:opacity-50"
              >
                Publish
              </button>
            )}
            {activeTab !== "unpublished" && (
              <button
                onClick={handleBulkUnpublish}
                disabled={bulkActionLoading}
                className="rounded-lg bg-amber/20 px-3 py-1.5 text-sm text-amber hover:bg-amber/30 disabled:opacity-50"
              >
                Unpublish
              </button>
            )}
            <button
              onClick={handleBulkDelete}
              disabled={bulkActionLoading}
              className="rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              Delete
            </button>
            <button
              onClick={clearSelection}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-white text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    filteredProducts.length > 0 &&
                    visibleSelectedCount === filteredProducts.length
                  }
                  onChange={toggleAll}
                  className="rounded border-slate-200 bg-slate-50"
                />
              </th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Condition</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredProducts.map((p) => (
              <tr
                key={p._id}
                className="cursor-pointer transition hover:bg-slate-100"
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName !== "INPUT") {
                    router.push(`/admin/products/${p._id}/edit`);
                  }
                }}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p._id)}
                    onChange={() => toggleSelection(p._id)}
                    className="rounded border-slate-200 bg-slate-50"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-700">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.brand}</p>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  <p>{p.category}</p>
                  {(p.categorySlug || p.subcategory) && (
                    <p className="mt-1 text-xs text-slate-500">
                      {[p.categorySlug, p.subcategory].filter(Boolean).join(" / ")}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500">{p.supplier ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                      p.condition === "New"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : p.condition === "Refurbished"
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-slate-200 bg-slate-100 text-slate-600"
                    }`}
                  >
                    {p.condition}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">
                  R{p.price.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className={p.stock > 0 ? "text-emerald-700" : "text-red-700"}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                      isAdminProductPublished(p)
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isAdminProductPublished(p) ? "Published" : "Unpublished"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
