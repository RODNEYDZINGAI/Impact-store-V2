"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f5f7fb]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0f172a] px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1f4f8f] via-[#173b6b] to-[#0f172a]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[#1d4ed8] blur-3xl" />
          <div className="absolute -right-20 top-4 h-72 w-72 rounded-full bg-[#38bdf8] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#fbbf24]">
            Get in Touch
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-5xl lg:text-6xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/75">
            Need product advice, a bulk quote, or help with an order? Send us a message and the Impact Store team will respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="relative mx-auto max-w-7xl px-4 -mt-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#fbbf24] hover:shadow-lg">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#fbbf24] text-[#1f2937]">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-[#1f2937]">Address</h3>
            <p className="mt-2 text-sm text-slate-500">
              16 Baker St<br />
              Rosebank<br />
              Johannesburg, 2196
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#fbbf24] hover:shadow-lg">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#fbbf24] text-[#1f2937]">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-[#1f2937]">Email</h3>
            <p className="mt-2 text-sm text-slate-500">
              <a
                href="mailto:info@impactstore.co.za"
                className="transition hover:text-[#1f4f8f]"
              >
                info@impactstore.co.za
              </a>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#fbbf24] hover:shadow-lg">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#fbbf24] text-[#1f2937]">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-[#1f2937]">Phone</h3>
            <p className="mt-2 text-sm text-slate-500">
              <a href="tel:+27100013608" className="transition hover:text-[#1f4f8f]">
                +27 10 001 3608
              </a>
              <br />
              Office line
              <br />
              <a href="tel:+27785229194" className="transition hover:text-[#1f4f8f]">
                +27 78 522 9194
              </a>
              <br />
              Mobile &amp; WhatsApp
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#fbbf24] hover:shadow-lg">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#fbbf24] text-[#1f2937]">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-[#1f2937]">Hours</h3>
            <p className="mt-2 text-sm text-slate-500">
              Mon-Fri business support
              <br />
              Online inquiries welcome anytime
            </p>
          </div>
        </div>
      </section>

      {/* Map and Form Section */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Google Map */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm" style={{ minHeight: "500px" }}>
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent to-black/5 pointer-events-none" />
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent("16 Baker St, Rosebank, Johannesburg, 2196")}&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0, position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Impact Store Location"
            />
            {/* Fallback map link */}
            <div className="absolute bottom-4 left-4 right-4 z-20">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent("16 Baker St, Rosebank, Johannesburg, 2196")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-white/95 px-4 py-3 text-sm font-semibold text-[#1f2937] shadow-lg backdrop-blur-sm transition hover:bg-white"
              >
                <MapPin className="h-4 w-4 text-[#1f4f8f]" />
                Open in Google Maps
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
            {isSubmitted ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-semibold text-[#1f2937]">
                  Message Sent!
                </h2>
                <p className="mt-3 text-slate-500">
                  Thank you for reaching out. We&apos;ve received your message and will get back to you shortly.
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  A confirmation email has been sent to your inbox.
                </p>
                <Button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-8 rounded-full bg-[#fbbf24] px-6 py-3 text-sm font-semibold text-[#1f2937] hover:bg-[#f59e0b]"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-[#1f2937]">
                    Send us a Message
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[#1f2937]">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="h-12 rounded-xl border-slate-200 bg-white focus-visible:ring-[#1f4f8f]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[#1f2937]">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="h-12 rounded-xl border-slate-200 bg-white focus-visible:ring-[#1f4f8f]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-[#1f2937]">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+27 12 345 6789"
                        className="h-12 rounded-xl border-slate-200 bg-white focus-visible:ring-[#1f4f8f]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-[#1f2937]">
                        Subject <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="How can we help?"
                        className="h-12 rounded-xl border-slate-200 bg-white focus-visible:ring-[#1f4f8f]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-[#1f2937]">
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      className="rounded-xl border-slate-200 bg-white focus-visible:ring-[#1f4f8f]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-full bg-[#1f4f8f] text-sm font-semibold text-white transition hover:bg-[#173b6b] disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Send Message
                      </span>
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="relative mx-auto mb-20 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[#1f4f8f] px-7 py-10 text-white shadow-sm sm:px-10 sm:py-12">
          <div className="absolute -right-12 top-0 h-52 w-52 rounded-full bg-[#38bdf8]/20 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#fbbf24]">
                Quick Support
              </p>
              <h2 className="mt-3 max-w-2xl text-2xl font-semibold leading-tight text-white sm:text-3xl">
                Need immediate assistance with your order?
              </h2>
              <p className="mt-4 max-w-2xl text-white/75">
                Check your order status from your account, or contact us directly for quote and delivery support.
              </p>
            </div>
            <a
              href="/profile"
              className="inline-flex w-fit items-center rounded-full bg-[#fbbf24] px-6 py-3 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f59e0b]"
            >
              View My Account
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
