import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { generateReferralCode } from "@/lib/referral";

// Join affiliate program - generates referral code for the user
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If user already has referral enabled, return existing code
    if (user.referralEnabled && user.referralCode) {
      return NextResponse.json({
        message: "Already part of affiliate program",
        referralCode: user.referralCode,
      });
    }

    // Generate unique referral code
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

    // Enable affiliate program for user
    user.referralEnabled = true;
    user.referralCode = code;
    await user.save();

    return NextResponse.json({
      message: "Successfully joined affiliate program",
      referralCode: code,
    });
  } catch (error) {
    console.error("Affiliate join error:", error);
    return NextResponse.json(
      { error: "Failed to join affiliate program" },
      { status: 500 }
    );
  }
}
