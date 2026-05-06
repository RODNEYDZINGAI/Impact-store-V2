import { ArrowRight, BadgeCheck, Building2, ClipboardCheck, PackageCheck, Truck } from "lucide-react";
import Link from "next/link";

const pillars = [
  {
    title: "Procurement Support",
    description: "We help businesses source the right devices, accessories, and ICT hardware for daily operations and rollouts.",
    icon: ClipboardCheck,
  },
  {
    title: "Business-Ready Stock",
    description: "Our catalog focuses on practical technology for teams, offices, schools, field staff, and support desks.",
    icon: PackageCheck,
  },
  {
    title: "Local Fulfilment",
    description: "South African support, clear communication, and delivery options built around real buying timelines.",
    icon: Truck,
  },
];

const promises = [
  "ICT hardware, laptops, phones, tablets, accessories, and security solutions",
  "Bulk-order assistance for teams, schools, offices, and resellers",
  "Straightforward advice on availability, fit, pricing, and rollout timing",
  "Nationwide delivery backed by responsive customer support",
];

const highlights = [
  { label: "Customer focus", value: "B2B & B2C" },
  { label: "Fulfilment", value: "Nationwide" },
  { label: "Bulk support", value: "Up to 25% off" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <section className="relative overflow-hidden border-b border-[#cfe1f3] bg-gradient-to-br from-[#eef6ff] via-white to-[#dbeafe]">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.22),transparent_42%)]" />
        <div className="relative mx-auto grid max-w-[1440px] gap-10 px-6 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#fbbf24]">About Impact Store</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-normal text-[#1f2937] sm:text-5xl lg:text-6xl">
              ICT procurement made simpler for teams and everyday buyers.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Impact Store is the technology retail and procurement arm of Impact Holdings, helping customers source dependable devices, workplace accessories, ICT hardware, and business technology solutions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="inline-flex items-center gap-2 rounded-full bg-[#fbbf24] px-6 py-3 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f59e0b]">
                Browse products
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-[#1f4f8f]/25 px-6 py-3 text-sm font-semibold text-[#1f4f8f] transition hover:bg-[#1f4f8f]/8">
                Request a quote
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/82 p-6 shadow-sm backdrop-blur-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1f4f8f]">What We Stand For</p>
            <div className="mt-5 space-y-4">
              {promises.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-[#f5f7fb] px-4 py-4">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#fbbf24] text-xs font-bold text-[#1f2937]">
                    ✓
                  </span>
                  <p className="text-sm leading-relaxed text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-14">
        <div className="grid gap-5 md:grid-cols-3">
          {highlights.map((item, index) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1f4f8f]">0{index + 1}</p>
              <h2 className="mt-3 text-2xl font-semibold text-[#1f2937]">{item.value}</h2>
              <p className="mt-2 text-sm text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-8 px-6 py-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1f4f8f]">Our Role</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-normal text-[#1f2937] sm:text-4xl">
            A practical bridge between technology vendors and the people who need the equipment.
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
            <p>
              We serve individual shoppers, small businesses, schools, and growing teams that need technology without procurement complexity.
            </p>
            <p>
              The store combines retail checkout with quote-led buying for larger needs, so customers can either order directly or speak to us about quantities, availability, and rollout requirements.
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-[#1f4f8f] p-8 text-white shadow-xl sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#fbbf24]">How We Work</p>
          <div className="mt-6 space-y-5">
            {[
              ["Understand the requirement", "We clarify the device type, quantity, budget, delivery location, and support requirements."],
              ["Source and quote clearly", "We present practical options with transparent pricing and realistic availability."],
              ["Fulfil and support", "We coordinate checkout, delivery, and after-sales communication through the right support channel."],
            ].map(([title, description], index) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fbbf24] text-[#1f2937]">
                  {index === 0 ? <Building2 className="h-5 w-5" /> : index === 1 ? <BadgeCheck className="h-5 w-5" /> : <Truck className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/72">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <div key={pillar.title} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbbf24] text-[#1f2937]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-[#1f2937]">{pillar.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{pillar.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
