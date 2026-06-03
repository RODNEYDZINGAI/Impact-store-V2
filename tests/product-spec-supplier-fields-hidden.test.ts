import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const PRODUCT_DETAIL_CLIENT = "src/components/ProductDetailClient.tsx";

test("storefront product specifications hide supplier-only metadata fields", () => {
  const content = readFileSync(PRODUCT_DETAIL_CLIENT, "utf8");

  assert.match(content, /const SUPPLIER_ONLY_SPEC_KEYS = new Set\(/);
  assert.match(content, /"supplier category"/);
  assert.match(content, /"supplier sub category"/);
  assert.match(content, /"supplier code"/);
  assert.match(content, /function isStorefrontSpecVisible\(key: string\)/);
  assert.match(content, /Object\.entries\(product\.specs\)\.filter\(\(\[key\]\) => isStorefrontSpecVisible\(key\)\)/);
  assert.doesNotMatch(content, /const specs = product\.specs \? Object\.entries\(product\.specs\) : \[\];/);
});
