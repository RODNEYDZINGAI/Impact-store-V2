import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const PRODUCT_DETAIL_CLIENT = "src/components/ProductDetailClient.tsx";

test("downloadable product specs render URL values behind a generic link label", () => {
  const content = readFileSync(PRODUCT_DETAIL_CLIENT, "utf8");

  assert.match(content, /function isDownloadableSpec\(key: string\)/);
  assert.match(content, /return \/download\/i\.test\(key\);/);
  assert.match(content, /function SpecValue\(\{ specKey, value \}/);
  assert.match(content, /href=\{value\}/);
  assert.match(content, />\s*link\s*<\/a>/);
  assert.doesNotMatch(content, /<td className="px-4 py-2\.5 text-slate-600">\{value\}<\/td>/);
});
