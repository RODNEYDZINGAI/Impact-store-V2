import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#1f4f8f] text-white">
      <div className="mx-auto max-w-[1240px] px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fbbf24] text-sm font-bold text-[#1f2937]">
                IS
              </span>
              <div className="text-lg font-semibold">
                Impact <span className="text-white/70">Store</span>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/80">
              South Africa&apos;s procurement-first ICT store. Authorized dealer for 40+ brands.
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
            <h3 className="text-sm font-semibold">Shop</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {[
                ["All products", "/products"],
                ["Laptops", "/products?category=Laptops"],
                ["Mobile Devices", "/products?category=Phones"],
                ["IT hardware", "/products?category=IT+Hardware"],
                ["Accessories", "/products?category=Accessories"],
                ["Security & access", "/products?category=Security+%26+Access+Control"],
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
            <h3 className="text-sm font-semibold">Business</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {[
                ["Request a quote", "/contact"],
                ["Bulk pricing", "/contact"],
                ["TAP financing", "/tap"],
                ["MDM solutions", "/mdm"],
                ["Education sector", "/contact"],
                ["Government", "/contact"],
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
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {[
                ["Contact us", "/contact"],
                ["Shipping", "/shipping-policy"],
                ["Returns", "/refund-policy"],
                ["Warranty", "/warranty-policy"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="transition hover:text-[#fbbf24]">
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="tel:+27100013608" className="transition hover:text-[#fbbf24]">
                  +27 10 001 3608
                </a>
              </li>
              <li>
                <a href="mailto:info@impactholdings.co.za" className="transition hover:text-[#fbbf24]">
                  info@impactholdings.co.za
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/20 pt-6 text-xs text-white/70 md:flex-row">
          <span>&copy; {new Date().getFullYear()} Impact Holdings. Trading as Impact Store.</span>
          <div className="flex flex-wrap gap-6">
            <Link href="/privacy-policy" className="transition hover:text-[#fbbf24]">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="transition hover:text-[#fbbf24]">
              Terms
            </Link>
            <a href="https://impactholdings.co.za" target="_blank" rel="noreferrer" className="transition hover:text-[#fbbf24]">
              B-BBEE Certificate
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
