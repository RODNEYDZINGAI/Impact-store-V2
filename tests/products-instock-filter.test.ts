import assert from "node:assert/strict";
import test from "node:test";

// Mirrors the in-stock logic used in the MongoDB filter and AddToCartButton:
// - products without variants: stock > 0 on the product itself
// - products with variants: any variant with stock > 0
function isInStock(product: { stock: number; variants?: { stock: number; published?: boolean }[] }): boolean {
  if (!product.variants || product.variants.length === 0) {
    return product.stock > 0;
  }
  return product.variants.some((v) => v.stock > 0);
}

test("product without variants is in-stock when stock > 0", () => {
  assert.equal(isInStock({ stock: 5 }), true);
  assert.equal(isInStock({ stock: 1 }), true);
  assert.equal(isInStock({ stock: 0 }), false);
});

test("product with variants is in-stock when any variant has stock > 0", () => {
  assert.equal(isInStock({ stock: 0, variants: [{ stock: 2 }, { stock: 0 }] }), true);
  assert.equal(isInStock({ stock: 0, variants: [{ stock: 0 }, { stock: 3 }] }), true);
});

test("product with variants is out-of-stock when all variants have zero stock", () => {
  assert.equal(isInStock({ stock: 0, variants: [{ stock: 0 }] }), false);
  assert.equal(isInStock({ stock: 0, variants: [{ stock: 0 }, { stock: 0 }] }), false);
  // base product.stock is ignored when variants exist
  assert.equal(isInStock({ stock: 99, variants: [{ stock: 0 }] }), false);
});

test("product with empty variants array falls back to base stock", () => {
  assert.equal(isInStock({ stock: 5, variants: [] }), true);
  assert.equal(isInStock({ stock: 0, variants: [] }), false);
});
