"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type ImportStrategy = "create" | "update" | "upsert";

interface ImportRow {
  row: number;
  sku?: string;
  slug?: string;
  name?: string;
  action?: "create" | "update";
  errors: string[];
  warnings: string[];
}

interface ImportResponse {
  mode: "dry-run" | "commit";
  strategy: ImportStrategy;
  summary: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    warningRows: number;
    createRows: number;
    updateRows: number;
    created?: number;
    updated?: number;
  };
  rows: ImportRow[];
  error?: string;
}

export default function ImportProductsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [strategy, setStrategy] = useState<ImportStrategy>("create");
  const [defaultPublished, setDefaultPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);

  const downloadTemplate = () => {
    window.location.href = "/api/admin/products/import";
  };

  const runImport = async (mode: "dry-run" | "commit") => {
    if (!file) {
      alert("Choose a spreadsheet first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);
    formData.append("strategy", strategy);
    formData.append("defaultPublished", String(defaultPublished));

    const response = await fetch("/api/admin/products/import", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  const canCommit = result && result.summary.errorRows === 0 && result.summary.validRows > 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Import Products</h1>
          <p className="mt-2 text-sm text-gray-500">
            Upload an Excel spreadsheet, validate it, then commit the valid products.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="border-white/[0.08] bg-transparent text-gray-300 hover:bg-white/[0.05] hover:text-white"
        >
          <Link href="/admin/products">Back to Products</Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-2xl border border-white/[0.06] bg-navy-light p-5">
          <h2 className="text-lg font-semibold text-white">Spreadsheet</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Start with the template so categories, conditions, image URLs, and specs are formatted correctly.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={downloadTemplate}
              className="bg-gradient-to-r from-royal to-steel text-white hover:from-steel hover:to-royal"
            >
              Download Sample Spreadsheet
            </Button>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400">Upload .xlsx, .xls, or .csv</label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(event) => {
                  setFile(event.target.files?.[0] || null);
                  setResult(null);
                }}
                className="mt-2 w-full rounded-xl border border-white/[0.06] bg-navy px-4 py-2.5 text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-steel/20 file:px-3 file:py-1.5 file:text-sm file:text-steel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">Import mode</label>
              <select
                value={strategy}
                onChange={(event) => {
                  setStrategy(event.target.value as ImportStrategy);
                  setResult(null);
                }}
                className="mt-2 w-full rounded-xl border border-white/[0.06] bg-navy px-4 py-2.5 text-sm text-white focus:border-steel focus:outline-none"
              >
                <option value="create">Create new products only</option>
                <option value="update">Update existing products only</option>
                <option value="upsert">Create new and update existing</option>
              </select>
            </div>

            <label className="flex items-center gap-3 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={defaultPublished}
                onChange={(event) => setDefaultPublished(event.target.checked)}
                className="rounded border-white/[0.06] bg-navy"
              />
              Publish rows by default when the published column is blank
            </label>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                disabled={loading || !file}
                onClick={() => runImport("dry-run")}
                className="bg-gradient-to-r from-royal to-steel text-white hover:from-steel hover:to-royal disabled:opacity-60"
              >
                {loading ? "Checking..." : "Validate Spreadsheet"}
              </Button>
              <Button
                type="button"
                disabled={loading || !canCommit}
                onClick={() => runImport("commit")}
                className="bg-emerald/20 text-emerald hover:bg-emerald/30 disabled:opacity-40"
              >
                Commit Import
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-navy-light p-5">
          <h2 className="text-lg font-semibold text-white">Template Rules</h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-500">
            <p>
              Products are matched by SKU first, then slug. Keep SKUs stable when updating existing products.
            </p>
            <p>
              Use categories exactly as shown in the dropdowns: Phones, Tablets, Laptops, Accessories, IT Hardware, or Security &amp; Access Control.
            </p>
            <p>
              Use <span className="text-gray-300">New</span> or <span className="text-gray-300">Refurbished</span> for condition.
            </p>
            <p>
              Multiple images can be comma-separated. The import stores image paths or public URLs only; it does not upload image files to R2. Use full public R2 URLs after the images are already uploaded, or site-relative paths for bundled demo assets.
            </p>
            <code className="block rounded-xl bg-navy p-3 text-xs text-gray-300">
              https://your-r2-url/products/laptop/front.jpg, https://your-r2-url/products/laptop/side.jpg
            </code>
            <p>
              Specs should use semicolon-separated key/value pairs, for example:
            </p>
            <code className="block rounded-xl bg-navy p-3 text-xs text-gray-300">
              CPU:Intel Core i5;RAM:16GB;Storage:512GB SSD
            </code>
          </div>
        </section>
      </div>

      {result && (
        <section className="mt-6 rounded-2xl border border-white/[0.06] bg-navy-light p-5">
          {result.error ? (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{result.error}</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">
                  {result.mode === "commit" ? "Import Complete" : "Validation Results"}
                </h2>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-white/[0.08] px-3 py-1 text-gray-300">
                    {result.summary.totalRows} rows
                  </span>
                  <span className="rounded-full border border-emerald/30 bg-emerald/10 px-3 py-1 text-emerald">
                    {result.summary.validRows} valid
                  </span>
                  <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-red-300">
                    {result.summary.errorRows} errors
                  </span>
                  <span className="rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-amber">
                    {result.summary.warningRows} warnings
                  </span>
                </div>
              </div>

              {result.mode === "commit" && (
                <p className="mt-4 rounded-xl border border-emerald/20 bg-emerald/10 p-4 text-sm text-emerald">
                  Created {result.summary.created ?? 0} product(s), updated {result.summary.updated ?? 0} product(s).
                </p>
              )}

              <div className="mt-5 overflow-x-auto rounded-xl border border-white/[0.06]">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/[0.06] bg-navy text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Row</th>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {result.rows.map((row) => (
                      <tr key={row.row}>
                        <td className="px-4 py-3 text-gray-400">{row.row}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-200">{row.name || "Unnamed product"}</p>
                          <p className="text-xs text-gray-600">{row.sku || row.slug || "No SKU/slug"}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{row.action || "-"}</td>
                        <td className="px-4 py-3">
                          {row.errors.length ? (
                            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-300">Error</span>
                          ) : row.warnings.length ? (
                            <span className="rounded-full border border-amber/30 bg-amber/10 px-2 py-0.5 text-xs font-medium text-amber">Warning</span>
                          ) : (
                            <span className="rounded-full border border-emerald/30 bg-emerald/10 px-2 py-0.5 text-xs font-medium text-emerald">Ready</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {[...row.errors, ...row.warnings].length ? [...row.errors, ...row.warnings].join(" ") : "No issues"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
