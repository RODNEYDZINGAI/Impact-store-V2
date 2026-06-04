import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const CONTACT_EMAIL = "info@impactstore.co.za";
const OLD_DOMAIN = "@impactholdings.co.za";
const WHATSAPP_NUMBER = "27100013608";
const WHATSAPP_DISPLAY_NUMBER = "+27 10 001 3608";
const OLD_WHATSAPP_NUMBER = "27785229194";
const OLD_DISPLAY_NUMBER = "+27 78 522 9194";

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

  assert.match(content, /\["Refund and Returns Policy", "\/returns-policy"\]/);
  assert.doesNotMatch(content, /\["Returns Policy", "\/returns-policy"\]/);
});

test("returns policy page is presented as a refund and returns policy with Impact Store ownership", () => {
  const content = readFileSync("src/app/returns-policy/page.tsx", "utf8");

  assert.match(content, /Refund and Returns Policy \| Impact Store/);
  assert.match(content, /Refund and Returns Policy/);
  assert.match(content, /support@impactstore\.co\.za/);
  assert.match(content, /repair, replacement, or refund/i);
  assert.doesNotMatch(content, /Approved by Impact Holdings/);
});

test("customer-facing WhatsApp and phone links use the new Impact Store number", () => {
  const filesWithDialableNumber = [
    "src/components/Navbar.tsx",
    "src/components/Footer.tsx",
  ];
  const filesWithDisplayedNumber = [
    "src/components/Navbar.tsx",
    "src/components/Footer.tsx",
  ];

  for (const file of filesWithDialableNumber) {
    const content = readFileSync(file, "utf8");

    assert.match(content, new RegExp(WHATSAPP_NUMBER), `${file} should include ${WHATSAPP_NUMBER}`);
    assert.doesNotMatch(content, new RegExp(OLD_WHATSAPP_NUMBER), `${file} should not include old WhatsApp number`);
    assert.doesNotMatch(content, new RegExp(OLD_DISPLAY_NUMBER.replace(/[+]/g, "\\+")), `${file} should not display old phone number`);
  }

  for (const file of filesWithDisplayedNumber) {
    const content = readFileSync(file, "utf8");

    assert.match(content, new RegExp(WHATSAPP_DISPLAY_NUMBER.replace(/[+]/g, "\\+")), `${file} should display ${WHATSAPP_DISPLAY_NUMBER}`);
  }
});

test("contact page displays both the office line and mobile WhatsApp number", () => {
  const content = readFileSync("src/app/contact/page.tsx", "utf8");

  assert.match(content, new RegExp(WHATSAPP_NUMBER));
  assert.match(content, new RegExp(WHATSAPP_DISPLAY_NUMBER.replace(/[+]/g, "\\+")));
  assert.match(content, new RegExp(OLD_WHATSAPP_NUMBER));
  assert.match(content, new RegExp(OLD_DISPLAY_NUMBER.replace(/[+]/g, "\\+")));
});
