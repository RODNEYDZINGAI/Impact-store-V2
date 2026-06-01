import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

function encodePayFastValue(value: string) {
  return encodeURIComponent(value.trim()).replace(/%20/g, "+");
}

function signatureStringFromEntries(entries: [string, string][], passphrase?: string) {
  const parts = entries
    .filter(([key, value]) => key !== "signature" && value !== undefined && value !== null && String(value).trim() !== "")
    .map(([key, value]) => `${key}=${encodePayFastValue(String(value))}`);

  if (passphrase) {
    parts.push(`passphrase=${encodePayFastValue(passphrase)}`);
  }

  return parts.join("&");
}

function verifyPayFastSignature(entries: [string, string][]) {
  const receivedSignature = entries.find(([key]) => key === "signature")?.[1];
  if (!receivedSignature) return false;

  const passphrase =
    process.env.PAYFAST_PASSPHRASE?.trim() || process.env.PAYFAST_SALT?.trim();
  const calculated = crypto
    .createHash("md5")
    .update(signatureStringFromEntries(entries, passphrase))
    .digest("hex");

  return calculated === receivedSignature;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const entries = Array.from(formData.entries()).map(
      ([key, value]) => [key, String(value)] as [string, string]
    );
    const payload = Object.fromEntries(entries);

    if (!verifyPayFastSignature(entries)) {
      console.warn("[PayFast] Invalid ITN signature", {
        orderId: payload.m_payment_id,
        paymentId: payload.pf_payment_id,
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const orderId = payload.m_payment_id;
    if (!orderId) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    await dbConnect();

    const statusMap: Record<string, "paid" | "failed" | "cancelled" | "unpaid"> = {
      COMPLETE: "paid",
      FAILED: "failed",
      CANCELLED: "cancelled",
      PENDING: "unpaid",
    };

    const paymentStatus = statusMap[String(payload.payment_status || "").toUpperCase()] || "unpaid";
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    order.paymentStatus = paymentStatus;
    order.paymentId = String(payload.pf_payment_id || "payfast");
    if (paymentStatus === "paid") {
      order.status = "confirmed";
    }
    order.notes = [order.notes, `PayFast status: ${payload.payment_status || "unknown"}`]
      .filter(Boolean)
      .join("\n");

    await order.save();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PayFast webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
