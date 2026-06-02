import assert from "node:assert/strict";
import test from "node:test";

import { isValidRefundStatusTransition, buildOrderSnapshot } from "../src/lib/admin-refunds";

// --- isValidRefundStatusTransition ---

test("open can transition to resolved", () => {
  assert.equal(isValidRefundStatusTransition("open", "resolved"), true);
});

test("open can transition to denied", () => {
  assert.equal(isValidRefundStatusTransition("open", "denied"), true);
});

test("resolved cannot transition to any status", () => {
  assert.equal(isValidRefundStatusTransition("resolved", "open"), false);
  assert.equal(isValidRefundStatusTransition("resolved", "denied"), false);
});

test("denied can be reopened to open", () => {
  assert.equal(isValidRefundStatusTransition("denied", "open"), true);
});

test("denied cannot transition to resolved directly", () => {
  assert.equal(isValidRefundStatusTransition("denied", "resolved"), false);
});

test("open cannot transition to open (no self-loop)", () => {
  assert.equal(isValidRefundStatusTransition("open", "open"), false);
});

// --- buildOrderSnapshot ---

const sampleOrder = {
  total: 2500,
  subtotal: 2600,
  discount: 100,
  items: [
    { name: "Widget A", sku: "WGT-001", price: 1000, quantity: 2, image: "/img/a.jpg", variantTitle: "Red" },
    { name: "Widget B", price: 500, quantity: 1, image: "/img/b.jpg" },
  ],
  shippingAddress: {
    fullName: "Jane Doe",
    address: "12 Main St",
    city: "Cape Town",
    province: "Western Cape",
    postalCode: "8001",
    phone: "0712345678",
  },
  status: "confirmed",
  paymentStatus: "paid",
  paymentId: "PAY-123",
  couponCode: "SAVE10",
  createdAt: new Date("2025-01-15T10:00:00Z"),
};

test("buildOrderSnapshot produces expected shape", () => {
  const snap = buildOrderSnapshot(sampleOrder);

  assert.equal(snap.total, 2500);
  assert.equal(snap.subtotal, 2600);
  assert.equal(snap.discount, 100);
  assert.equal(snap.status, "confirmed");
  assert.equal(snap.paymentStatus, "paid");
  assert.equal(snap.paymentId, "PAY-123");
  assert.equal(snap.couponCode, "SAVE10");
  assert.deepEqual(snap.orderCreatedAt, sampleOrder.createdAt);
});

test("buildOrderSnapshot maps items correctly", () => {
  const snap = buildOrderSnapshot(sampleOrder);

  assert.equal(snap.items.length, 2);
  assert.equal(snap.items[0].name, "Widget A");
  assert.equal(snap.items[0].sku, "WGT-001");
  assert.equal(snap.items[0].variantTitle, "Red");
  assert.equal(snap.items[1].name, "Widget B");
  assert.equal(snap.items[1].sku, undefined);
});

test("buildOrderSnapshot copies shippingAddress", () => {
  const snap = buildOrderSnapshot(sampleOrder);
  const addr = snap.shippingAddress;

  assert.equal(addr.fullName, "Jane Doe");
  assert.equal(addr.city, "Cape Town");
  assert.equal(addr.postalCode, "8001");
});

test("buildOrderSnapshot does not share address reference with source", () => {
  const snap = buildOrderSnapshot(sampleOrder);
  snap.shippingAddress.fullName = "Mutated";

  assert.equal(sampleOrder.shippingAddress.fullName, "Jane Doe");
});

test("buildOrderSnapshot handles missing optional fields", () => {
  const minimal = {
    ...sampleOrder,
    paymentId: undefined,
    couponCode: undefined,
  };
  const snap = buildOrderSnapshot(minimal);

  assert.equal(snap.paymentId, undefined);
  assert.equal(snap.couponCode, undefined);
});
