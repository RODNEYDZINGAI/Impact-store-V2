import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { stripProductSourceUrls } from "../src/lib/product-response";

const publicProduct = stripProductSourceUrls({
  name: "Test product",
  sourceUrl: "https://supplier.example/product",
  supplier: "Scoop",
  brand: "Impact",
});

assert.equal("sourceUrl" in publicProduct, false, "public product responses must hide sourceUrl");
assert.equal("supplier" in publicProduct, false, "public product responses must hide supplier");
assert.equal(publicProduct.name, "Test product");

const publicProducts = stripProductSourceUrls([
  { name: "One", sourceUrl: "https://example.com/one", supplier: "Scoop" },
  { name: "Two", supplier: "Rectron" },
]);
assert.deepEqual(
  publicProducts.map((product) => Object.keys(product).sort()),
  [["name"], ["name"]],
  "public product arrays must hide admin-only fields"
);

const modelSource = readFileSync("src/models/Product.ts", "utf8");
assert.match(modelSource, /supplier\?: string/, "Product interface should expose optional supplier");
assert.match(modelSource.replace(/\n/g, " "), /supplier:\s*\{\s*type:\s*String,\s*trim:\s*true\s*\}/, "Product schema should persist trimmed supplier");

const newProductPage = readFileSync("src/app/admin/products/new/page.tsx", "utf8");
assert.match(newProductPage, /supplier:\s*""/, "new product form should track supplier state");
assert.match(newProductPage, />Supplier</, "new product form should render a Supplier input label");
assert.match(newProductPage, /supplier:\s*form\.supplier\.trim\(\) \|\| undefined/, "new product form should submit trimmed supplier");

const editProductPage = readFileSync("src/app/admin/products/[id]/edit/page.tsx", "utf8");
assert.match(editProductPage, /supplier:\s*p\.supplier \|\| ""/, "edit product form should hydrate supplier from API");
assert.match(editProductPage, />Supplier</, "edit product form should render a Supplier input label");
assert.match(editProductPage, /supplier:\s*form\.supplier\.trim\(\) \|\| undefined/, "edit product form should submit trimmed supplier");

const storefrontFiles = [
  "src/app/page.tsx",
  "src/app/products/page.tsx",
  "src/app/products/[slug]/page.tsx",
];
for (const file of storefrontFiles) {
  const source = readFileSync(file, "utf8");
  assert.doesNotMatch(source, /\.select\("-sourceUrl"\)/, `${file} should not select supplier on public storefront queries`);
}

console.log("Admin-only supplier field verification checks passed");
