export const dynamic = "force-dynamic";

import { Cpu, MonitorSmartphone, Package, ShieldCheck, TabletSmartphone } from "lucide-react";
import HeroSlider from "@/components/HeroSlider";
import ProductGrid from "@/components/ProductGrid";
import Product from "@/models/Product";
import dbConnect from "@/lib/mongodb";
import Link from "next/link";

const categories = [
  {
    name: "Phones",
    desc: "Mobile devices for teams, executives, students, and everyday business communication.",
    image: "/impact/evp/phones-1.jpg",
    icon: TabletSmartphone,
  },
  {
    name: "Laptops",
    desc: "Business notebooks and workstations selected for dependable daily performance.",
    image: "/impact/evp/laptops1.jpg",
    icon: MonitorSmartphone,
  },
  {
    name: "Tablets",
    desc: "Portable productivity, learning, point-of-sale, and field-work devices.",
    image: "/impact/evp/tablets1.jpg",
    icon: ShieldCheck,
  },
  {
    name: "Accessories",
    desc: "Chargers, keyboards, sleeves, hubs, and workplace essentials for complete rollouts.",
    image: "/impact/evp/accessories1.jpg",
    icon: Package,
  },
  {
    name: "IT Hardware",
    desc: "Networking, storage, workstation, and office infrastructure essentials.",
    image: "/impact/evp/laptops3.jpg",
    icon: Cpu,
  },
  {
    name: "Security & Access Control",
    desc: "Access control, surveillance, and workplace security equipment for business premises.",
    image: "/impact/mdm.jpg",
    icon: ShieldCheck,
  },
];

const trustItems = ["Authorized Dealer", "Nationwide Delivery", "Bulk Procurement", "Business Support"];

export default async function HomePage() {
  await dbConnect();
  const featuredProducts = await Product.find({
    featured: true,
    $or: [{ published: true }, { published: { $exists: false } }],
  })
    .limit(8)
    .lean();

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <HeroSlider />

      <section className="bg-white">
        <div className="mx-auto grid max-w-[1440px] gap-4 px-6 py-6 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-[#fbbf24]" />
              <span className="font-medium">{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f5f7fb] py-16 sm:py-24">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-[#1f2937] sm:text-4xl">Shop by Category</h2>
            <p className="mt-4 text-base text-slate-500">
              From ICT hardware to mobile devices and accessories, Impact Store keeps business buying simple.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <Link
                  key={category.name}
                  href={`/products?category=${encodeURIComponent(category.name)}`}
                  className="group relative overflow-hidden rounded-2xl border-2 border-transparent bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#fbbf24] hover:shadow-xl"
                >
                  <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                    <img
                      src={category.image}
                      alt={`${category.name} technology category at Impact Store`}
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 shadow-sm">
                      <Icon className="h-5 w-5 text-[#1f4f8f]" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-[#1f2937] transition-colors group-hover:text-[#1f4f8f]">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{category.desc}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                    <span className="text-sm font-medium text-slate-500">Explore</span>
                    <span className="flex items-center gap-1 text-sm font-semibold text-[#1f4f8f] transition-colors group-hover:text-[#f59e0b]">
                      Browse <span className="transition-transform group-hover:translate-x-1">-&gt;</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-[#1f2937] sm:text-4xl">Featured Products</h2>
              <p className="mt-3 text-slate-500">Selected devices and hardware ready for fast quoting or checkout.</p>
            </div>
            <Link href="/products" className="text-sm font-semibold text-[#1f4f8f] transition hover:text-[#f59e0b]">
              View all products -&gt;
            </Link>
          </div>
          <ProductGrid products={JSON.parse(JSON.stringify(featuredProducts))} />
        </div>
      </section>

      <section id="bulk-quote" className="bg-[#f5f7fb] py-16 sm:py-24">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="overflow-hidden rounded-3xl bg-[#1f4f8f] p-8 text-white shadow-xl sm:p-10 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.75fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#fbbf24]">Bulk procurement</p>
                <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
                  Need devices for a team, school, office, or rollout?
                </h2>
                <p className="mt-4 max-w-2xl text-white/80">
                  Request a quote for priority pricing, sourcing support, and rollout planning across laptops, phones, tablets, and accessories.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  { qty: "1-4 units", discount: "Standard price" },
                  { qty: "5-24 units", discount: "Volume pricing" },
                  { qty: "25+ units", discount: "Up to 25% off" },
                ].map((tier) => (
                  <div key={tier.qty} className="rounded-2xl bg-white/10 p-4">
                    <p className="text-sm font-semibold">{tier.qty}</p>
                    <p className="mt-1 text-sm text-[#fbbf24]">{tier.discount}</p>
                  </div>
                ))}
                <Link
                  href="/quote?source=homepage-bulk-quote"
                  className="inline-flex items-center justify-center rounded-full bg-[#fbbf24] px-6 py-3 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f59e0b]"
                >
                  Request a Quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
