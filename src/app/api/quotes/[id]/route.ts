import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import QuoteRequest from "@/models/QuoteRequest";

const VALID_STATUSES = ["new", "contacted", "quoted", "won", "lost", "archived"] as const;

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

    const quote = await QuoteRequest.findById(id)
      .populate("products.product", "name slug")
      .lean();
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error("[Quotes] GET[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 });
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
    const body = await req.json();
    const { status, adminNotes, quotedPrice, quotedNotes } = body;

    const update: Record<string, unknown> = {};

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
      update.status = status;
    }

    if (adminNotes !== undefined) {
      if (typeof adminNotes !== "string") {
        return NextResponse.json({ error: "adminNotes must be a string" }, { status: 400 });
      }
      if (adminNotes.length > 4000) {
        return NextResponse.json({ error: "Admin notes must be 4000 characters or fewer" }, { status: 400 });
      }
      update.adminNotes = adminNotes.trim();
    }

    if (quotedPrice !== undefined) {
      if (quotedPrice !== null && (typeof quotedPrice !== "number" || quotedPrice < 0)) {
        return NextResponse.json({ error: "quotedPrice must be a non-negative number" }, { status: 400 });
      }
      update.quotedPrice = quotedPrice ?? undefined;
    }

    if (quotedNotes !== undefined) {
      if (typeof quotedNotes !== "string") {
        return NextResponse.json({ error: "quotedNotes must be a string" }, { status: 400 });
      }
      if (quotedNotes.length > 4000) {
        return NextResponse.json({ error: "Quoted notes must be 4000 characters or fewer" }, { status: 400 });
      }
      update.quotedNotes = quotedNotes.trim();
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    await dbConnect();

    const quote = await QuoteRequest.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error("[Quotes] PATCH[id] error:", error);
    return NextResponse.json({ error: "Failed to update quote" }, { status: 500 });
  }
}

export async function DELETE(
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

    const quote = await QuoteRequest.findByIdAndUpdate(
      id,
      { status: "archived" },
      { new: true }
    ).lean();

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Quotes] DELETE[id] error:", error);
    return NextResponse.json({ error: "Failed to archive quote" }, { status: 500 });
  }
}
