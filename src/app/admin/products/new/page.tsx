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
    category: "Laptops", categorySlug: "it-hardware", subcategory: "laptops-desktops", condition: "Refurbished", brand: "", stock: "", featured: false,
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

  const generateSku = (category: string, brand: string) => {
    const cat = category.substring(0, 3).toUpperCase();
    const br = brand.substring(0, 3).toUpperCase() || "XXX";
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${cat}-${br}-${rand}`;
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
        sku: v.sku.trim() || generateSku(form.category, form.brand),
        price: Number(v.price),
        stock: Number(v.stock),
        condition: v.condition,
        attributes: {},
        published: true,
      }));
    const body = {
      ...form, slug: form.slug || generateSlug(form.name),
      sku: form.sku || generateSku(form.category, form.brand),
      subtitle: form.subtitle || undefined,
      price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      stock: Number(form.stock), images, specs: specsObject,
      variants: serializedVariants.length > 0 ? serializedVariants : undefined,
    };
    const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) router.push("/admin/products");
    else { alert("Failed to create product"); setLoading(false); }
  };

  const inputClass = "mt-1 w-full rounded-xl border border-white/[0.06] bg-navy px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-steel focus:outline-none";
  const selectClass = "mt-1 w-full rounded-xl border border-white/[0.06] bg-navy px-4 py-2.5 text-sm text-white focus:border-steel focus:outline-none";

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Add Product</h1>
      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-500">Product Name</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-500">Slug</label>
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-500">SKU</label>
            <div className="flex gap-2">
              <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })} className={`${inputClass} flex-1`} placeholder="e.g., LAP-DEL-A3F2" />
              <button type="button" onClick={() => setForm({ ...form, sku: generateSku(form.category, form.brand) })} className="mt-1 rounded-xl border border-steel/30 px-4 py-2.5 text-sm text-steel hover:bg-steel/10">
                Generate
              </button>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-500">Subtitle</label>
            <input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={inputClass} placeholder="Short tagline shown under product name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Brand</label>
            <input type="text" required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Main Category</label>
            <select value={form.categorySlug} onChange={(e) => syncTaxonomySelection(e.target.value)} className={selectClass}>
              {taxonomy.map((category) => (
                <option key={category.slug} value={category.slug}>{category.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Subcategory</label>
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
            <label className="block text-sm font-medium text-gray-500">Legacy Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={selectClass}>
              {LEGACY_CATEGORY_OPTIONS.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-600">Kept for existing product links, reports, and backward-compatible filters.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Condition</label>
            <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className={selectClass}>
              <option>New</option><option>Refurbished</option><option>Used</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Price (R)</label>
            <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Original Price (R)</label>
            <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} className={inputClass} placeholder="Optional" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Stock</label>
            <input type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-500">Description</label>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-500">Specifications</label>
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
                    className="rounded-lg bg-red-500/20 px-3 text-red-400 hover:bg-red-500/30"
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
              <label className="block text-sm font-medium text-gray-500">Variants</label>
              <span className="text-xs text-gray-600">Optional — add if this product has multiple SKUs (e.g. colour, storage)</span>
            </div>
            <div className="mt-2 space-y-3">
              {variants.map((variant, index) => (
                <div
                  key={variant.variantId}
                  className="rounded-xl border border-white/[0.06] bg-navy p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Variant {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="rounded-lg bg-red-500/20 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/30"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-500">Title</label>
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
                      <label className="block text-xs text-gray-500">SKU</label>
                      <input
                        type="text"
                        placeholder="Auto-generated if empty"
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, "sku", e.target.value.toUpperCase())}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Condition</label>
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
                      <label className="block text-xs text-gray-500">Price (R)</label>
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
                      <label className="block text-xs text-gray-500">Stock</label>
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
            <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded border-white/[0.06] bg-navy" />
            <label htmlFor="featured" className="text-sm text-gray-400">Featured product</label>
          </div>
        </div>
        <Button type="submit" disabled={loading} className="bg-gradient-to-r from-royal to-steel text-white hover:from-steel hover:to-royal shadow-lg shadow-royal/25">
          {loading ? "Creating..." : "Create Product"}
        </Button>
      </form>
    </div>
  );
}
