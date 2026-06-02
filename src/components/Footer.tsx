import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#1f4f8f] text-white">
      <div className="mx-auto max-w-[1440px] px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fbbf24] text-lg font-semibold text-[#1f2937]">
                I
              </span>
              <div className="text-lg font-semibold">
                Impact <span className="text-white/70">Store</span>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/80">
              Your trusted partner for ICT hardware, mobile devices, accessories, and business technology solutions across South Africa.
            </p>
            <a
              href="https://impactholdings.co.za"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#fbbf24] transition hover:text-[#f59e0b]"
            >
              Visit Impact Holdings
              <span>-&gt;</span>
            </a>
          </div>

          <div>
            <h3 className="text-base font-semibold">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {[
                ["All Products", "/products"],
                ["Laptops", "/products?category=Laptops"],
                ["Mobile Devices", "/products?category=Phones"],
                ["Tablets", "/products?category=Tablets"],
                ["IT Hardware", "/products?category=IT+Hardware"],
                ["Accessories", "/products?category=Accessories"],
                ["Security & Access Control", "/products?category=Security+%26+Access+Control"],
                ["Buying Guides", "/articles"],
                ["TAP", "/tap"],
                ["MDM", "/mdm"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="transition hover:text-[#fbbf24]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold">Customer Service</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {[
                ["Request a Quote", "/quote?source=footer"],
                ["Contact Us", "/contact"],
                ["Shipping Information", "/shipping-policy"],
                ["Refund and Returns Policy", "/refund-policy"],
                ["Warranty Policy", "/warranty-policy"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="transition hover:text-[#fbbf24]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold">Contact Us</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li>16 Baker St, Rosebank, Johannesburg, 2196</li>
              <li>
                <a href="mailto:info@impactstore.co.za" className="transition hover:text-[#fbbf24]">
                  info@impactstore.co.za
                </a>
              </li>
              <li>
                <a href="tel:+27785229194" className="transition hover:text-[#fbbf24]">
                  +27 78 522 9194
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/20 pt-6 text-xs text-white/70 md:flex-row">
          <span>&copy; {new Date().getFullYear()} Impact Holdings Store. All rights reserved.</span>
          <span>Impact Store is a trading name of Impact Holdings.</span>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="transition hover:text-[#fbbf24]">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="transition hover:text-[#fbbf24]">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
