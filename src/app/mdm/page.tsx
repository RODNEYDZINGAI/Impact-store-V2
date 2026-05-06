import { CheckCircle2, Lock, MonitorSmartphone, ShieldCheck, Smartphone, UsersRound } from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Device enrolment",
    description: "Prepare phones, tablets, and laptops for managed business use before they reach the team.",
    icon: MonitorSmartphone,
  },
  {
    title: "Policy control",
    description: "Support consistent security settings, app access, and acceptable-use requirements across devices.",
    icon: ShieldCheck,
  },
  {
    title: "User support",
    description: "Help teams reduce setup friction with procurement, staging, and handover guidance.",
    icon: UsersRound,
  },
];

export default function MdmPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <section className="relative overflow-hidden border-b border-[#cfe1f3] bg-gradient-to-br from-[#eef6ff] via-white to-[#dbeafe]">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.22),transparent_42%)]" />
        <div className="relative mx-auto grid max-w-[1440px] gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#fbbf24]">Mobile Device Management</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal text-[#1f2937] sm:text-5xl lg:text-6xl">
              Keep business devices easier to deploy, secure, and support.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Impact Store helps teams source and prepare devices for managed environments, from small office rollouts to larger mobile workforces.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="rounded-full bg-[#fbbf24] px-6 py-3 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f59e0b]">
                Request MDM support
              </Link>
              <Link href="/products" className="rounded-full border border-[#1f4f8f]/25 px-6 py-3 text-sm font-semibold text-[#1f4f8f] transition hover:bg-[#1f4f8f]/8">
                Browse devices
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl shadow-2xl">
            <img src="/impact/mdm.jpg" alt="Managed devices in a workplace" className="h-full min-h-[360px] w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbbf24] text-[#1f2937]">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-[#1f2937]">{feature.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-8 px-6 pb-20 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl bg-[#1f4f8f] p-8 text-white shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#fbbf24]">Best for</p>
          <div className="mt-6 space-y-4">
            {["Field sales teams", "School and training devices", "Support desk replacements", "Shared tablets and workplace phones"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#fbbf24]" />
                <span className="text-sm text-white/82">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1f4f8f]">How we help</p>
          <h2 className="mt-4 text-3xl font-semibold text-[#1f2937]">Start with the device plan, then match the controls.</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              [Smartphone, "Source suitable phones, tablets, and laptops."],
              [Lock, "Support secure handover and account readiness."],
              [ShieldCheck, "Plan device ownership and access policies."],
              [UsersRound, "Coordinate rollout quantities and timing."],
            ].map(([Icon, text]) => {
              const TypedIcon = Icon as typeof Smartphone;
              return (
                <div key={text as string} className="rounded-2xl bg-slate-50 p-4">
                  <TypedIcon className="h-5 w-5 text-[#1f4f8f]" />
                  <p className="mt-3 text-sm text-slate-600">{text as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
