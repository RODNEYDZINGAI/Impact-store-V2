export const metadata = {
  title: "Refund and Returns Policy | Impact Store",
  description:
    "Review Impact Store's refund and returns policy, including return eligibility, CPA defect remedies, inspection timelines, and how to submit a return request.",
};

const returnSteps = [
  "Email info@impactstore.co.za with your order number, product details, photos where relevant, and a short description of the issue.",
  "Wait for written authorisation and return instructions before sending any item back.",
  "Pack the item securely with all accessories, packaging, manuals, and proof of purchase.",
  "Once received, Impact Store will inspect the item and confirm the available remedy in writing.",
];

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="premium-panel rounded-3xl p-8 sm:p-12">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
              Customer Care
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-obsidian sm:text-4xl">
              Refund and Returns Policy
            </h1>
            <p className="mt-4 text-ink-soft">
              Last updated: January 5, 2026
            </p>
            <p className="mt-5 leading-relaxed text-ink">
              Impact Store is committed to fair, transparent, and practical after-sales support. This policy explains when products may be returned, exchanged, repaired, replaced, or refunded, and is aligned with the South African Consumer Protection Act (CPA), Act 68 of 2008.
            </p>
          </div>

          <div className="mt-10 space-y-8 text-ink">
            <section>
              <h2 className="text-xl font-semibold text-obsidian">Return Eligibility</h2>
              <p className="mt-3 leading-relaxed">
                Please contact us as soon as possible if an item arrives damaged, defective, incomplete, or materially different from what was ordered. Return requests must be submitted within 7 (seven) calendar days of delivery unless a CPA defect remedy applies.
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
                <li>The item must be returned with all accessories, packaging, manuals, and proof of purchase.</li>
                <li>The product must not be damaged through misuse, neglect, tampering, unauthorised repairs, liquid damage, or electrical damage after delivery.</li>
                <li>Returns sent without prior written authorisation may be refused and returned to the customer at the customer&apos;s cost.</li>
                <li>Change-of-mind returns are not accepted unless Impact Store confirms an exception in writing.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Defective Products and CPA Remedies</h2>
              <p className="mt-3 leading-relaxed">
                If a product is found to be defective within the CPA period, the customer may request a repair, replacement, or refund. Impact Store will assess each claim individually and confirm the appropriate remedy after inspection.
              </p>
              <p className="mt-3 leading-relaxed">
                Where a defect is confirmed, Impact Store may offer a repair, a replacement with an equivalent product, store credit, or a refund where repair or replacement is not reasonably possible.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Items Not Covered</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
                <li>Physical damage, liquid damage, power surge damage, or misuse after delivery.</li>
                <li>Devices that have been rooted, jailbroken, modified, opened, or repaired by an unauthorised party.</li>
                <li>Consumables, accessories, cables, chargers, and sealed items once opened, unless defective on arrival.</li>
                <li>Software issues, data loss, viruses, account locks, passwords, or customer-installed applications.</li>
                <li>Lay-buy cancellations or changes, which are handled under the separate Lay-Buy Policy.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Inspection and Processing Timelines</h2>
              <p className="mt-3 leading-relaxed">
                Once an authorised return is received, Impact Store will inspect the product and provide feedback as quickly as possible. Complex technical assessments may take longer where supplier or manufacturer input is required.
              </p>
              <p className="mt-3 leading-relaxed">
                Approved refunds are processed within 7–14 business days via the original payment method where possible. Delivery, handling, and administrative fees are non-refundable unless the confirmed fault lies with Impact Store or the product supplied was materially incorrect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">How to Submit a Return Request</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-6 leading-relaxed">
                {returnSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="mt-4 leading-relaxed">
                For assistance, email{" "}
                <a href="mailto:info@impactstore.co.za" className="font-semibold text-[#1f4f8f] hover:underline">
                  info@impactstore.co.za
                </a>
                .
              </p>
            </section>
          </div>

          <div className="mt-12 border-t border-gold/20 pt-8">
            <p className="text-sm text-ink-soft">
              <strong>Impact Store</strong> | Policy Version 1.1 | Effective: 05 January 2026 | Approved by Impact Store
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
