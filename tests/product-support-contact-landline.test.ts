import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const PRODUCT_DETAIL_CLIENT = "src/components/ProductDetailClient.tsx";

test("product support tab includes the top bar landline number", () => {
  const content = readFileSync(PRODUCT_DETAIL_CLIENT, "utf8");
  const supportSection = content.slice(content.indexOf('{activeTab === "support"'));

  assert.ok(supportSection.includes('Landline:{" "}'));
  assert.match(supportSection, /href="tel:\+271[0-9]+"/);
  assert.ok(supportSection.includes("+27 10 001 3608"));
});
