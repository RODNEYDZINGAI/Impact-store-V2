import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendOrderConfirmationEmail } from "@/lib/email";

// Test endpoint to manually trigger order confirmation email
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Test Order Email] Starting test...");
    console.log("[Test Order Email] User:", session.user);

    // Allow overriding the email for testing
    const body = await req.json().catch(() => ({}));
    const testEmail = body.email || session.user.email;
    const testName = body.name || session.user.name;

    const result = await sendOrderConfirmationEmail({
      to: testEmail!,
      name: testName!,
      orderId: "123456789012345678901234",
      items: [
        { name: "iPhone 12 Pro 128GB", quantity: 1, price: 9100 },
        { name: "Samsung Galaxy S21", quantity: 1, price: 6500 },
      ],
      subtotal: 15600,
      shipping: 99,
      discount: 780,
      total: 14919,
      shippingAddress: {
        fullName: testName!,
        address: "123 Main Street, Apartment 4B",
        city: "Johannesburg",
        province: "Gauteng",
        postalCode: "2000",
      },
    });

    console.log("[Test Order Email] Result:", result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Order confirmation email sent successfully",
        to: testEmail,
        data: result.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Test Order Email] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
