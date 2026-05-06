import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendVerificationCodeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Generate 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationCodeExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "customer",
      emailVerified: false,
      verificationCode,
      verificationCodeExpiry,
    });

    // Send verification email (don't wait for it to complete)
    sendVerificationCodeEmail({
      to: email.toLowerCase(),
      name,
      code: verificationCode,
    }).catch((err) => {
      console.error("Failed to send verification email:", err);
    });

    return NextResponse.json(
      {
        message: "Account created. Please check your email for verification code.",
        userId: user._id,
        email: email.toLowerCase(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
