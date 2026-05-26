import crypto from "crypto";

interface CreatePayFastPaymentParams {
  orderId: string;
  amount: number;
  email?: string | null;
  name?: string | null;
  itemName: string;
  itemDescription?: string;
}

type PayFastParams = Record<string, string>;

const PAYFAST_FIELD_ORDER = [
  "merchant_id",
  "merchant_key",
  "return_url",
  "cancel_url",
  "notify_url",
  "name_first",
  "name_last",
  "email_address",
  "m_payment_id",
  "amount",
  "item_name",
  "item_description",
];

function encodePayFastValue(value: string) {
  return encodeURIComponent(value.trim()).replace(/%20/g, "+");
}

function splitName(name?: string | null): PayFastParams {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { name_first: parts[0] };
  return {
    name_first: parts[0],
    name_last: parts.slice(1).join(" "),
  };
}

function trimDescription(description?: string) {
  return (description || "").slice(0, 255);
}

export function generatePayFastSignature(params: PayFastParams, passphrase?: string) {
  const pairs = PAYFAST_FIELD_ORDER.flatMap((key) => {
    const value = params[key];
    return value ? [`${key}=${encodePayFastValue(value)}`] : [];
  });

  if (passphrase) {
    pairs.push(`passphrase=${encodePayFastValue(passphrase)}`);
  }

  return crypto.createHash("md5").update(pairs.join("&")).digest("hex");
}

export function createPayFastRedirectUrl(params: CreatePayFastPaymentParams) {
  const merchantId = process.env.PAYFAST_MERCHANT_ID?.trim();
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY?.trim();
  const processUrl = (
    process.env.PAYFAST_SANDBOX_URL ||
    process.env.PAYFAST_URL ||
    "https://sandbox.payfast.co.za/eng/process"
  ).trim();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();

  if (!merchantId || !merchantKey || !baseUrl) {
    throw new Error("PayFast environment variables are not configured");
  }

  const paymentParams: PayFastParams = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: `${baseUrl}/payment/success?order=${params.orderId}`,
    cancel_url: `${baseUrl}/payment/cancel?order=${params.orderId}`,
    notify_url: `${baseUrl}/api/webhooks/payfast`,
    ...splitName(params.name),
    email_address: params.email || "",
    m_payment_id: params.orderId,
    amount: params.amount.toFixed(2),
    item_name: params.itemName,
    item_description: trimDescription(params.itemDescription),
  };

  const passphrase =
    process.env.PAYFAST_PASSPHRASE?.trim() || process.env.PAYFAST_SALT?.trim();
  const signature = generatePayFastSignature(paymentParams, passphrase);
  const searchParams = new URLSearchParams();

  for (const key of PAYFAST_FIELD_ORDER) {
    const value = paymentParams[key];
    if (value) searchParams.set(key, value);
  }
  searchParams.set("signature", signature);

  return `${processUrl}?${searchParams.toString()}`;
}
