export const metadata = {
  title: "Privacy & POPIA Policy | Impact Store",
  description: "Learn how Impact Store collects, uses, and protects your personal information in compliance with POPIA.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="premium-panel rounded-3xl p-8 sm:p-12">
          <h1 className="text-3xl font-semibold tracking-tight text-obsidian sm:text-4xl">
            Privacy & POPIA Policy
          </h1>
          <p className="mt-4 text-ink-soft">
            Last updated: January 5, 2026
          </p>

          <div className="mt-10 space-y-8 text-ink">
            <section>
              <h2 className="text-xl font-semibold text-obsidian">Overview</h2>
              <p className="mt-3 leading-relaxed">
                Impact Store is committed to protecting your personal information in full compliance with the Protection of Personal Information Act (POPIA), Act 4 of 2013.
              </p>
              <p className="mt-3 leading-relaxed">
                By using this website or placing an order, you consent to the collection and use of your personal information as described in this policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">What Information We Collect</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
                <li>Full name and contact details — phone number and email address</li>
                <li>Delivery address</li>
                <li>Payment reference information — we do not store card or banking details</li>
                <li>Device IMEI numbers for sales and warranty records</li>
                <li>Communication records via WhatsApp, email, or the website contact form</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Why We Collect It</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
                <li>Processing and fulfilling your order</li>
                <li>Communicating order updates, tracking information, and customer support</li>
                <li>Complying with legal and regulatory obligations</li>
                <li>Maintaining accurate sales, warranty, and lay-buy records</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">How We Protect It</h2>
              <p className="mt-3 leading-relaxed">
                Impact Store implements reasonable technical and organisational security measures to protect your personal information against unauthorised access, loss, or misuse. Access to customer data is restricted to authorised personnel only.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Who We Share It With</h2>
              <p className="mt-3 leading-relaxed">
                Your information is never sold, traded, or shared for commercial purposes. It may be shared only with:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
                <li>Courier partners — solely for delivery and tracking purposes</li>
                <li>Payment processors — for transaction verification only</li>
                <li>Regulatory or law enforcement bodies — where required by South African law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Your Rights Under POPIA</h2>
              <p className="mt-3 leading-relaxed">You have the right to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
                <li>Request access to your personal information held by Impact Store</li>
                <li>Request correction of inaccurate or outdated information</li>
                <li>Request deletion of your information where legally permissible</li>
                <li>Object to the processing of your information for direct marketing purposes</li>
              </ul>
              <p className="mt-3 leading-relaxed">
                To exercise any of these rights, contact us via WhatsApp or email. We will respond within 21 business days as required by POPIA.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">Cookies</h2>
              <p className="mt-3 leading-relaxed">
                This website may use cookies to improve your browsing experience and analyse website traffic. By continuing to use this website, you consent to cookie usage in accordance with this policy. You may disable cookies in your browser settings, though some website features may not function correctly as a result.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-obsidian">POPIA Information Officer</h2>
              <div className="mt-4 overflow-hidden rounded-xl border border-gold/20">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gold/10">
                    <tr>
                      <td className="bg-obsidian/5 px-4 py-3 font-semibold text-obsidian">Name</td>
                      <td className="px-4 py-3">Impact Holdings</td>
                    </tr>
                    <tr>
                      <td className="bg-obsidian/5 px-4 py-3 font-semibold text-obsidian">Position</td>
                      <td className="px-4 py-3">Founder & Managing Director</td>
                    </tr>
                    <tr>
                      <td className="bg-obsidian/5 px-4 py-3 font-semibold text-obsidian">Business</td>
                      <td className="px-4 py-3">Impact Store — A Division of Impact Holdings</td>
                    </tr>
                    <tr>
                      <td className="bg-obsidian/5 px-4 py-3 font-semibold text-obsidian">Registration No</td>
                      <td className="px-4 py-3">2025/964922/07</td>
                    </tr>
                    <tr>
                      <td className="bg-obsidian/5 px-4 py-3 font-semibold text-obsidian">Contact</td>
                      <td className="px-4 py-3">Via impactholdings.co.za/contact</td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
