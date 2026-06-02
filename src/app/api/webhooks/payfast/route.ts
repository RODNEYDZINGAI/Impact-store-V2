import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import Order from "@/models/Order";
import User from "@/models/User";
import { sendOrderConfirmationEmail } from "@/lib/email";

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

    const wasPaid = order.paymentStatus === "paid";

    order.paymentStatus = paymentStatus;
    order.paymentId = String(payload.pf_payment_id || "payfast");
    if (paymentStatus === "paid") {
      order.status = "confirmed";
    }
    order.notes = [order.notes, `PayFast status: ${payload.payment_status || "unknown"}`]
      .filter(Boolean)
      .join("\n");

    await order.save();

    if (paymentStatus === "paid" && !wasPaid && !order.promotionsRecorded) {
      const promotionUpdates: Promise<unknown>[] = [];

      if (order.couponCode) {
        promotionUpdates.push(
          Coupon.updateOne({ code: order.couponCode }, { $inc: { usedCount: 1 } })
        );
      }

      if (order.referrer) {
        promotionUpdates.push(
          User.updateOne(
            { _id: order.referrer },
            {
              $inc: {
                "referralStats.usageCount": 1,
                "referralStats.revenue": order.total,
                "referralStats.discountIssued": order.referralDiscount || 0,
              },
              $addToSet: { "referralStats.referredOrders": order._id },
            }
          )
        );
        promotionUpdates.push(
          User.updateOne(
            { _id: order.user, referredBy: { $exists: false } },
            { $set: { referredBy: order.referrer } }
          )
        );
      }

      if (promotionUpdates.length > 0) {
        await Promise.all(promotionUpdates);
        order.promotionsRecorded = true;
        await order.save();
      }
    }

    if (paymentStatus === "paid" && !wasPaid) {
      console.log("[PayFast] Payment confirmed, triggering order email:", JSON.stringify({
        orderId: order._id.toString().slice(-8).toUpperCase(),
        paymentStatus,
        wasPaid,
        userId: order.user,
      }));
      try {
        const user = await User.findById(order.user);
        if (user) {
          console.log("[PayFast] User found, sending order confirmation to:", user.email);
          await sendOrderConfirmationEmail({
            to: user.email,
            name: user.name,
            orderId: order._id.toString(),
            items: order.items.map((item: { name: string; quantity: number; price: number }) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            subtotal: order.subtotal || order.items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0),
            shipping: 99,
            discount: order.discount || 0,
            total: order.total,
            shippingAddress: order.shippingAddress,
          });
        }
      } catch (emailError) {
        console.error("[PayFast] Failed to send order confirmation email:", emailError);
        // Don't fail the webhook if email fails
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PayFast webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
