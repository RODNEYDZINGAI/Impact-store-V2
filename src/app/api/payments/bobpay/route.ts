import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { createPaymentLink } from "@/lib/bobpay";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    // Validate stock availability for all items
    const productIds = body.items.map((i: { product: string }) => i.product);
    const products = await Product.find({ _id: { $in: productIds } });

    const outOfStock: string[] = [];
    const insufficientStock: { name: string; available: number; requested: number }[] = [];

    for (const item of body.items) {
      const product = products.find((p) => p._id.toString() === item.product);
      if (!product) {
        outOfStock.push(item.name);
      } else if (product.stock < item.quantity) {
        insufficientStock.push({
          name: product.name,
          available: product.stock,
          requested: item.quantity,
        });
      }
    }

    if (outOfStock.length > 0) {
      return NextResponse.json(
        { error: `Product(s) no longer available: ${outOfStock.join(", ")}` },
        { status: 400 }
      );
    }

    if (insufficientStock.length > 0) {
      const details = insufficientStock
        .map((s) => `${s.name} (only ${s.available} left, you requested ${s.requested})`)
        .join("; ");
      return NextResponse.json(
        { error: `Insufficient stock: ${details}` },
        { status: 400 }
      );
    }

    // Deduct stock using atomic operations
    for (const item of body.items) {
      const result = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!result) {
        // Race condition: stock changed between check and update — rollback previous deductions
        for (const prevItem of body.items) {
          if (prevItem.product === item.product) break;
          await Product.findByIdAndUpdate(prevItem.product, {
            $inc: { stock: prevItem.quantity },
          });
        }
        return NextResponse.json(
          { error: `${item.name} just went out of stock. Please try again.` },
          { status: 409 }
        );
      }
    }

    // Enrich order items with SKU
    const orderItems = body.items.map((item: { product: string; name: string; price: number; quantity: number; image: string }) => {
      const product = products.find((p) => p._id.toString() === item.product);
      return { ...item, sku: product?.sku };
    });

    // Calculate subtotal from items
    const subtotal = body.items.reduce((sum: number, item: { price: number; quantity: number }) =>
      sum + (item.price * item.quantity), 0
    );

    // Create the order
    const order = await Order.create({
      user: session.user.id,
      items: orderItems,
      shippingAddress: body.shippingAddress,
      subtotal,
      discount: body.discount || 0,
      total: body.total,
      status: "pending",
      paymentStatus: "unpaid",
      referralCode: body.referralCode,
    });

    // Create BobPay payment link
    const itemNames = body.items
      .map((i: { name: string }) => i.name)
      .join(", ");

    const payment = await createPaymentLink({
      orderId: order._id.toString(),
      amount: body.total,
      email: session.user.email!,
      itemName: `Impact Store Order #${order._id.toString().slice(-6).toUpperCase()}`,
      itemDescription: itemNames,
    });

    return NextResponse.json({
      orderId: order._id,
      paymentUrl: payment.url,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
