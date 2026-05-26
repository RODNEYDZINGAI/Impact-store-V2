"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ImageUpload";
import { DEFAULT_CATEGORY_TAXONOMY, getLegacyCategoryForSelection, LEGACY_CATEGORY_OPTIONS } from "@/lib/category-taxonomy";

interface VariantDraft {
  variantId: string;
  title: string;
  sku: string;
  price: string;
  stock: string;
  condition: "New" | "Refurbished" | "Used";
}

const emptyVariant = (): VariantDraft => ({
  variantId: crypto.randomUUID(),
  title: "",
  sku: "",
  price: "",
  stock: "",
  condition: "New",
});

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [form, setForm] = useState({
    name: "", slug: "", sku: "", subtitle: "", description: "", price: "", originalPrice: "",
    sourceUrl: "", category: "Laptops", categorySlug: "it-hardware", subcategory: "laptops-desktops", condition: "Refurbished", brand: "", stock: "", featured: false,
  });

  const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);
  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));
  const updateSpec = (index: number, field: "key" | "value", value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const addVariant = () => setVariants([...variants, emptyVariant()]);
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));
  const updateVariant = <K extends keyof VariantDraft>(index: number, field: K, value: VariantDraft[K]) => {
    const next = [...variants];
    next[index] = { ...next[index], [field]: value };
    setVariants(next);
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const taxonomy = DEFAULT_CATEGORY_TAXONOMY;
  const selectedCategory = taxonomy.find((item) => item.slug === form.categorySlug) || taxonomy[0];
  const selectedSubcategories = selectedCategory?.subcategories || [];
  const syncTaxonomySelection = (categorySlug: string, subcategorySlug?: string) => {
    const category = taxonomy.find((item) => item.slug === categorySlug) || taxonomy[0];
    const nextSubcategory = subcategorySlug || category.subcategories[0]?.slug || "";
    setForm({
      ...form,
      categorySlug: category.slug,
      subcategory: nextSubcategory,
      category: getLegacyCategoryForSelection(taxonomy, category.slug, nextSubcategory) || category.defaultLegacyCategory,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const specsObject = Object.fromEntries(
      specs.filter((s) => s.key.trim()).map((s) => [s.key.trim(), s.value.trim()])
    );
    const serializedVariants = variants
      .filter((v) => v.title.trim())
      .map((v) => ({
        variantId: v.variantId,
        title: v.title.trim(),
        sku: v.sku.trim(), // server will auto-generate if empty
        price: Number(v.price),
        stock: Number(v.stock),
        condition: v.condition,
        attributes: {},
        published: true,
      }));
    const body = {
      ...form, slug: form.slug || generateSlug(form.name),
      sku: form.sku, // server auto-generates if empty
      subtitle: form.subtitle || undefined,
      sourceUrl: form.sourceUrl.trim() || undefined,
      price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      stock: Number(form.stock), images, specs: specsObject,
      variants: serializedVariants.length > 0 ? serializedVariants : undefined,
    };
    const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) router.push("/admin/products");
    else { alert("Failed to create product"); setLoading(false); }
  };

  const inputClass = "mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#1f4f8f] focus:outline-none";
  const selectClass = "mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#1f4f8f] focus:outline-none";

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Add Product</h1>
      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-500">Product Name</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-500">Slug</label>
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-500">SKU <span className="text-xs text-slate-400">(auto-generated)</span></label>
            <input type="text" value={form.sku} readOnly className={`${inputClass} cursor-not-allowed bg-slate-100`} placeholder="Auto-generated on save" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-500">Subtitle</label>
            <input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={inputClass} placeholder="Short tagline shown under product name" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-500">Source URL</label>
            <input type="url" value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} className={inputClass} placeholder="Supplier or product source link" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500">Brand</label>
            <input type="text" required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500">Main Category</label>
            <select value={form.categorySlug} onChange={(e) => syncTaxonomySelection(e.target.value)} className={selectClass}>
              {taxonomy.map((category) => (
                <option key={category.slug} value={category.slug}>{category.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500">Subcategory</label>
            <select
              value={form.subcategory}
              onChange={(e) => syncTaxonomySelection(form.categorySlug, e.target.value)}
              className={selectClass}
            >
              {selectedSubcategories.map((subcategory) => (
                <option key={subcategory.slug} value={subcategory.slug}>{subcategory.name}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-500">Legacy Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={selectClass}>
              {LEGACY_CATEGORY_OPTIONS.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">Kept for existing product links, reports, and backward-compatible filters.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500">Condition</label>
            <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className={selectClass}>
              <option>New</option><option>Refurbished</option><option>Used</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500">Price (R)</label>
            <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500">Original Price (R)</label>
            <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} className={inputClass} placeholder="Optional" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500">Stock</label>
            <input type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-500">Description</label>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-500">Specifications</label>
            <div className="mt-2 space-y-2">
              {specs.map((spec, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Screen Size"
                    value={spec.key}
                    onChange={(e) => updateSpec(index, "key", e.target.value)}
                    className={`${inputClass} flex-1`}
                  />
                  <input
                    type="text"
                    placeholder="e.g., 6.1 inches"
                    value={spec.value}
                    onChange={(e) => updateSpec(index, "value", e.target.value)}
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(index)}
                    className="rounded-lg bg-red-50 px-3 text-red-700 hover:bg-red-100"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSpec}
                className="mt-2 rounded-lg border border-steel/30 px-4 py-2 text-sm text-steel hover:bg-steel/10"
              >
                + Add Specification
              </button>
            </div>
          </div>

          {/* Variants */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-500">Variants</label>
              <span className="text-xs text-slate-500">Optional — add if this product has multiple SKUs (e.g. colour, storage)</span>
            </div>
            <div className="mt-2 space-y-3">
              {variants.map((variant, index) => (
                <div
                  key={variant.variantId}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Variant {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="rounded-lg bg-red-50 px-2.5 py-1 text-xs text-red-700 hover:bg-red-100"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-500">Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., 128GB Black"
                        value={variant.title}
                        onChange={(e) => updateVariant(index, "title", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500">SKU <span className="text-[10px] text-slate-400">(auto)</span></label>
                      <input
                        type="text"
                        placeholder="Auto-generated if empty"
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, "sku", e.target.value.toUpperCase())}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500">Condition</label>
                      <select
                        value={variant.condition}
                        onChange={(e) => updateVariant(index, "condition", e.target.value as VariantDraft["condition"])}
                        className={selectClass}
                      >
                        <option>New</option>
                        <option>Refurbished</option>
                        <option>Used</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500">Price (R)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, "price", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500">Stock</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={variant.stock}
                        onChange={(e) => updateVariant(index, "stock", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addVariant}
                className="mt-2 rounded-lg border border-steel/30 px-4 py-2 text-sm text-steel hover:bg-steel/10"
              >
                + Add Variant
              </button>
            </div>
          </div>

          <div className="sm:col-span-2">
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              slug={form.slug || generateSlug(form.name)}
            />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded border-slate-200 bg-slate-50" />
            <label htmlFor="featured" className="text-sm text-slate-500">Featured product</label>
          </div>
        </div>
        <Button type="submit" disabled={loading} className="bg-[#1f4f8f] text-white shadow-md shadow-[#1f4f8f]/10 hover:bg-[#1f4f8f]/90">
          {loading ? "Creating..." : "Create Product"}
        </Button>
      </form>
    </div>
  );
}
