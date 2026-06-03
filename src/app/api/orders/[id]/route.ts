import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

const VALID_STATUSES = ["pending", "confirmed", "shipped", "delivered"] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = (await req.json()) as {
      status?: string;
      notes?: string;
      noteEntry?: string;
    };
    const update: { status?: OrderStatus; notes?: string } = {};
    const push: { noteEntries?: { text: string; createdAt: Date } } = {};

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status as OrderStatus)) {
        return NextResponse.json(
          { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }
      update.status = body.status as OrderStatus;
    }

    if (body.notes !== undefined) {
      update.notes = body.notes.trim();
    }

    if (body.noteEntry !== undefined && body.noteEntry.trim()) {
      push.noteEntries = { text: body.noteEntry.trim(), createdAt: new Date() };
    }

    if (Object.keys(update).length === 0 && !push.noteEntries) {
      return NextResponse.json(
        { error: "Provide a status, notes, or noteEntry update" },
        { status: 400 }
      );
    }

    await dbConnect();

    const mongoUpdate: Record<string, unknown> = {};
    if (Object.keys(update).length > 0) mongoUpdate.$set = update;
    if (push.noteEntries) mongoUpdate.$push = { noteEntries: push.noteEntries };

    const order = await Order.findByIdAndUpdate(id, mongoUpdate, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
