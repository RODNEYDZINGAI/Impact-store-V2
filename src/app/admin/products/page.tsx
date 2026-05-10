"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
  published: boolean;
}

type FilterTab = "all" | "published" | "unpublished";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
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

  // Treat undefined as published (existing products before this feature)
  const isPublished = (p: Product) => p.published !== false;
  
  const filteredProducts = products.filter((p) => {
    if (activeTab === "published") return isPublished(p);
    if (activeTab === "unpublished") return !isPublished(p);
    return true;
  });

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
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p._id)));
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

  const publishedCount = products.filter((p) => isPublished(p)).length;
  const unpublishedCount = products.filter((p) => !isPublished(p)).length;

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
                    selectedIds.size === filteredProducts.length
                  }
                  onChange={toggleAll}
                  className="rounded border-slate-200 bg-slate-50"
                />
              </th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
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
                      isPublished(p)
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isPublished(p) ? "Published" : "Unpublished"}
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
