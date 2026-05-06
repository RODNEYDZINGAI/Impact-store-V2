import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";

export const metadata: Metadata = {
  title: "Impact Store | ICT Hardware & Security Solutions",
  description:
    "Impact Store supplies ICT hardware, mobile devices, accessories, and business technology solutions across South Africa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingWhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
