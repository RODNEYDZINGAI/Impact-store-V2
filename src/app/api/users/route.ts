import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Order from "@/models/Order";

// Generate random referral code
function generateReferralCode(): string {
  const randomNum = Math.floor(100 + Math.random() * 900); // 3 digits
  return `MEG${randomNum}`;
}

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
    console.log("PUT /api/users body:", body);
    
    const { userId, referralEnabled } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Current user state:", { 
      referralEnabled: user.referralEnabled, 
      referralCode: user.referralCode 
    });

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

    console.log("Saving user with:", { 
      referralEnabled: user.referralEnabled, 
      referralCode: user.referralCode 
    });

    // Save the document directly
    await user.save();

    // Fetch fresh copy to confirm
    const updatedUser = await User.findById(userId).select("-password");

    console.log("Updated user after save:", { 
      referralEnabled: updatedUser?.referralEnabled, 
      referralCode: updatedUser?.referralCode 
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: {
        _id: updatedUser?._id,
        name: updatedUser?.name,
        email: updatedUser?.email,
        referralCode: updatedUser?.referralCode,
        referralEnabled: updatedUser?.referralEnabled,
      },
    });
  } catch (error) {
    console.error("Users PUT error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
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
      referralCode: referralCode.toUpperCase(),
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
