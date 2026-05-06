export const metadata = {
  title: "Warranty Policy | Impact Store",
  description: "Learn about Impact Store's warranty terms and coverage for all products.",
};

export default function WarrantyPolicyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="premium-panel rounded-3xl p-8 sm:p-12">
          <h1 className="text-3xl font-semibold tracking-tight text-obsidian sm:text-4xl">
            Warranty Policy
          </h1>
          <p className="mt-4 text-ink-soft">
            Last updated: January 5, 2026
          </p>

          <div className="mt-10 space-y-8 text-ink">
            <section>
              <h2 className="text-xl font-semibold text-obsidian">Overview</h2>
              <p className="mt-3 leading-relaxed">
                This policy defines the warranty terms applicable to all products sold by Impact Store.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Warranty Period</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
                <li>All listed devices carry a 3-month carry-in warranty from the date of delivery or collection, unless otherwise stated on the invoice</li>
                <li>For standard purchases: warranty commences on the date of delivery</li>
                <li>For lay-buy purchases: warranty commences on the date of item release after full payment</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">What Is Covered</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
                <li>Hardware faults and manufacturing defects occurring under normal use</li>
                <li>Screen and battery defects present at the time of sale — must be reported within 48 hours of receipt</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">What Is NOT Covered</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
                <li>Physical damage — cracked screens, bent frames, broken ports</li>
                <li>Liquid or moisture damage of any kind</li>
                <li>Electrical damage caused by non-standard chargers or power surges</li>
                <li>Damage caused by misuse, dropping, or neglect</li>
                <li>Devices opened, repaired, or modified by any party other than Impact Store or an authorised repair centre</li>
                <li>Software issues, viruses, or data loss</li>
                <li>Normal wear and tear — minor scratches, fading, or cosmetic ageing</li>
                <li>Accessories including chargers, cables, cases, and earphones</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">How to Claim</h2>
              <p className="mt-3 leading-relaxed">
                Contact Impact Store via WhatsApp or email within the warranty period before sending or bringing in any device. Do not attempt to repair the device yourself or take it to a third-party repair shop — doing so will void the warranty immediately and no claim will be considered.
              </p>
              <p className="mt-3 leading-relaxed">
                The customer is responsible for courier costs to return the device for assessment. If the fault is confirmed to be covered under warranty, Impact Store will cover the return courier costs.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Assessment & Resolution</h2>
              <p className="mt-3 leading-relaxed">
                Impact Store will assess the device within 5–7 business days of receipt. Where the fault is covered, Impact Store will repair or replace the device at its discretion. If the fault is found to be excluded from warranty coverage, the customer will be provided with a repair quotation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Limitation of Liability</h2>
              <p className="mt-3 leading-relaxed">
                Impact Store does not provide extended or lifetime warranties. Our warranty obligations are strictly limited to repair or replacement of the defective product within the stated warranty period.
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
