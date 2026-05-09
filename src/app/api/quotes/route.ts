import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import QuoteRequest from "@/models/QuoteRequest";
import Product from "@/models/Product";
import { sendQuoteRequestEmail, sendQuoteAcknowledgmentEmail } from "@/lib/email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, company, message }: {
      name?: string; email?: string; phone?: string;
      company?: string; message?: string;
    } = body;
    const safeProducts = Array.isArray(body.products) ? body.products : [];

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    for (const p of safeProducts) {
      if (!p.product || typeof p.product !== "string") {
        return NextResponse.json({ error: "Invalid product reference" }, { status: 400 });
      }
      if (p.quantityMin !== undefined && (typeof p.quantityMin !== "number" || p.quantityMin < 1)) {
        return NextResponse.json({ error: "Quantity must be a positive number" }, { status: 400 });
      }
      if (p.quantityMax !== undefined && (typeof p.quantityMax !== "number" || p.quantityMax < 1)) {
        return NextResponse.json({ error: "Quantity must be a positive number" }, { status: 400 });
      }
    }

    if (message && typeof message === "string" && message.trim().length > 2000) {
      return NextResponse.json({ error: "Message must be 2000 characters or fewer" }, { status: 400 });
    }

    await dbConnect();

    // Resolve product names for provided product IDs
    const quoteProducts: { product: string; name: string; quantityMin?: number; quantityMax?: number }[] = [];
    if (safeProducts.length > 0) {
      const productIds = safeProducts.map((p: { product: string }) => p.product);
      const foundProducts = await Product.find({ _id: { $in: productIds } })
        .select("_id name")
        .lean();

      const productMap = new Map(
        foundProducts.map((p) => [p._id.toString(), p.name as string])
      );

      for (const p of safeProducts) {
        if (!productMap.has(p.product)) {
          return NextResponse.json(
            { error: `Product not found: ${p.product}` },
            { status: 400 }
          );
        }
      }

      for (const p of safeProducts) {
        quoteProducts.push({
          product: p.product,
          name: productMap.get(p.product)!,
          quantityMin: p.quantityMin,
          quantityMax: p.quantityMax,
        });
      }
    }

    const quote = await QuoteRequest.create({
      products: quoteProducts,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || undefined,
      company: company?.trim() || undefined,
      message: message?.trim() || undefined,
    });

    const emailProducts = quoteProducts.map((p) => ({
      name: String(p.name),
      quantityMin: p.quantityMin,
      quantityMax: p.quantityMax,
    }));

    const [adminResult] = await Promise.allSettled([
      sendQuoteRequestEmail({
        name: quote.name,
        email: quote.email,
        phone: quote.phone,
        company: quote.company,
        message: quote.message,
        products: emailProducts,
        quoteId: quote._id.toString(),
      }),
      sendQuoteAcknowledgmentEmail({
        to: quote.email,
        name: quote.name,
        products: emailProducts,
      }),
    ]);

    if (adminResult.status === "rejected") {
      console.error("[Quotes] Admin notification failed:", adminResult.reason);
    }

    return NextResponse.json(
      { success: true, id: quote._id.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Quotes] POST error:", error);
    return NextResponse.json({ error: "Failed to submit quote request" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status");
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
    const query = statusFilter ? { status: statusFilter } : {};

    const [quotes, total] = await Promise.all([
      QuoteRequest.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      QuoteRequest.countDocuments(query),
    ]);

    return NextResponse.json({ quotes, total });
  } catch (error) {
    console.error("[Quotes] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
}
