import assert from "node:assert/strict";
import crypto from "node:crypto";
import { test } from "node:test";
import {
  buildPayFastSignatureString,
  summarizePayFastPayload,
  verifyPayFastSignatureEntries,
} from "../src/lib/payfast";

const passphrase = "test-passphrase";

function md5(value: string) {
  return crypto.createHash("md5").update(value).digest("hex");
}

test("PayFast ITN signature builder includes every posted field except signature and appends passphrase", () => {
  const entries: [string, string][] = [
    ["m_payment_id", "order-123"],
    ["pf_payment_id", "999"],
    ["payment_status", "COMPLETE"],
    ["signature", "ignore-me"],
  ];

  assert.equal(
    buildPayFastSignatureString(entries, passphrase),
    "m_payment_id=order-123&pf_payment_id=999&payment_status=COMPLETE&passphrase=test-passphrase"
  );
});

test("PayFast ITN signature builder keeps blank fields that PayFast posted", () => {
  const entries: [string, string][] = [
    ["m_payment_id", "order-123"],
    ["custom_str1", ""],
    ["custom_int1", ""],
    ["payment_status", "COMPLETE"],
    ["signature", "ignore-me"],
  ];

  assert.equal(
    buildPayFastSignatureString(entries, passphrase),
    "m_payment_id=order-123&custom_str1=&custom_int1=&payment_status=COMPLETE&passphrase=test-passphrase"
  );
});

test("PayFast ITN signature verification accepts a valid posted signature", () => {
  const entries: [string, string][] = [
    ["m_payment_id", "order-123"],
    ["pf_payment_id", "999"],
    ["payment_status", "COMPLETE"],
  ];
  const signature = md5(buildPayFastSignatureString(entries, passphrase));

  assert.equal(
    verifyPayFastSignatureEntries([...entries, ["signature", signature]], passphrase),
    true
  );
});

test("PayFast webhook diagnostics expose only safe metadata", () => {
  const summary = summarizePayFastPayload(
    [
      ["m_payment_id", "secret-order-id"],
      ["pf_payment_id", "secret-payment-id"],
      ["payment_status", "COMPLETE"],
      ["signature", "secret-signature"],
    ],
    {
      contentType: "application/x-www-form-urlencoded",
      contentLength: "128",
    }
  );

  assert.deepEqual(summary, {
    contentType: "application/x-www-form-urlencoded",
    contentLength: "128",
    fieldNames: ["m_payment_id", "pf_payment_id", "payment_status", "signature"],
    hasSignature: true,
    hasOrderId: true,
    hasPaymentId: true,
    hasPaymentStatus: true,
    fieldCount: 4,
  });
  assert.doesNotMatch(JSON.stringify(summary), /secret-order-id|secret-payment-id|secret-signature/);
});
