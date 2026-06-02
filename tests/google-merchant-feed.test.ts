import assert from "node:assert/strict";
import test from "node:test";

import {
  buildGoogleMerchantFeedXml,
  mapProductToGoogleMerchantFeedItems,
} from "../src/lib/google-merchant-feed";

const product = {
  _id: "mongo-1",
  name: "Scoop Router & Firewall <Pro>",
  slug: "scoop-router-firewall-pro",
  sku: "SCP-ROUTER-1",
  description: "<p>Fast & secure router for business networks. Model/Supplier code: U7-Lite. Supplied by Scoop.</p>",
  price: 1299,
  category: "IT Hardware",
  subcategory: "Networking",
  condition: "New",
  brand: "Scoop",
  images: ["/products/router.jpg", "https://cdn.example.com/router-side.jpg"],
  stock: 12,
  published: true,
  supplier: "Scoop",
  sourceUrl: "https://supplier.example.com/product/1",
};

test("maps a published product into a Google Merchant feed item", () => {
  const items = mapProductToGoogleMerchantFeedItems(product, "https://impactstore.co.za");

  assert.equal(items.length, 1);
  assert.deepEqual(items[0], {
    id: "SCP-ROUTER-1",
    title: "Scoop Router & Firewall <Pro>",
    description: "Fast & secure router for business networks. Model code: U7-Lite.",
    link: "https://impactstore.co.za/products/scoop-router-firewall-pro",
    imageLink: "https://impactstore.co.za/products/router.jpg",
    additionalImageLinks: ["https://cdn.example.com/router-side.jpg"],
    availability: "in_stock",
    price: "1299.00 ZAR",
    condition: "new",
    brand: "Scoop",
    mpn: "SCP-ROUTER-1",
    productType: "IT Hardware > Networking",
    googleProductCategory: "Electronics > Network Components",
  });
});

test("skips products that Google Merchant Center cannot accept safely", () => {
  assert.equal(
    mapProductToGoogleMerchantFeedItems({ ...product, price: 0 }, "https://impactstore.co.za").length,
    0
  );
  assert.equal(
    mapProductToGoogleMerchantFeedItems({ ...product, images: [] }, "https://impactstore.co.za").length,
    0
  );
  assert.equal(
    mapProductToGoogleMerchantFeedItems({ ...product, published: false }, "https://impactstore.co.za").length,
    0
  );
});

test("builds escaped RSS XML without leaking supplier source metadata", () => {
  const xml = buildGoogleMerchantFeedXml([product], "https://impactstore.co.za");

  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<rss version="2.0" xmlns:g="http:\/\/base\.google\.com\/ns\/1\.0">/);
  assert.match(xml, /<g:title>Scoop Router &amp; Firewall &lt;Pro&gt;<\/g:title>/);
  assert.match(xml, /<g:description>Fast &amp; secure router for business networks\. Model code: U7-Lite\.<\/g:description>/);
  assert.doesNotMatch(xml, /Supplied by/i);
  assert.doesNotMatch(xml, /Supplier code/i);
  assert.match(xml, /<g:availability>in_stock<\/g:availability>/);
  assert.match(xml, /<g:price>1299\.00 ZAR<\/g:price>/);
  assert.doesNotMatch(xml, /supplier/i);
  assert.doesNotMatch(xml, /sourceUrl/i);
  assert.doesNotMatch(xml, /supplier\.example\.com/);
});
