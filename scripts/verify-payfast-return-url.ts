import assert from "node:assert/strict";

import { createPayFastRedirectUrl } from "../src/lib/payfast";

process.env.PAYFAST_MERCHANT_ID = "10000100";
process.env.PAYFAST_MERCHANT_KEY = "46f0cd694581a";
process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
process.env.PAYFAST_SANDBOX_URL = "https://sandbox.payfast.co.za/eng/process";

type PayFastRedirectParams = Parameters<typeof createPayFastRedirectUrl>[0] & {
  baseUrl?: string;
};

const orderId = "6a1dc185c7afca421e82eb84";
const paymentUrl = createPayFastRedirectUrl({
  orderId,
  amount: 10,
  itemName: "Impact Store test order",
  baseUrl: "https://lab.impactstore.co.za",
} as PayFastRedirectParams);

const redirectParams = new URL(paymentUrl).searchParams;

assert.equal(
  redirectParams.get("return_url"),
  `https://lab.impactstore.co.za/payment/success?order=${orderId}`
);
assert.equal(
  redirectParams.get("cancel_url"),
  `https://lab.impactstore.co.za/payment/cancel?order=${orderId}`
);
assert.equal(
  redirectParams.get("notify_url"),
  "https://lab.impactstore.co.za/api/webhooks/payfast"
);
assert.notEqual(redirectParams.get("return_url"), `http://localhost:3000/payment/success?order=${orderId}`);

console.log("PayFast return URL verification checks passed");
