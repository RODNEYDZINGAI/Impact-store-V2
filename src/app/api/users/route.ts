import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";
import { generateReferralCode, normalizeReferralCode } from "@/lib/referral";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    // If userId is provided, return specific user with their orders
    if (userId) {
      const user = await User.findById(userId).select("-password");
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate("items.product", "name slug images");

      return NextResponse.json({ user, orders });
    }

    // Otherwise return all users
    const users = await User.find({ role: "customer" })
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Users GET error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// Update user (for admin - toggle referral, etc.)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    const { userId, referralEnabled, banned, banReason } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.role === "admin") {
      return NextResponse.json({ error: "Admin accounts cannot be modified here" }, { status: 400 });
    }

    // Toggle referral status directly on the document
    if (referralEnabled !== undefined) {
      user.referralEnabled = referralEnabled;

      // Generate referral code if enabling and no code exists
      if (referralEnabled && !user.referralCode) {
        let code = generateReferralCode();
        let attempts = 0;
        
        // Ensure unique code
        while (await User.findOne({ referralCode: code })) {
          code = generateReferralCode();
          attempts++;
          if (attempts > 10) {
            return NextResponse.json(
              { error: "Failed to generate unique referral code" },
              { status: 500 }
            );
          }
        }
        
        user.referralCode = code;
      }
    }

    if (banned !== undefined) {
      user.banned = Boolean(banned);
      user.bannedAt = banned ? new Date() : undefined;
      user.banReason = banned ? String(banReason || "").trim() || "Banned by admin" : undefined;
      if (banned) {
        user.referralEnabled = false;
      }
    }

    // Save the document directly
    await user.save();

    // Fetch fresh copy to confirm
    const updatedUser = await User.findById(userId).select("-password");

    return NextResponse.json({
      message: "User updated successfully",
      user: {
        _id: updatedUser?._id,
        name: updatedUser?.name,
        email: updatedUser?.email,
        referralCode: updatedUser?.referralCode,
        referralEnabled: updatedUser?.referralEnabled,
        banned: updatedUser?.banned,
        bannedAt: updatedUser?.bannedAt,
        banReason: updatedUser?.banReason,
      },
    });
  } catch (error) {
    console.error("Users PUT error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }
    if (userId === session.user.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.role === "admin") {
      return NextResponse.json({ error: "Admin accounts cannot be deleted here" }, { status: 400 });
    }

    const orderCount = await Order.countDocuments({ user: userId });
    if (orderCount > 0) {
      return NextResponse.json(
        { error: "This customer has orders. Ban the account instead to preserve order history." },
        { status: 409 }
      );
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("Users DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

// Validate referral code (public endpoint for checkout)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { referralCode } = await req.json();

    if (!referralCode) {
      return NextResponse.json({ error: "Referral code required" }, { status: 400 });
    }

    const user = await User.findOne({
      referralCode: normalizeReferralCode(referralCode),
      referralEnabled: true,
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      discount: 5, // 5% discount
      code: user.referralCode,
    });
  } catch (error) {
    console.error("Referral validation error:", error);
    return NextResponse.json({ error: "Failed to validate code" }, { status: 500 });
  }
}
