import { SITE_NAME, truncateMetaDescription } from "@/lib/seo";

export interface CategoryFAQItem {
  question: string;
  answer: string;
}

export interface CategorySEOContent {
  seoTitle: string;
  metaDescription: string;
  eyebrow: string;
  intro: string;
  description: string;
  benefits: string[];
  faqs: CategoryFAQItem[];
}

export const categorySEOContent: Record<string, CategorySEOContent> = {
  Phones: {
    seoTitle: `Business Phones South Africa | ${SITE_NAME}`,
    metaDescription:
      "Buy smartphones and business phones in South Africa from Impact Store. Request quotes for team devices, mobile refreshes and accessories.",
    eyebrow: "Business mobile devices",
    intro:
      "Keep teams connected with phones for business users, field staff and everyday buyers in South Africa.",
    description:
      "Impact Store supplies business smartphones and personal mobile devices for South African teams and individual buyers. Use this category to source executive handsets, fleet devices for field teams, affordable smartphones for students and the accessories needed to support mobile rollouts.",
    benefits: [
      "Smartphones for staff refreshes, field teams and everyday mobile productivity.",
      "Quote support for team quantities, preferred models, budgets and rollout timelines.",
      "A category that supports both individual online purchases and business procurement.",
    ],
    faqs: [
      { question: "Can businesses request quotes for multiple phones?", answer: "Yes. Share the number of devices, preferred models or budgets and required timeline through the quote form for availability and pricing support." },
      { question: "Do you sell phones to individual customers too?", answer: "Yes. The phones category remains suitable for individual online shoppers while also supporting business quote requests." },
      { question: "Can accessories be included with phone procurement?", answer: "Include cases, chargers, cables or other accessory needs in the quote request so the team can prepare a complete basket where stock allows." },
    ],
  },
  Laptops: {
    seoTitle: `Business Laptops South Africa | ${SITE_NAME}`,
    metaDescription:
      "Buy business laptops in South Africa from Impact Store. Source HP, Dell, Lenovo and other corporate laptops for teams, schools and office procurement.",
    eyebrow: "Business laptop procurement",
    intro: "Source reliable business laptops for South African teams, schools and growing companies.",
    description:
      "Browse business laptops, student notebooks and workstations for office productivity, remote work, classroom learning and enterprise deployments. Impact Store helps procurement buyers compare practical notebook options and request quotes for bulk laptop requirements.",
    benefits: [
      "Business-ready options for staff rollouts, classrooms and hybrid work teams.",
      "Quote-led support for bulk laptop requirements, accessories and availability checks.",
      "Nationwide fulfilment for South African organisations that need dependable ICT supply.",
    ],
    faqs: [
      { question: "Can Impact Store quote on bulk business laptop orders?", answer: "Yes. Use the quote request flow to share quantities, preferred brands, budget and timeline so the team can confirm availability and recommend suitable business laptops." },
      { question: "Which laptop brands are suitable for business buyers?", answer: "Common business requirements include HP, Dell, Lenovo and other reliable notebook ranges with enough memory, storage and warranty cover for office productivity." },
      { question: "Do you supply laptops for schools and small businesses?", answer: "Impact Store supports SMEs, schools and teams that need laptops, accessories and related ICT equipment delivered in South Africa." },
    ],
  },
  Tablets: {
    seoTitle: `Tablets for Business South Africa | ${SITE_NAME}`,
    metaDescription:
      "Source tablets for business, schools, retail and field teams in South Africa from Impact Store. Request quotes for devices and accessories.",
    eyebrow: "Business tablets",
    intro: "Browse tablets for South African businesses, schools, retail teams and mobile workforces.",
    description:
      "Shop tablets for business, education and personal use, including device options suited to point-of-sale, field work, classroom learning and office productivity. Impact Store supports both individual tablet buyers and South African organisations planning multi-device rollouts.",
    benefits: [
      "Tablet options for point-of-sale, classrooms, field work and executive mobility.",
      "Quote-led support for quantities, accessories and deployment timelines.",
      "A practical path for both individual tablet purchases and B2B procurement.",
    ],
    faqs: [
      { question: "Are tablets suitable for business and school procurement?", answer: "Yes. Tablets can support classrooms, retail operations, mobile teams and office users depending on performance, durability and accessory requirements." },
      { question: "Can Impact Store quote for tablet rollouts?", answer: "Use the quote form to provide quantities, preferred specifications, budgets and timelines for tablet rollout support." },
      { question: "Can tablet accessories be quoted with devices?", answer: "Yes. Mention covers, chargers, keyboards or other accessories in the quote request so availability can be checked alongside the devices." },
    ],
  },
  Accessories: {
    seoTitle: `Computer Accessories South Africa | ${SITE_NAME}`,
    metaDescription:
      "Shop computer accessories, mobile accessories, cables, chargers and peripherals for South African homes and businesses from Impact Store.",
    eyebrow: "Accessories and peripherals",
    intro: "Complete workplace and device setups with accessories for South African buyers.",
    description:
      "Find laptop chargers, keyboards, portable storage, power banks, headsets, adapters and other office technology accessories. Impact Store lists practical add-ons for individuals, offices and procurement teams building larger baskets around laptops, phones, tablets and IT hardware.",
    benefits: [
      "Accessories for laptops, phones, tablets and office technology setups.",
      "Useful add-ons for bulk device procurement and staff equipment refreshes.",
      "Quote support for accessory quantities, compatibility notes and bundled orders.",
    ],
    faqs: [
      { question: "Can accessories be included in a business technology quote?", answer: "Yes. Add the required accessories, quantities and compatible devices to your quote request so Impact Store can prepare a fuller procurement response." },
      { question: "What types of accessories does Impact Store list?", answer: "The catalogue can include mobile accessories, cables, chargers, adapters, peripherals and other add-ons for technology setups." },
      { question: "Are accessories available for individual shoppers?", answer: "Yes. Accessories remain available for everyday online shoppers as well as offices and teams building larger baskets." },
    ],
  },
  "IT Hardware": {
    seoTitle: `IT Equipment Supplier South Africa | ${SITE_NAME}`,
    metaDescription:
      "Source IT hardware, networking equipment, components, peripherals and UPS products for South African businesses from Impact Store.",
    eyebrow: "IT hardware supply",
    intro: "Build and refresh workplace technology with IT hardware for South African businesses.",
    description:
      "Source networking equipment, storage, UPS systems, peripherals and other office ICT essentials from Impact Store. This category supports procurement teams, installers, schools and managed service providers looking for practical IT hardware supply in South Africa.",
    benefits: [
      "A practical catalogue for offices, installers, schools and managed service providers.",
      "Networking, storage, UPS and peripheral options aligned to business procurement needs.",
      "Quote assistance for mixed baskets, project quantities and phased rollouts.",
    ],
    faqs: [
      { question: "What IT hardware can businesses request from Impact Store?", answer: "Businesses can browse and request quotes for networking equipment, peripherals, storage, components, UPS products and other office technology essentials." },
      { question: "Can I request a quote for a mixed IT hardware basket?", answer: "Yes. Add product context or describe your hardware list in the quote form so the team can confirm availability and pricing for the full requirement." },
      { question: "Do you supply networking equipment for offices?", answer: "Impact Store lists business networking and infrastructure products such as routers, switches, storage and connectivity accessories for South African workplaces." },
    ],
  },
  "Security & Access Control": {
    seoTitle: `Security Equipment Supplier South Africa | ${SITE_NAME}`,
    metaDescription:
      "Shop CCTV, access control, biometrics, alarms and security accessories for South African businesses and installers from Impact Store.",
    eyebrow: "Security and access control",
    intro: "Equip sites with business security and access control products for South African offices, retail locations, schools and installers.",
    description:
      "Impact Store supplies CCTV cameras, NVR systems, biometric access control, time attendance terminals and security equipment for business premises. Browse security products for offices, retail locations, schools and installers that need quote-led procurement support.",
    benefits: [
      "CCTV, access control and alarm products for commercial and institutional sites.",
      "Useful for installers and procurement teams building complete security baskets.",
      "Quote support for quantities, site rollouts and compatible accessories.",
    ],
    faqs: [
      { question: "Does Impact Store supply CCTV products for businesses?", answer: "Yes. The security catalogue includes CCTV cameras, recording equipment and accessories that can be quoted for business and installer requirements." },
      { question: "Can I source access control and biometric equipment?", answer: "Impact Store lists access readers, controllers, biometrics and related security products for South African organisations and installers." },
      { question: "How should I request security equipment for a project?", answer: "Submit a quote request with the products, quantities and site timeline. Include accessory needs such as mounts, storage, cabling or power where relevant." },
    ],
  },
};

export function getCategorySEOContent(category?: string | null) {
  if (!category) return undefined;
  return categorySEOContent[category];
}

export function getCategorySEOMetaDescription(content: CategorySEOContent) {
  return truncateMetaDescription(content.metaDescription);
}

export function buildFAQPageJsonLd(content: CategorySEOContent) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
