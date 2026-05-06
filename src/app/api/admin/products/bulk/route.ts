import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return Boolean(session && session.user.role === "admin");
}

export async function POST(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, ids } = await req.json();
    if (!Array.isArray(ids) || !ids.length) {
      return NextResponse.json({ error: "Product IDs are required" }, { status: 400 });
    }

    await dbConnect();

    if (action === "publish" || action === "unpublish") {
      const result = await Product.updateMany(
        { _id: { $in: ids } },
        { $set: { published: action === "publish" } },
        { runValidators: true }
      );
      return NextResponse.json({ matched: result.matchedCount, modified: result.modifiedCount });
    }

    if (action === "delete") {
      const result = await Product.deleteMany({ _id: { $in: ids } });
      return NextResponse.json({ deleted: result.deletedCount });
    }

    return NextResponse.json({ error: "Unsupported bulk action" }, { status: 400 });
  } catch (error) {
    console.error("Admin products bulk error:", error);
    return NextResponse.json({ error: "Failed to perform bulk action" }, { status: 500 });
  }
}
