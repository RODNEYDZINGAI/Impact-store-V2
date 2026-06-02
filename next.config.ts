import type { NextConfig } from "next";

const r2PublicUrl = process.env.R2_PUBLIC_URL;

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "https", hostname: "**.r2.dev" },
  { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
];

if (r2PublicUrl) {
  const { protocol, hostname, pathname } = new URL(r2PublicUrl);
  remotePatterns.push({
    protocol: protocol.replace(":", "") as "http" | "https",
    hostname,
    pathname: `${pathname.replace(/\/$/, "")}/**`,
  });
}

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    localPatterns: [{ pathname: "/**" }],
    remotePatterns,
  },
  reactCompiler: true,
};

export default nextConfig;
