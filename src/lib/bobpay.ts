import crypto from "crypto";

const BOBPAY_API_URL = process.env.BOBPAY_API_URL!;
const BOBPAY_API_KEY = process.env.BOBPAY_API_KEY!;
const BOBPAY_PASSPHRASE = process.env.BOBPAY_PASSPHRASE!;

interface CreatePaymentLinkParams {
  orderId: string;
  amount: number;
  email: string;
  phone?: string;
  itemName: string;
  itemDescription?: string;
}

export async function createPaymentLink(params: CreatePaymentLinkParams) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

  const body = {
    recipient_account_code: process.env.BOBPAY_RECIPIENT_ACCOUNT_CODE!,
    custom_payment_id: params.orderId,
    email: params.email,
    phone_number: params.phone || "",
    amount: params.amount,
    item_name: params.itemName,
    item_description: params.itemDescription || "",
    notify_url: `${baseUrl}/api/webhooks/bobpay`,
    success_url: `${baseUrl}/payment/success?order=${params.orderId}`,
    pending_url: `${baseUrl}/payment/pending?order=${params.orderId}`,
    cancel_url: `${baseUrl}/payment/cancel?order=${params.orderId}`,
    short_url: false,
  };

  const res = await fetch(`${BOBPAY_API_URL}/payments/intents/link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${BOBPAY_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`BobPay create payment failed: ${res.status} - ${error}`);
  }

  return res.json() as Promise<{ url: string; short_url?: string }>;
}

export async function validatePayment(webhookPayload: Record<string, unknown>) {
  const res = await fetch(`${BOBPAY_API_URL}/payments/intents/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${BOBPAY_API_KEY}`,
    },
    body: JSON.stringify(webhookPayload),
  });

  return res.ok;
}

export function verifySignature(
  webhookData: Record<string, unknown>
): boolean {
  // BobPay may send phone_number or mobile_number - normalize to mobile_number
  const mobileNumber = String(webhookData.mobile_number || webhookData.phone_number || "");
  
  const keyValuePairs = [
    `recipient_account_code=${encodeURIComponent(String(webhookData.recipient_account_code || ""))}`,
    `custom_payment_id=${encodeURIComponent(String(webhookData.custom_payment_id || ""))}`,
    `email=${encodeURIComponent(String(webhookData.email || ""))}`,
    `mobile_number=${encodeURIComponent(mobileNumber)}`,
    `amount=${Number(webhookData.amount).toFixed(2)}`,
    `item_name=${encodeURIComponent(String(webhookData.item_name || ""))}`,
    `item_description=${encodeURIComponent(String(webhookData.item_description || ""))}`,
    `notify_url=${encodeURIComponent(String(webhookData.notify_url || ""))}`,
    `success_url=${encodeURIComponent(String(webhookData.success_url || ""))}`,
    `pending_url=${encodeURIComponent(String(webhookData.pending_url || ""))}`,
    `cancel_url=${encodeURIComponent(String(webhookData.cancel_url || ""))}`,
  ];

  const signatureString =
    keyValuePairs.join("&") + `&passphrase=${BOBPAY_PASSPHRASE}`;
  
  const calculated = crypto
    .createHash("md5")
    .update(signatureString)
    .digest("hex");

  return calculated === webhookData.signature;
}
