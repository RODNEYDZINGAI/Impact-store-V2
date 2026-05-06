import { NextRequest, NextResponse } from "next/server";
import { sendContactInquiryEmail, sendContactAcknowledgmentEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Send inquiry email to admin
    const inquiryResult = await sendContactInquiryEmail({
      name,
      email,
      phone,
      subject,
      message,
    });

    if (!inquiryResult.success) {
      console.error("Failed to send inquiry email:", inquiryResult.error);
      return NextResponse.json(
        { error: "Failed to send message. Please try again later." },
        { status: 500 }
      );
    }

    // Send acknowledgment email to user
    const acknowledgmentResult = await sendContactAcknowledgmentEmail({
      to: email,
      name,
      subject,
    });

    if (!acknowledgmentResult.success) {
      // Log but don't fail - the inquiry was still sent to admin
      console.warn("Failed to send acknowledgment email:", acknowledgmentResult.error);
    }

    return NextResponse.json(
      { success: true, message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
