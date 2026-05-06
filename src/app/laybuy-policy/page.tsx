export const metadata = {
  title: "Lay-Buy Terms & Conditions | Impact Store",
  description: "Learn about Impact Store's lay-buy payment terms and conditions.",
};

export default function LaybuyPolicyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="premium-panel rounded-3xl p-8 sm:p-12">
          <h1 className="text-3xl font-semibold tracking-tight text-obsidian sm:text-4xl">
            Lay-Buy Terms & Conditions
          </h1>
          <p className="mt-4 text-ink-soft">
            Last updated: January 5, 2026
          </p>

          <div className="mt-10 space-y-8 text-ink">
            <section>
              <h2 className="text-xl font-semibold text-obsidian">Overview</h2>
              <p className="mt-3 leading-relaxed">
                These terms govern all lay-buy purchases at Impact Store. By paying a deposit, you confirm that you have read and fully accept these terms and conditions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Eligibility</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
                <li>Lay-buy is available on selected products only, subject to stock availability</li>
                <li>Impact Store reserves the right to offer or decline lay-buy at management&apos;s discretion</li>
                <li>Lay-buy is not available on accessories</li>
                <li>Stock availability must be confirmed before a lay-buy is approved</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Payment Structure</h2>
              <div className="mt-4 overflow-hidden rounded-xl border border-gold/20">
                <table className="w-full text-sm">
                  <thead className="bg-obsidian text-sand">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Payment</th>
                      <th className="px-4 py-3 text-left font-semibold">Amount</th>
                      <th className="px-4 py-3 text-left font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/10">
                    <tr>
                      <td className="px-4 py-3 font-medium">Deposit</td>
                      <td className="px-4 py-3">50% of price</td>
                      <td className="px-4 py-3">Payable immediately — secures and reserves the item</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Payment 2</td>
                      <td className="px-4 py-3">25% of price</td>
                      <td className="px-4 py-3">Due 30 days after deposit date</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Payment 3</td>
                      <td className="px-4 py-3">25% + R300 admin fee</td>
                      <td className="px-4 py-3">Due 60 days after deposit — item released on full settlement</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Key Terms</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
                <li>Maximum lay-buy period is 3 (three) months from the date of deposit</li>
                <li>Items remain the property of Impact Store until full payment has been received</li>
                <li>Goods will only be released after full settlement of all amounts due, including the R300 administration fee</li>
                <li>The purchase price is locked at the time the deposit is paid and will not change</li>
                <li>Payments must be made on or before agreed due dates</li>
                <li>Lay-buy agreements are not transferable to another person or product</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Late & Missed Payments</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
                <li>Payments more than 7 days overdue will trigger a cancellation review</li>
                <li>No payment extensions will be granted under any circumstances</li>
                <li>Impact Store will attempt to contact the customer via WhatsApp before proceeding with cancellation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Cancellations</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
                <li>Cancellations within 48 hours of deposit payment qualify for a full deposit refund</li>
                <li>Cancellations after 48 hours result in forfeiture of the full deposit — no refund will be issued</li>
                <li>No cash refunds are issued on lay-buy cancellations after the 48-hour cooling-off period</li>
                <li>Cancelled items will be returned to active inventory immediately</li>
                <li>Exchanges on cancelled lay-buys may be considered at management&apos;s discretion only</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Warranty</h2>
              <p className="mt-3 leading-relaxed">
                Warranty commences on the date the item is physically released to the customer, not the date of deposit or any interim payment.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Condition on Release</h2>
              <p className="mt-3 leading-relaxed">
                The item will be in the same condition as assessed and agreed at the time of deposit. If the specific reserved item becomes damaged or unavailable before release through no fault of the customer, Impact Store will offer a replacement of equal or greater value, or issue a full refund of all payments made.
              </p>
            </section>

            <section className="rounded-lg border border-gold/30 bg-gold/5 p-6">
              <h2 className="text-xl font-semibold text-obsidian">Important Notice to Customers</h2>
              <p className="mt-3 leading-relaxed">
                By paying your deposit, you confirm that you have read, understood, and agreed to all terms above. Please ensure you are able to meet all payment deadlines before proceeding. For any questions, contact us via WhatsApp before placing your lay-buy.
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
