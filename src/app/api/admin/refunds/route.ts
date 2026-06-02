import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import RefundCase from "@/models/RefundCase";
import { buildOrderSnapshot } from "@/lib/admin-refunds";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const refunds = await RefundCase.find({})
      .sort({ createdAt: -1 })
      .populate("order", "_id status paymentStatus total createdAt")
      .populate("initiatedBy", "name email");

    return NextResponse.json(refunds);
  } catch {
    return NextResponse.json({ error: "Failed to fetch refunds" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { orderId: string; reason?: string };

    if (!body.orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    await dbConnect();

    const order = await Order.findById(body.orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const snapshot = buildOrderSnapshot({
      total: order.total,
      subtotal: order.subtotal,
      discount: order.discount,
      items: order.items.map((item) => ({
        name: item.name,
        sku: item.sku,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        variantTitle: item.variantTitle,
      })),
      shippingAddress: order.shippingAddress,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentId: order.paymentId,
      couponCode: order.couponCode,
      createdAt: order.createdAt,
    });

    // Carry over existing timestamped notes from the order
    const inheritedNotes = [...(order.noteEntries ?? [])];
    // If a legacy freetext note exists, bring it along with a pseudo-timestamp
    if (order.notes?.trim()) {
      inheritedNotes.unshift({ text: `[Legacy note] ${order.notes.trim()}`, createdAt: order.updatedAt ?? order.createdAt });
    }

    const refund = await RefundCase.create({
      order: order._id,
      status: "open",
      reason: body.reason?.trim() || undefined,
      noteEntries: inheritedNotes,
      orderSnapshot: snapshot,
      initiatedBy: session.user.id,
    });

    return NextResponse.json(refund, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create refund case" }, { status: 500 });
  }
}
