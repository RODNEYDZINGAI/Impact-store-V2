import assert from "node:assert/strict";
import {
  getSearchFallbackMode,
  rankProductsBySearch,
  shouldUseFuzzyFallback,
} from "../src/lib/product-search";

const products = [
  {
    _id: "iphone-15",
    name: "Apple iPhone 15 Pro",
    brand: "Apple",
    sku: "APL-IP15-PRO",
    description: "A premium iOS smartphone with pro camera features",
    category: "Phones",
    subcategory: "Smartphones",
    createdAt: new Date("2024-02-01"),
  },
  {
    _id: "iphone-case",
    name: "iPhone Rugged Case",
    brand: "Impact",
    sku: "CASE-IP-RUGGED",
    description: "Protective phone case",
    category: "Accessories",
    subcategory: "Cases",
    createdAt: new Date("2024-03-01"),
  },
  {
    _id: "dell-latitude",
    name: "Dell Latitude 5420",
    brand: "Dell",
    sku: "DEL-LAT-5420",
    description: "Business laptop with Intel processor",
    category: "Laptops",
    subcategory: "Business Laptops",
    createdAt: new Date("2024-04-01"),
  },
  {
    _id: "samsung-a54",
    name: "Samsung Galaxy A54",
    brand: "Samsung",
    sku: "SAM-A54",
    description: "Android smartphone",
    category: "Phones",
    subcategory: "Smartphones",
    createdAt: new Date("2024-05-01"),
  },
];

const exactRanked = rankProductsBySearch(products, "iphone");
assert.deepEqual(
  exactRanked.map((p) => p._id),
  ["iphone-15", "iphone-case"],
  "exact and partial name matches should rank above unrelated products and exclude zero-score products",
);
assert.equal(shouldUseFuzzyFallback(exactRanked), false, "exact matches should not be labeled as fuzzy fallback");
assert.equal(getSearchFallbackMode("iphone", exactRanked), "exact");

const typoRanked = rankProductsBySearch(products, "iphnoe");
assert.deepEqual(
  typoRanked.map((p) => p._id),
  ["iphone-15", "iphone-case"],
  "one transposed/mistyped query should still find iPhone products",
);
assert.equal(shouldUseFuzzyFallback(typoRanked), true, "typo-only matches should be labeled as fuzzy fallback");
assert.equal(getSearchFallbackMode("iphnoe", typoRanked), "fuzzy");

const skuRanked = rankProductsBySearch(products, "DEL LAT 5420");
assert.deepEqual(skuRanked.map((p) => p._id), ["dell-latitude"], "SKU tokens should be searchable");
assert.equal(getSearchFallbackMode("DEL LAT 5420", skuRanked), "exact");

const noResults = rankProductsBySearch(products, "projector");
assert.deepEqual(noResults, [], "unmatched searches should return an empty array instead of falling back to all products");
assert.equal(getSearchFallbackMode("projector", noResults), "none");

console.log("product search tests passed");
