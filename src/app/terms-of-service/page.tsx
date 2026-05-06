export const metadata = {
  title: "Terms of Service | Impact Store",
  description: "Read Impact Store's terms of service and conditions of use.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="premium-panel rounded-3xl p-8 sm:p-12">
          <h1 className="text-3xl font-semibold tracking-tight text-obsidian sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-ink-soft">
            Last updated: January 5, 2026
          </p>

          <div className="mt-10 space-y-8 text-ink">
            <section>
              <h2 className="text-xl font-semibold text-obsidian">1. Acceptance of Terms</h2>
              <p className="mt-3 leading-relaxed">
                By browsing, placing an order, or making a payment on impactholdings.co.za, you agree to be bound by these Terms of Service in full. If you do not agree, do not use this website or place any orders.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">2. Products & Pricing</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
                <li>All prices are quoted in South African Rand (ZAR) and include VAT where applicable</li>
                <li>Prices include delivery unless explicitly stated otherwise</li>
                <li>Price quotations are valid for a maximum of 24 hours unless confirmed in writing</li>
                <li>Impact Store reserves the right to correct pricing errors at any time before dispatch</li>
                <li>Product images are for illustrative purposes. Actual product colour and condition grade will be as described in the listing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">3. Order Confirmation</h2>
              <p className="mt-3 leading-relaxed">
                An order is only confirmed once full payment reflects in the official Impact Store business account. Receipt of a payment confirmation from your bank does not constitute order confirmation on our side. Impact Store reserves the right to cancel any order where stock becomes unavailable prior to payment confirmation — a full refund will be issued in such cases.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">4. Product Condition Grading</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
                <li><strong>New</strong> — Factory sealed or unused, original packaging</li>
                <li><strong>Refurbished</strong> — Professionally tested, reset, and graded. May show minor cosmetic wear</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">5. IMEI & Device Disclaimer</h2>
              <p className="mt-3 leading-relaxed">
                It is the buyer&apos;s responsibility to verify the IMEI number of any device upon receipt by dialling <code className="rounded bg-obsidian/5 px-2 py-1 text-sm">*#06#</code> or using the South African GSMA IMEI checker. Impact Store takes reasonable steps to ensure all devices are clean and not blacklisted at the time of sale. However, Impact Store accepts no liability for any IMEI-related issues that arise after the device has been released to the customer or courier.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">6. Intellectual Property</h2>
              <p className="mt-3 leading-relaxed">
                All content on this website including images, logos, text, and branding is the property of Impact Store / Impact Holdings and may not be reproduced, copied, or distributed without prior written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">7. Limitation of Liability</h2>
              <p className="mt-3 leading-relaxed">
                Impact Store shall not be held liable for any indirect, incidental, or consequential loss arising from the use of products or services purchased through this website. Our maximum liability in any event is limited to the purchase price paid for the specific product in question.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">8. Governing Law</h2>
              <p className="mt-3 leading-relaxed">
                These terms are governed by the laws of the Republic of South Africa. Any disputes will be subject to the exclusive jurisdiction of the South African courts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">9. Amendments</h2>
              <p className="mt-3 leading-relaxed">
                Impact Store reserves the right to update these Terms of Service at any time without prior notice. Continued use of the website following any update constitutes acceptance of the revised terms.
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
