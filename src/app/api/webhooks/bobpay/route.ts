import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import Order from "@/models/Order";
import User from "@/models/User";
import { verifySignature, validatePayment } from "@/lib/bobpay";
import { sendOrderConfirmationEmail } from "@/lib/email";

// BobPay webhook IPs
const ALLOWED_IPS = [
  "13.246.115.225", // Sandbox
  "13.246.100.25",  // Production
];

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "";

    // In production, verify source IP
    if (
      process.env.NODE_ENV === "production" &&
      !ALLOWED_IPS.includes(clientIp)
    ) {
      console.warn(`Webhook from unauthorized IP: ${clientIp}`);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const webhookData = await req.json();
    const orderId = webhookData.custom_payment_id;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    // Verify signature
    const sigValid = verifySignature(webhookData);
    if (!sigValid && process.env.NODE_ENV === "production") {
      console.warn(`[BobPay] Invalid signature for order: ${orderId}`);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Validate with BobPay API
    const isValid = await validatePayment(webhookData);
    if (!isValid) {
      console.warn(`Payment validation failed for order: ${orderId}`);
      return NextResponse.json(
        { error: "Validation failed" },
        { status: 400 }
      );
    }

    await dbConnect();

    const order = await Order.findById(orderId);
    if (!order) {
      console.warn(`Order not found: ${orderId}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify amount matches
    if (Number(webhookData.paid_amount) < order.total) {
      console.warn(
        `Amount mismatch for order ${orderId}: expected ${order.total}, got ${webhookData.paid_amount}`
      );
      return NextResponse.json(
        { error: "Amount mismatch" },
        { status: 400 }
      );
    }

    // Map BobPay status to our payment status
    const statusMap: Record<string, string> = {
      paid: "paid",
      unpaid: "unpaid",
      failed: "failed",
      cancelled: "cancelled",
      refunded: "refunded",
    };

    const paymentStatus = (statusMap[webhookData.status] || "unpaid") as
      "unpaid" | "paid" | "failed" | "cancelled" | "refunded";
    const wasPaid = order.paymentStatus === "paid";

    // Update order
    order.paymentStatus = paymentStatus;
    order.bobpayUuid = webhookData.uuid;
    order.paymentId = String(webhookData.payment_id || "");

    if (paymentStatus === "paid") {
      order.status = "confirmed";
    }

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

    // Send order confirmation email when payment is successful
    if (paymentStatus === "paid" && !wasPaid) {
      console.log("[BobPay] Payment confirmed, triggering order email:", JSON.stringify({
        orderId: order._id.toString().slice(-8).toUpperCase(),
        paymentStatus,
        wasPaid,
        userEmail: order.user,
      }));
      try {
        const user = await User.findById(order.user);
        if (user) {
          console.log("[BobPay] User found, sending order confirmation to:", user.email);
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
        console.error("[Webhook] Failed to send order confirmation email:", emailError);
        // Don't fail the webhook if email fails
      }
    }

    // Must return 200 to acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Return 200 to prevent retries for processing errors
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
