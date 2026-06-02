import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const CONTACT_EMAIL = "info@impactstore.co.za";
const OLD_DOMAIN = "@impactholdings.co.za";

const filesThatShouldUseImpactStoreEmail = [
  "src/components/Navbar.tsx",
  "src/components/Footer.tsx",
  "src/components/ProductDetailClient.tsx",
  "src/app/contact/page.tsx",
  "docs/seo/metadata-strategy.md",
];

test("customer-facing contact points use the Impact Store email address", () => {
  for (const file of filesThatShouldUseImpactStoreEmail) {
    const content = readFileSync(file, "utf8");

    assert.match(content, new RegExp(CONTACT_EMAIL, "i"), `${file} should include ${CONTACT_EMAIL}`);
    assert.doesNotMatch(content, new RegExp(OLD_DOMAIN, "i"), `${file} should not include old Impact Holdings email domain`);
  }
});

test("footer shortcut labels the refund route as refund and returns policy", () => {
  const content = readFileSync("src/components/Footer.tsx", "utf8");

  assert.match(content, /\["Refund and Returns Policy", "\/refund-policy"\]/);
  assert.doesNotMatch(content, /\["Returns Policy", "\/refund-policy"\]/);
});

test("refund policy page is presented as a refund and returns policy with Impact Store ownership", () => {
  const content = readFileSync("src/app/refund-policy/page.tsx", "utf8");

  assert.match(content, /Refund and Returns Policy \| Impact Store/);
  assert.match(content, /Refund and Returns Policy/);
  assert.match(content, /info@impactstore\.co\.za/);
  assert.match(content, /repair, replacement, or refund/i);
  assert.doesNotMatch(content, /Approved by Impact Holdings/);
});
