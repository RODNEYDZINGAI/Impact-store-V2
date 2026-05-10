"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CategoryTaxonomyItem, DEFAULT_CATEGORY_TAXONOMY, LEGACY_CATEGORY_OPTIONS, slugifyTaxonomyValue } from "@/lib/category-taxonomy";

type Status = "idle" | "loading" | "saving" | "saved" | "error";

const emptyCategory = (): CategoryTaxonomyItem => ({
  name: "",
  slug: "",
  description: "",
  legacyCategories: [],
  defaultLegacyCategory: "IT Hardware",
  subcategories: [],
});

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryTaxonomyItem[]>(DEFAULT_CATEGORY_TAXONOMY);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/category-taxonomy")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.categories)) setCategories(data.categories);
        setStatus("idle");
      })
      .catch(() => {
        setError("Failed to load saved taxonomy; showing defaults.");
        setStatus("error");
      });
  }, []);

  const updateCategory = <K extends keyof CategoryTaxonomyItem>(index: number, field: K, value: CategoryTaxonomyItem[K]) => {
    setCategories((current) => current.map((category, i) => (i === index ? { ...category, [field]: value } : category)));
  };

  const addCategory = () => setCategories((current) => [...current, emptyCategory()]);
  const removeCategory = (index: number) => setCategories((current) => current.filter((_, i) => i !== index));
  const addSubcategory = (categoryIndex: number) => {
    setCategories((current) =>
      current.map((category, i) =>
        i === categoryIndex
          ? {
              ...category,
              subcategories: [
                ...category.subcategories,
                { name: "", slug: "", legacyCategory: category.defaultLegacyCategory },
              ],
            }
          : category
      )
    );
  };

  const updateSubcategory = (categoryIndex: number, subcategoryIndex: number, field: "name" | "slug" | "legacyCategory", value: string) => {
    setCategories((current) =>
      current.map((category, i) =>
        i === categoryIndex
          ? {
              ...category,
              subcategories: category.subcategories.map((subcategory, j) =>
                j === subcategoryIndex ? { ...subcategory, [field]: value } : subcategory
              ),
            }
          : category
      )
    );
  };

  const removeSubcategory = (categoryIndex: number, subcategoryIndex: number) => {
    setCategories((current) =>
      current.map((category, i) =>
        i === categoryIndex
          ? { ...category, subcategories: category.subcategories.filter((_, j) => j !== subcategoryIndex) }
          : category
      )
    );
  };

  const save = async () => {
    setStatus("saving");
    setError("");
    const res = await fetch("/api/category-taxonomy", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories }),
    });
    const data = await res.json();
    if (res.ok) {
      setCategories(data.categories);
      setStatus("saved");
    } else {
      setError(data.error || "Failed to save category taxonomy");
      setStatus("error");
    }
  };

  const inputClass = "mt-1 w-full rounded-xl border border-white/[0.06] bg-navy px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-steel focus:outline-none";
  const selectClass = inputClass;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories & Subcategories</h1>
          <p className="mt-1 text-sm text-gray-500">Manage storefront navigation while preserving legacy product categories.</p>
        </div>
        <Button onClick={save} disabled={status === "saving"} className="bg-gradient-to-r from-royal to-steel text-white hover:from-steel hover:to-royal">
          {status === "saving" ? "Saving..." : "Save taxonomy"}
        </Button>
      </div>

      {status === "saved" && <p className="mt-4 rounded-xl border border-emerald/20 bg-emerald/10 px-4 py-3 text-sm text-emerald">Category taxonomy saved.</p>}
      {error && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      <div className="mt-6 space-y-5">
        {categories.map((category, categoryIndex) => (
          <section key={`${category.slug}-${categoryIndex}`} className="rounded-2xl border border-white/[0.06] bg-navy-light/70 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Category name</label>
                  <input value={category.name} onChange={(e) => updateCategory(categoryIndex, "name", e.target.value)} onBlur={() => updateCategory(categoryIndex, "slug", category.slug || slugifyTaxonomyValue(category.name))} className={inputClass} placeholder="Mobile Devices" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Slug</label>
                  <input value={category.slug} onChange={(e) => updateCategory(categoryIndex, "slug", e.target.value)} className={inputClass} placeholder="mobile-devices" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Description</label>
                  <input value={category.description} onChange={(e) => updateCategory(categoryIndex, "description", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Default legacy category</label>
                  <select value={category.defaultLegacyCategory} onChange={(e) => updateCategory(categoryIndex, "defaultLegacyCategory", e.target.value)} className={selectClass}>
                    {LEGACY_CATEGORY_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </div>
              </div>
              <button type="button" onClick={() => removeCategory(categoryIndex)} className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-400 hover:bg-red-500/30">Remove</button>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Subcategories</h2>
                <button type="button" onClick={() => addSubcategory(categoryIndex)} className="rounded-lg border border-steel/30 px-3 py-1.5 text-sm text-steel hover:bg-steel/10">+ Add subcategory</button>
              </div>
              <div className="mt-3 space-y-3">
                {category.subcategories.map((subcategory, subcategoryIndex) => (
                  <div key={`${subcategory.slug}-${subcategoryIndex}`} className="grid grid-cols-1 gap-3 rounded-xl border border-white/[0.06] bg-navy p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                    <input value={subcategory.name} onChange={(e) => updateSubcategory(categoryIndex, subcategoryIndex, "name", e.target.value)} onBlur={() => updateSubcategory(categoryIndex, subcategoryIndex, "slug", subcategory.slug || slugifyTaxonomyValue(subcategory.name))} className={inputClass} placeholder="Phones" />
                    <input value={subcategory.slug} onChange={(e) => updateSubcategory(categoryIndex, subcategoryIndex, "slug", e.target.value)} className={inputClass} placeholder="phones" />
                    <select value={subcategory.legacyCategory || category.defaultLegacyCategory} onChange={(e) => updateSubcategory(categoryIndex, subcategoryIndex, "legacyCategory", e.target.value)} className={selectClass}>
                      {LEGACY_CATEGORY_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                    </select>
                    <button type="button" onClick={() => removeSubcategory(categoryIndex, subcategoryIndex)} className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-400 hover:bg-red-500/30">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      <button type="button" onClick={addCategory} className="mt-5 rounded-xl border border-steel/30 px-4 py-2 text-sm text-steel hover:bg-steel/10">+ Add main category</button>
    </div>
  );
}
