"use client";

import { Package, Truck, UserRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const slides = [
  {
    id: 1,
    eyebrow: "B2B & B2C Solutions",
    title: "Your Partner for",
    highlight: "ICT & Security",
    subtitle:
      "Enterprise-grade hardware, mobile devices, accessories, and access control solutions with competitive pricing for growing teams.",
    image: "/impact/evp/laptops3.jpg",
    cta: { label: "Browse Products", href: "/products" },
    ctaSecondary: { label: "Request a Quote", href: "/contact" },
    chips: ["Authorized Dealer", "Nationwide Delivery", "Responsive Support"],
    floating: { label: "Fast Delivery", detail: "2-5 business days", icon: "truck" },
    badge: { value: "25%", label: "Bulk Discount", detail: "On 25+ units" },
  },
  {
    id: 2,
    eyebrow: "Technology Access Program",
    title: "Accelerate Growth with",
    highlight: "TAP",
    subtitle:
      "Priority pricing, lifecycle refreshes, and managed procurement for companies that need devices provisioned quickly.",
    image: "/impact/evp/phones-2.jpg",
    cta: { label: "Shop Devices", href: "/products?category=Phones" },
    ctaSecondary: { label: "Talk to our team", href: "/contact" },
    chips: ["Lifecycle Management", "Priority Fulfillment", "Bulk Procurement"],
    floating: { label: "Program Benefits", detail: "Pricing + provisioning", icon: "package" },
    badge: { value: "48h", label: "Setup Window", detail: "Fast onboarding" },
  },
  {
    id: 3,
    eyebrow: "Managed Device Solutions",
    title: "Equip Teams with",
    highlight: "Reliable Tech",
    subtitle:
      "Curated laptops, tablets, and workplace accessories for office rollouts, field teams, schools, and support desks.",
    image: "/impact/mdm.jpg",
    cta: { label: "View Laptops", href: "/products?category=Laptops" },
    ctaSecondary: { label: "Explore Tablets", href: "/products?category=Tablets" },
    chips: ["Device Staging", "Warranty Support", "Account Management"],
    floating: { label: "Team Ready", detail: "Configured for work", icon: "user" },
    badge: { value: "SA", label: "Local Support", detail: "South Africa wide" },
  },
];

const Icon = ({ name }: { name: string }) => {
  if (name === "truck") return <Truck className="h-5 w-5" />;
  if (name === "user") return <UserRound className="h-5 w-5" />;
  return <Package className="h-5 w-5" />;
};

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 10000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-[#0f172a] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1f4f8f] via-[#173b6b] to-[#0f172a]" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#fbbf24] blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-96 w-96 rounded-full bg-[#1d4ed8] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-6">
        <div className="grid min-h-[620px] items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="text-center lg:text-left">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/85 lg:mx-0">
              <span className="h-2 w-2 rounded-full bg-[#fbbf24]" />
              {slide.eyebrow}
            </div>

            <h1 className="text-4xl font-semibold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
              {slide.title} <span className="text-[#fbbf24]">{slide.highlight}</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              {slide.subtitle}
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href={slide.cta.href}
                className="inline-flex items-center justify-center rounded-full bg-[#fbbf24] px-6 py-3 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f59e0b]"
              >
                {slide.cta.label}
                <span className="ml-2">-&gt;</span>
              </Link>
              <Link
                href={slide.ctaSecondary.href}
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {slide.ctaSecondary.label}
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-6 text-xs uppercase tracking-wide text-white/70 lg:justify-start">
              {slide.chips.map((chip, index) => (
                <div key={chip} className="flex items-center gap-2">
                  {index === 0 ? <Package className="h-4 w-4" /> : index === 1 ? <Truck className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
                  {chip}
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative z-10 aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl">
              <img src={slide.image} alt={`${slide.highlight} ${slide.eyebrow} solution from Impact Store`} className="h-full w-full object-cover" />
            </div>

            <div className="absolute -bottom-8 -left-6 z-20 rounded-2xl bg-white p-4 text-[#1f2937] shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Icon name={slide.floating.icon} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{slide.floating.label}</p>
                  <p className="text-xs text-slate-500">{slide.floating.detail}</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 -top-4 z-20 rounded-2xl bg-white p-4 text-[#1f2937] shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <span className="text-base font-semibold">{slide.badge.value}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">{slide.badge.label}</p>
                  <p className="text-xs text-slate-500">{slide.badge.detail}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2 lg:left-6 lg:translate-x-0">
          {slides.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrent(index)}
              className={`h-2 rounded-full transition-all ${current === index ? "w-10 bg-[#fbbf24]" : "w-5 bg-white/35 hover:bg-white/60"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
