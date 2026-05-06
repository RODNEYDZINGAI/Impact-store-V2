"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface FilterBarProps {
  currentCategory?: string;
  currentCondition?: string;
  currentSearch?: string;
}

const categories = ["All", "Phones", "Laptops", "Tablets", "Accessories", "IT Hardware", "Security & Access Control"];
const conditions = ["All", "New", "Refurbished"];

export default function FilterBar({ currentCategory, currentCondition, currentSearch }: FilterBarProps) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch || "");

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams();
    if (key === "category" && value !== "All") params.set("category", value);
    else if (currentCategory && key !== "category") params.set("category", currentCategory);

    if (key === "condition" && value !== "All") params.set("condition", value);
    else if (currentCondition && key !== "condition") params.set("condition", currentCondition);

    if (key === "search" && value) params.set("search", value);
    else if (search && key !== "search") params.set("search", search);

    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilters("category", cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                (cat === "All" && !currentCategory) || currentCategory === cat
                  ? "bg-[#1f4f8f] text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-[#fbbf24] hover:text-[#1f2937]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            updateFilters("search", search);
          }}
          className="flex min-w-0"
        >
          <div className="relative min-w-0 flex-1 sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-l-full border border-r-0 border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-[#1f2937] placeholder:text-slate-400 focus:border-[#1f4f8f] focus:outline-none"
            />
          </div>
          <button type="submit" className="rounded-r-full bg-[#fbbf24] px-5 py-2 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f59e0b]">
            Search
          </button>
        </form>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {conditions.map((cond) => (
          <button
            key={cond}
            onClick={() => updateFilters("condition", cond)}
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
