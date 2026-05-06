import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://impactholdings.co.za";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/products",
          "/products/*",
          "/contact",
          "/tap",
          "/mdm",
          "/privacy-policy",
          "/terms-of-service",
          "/shipping-policy",
          "/refund-policy",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/api",
          "/api/*",
          "/cart",
          "/checkout",
          "/login",
          "/register",
          "/profile",
          "/orders",
          "/forgot-password",
          "/reset-password",
          "/verify",
          "/payment",
          "/payment/*",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
