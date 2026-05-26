import { ArrowRight, BadgePercent, Clock3, PackageCheck, RefreshCw, Truck } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Technology Access Program (TAP) — Priority Device Procurement | Impact Store",
  description: "Impact Store TAP helps businesses, schools, and teams procure laptops, phones, tablets, and ICT hardware in bulk with priority pricing, lifecycle planning, and fast fulfilment across South Africa.",
  keywords: ["technology procurement South Africa", "bulk device procurement", "bulk laptops phones for business", "device rollout planning"],
};

const benefits = [
  {
    title: "Priority pricing",
    description: "Better quote support for repeat procurement and qualifying volume orders.",
    icon: BadgePercent,
  },
  {
    title: "Lifecycle planning",
    description: "Plan device refreshes, replacements, and staged rollouts with fewer last-minute sourcing gaps.",
    icon: RefreshCw,
  },
  {
    title: "Fast fulfilment",
    description: "Coordinate availability, delivery, and handover timelines before the order is placed.",
    icon: Truck,
  },
];

export default function TapPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <section className="bg-[#0f172a] text-white">
        <div className="mx-auto max-w-[1440px] px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#fbbf24]">Technology Access Program</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-normal sm:text-5xl lg:text-6xl">
            Priority technology procurement for teams that need to move faster.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
            TAP helps businesses, schools, and growing teams access devices, accessories, and ICT hardware with quote-led support and bulk-order planning.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-[#fbbf24] px-6 py-3 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f59e0b]">
              Apply for TAP support
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/products" className="rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Browse catalog
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbbf24] text-[#1f2937]">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-[#1f2937]">{benefit.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 pb-20">
        <div className="overflow-hidden rounded-3xl bg-[#1f4f8f] text-white shadow-xl">
          <div className="grid gap-8 p-8 lg:grid-cols-[1fr_0.85fr] lg:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#fbbf24]">Program flow</p>
              <h2 className="mt-4 text-3xl font-semibold">A clearer path from requirement to delivery.</h2>
              <p className="mt-4 max-w-2xl text-white/75">
                Share the device types, quantities, budget range, and preferred timing. We respond with practical options and next steps.
              </p>
            </div>
            <div className="grid gap-3">
              {[
                [Clock3, "Send your requirement"],
                [PackageCheck, "Receive product and pricing options"],
                [Truck, "Confirm order and delivery plan"],
              ].map(([Icon, text]) => {
                const TypedIcon = Icon as typeof Clock3;
                return (
                  <div key={text as string} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                    <TypedIcon className="h-5 w-5 text-[#fbbf24]" />
                    <span className="text-sm text-white/82">{text as string}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 pb-20">
        <Link
          href="/mdm"
          className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold text-[#1f4f8f] shadow-sm transition hover:border-[#1f4f8f]/40 hover:bg-slate-50"
        >
          <span>Need device management? See our MDM support.</span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      </section>
    </div>
  );
}
