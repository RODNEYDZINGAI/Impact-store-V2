"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Recycle,
  ShieldCheck,
  Building2,
  Truck,
  Leaf,
  HardDrive,
  Smartphone,
  Monitor,
  Server,
  Camera,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const acceptedItems = [
  { icon: Smartphone, label: "Phones & Tablets", desc: "All brands, working or not" },
  { icon: Monitor, label: "Monitors & Displays", desc: "LCD, LED, CRT" },
  { icon: Server, label: "Servers & Workstations", desc: "Rack, tower, blade" },
  { icon: HardDrive, label: "Storage & Drives", desc: "HDD, SSD, tape media" },
  { icon: Camera, label: "CCTV & Security", desc: "Cameras, NVRs, access panels" },
  { icon: Recycle, label: "Networking Gear", desc: "Switches, routers, APs" },
  { icon: Monitor, label: "Laptops & Desktops", desc: "All makes and models" },
  { icon: HardDrive, label: "Printers & Peripherals", desc: "Scanners, UPS, toner" },
];

const processSteps = [
  { step: 1, title: "Request a Collection", desc: "Fill in the form or call us. Tell us what equipment you need collected and where." },
  { step: 2, title: "We Pick Up", desc: "Our team arrives at your premises at a scheduled time. No minimum quantity required." },
  { step: 3, title: "Secure Data Destruction", desc: "All storage media is wiped or physically destroyed. Certificates of destruction issued on request." },
  { step: 4, title: "Responsible Recycling", desc: "Equipment is refurbished, remarketed, or sent to certified e-waste recyclers. Nothing goes to landfill." },
];

