"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CategoryTaxonomyItem } from "@/lib/category-taxonomy";

interface FilterBarProps {
  taxonomy: CategoryTaxonomyItem[];
  currentCategory?: string;
  currentCategorySlug?: string;
  currentSubcategory?: string;
  currentCondition?: string;
  currentSearch?: string;
}

const conditions = ["All", "New", "Refurbished", "Used"];

export default function FilterBar({
  taxonomy,
  currentCategory,
  currentCategorySlug,
  currentSubcategory,
  currentCondition,
  currentSearch,
}: FilterBarProps) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch || "");

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const next = {
      category: currentCategory,
      categorySlug: currentCategorySlug,
      subcategory: currentSubcategory,
      condition: currentCondition,
      search,
      ...updates,
    };

    if (next.category && !next.categorySlug) params.set("category", next.category);
    if (next.categorySlug) params.set("categorySlug", next.categorySlug);
    if (next.subcategory) params.set("subcategory", next.subcategory);
    if (next.condition && next.condition !== "All") params.set("condition", next.condition);
    if (next.search) params.set("search", next.search);

    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const clearCategory = () => updateFilters({ category: undefined, categorySlug: undefined, subcategory: undefined });
  const activeCategory = currentCategorySlug || currentCategory;

  return (
    <div className="mt-7 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Shop by category</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={clearCategory}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                !activeCategory
                  ? "bg-[#1f4f8f] text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-[#fbbf24] hover:text-[#1f2937]"
              }`}
            >
              All
            </button>
            {taxonomy.map((category) => (
              <button
                key={category.slug}
                onClick={() => updateFilters({ category: undefined, categorySlug: category.slug, subcategory: undefined })}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  currentCategorySlug === category.slug || currentCategory === category.name
                    ? "bg-[#1f4f8f] text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-[#fbbf24] hover:text-[#1f2937]"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            updateFilters({ search });
          }}
          className="flex min-w-0"
        >
          <div className="relative min-w-0 flex-1 sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products, brands, categories..."
              className="w-full rounded-l-full border border-r-0 border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-[#1f2937] placeholder:text-slate-400 focus:border-[#1f4f8f] focus:outline-none"
            />
          </div>
          <button type="submit" className="rounded-r-full bg-[#fbbf24] px-5 py-2 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f59e0b]">
            Search
          </button>
        </form>
      </div>

      {taxonomy.map((category) => {
        const isActive = currentCategorySlug === category.slug || currentCategory === category.name;
        if (!isActive) return null;
        return (
          <div key={category.slug} className="rounded-2xl bg-slate-50 p-3">
            <p className="text-sm text-slate-600">{category.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => updateFilters({ categorySlug: category.slug, subcategory: undefined })}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  !currentSubcategory
                    ? "border border-[#fbbf24] bg-[#fbbf24]/20 text-[#1f2937]"
                    : "border border-slate-200 bg-white text-slate-500 hover:border-[#fbbf24]"
                }`}
              >
                All {category.name}
              </button>
              {category.subcategories.map((subcategory) => (
                <button
                  key={subcategory.slug}
                  onClick={() => updateFilters({ categorySlug: category.slug, subcategory: subcategory.slug })}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    currentSubcategory === subcategory.slug || currentSubcategory === subcategory.name
                      ? "border border-[#fbbf24] bg-[#fbbf24]/20 text-[#1f2937]"
                      : "border border-slate-200 bg-white text-slate-500 hover:border-[#fbbf24]"
                  }`}
                >
                  {subcategory.name}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex flex-wrap gap-2">
        {conditions.map((cond) => (
          <button
            key={cond}
            onClick={() => updateFilters({ condition: cond === "All" ? undefined : cond })}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
              (cond === "All" && !currentCondition) || currentCondition === cond
                ? "border border-[#fbbf24] bg-[#fbbf24]/20 text-[#1f2937]"
                : "border border-slate-200 bg-white text-slate-500 hover:border-[#fbbf24]"
            }`}
          >
            {cond}
          </button>
        ))}
      </div>
    </div>
  );
}
