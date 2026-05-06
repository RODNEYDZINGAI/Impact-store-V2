"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/ImageUpload";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
  const [form, setForm] = useState({
    name: "", slug: "", sku: "", subtitle: "", description: "", price: "", originalPrice: "",
    category: "Laptops", condition: "Refurbished", brand: "", stock: "", featured: false,
  });

  const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);
  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));
  const updateSpec = (index: number, field: "key" | "value", value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  useEffect(() => {
    fetch(`/api/products/${params.id}`).then((r) => r.json()).then((p) => {
      setForm({
        name: p.name, slug: p.slug, sku: p.sku || "", subtitle: p.subtitle || "", description: p.description, price: String(p.price),
        originalPrice: p.originalPrice ? String(p.originalPrice) : "", category: p.category,
        condition: p.condition, brand: p.brand, stock: String(p.stock), featured: p.featured,
      });
      setImages(p.images || []);
      // Convert specs Map/Object to array format
      if (p.specs) {
        const specsEntries = Object.entries(p.specs).map(([key, value]) => ({
          key,
          value: String(value),
        }));
        setSpecs(specsEntries);
      }
      setLoading(false);
    });
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const specsObject = Object.fromEntries(
      specs.filter((s) => s.key.trim()).map((s) => [s.key.trim(), s.value.trim()])
    );
    const body = { ...form, subtitle: form.subtitle || undefined, price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined, stock: Number(form.stock), images, specs: specsObject };
    const res = await fetch(`/api/products/${params.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      alert("Product saved successfully!");
    } else {
      alert("Failed to update product");
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-steel border-t-transparent" /></div>;
  }

  const inputClass = "mt-1 w-full rounded-xl border border-white/[0.06] bg-navy px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-steel focus:outline-none";
  const selectClass = "mt-1 w-full rounded-xl border border-white/[0.06] bg-navy px-4 py-2.5 text-sm text-white focus:border-steel focus:outline-none";

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Edit Product</h1>
      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-500">Product Name</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-500">Slug</label>
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-500">SKU</label>
            <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })} className={inputClass} placeholder="e.g., LAP-DEL-A3F2" />
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
            <label className="block text-sm font-medium text-gray-500">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={selectClass}>
              <option>Phones</option><option>Laptops</option><option>Tablets</option><option>Accessories</option><option>IT Hardware</option><option>Security &amp; Access Control</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Condition</label>
            <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className={selectClass}>
              <option>New</option><option>Refurbished</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Price (R)</label>
            <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Original Price (R)</label>
            <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} className={inputClass} />
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
          <div className="sm:col-span-2">
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              slug={form.slug}
            />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded border-white/[0.06] bg-navy" />
            <label htmlFor="featured" className="text-sm text-gray-400">Featured product</label>
          </div>
        </div>
        <Button type="submit" disabled={saving} className="bg-gradient-to-r from-royal to-steel text-white hover:from-steel hover:to-royal shadow-lg shadow-royal/25">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