export default function RecyclingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    equipmentType: "",
    estimatedQuantity: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          subject: `E-Waste Recycling Request — ${formData.companyName || "Individual"}`,
          message: [
            `Company: ${formData.companyName || "N/A"}`,
            `Equipment type: ${formData.equipmentType || "Not specified"}`,
            `Estimated quantity: ${formData.estimatedQuantity || "Not specified"}`,
            ``,
            formData.notes || "",
          ].join("\n"),
        }),
      });
      if (response.ok) {
        setIsSubmitted(true);
        setFormData({ companyName: "", contactName: "", email: "", phone: "", equipmentType: "", estimatedQuantity: "", notes: "" });
      }
    } catch (error) {
      console.error("Failed to submit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f5f7fb]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0f172a] px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#065f46] via-[#064e3b] to-[#0f172a]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-emerald-600 blur-3xl" />
          <div className="absolute -right-20 top-4 h-72 w-72 rounded-full bg-teal-400 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
            <Recycle className="h-8 w-8" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Electronics Recycling
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-5xl lg:text-6xl">
            Responsible E-Waste Recycling for Your Business
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/75">
            Don&apos;t let old IT equipment gather dust or end up in a landfill. Impact Store offers secure, certified electronics recycling and e-waste collection for businesses across South Africa.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a href="#request-collection" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600">
              Book a Collection <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#how-it-works" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative mx-auto max-w-7xl px-4 -mt-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: "100%", label: "Data Destruction Guaranteed" },
            { value: "Zero", label: "Landfill Contribution" },
            { value: "Certified", label: "E-Waste Processors" },
            { value: "Free", label: "Business Collection" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <p className="text-2xl font-bold text-emerald-600">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What We Recycle */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">What We Accept</p>
          <h2 className="mt-3 text-3xl font-bold text-[#0f172a]">Almost Any Electronic Equipment</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-500">
            From outdated office phones to decommissioned server racks — we handle it all.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {acceptedItems.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-[#0f172a]">{item.label}</h3>
              <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Recycle With Us */}
      <section className="bg-[#0f172a] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Why Impact Store</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Built for Business E-Waste</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Certified Data Destruction", desc: "Every hard drive and storage device is securely wiped using industry-standard methods. Certificates of destruction available for compliance and audits." },
              { icon: Building2, title: "Business-Focused Service", desc: "We specialise in office and enterprise equipment. Bulk pickups, scheduled collections, and dedicated account management for larger organisations." },
              { icon: Truck, title: "Free On-Site Collection", desc: "We come to your premises anywhere in Gauteng. Larger loads can be arranged nationwide. No minimum quantity — even a single box is worth recycling." },
              { icon: Leaf, title: "Zero Landfill Policy", desc: "Nothing we collect goes to a dump. Equipment is refurbished and reused, or broken down into raw materials by certified recycling partners." },
              { icon: HardDrive, title: "Asset Recovery Value", desc: "Working equipment may have residual value. We assess, refurbish, and can offer buy-back or trade-in credit toward new purchases." },
              { icon: Recycle, title: "Environmental Compliance", desc: "We operate in line with South Africa&apos;s National Environmental Management: Waste Act and e-Waste Association of South Africa (eWASA) guidelines." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Simple Process</p>
          <h2 className="mt-3 text-3xl font-bold text-[#0f172a]">How It Works</h2>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((item) => (
            <div key={item.step} className="relative text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-lg font-bold text-white">
                {item.step}
              </div>
              <h3 className="font-semibold text-[#0f172a]">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Request Collection Form */}
      <section id="request-collection" className="bg-[#0f172a] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Get Started</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Request a Collection</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/60">
              Fill in the form below and our recycling team will get back to you within one business day to arrange pickup.
            </p>
          </div>

          {isSubmitted ? (
            <div className="mt-10 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-400" />
              <h3 className="mt-4 text-xl font-semibold text-white">Collection Request Submitted!</h3>
              <p className="mt-2 text-white/60">We&apos;ll be in touch shortly to confirm the details and schedule your pickup.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 sm:p-8 backdrop-blur-sm">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="companyName" className="text-sm text-white/70">Company Name</Label>
                  <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Your company" className="mt-1 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-emerald-500" />
                </div>
                <div>
                  <Label htmlFor="contactName" className="text-sm text-white/70">Contact Name *</Label>
                  <Input id="contactName" name="contactName" value={formData.contactName} onChange={handleChange} required placeholder="John Doe" className="mt-1 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-emerald-500" />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="email" className="text-sm text-white/70">Email *</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@company.co.za" className="mt-1 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-emerald-500" />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm text-white/70">Phone</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+27 82 000 0000" className="mt-1 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <Label htmlFor="equipmentType" className="text-sm text-white/70">Type of Equipment</Label>
                <select id="equipmentType" name="equipmentType" value={formData.equipmentType} onChange={handleChange} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none">
                  <option value="" className="text-slate-800">Select equipment type</option>
                  <option value="Computers / Laptops" className="text-slate-800">Computers / Laptops</option>
                  <option value="Servers / Networking" className="text-slate-800">Servers / Networking</option>
                  <option value="Phones / Tablets" className="text-slate-800">Phones / Tablets</option>
                  <option value="Monitors / Displays" className="text-slate-800">Monitors / Displays</option>
                  <option value="CCTV / Security" className="text-slate-800">CCTV / Security</option>
                  <option value="Printers / Peripherals" className="text-slate-800">Printers / Peripherals</option>
                  <option value="Mixed / General e-Waste" className="text-slate-800">Mixed / General e-Waste</option>
                </select>
              </div>
              <div>
                <Label htmlFor="estimatedQuantity" className="text-sm text-white/70">Estimated Quantity</Label>
                <Input id="estimatedQuantity" name="estimatedQuantity" value={formData.estimatedQuantity} onChange={handleChange} placeholder="e.g. 20 laptops, 5 monitors, 3 servers" className="mt-1 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-emerald-500" />
              </div>
              <div>
                <Label htmlFor="notes" className="text-sm text-white/70">Additional Notes</Label>
                <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={4} placeholder="Collection address, access instructions, preferred dates, or any special requirements..." className="mt-1 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-emerald-500" />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-500 py-3 text-base font-semibold text-white hover:bg-emerald-600">
                {isSubmitting ? "Submitting..." : "Request Free Collection"}
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Environmental Impact */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Environmental Impact</p>
            <h2 className="mt-3 text-3xl font-bold text-[#0f172a]">Every Device Recycled Makes a Difference</h2>
            <p className="mt-4 text-slate-500">
              South Africa generates over 360,000 tonnes of e-waste annually, yet less than 12% is formally recycled. The rest ends up in landfills — leaching lead, mercury, and cadmium into soil and groundwater.
            </p>
            <p className="mt-3 text-slate-500">
              By choosing responsible recycling, your business reduces hazardous waste, recovers valuable materials (gold, copper, rare earths), and demonstrates environmental stewardship to clients and regulators.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Reduces toxic e-waste in landfills",
                "Conserves natural resources through material recovery",
                "Supports compliance with environmental legislation",
                "Enhances your company's sustainability profile",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                  <span className="text-sm text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-8">
            <Recycle className="mx-auto h-24 w-24 text-emerald-300" />
            <div className="mt-6 space-y-4 text-center">
              <div>
                <p className="text-3xl font-bold text-emerald-700">360K+</p>
                <p className="text-sm text-slate-500">Tonnes of e-waste generated yearly in SA</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-500">&lt;12%</p>
                <p className="text-sm text-slate-500">Is formally recycled</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-700">100%</p>
                <p className="text-sm text-slate-500">Of what we collect is responsibly processed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Responsibly Dispose of Your E-Waste?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Whether it&apos;s 5 phones or 500 servers, we&apos;ll handle the collection, data destruction, and recycling — at no cost to your business.
          </p>
          <a href="#request-collection" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-emerald-700 shadow-lg transition hover:bg-white/90">
            Book Your Free Collection <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
