import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import RefundCase from "@/models/RefundCase";
import { isValidRefundStatusTransition, type RefundStatus } from "@/lib/admin-refunds";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const refund = await RefundCase.findById(id)
      .populate("order", "_id status paymentStatus total createdAt shippingAddress items")
      .populate("initiatedBy", "name email");

    if (!refund) {
      return NextResponse.json({ error: "Refund case not found" }, { status: 404 });
    }

    return NextResponse.json(refund);
  } catch {
    return NextResponse.json({ error: "Failed to fetch refund case" }, { status: 500 });
  }
}

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
    const body = (await req.json()) as { status?: string; noteEntry?: string };

    await dbConnect();

    const refund = await RefundCase.findById(id);
    if (!refund) {
      return NextResponse.json({ error: "Refund case not found" }, { status: 404 });
    }

    const mongoUpdate: Record<string, unknown> = {};

    if (body.status !== undefined) {
      const from = refund.status as RefundStatus;
      const to = body.status as RefundStatus;
      if (!isValidRefundStatusTransition(from, to)) {
        return NextResponse.json(
          { error: `Cannot transition refund status from "${from}" to "${to}"` },
          { status: 400 }
        );
      }
      mongoUpdate.$set = { status: to };
    }

    if (body.noteEntry?.trim()) {
      mongoUpdate.$push = {
        noteEntries: { text: body.noteEntry.trim(), createdAt: new Date() },
      };
    }

    if (Object.keys(mongoUpdate).length === 0) {
      return NextResponse.json(
        { error: "Provide a status or noteEntry update" },
        { status: 400 }
      );
    }

    const updated = await RefundCase.findByIdAndUpdate(id, mongoUpdate, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update refund case" }, { status: 500 });
  }
}
