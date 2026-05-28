import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { sanitizePromotionInput } from "@/lib/promotions";
import Promotion from "@/models/Promotion";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user.role === "admin";
}

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const promotions = await Promotion.find({}).sort({ createdAt: -1 });
    return NextResponse.json(promotions);
  } catch (error) {
    console.error("Promotions GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch promotions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const promotion = await Promotion.create(sanitizePromotionInput(body));
    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create promotion";
    if (message.includes("duplicate key")) {
      return NextResponse.json(
        { error: "Promotion code already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
