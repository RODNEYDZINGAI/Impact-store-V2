import assert from "node:assert/strict";
import test from "node:test";

import {
  applyAdminProductFilters,
  buildAdminProductFilterOptions,
  createDefaultAdminProductFilters,
} from "../src/lib/admin-product-filters";

const products = [
  {
    _id: "p1",
    name: "iPhone 13 Pro",
    brand: "Apple",
    supplier: "Scoop",
    category: "Phones",
    categorySlug: "phones",
    subcategory: "iPhones",
    condition: "New",
    stock: 5,
    published: true,
  },
  {
    _id: "p2",
    name: "Galaxy S22",
    brand: "Samsung",
    supplier: "Rectron",
    category: "Phones",
    categorySlug: "phones",
    subcategory: "Android",
    condition: "Refurbished",
    stock: 0,
    published: false,
  },
  {
    _id: "p3",
    name: "MacBook Air",
    brand: "Apple",
    supplier: "Tarsus",
    category: "Laptops",
    categorySlug: "laptops",
    subcategory: "MacBooks",
    condition: "Used",
    stock: 2,
  },
];

test("applies status, category, brand, condition, and stock filters together", () => {
  const filtered = applyAdminProductFilters(products, {
    status: "published",
    category: "Phones",
    brand: "Apple",
    condition: "New",
    stock: "in-stock",
    search: "iphone",
  });

  assert.deepEqual(filtered.map((p) => p._id), ["p1"]);
});

test("admin product search includes supplier names", () => {
  const filtered = applyAdminProductFilters(products, {
    ...createDefaultAdminProductFilters(),
    search: "rectron",
  });

  assert.deepEqual(filtered.map((p) => p._id), ["p2"]);
});

test("treats products with undefined published as published for legacy data", () => {
  const filtered = applyAdminProductFilters(products, {
    ...createDefaultAdminProductFilters(),
    status: "published",
    brand: "Apple",
  });

  assert.deepEqual(filtered.map((p) => p._id), ["p1", "p3"]);
});

test("builds sorted unique filter option lists and ignores blank values", () => {
  const options = buildAdminProductFilterOptions([
    ...products,
    { ...products[0], _id: "p4", brand: " ", category: "Phones" },
  ]);

  assert.deepEqual(options.brands, ["Apple", "Samsung"]);
  assert.deepEqual(options.categories, ["Laptops", "Phones"]);
  assert.deepEqual(options.conditions, ["New", "Refurbished", "Used"]);
});
