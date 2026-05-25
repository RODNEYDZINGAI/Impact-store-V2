import { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/products",
          "/products/*",
          "/about",
          "/contact",
          "/quote",
          "/recycling",
          "/tap",
          "/mdm",
          "/privacy-policy",
          "/terms-of-service",
          "/shipping-policy",
          "/refund-policy",
          "/laybuy-policy",
          "/warranty-policy",
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
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
