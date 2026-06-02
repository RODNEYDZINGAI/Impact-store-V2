import { getBaseUrl } from "@/lib/seo";
import { buildGoogleMerchantFeedXml } from "@/lib/google-merchant-feed";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  await dbConnect();

  const products = await Product.find({
    published: true,
    price: { $gt: 0 },
  })
    .select("name slug sku description price category subcategory condition brand images stock published variants updatedAt")
    .lean();

  const xml = buildGoogleMerchantFeedXml(products, getBaseUrl());

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
