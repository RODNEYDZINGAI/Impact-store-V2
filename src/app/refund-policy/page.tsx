export const metadata = {
  title: "Refund & Exchange Policy | Impact Store",
  description: "Learn about Impact Store's refund and exchange policy aligned with the South African Consumer Protection Act.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="premium-panel rounded-3xl p-8 sm:p-12">
          <h1 className="text-3xl font-semibold tracking-tight text-obsidian sm:text-4xl">
            Refund & Exchange Policy
          </h1>
          <p className="mt-4 text-ink-soft">
            Last updated: January 5, 2026
          </p>

          <div className="mt-10 space-y-8 text-ink">
            <section>
              <h2 className="text-xl font-semibold text-obsidian">Overview</h2>
              <p className="mt-3 leading-relaxed">
                Impact Store is committed to fair and transparent trading. This policy governs all return, exchange, and refund requests and is aligned with the South African Consumer Protection Act (CPA), Act 68 of 2008.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Returns & Exchanges</h2>
              <p className="mt-3 leading-relaxed">
                Returns and exchanges are accepted under the following conditions only:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
                <li>The product is defective, damaged, or materially different from what was ordered</li>
                <li>The return request is submitted within 7 (seven) calendar days of the delivery date</li>
                <li>The item is returned in its original condition with all accessories, packaging, and proof of purchase</li>
                <li>Change-of-mind returns are not accepted and will not be processed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">What Is Not Covered</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
                <li>Physical damage, liquid damage, or electrical damage caused after delivery</li>
                <li>Devices that have been tampered with, rooted, jailbroken, or repaired by an unauthorised party</li>
                <li>Accessories, cables, and chargers — non-returnable once opened</li>
                <li>Software issues, data loss, or viruses</li>
                <li>Products purchased under lay-buy (governed by the separate Lay-Buy Policy)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">CPA Compliance — Section 56</h2>
              <p className="mt-3 leading-relaxed">
                In accordance with Section 56 of the Consumer Protection Act, if a product is found to be defective within 6 (six) months of the date of delivery, the customer is entitled to request a repair, replacement, or refund.
              </p>
              <p className="mt-3 leading-relaxed">
                Impact Store will assess each claim individually. Where a defect is confirmed, Impact Store will offer one of the following at its discretion: repair, replacement with an equivalent product, or a store credit. Cash refunds are issued only where repair and replacement are not reasonably possible.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Refund Processing</h2>
              <p className="mt-3 leading-relaxed">
                Approved refunds are processed within 7–14 business days via the original payment method. Delivery, handling, and administrative fees are non-refundable unless the fault is proven to lie with Impact Store.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">How to Submit a Return Request</h2>
              <p className="mt-3 leading-relaxed">
                Contact us via WhatsApp or email before sending any item back. Items returned without prior written authorisation will not be accepted and will be returned to sender at the customer&apos;s expense.
              </p>
            </section>
          </div>

          <div className="mt-12 border-t border-gold/20 pt-8">
            <p className="text-sm text-ink-soft">
              <strong>Impact Store</strong> | Policy Version 1.0 | Effective: 05 January 2026 | Approved by Impact Holdings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
