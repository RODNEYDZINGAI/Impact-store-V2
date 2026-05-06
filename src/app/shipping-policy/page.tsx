export const metadata = {
  title: "Shipping & Delivery Policy | Impact Store",
  description: "Learn about Impact Store's shipping options, delivery times, and coverage areas across South Africa.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="premium-panel rounded-3xl p-8 sm:p-12">
          <h1 className="text-3xl font-semibold tracking-tight text-obsidian sm:text-4xl">
            Shipping & Delivery Policy
          </h1>
          <p className="mt-4 text-ink-soft">
            Last updated: January 5, 2026
          </p>

          <div className="mt-10 space-y-8 text-ink">
            <section>
              <h2 className="text-xl font-semibold text-obsidian">Overview</h2>
              <p className="mt-3 leading-relaxed">
                This policy outlines delivery responsibilities, timelines, and risk allocation for all orders placed with Impact Store.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Delivery Coverage</h2>
              <p className="mt-3 leading-relaxed">
                Impact Store delivers nationwide across South Africa via reliable courier partners.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Delivery Timelines</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
                <li>Standard delivery: 3–7 business days from date of payment confirmation</li>
                <li>Remote or outlying areas: up to 14 business days</li>
                <li>All timelines are estimates and are not guaranteed. Delays may occur due to courier operations, public holidays, load shedding, weather, or events beyond our control.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Delivery Costs</h2>
              <p className="mt-3 leading-relaxed">
                Delivery costs are included in the purchase price unless explicitly stated otherwise at checkout.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Order Confirmation & Processing</h2>
              <p className="mt-3 leading-relaxed">
                Orders are only confirmed and dispatched once full payment reflects in the official Impact Store business account. Orders paid after 2:00 PM on a business day will be processed the following business day.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Tracking</h2>
              <p className="mt-3 leading-relaxed">
                Proof of dispatch and tracking details will be provided via WhatsApp or email once your order has been shipped.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Risk Transfer</h2>
              <p className="mt-3 leading-relaxed">
                Risk in the goods passes to the customer once the order has been handed over to the courier. Impact Store is not liable for loss, theft, or damage that occurs during transit once the item has been dispatched.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Customer Responsibility</h2>
              <p className="mt-3 leading-relaxed">
                Customers are responsible for providing accurate and complete delivery information. Impact Store accepts no liability for failed or delayed deliveries resulting from incorrect addresses or unresponsive recipients.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Failed Deliveries</h2>
              <p className="mt-3 leading-relaxed">
                If a delivery attempt fails due to the customer being unavailable or providing incorrect information, a re-delivery fee may apply. Impact Store will contact the customer via WhatsApp before a re-delivery is arranged.
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
