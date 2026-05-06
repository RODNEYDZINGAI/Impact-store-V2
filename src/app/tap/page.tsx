import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  Headphones,
  Laptop,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Tablet,
  Truck,
  Wifi,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Technology Access Program (TAP) | Impact Store",
  description:
    "Impact Store's Technology Access Program helps employers give teams access to devices, connectivity, and managed deployment support.",
};

const stats = [
  { value: "87%", label: "Employee satisfaction" },
  { value: "32%", label: "Retention improvement" },
  { value: "45%", label: "Savings vs retail" },
  { value: "3.5x", label: "Employer ROI" },
];

const deviceBundles = [
  {
    title: "Smartphones",
    description: "iOS and Android devices for frontline, mobile, and hybrid teams.",
    image: "/impact/evp/phones-2.jpg",
    href: "/products?category=Phones",
    icon: Smartphone,
  },
  {
    title: "Laptops",
    description: "Business-ready laptops for productivity, onboarding, and refresh cycles.",
    image: "/impact/evp/laptops2.jpg",
    href: "/products?category=Laptops",
    icon: Laptop,
  },
  {
    title: "Tablets",
    description: "Flexible devices for retail, education, field service, and operations.",
    image: "/impact/evp/tablets2.jpg",
    href: "/products?category=Tablets",
    icon: Tablet,
  },
  {
    title: "Accessories",
    description: "Headsets, chargers, docks, cases, and productivity add-ons.",
    image: "/impact/evp/accessories2.jpg",
    href: "/products?category=Accessories",
    icon: Headphones,
  },
];

const steps = [
  {
    title: "Build the program",
    detail:
      "We confirm workforce size, user groups, device needs, budget range, and rollout dates.",
    icon: ClipboardList,
  },
  {
    title: "Bundle devices and connectivity",
    detail:
      "Phones, laptops, tablets, accessories, data plans, and support are shaped into practical options.",
    icon: Wifi,
  },
  {
    title: "Configure and deploy",
    detail:
      "Impact coordinates sourcing, setup, handover, delivery, and ongoing support.",
    icon: PackageCheck,
  },
  {
    title: "Refresh when needed",
    detail:
      "Plan renewals, replacements, upgrades, and new employee onboarding with less disruption.",
    icon: RefreshCw,
  },
];

const employerBenefits = [
  "Give employees a practical benefit they can use every day.",
  "Reduce the pressure of one-off hardware purchases and emergency replacements.",
  "Standardize device options while still giving teams relevant choices.",
  "Support digital inclusion for office, remote, and field-based staff.",
  "Keep procurement, connectivity, warranty, and support under one managed program.",
];

const programHighlights = [
  {
    title: "Employer-led access",
    description:
      "TAP is designed around employers that want to make technology easier for teams to access.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Managed distribution",
    description:
      "Impact supports device selection, allocation, fulfilment, delivery, and rollout planning.",
    icon: Truck,
  },
  {
    title: "Secure lifecycle support",
    description:
      "Add provisioning, asset visibility, warranties, accessories, and refresh planning where needed.",
    icon: ShieldCheck,
  },
];

export default function TapPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <section className="relative overflow-hidden bg-[#0f172a] text-white">
        <div className="absolute inset-0">
          <Image
            src="/impact/evp/laptops0.jpg"
            alt="Technology devices prepared for the Technology Access Program"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/95 via-[#1f4f8f]/75 to-[#0f172a]/35" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f5f7fb] to-transparent" />
        </div>

        <div className="relative mx-auto grid max-w-[1440px] gap-10 px-6 pb-24 pt-24 lg:grid-cols-[1fr_420px] lg:pb-28 lg:pt-28">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#fbbf24] backdrop-blur">
              Employee Value Proposition
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
              Technology Access Program
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/82">
              Empower your workforce with devices they can use and keep. TAP combines modern devices, connectivity, accessories, deployment support, and managed distribution into a practical employee technology benefit.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[#fbbf24] px-6 py-3 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f59e0b]"
              >
                Talk to the TAP team
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                See how it works
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/18 bg-white/12 p-5 shadow-2xl backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#fbbf24]">Designed for</p>
            <div className="mt-5 grid gap-3">
              {[
                "Employee device benefits",
                "Workforce onboarding",
                "Device refresh programs",
                "Connectivity-led deployments",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/12 px-4 py-3 text-sm text-white/90">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#fbbf24]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-12 max-w-[1180px] px-6">
        <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="border-b border-slate-200 p-6 text-center sm:border-r lg:border-b-0">
              <p className="text-3xl font-semibold text-[#1f4f8f]">{item.value}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-16 lg:py-20">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#f5a400]">Choose your technology</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-normal text-[#1f2937] sm:text-4xl">
              Device bundles built for real teams and real rollout constraints.
            </h2>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f4f8f] transition hover:text-[#163a69]">
            Browse all products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {deviceBundles.map((device) => {
            const Icon = device.icon;
            return (
              <Link
                key={device.title}
                href={device.href}
                className="group relative min-h-[390px] overflow-hidden rounded-2xl bg-[#0f172a] shadow-lg"
              >
                <Image
                  src={device.image}
                  alt={device.title}
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/88 via-[#0f172a]/34 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fbbf24] text-[#1f2937]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{device.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/82">{device.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="how-it-works" className="bg-white/75 py-16 lg:py-20">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#f5a400]">How TAP works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-[#1f2937] sm:text-4xl">
              A managed path from employee need to delivered device.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              TAP is not just a product catalogue. It is a structured program for sourcing, bundling, distributing, and supporting technology across a workforce.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8f1fb] text-[#1f4f8f]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-300">0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-[#1f2937]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-8 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
        <div className="relative min-h-[420px] overflow-hidden rounded-[28px] bg-[#0f172a]">
          <Image
            src="/impact/evp/accessories3.jpg"
            alt="Devices and accessories for a managed technology program"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/75 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#fbbf24]">Bundle-ready</p>
            <h2 className="mt-3 max-w-lg text-3xl font-semibold tracking-normal">
              Devices, connectivity, accessories, and support in one program.
            </h2>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="grid gap-4 sm:grid-cols-3">
            {programHighlights.map((highlight) => {
              const Icon = highlight.icon;
              return (
                <div key={highlight.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <Icon className="h-6 w-6 text-[#1f4f8f]" />
                  <h3 className="mt-4 text-base font-semibold text-[#1f2937]">{highlight.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{highlight.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fbbf24] text-[#1f2937]">
                <Boxes className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-[#1f2937]">Why employers choose TAP</h2>
            </div>
            <ul className="mt-5 grid gap-3 text-sm leading-relaxed text-slate-600">
              {employerBenefits.map((benefit) => (
                <li key={benefit} className="flex gap-3">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1f4f8f]" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 pb-20">
        <div className="overflow-hidden rounded-[28px] bg-[#1f4f8f] text-white shadow-xl">
          <div className="grid gap-8 p-8 lg:grid-cols-[1fr_0.72fr] lg:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#fbbf24]">Ready to launch TAP?</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-normal sm:text-4xl">
                Design a technology access program around your workforce.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/78">
                Share your team size, device categories, location spread, support needs, and rollout timing. Impact Store will help shape the practical options.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#fbbf24] px-6 py-3 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f59e0b]"
              >
                Request TAP support
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View device options
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
