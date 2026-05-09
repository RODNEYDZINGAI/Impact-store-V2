import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendOrderConfirmationEmail } from "@/lib/email";

// Test endpoint to send order confirmation email
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await sendOrderConfirmationEmail({
      to: session.user.email!,
      name: session.user.name!,
      orderId: "123456789012345678901234",
      items: [
        { name: "iPhone 12 Pro", quantity: 1, price: 9100 },
        { name: "Samsung Galaxy S21", quantity: 2, price: 6500 },
      ],
      subtotal: 22100,
      shipping: 99,
      discount: 1105,
      total: 21094,
      shippingAddress: {
        fullName: "John Doe",
        address: "123 Main Street",
        city: "Johannesburg",
        province: "Gauteng",
        postalCode: "2000",
      },
    });

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: "Test email sent successfully",
        data: result.data 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("[Test Email] Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}
