import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import User from "@/models/User";

const productSelect = "name slug price originalPrice category condition brand images subtitle";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

async function getSessionUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id;
}

async function getPopulatedWishlist(userId: string) {
  const user = await User.findById(userId)
    .select("wishlist")
    .populate({
      path: "wishlist",
      model: Product,
      select: productSelect,
      match: { $or: [{ published: true }, { published: { $exists: false } }] },
    })
    .lean();

  if (!user) return null;
  return (user.wishlist || []).filter(Boolean);
}

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return unauthorized();

    await dbConnect();
    const wishlist = await getPopulatedWishlist(userId);
    if (!wishlist) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return unauthorized();

    const { productId } = await req.json();
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    await dbConnect();
    const product = await Product.findOne({
      _id: productId,
      $or: [{ published: true }, { published: { $exists: false } }],
    }).select("_id");

    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    await User.findByIdAndUpdate(userId, { $addToSet: { wishlist: product._id } });
    const wishlist = await getPopulatedWishlist(userId);
    if (!wishlist) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json({ error: "Failed to update wishlist" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return unauthorized();

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    await dbConnect();
    await User.findByIdAndUpdate(userId, { $pull: { wishlist: productId } });
    const wishlist = await getPopulatedWishlist(userId);
    if (!wishlist) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error("Wishlist DELETE error:", error);
    return NextResponse.json({ error: "Failed to update wishlist" }, { status: 500 });
  }
}
