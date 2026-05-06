import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Product from "../models/Product";
import User from "../models/User";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in your .env.local file");
}

const products = [
  {
    name: "Dell Latitude 5520",
    slug: "dell-latitude-5520",
    description: "Top-tier performance for modern workloads, speed, and longevity. Professionally refurbished, fully tested & certified with near-new performance standards.",
    price: 8000,
    originalPrice: 18000,
    category: "Laptops",
    condition: "Refurbished",
    brand: "Dell",
    images: ["/impact/evp/laptops0.jpg"],
    specs: new Map([
      ["Processor", "Intel Core i5 (11th Gen)"],
      ["RAM", "16GB"],
      ["Storage", "256GB SSD"],
      ["Operating System", "Windows 11 Professional"],
      ["Warranty", "3 Months"],
    ]),
    stock: 5,
    featured: true,
  },
  {
    name: "HP EliteBook 8440p",
    slug: "hp-elitebook-8440p",
    description: "Ideal for office work, online learning, home & admin use. Professionally refurbished with charger included.",
    price: 3000,
    originalPrice: 7000,
    category: "Laptops",
    condition: "Refurbished",
    brand: "HP",
    images: ["/impact/evp/laptops1.jpg"],
    specs: new Map([
      ["Processor", "Intel Core i5"],
      ["RAM", "4GB"],
      ["Storage", "500GB HDD"],
      ["Operating System", "Windows Installed"],
      ["Warranty", "3 Months"],
    ]),
    stock: 8,
    featured: true,
  },
  {
    name: "iPhone X 64GB",
    slug: "iphone-x-64gb",
    description: "The original edge-to-edge iPhone. Brand new, sealed unit at an unbeatable price.",
    price: 4300,
    category: "Phones",
    condition: "New",
    brand: "Apple",
    images: ["/impact/evp/phones-1.jpg"],
    specs: new Map([
      ["Display", '5.8" Super Retina OLED'],
      ["Processor", "A11 Bionic"],
      ["Storage", "64GB"],
      ["Face ID", "Yes"],
    ]),
    stock: 3,
    featured: false,
  },
  {
    name: "iPhone 11 128GB",
    slug: "iphone-11-128gb",
    description: "Dual-camera system, all-day battery life, and the powerful A13 Bionic chip. Brand new.",
    price: 5600,
    category: "Phones",
    condition: "New",
    brand: "Apple",
    images: ["/impact/evp/phones-2.jpg"],
    specs: new Map([
      ["Display", '6.1" Liquid Retina HD'],
      ["Processor", "A13 Bionic"],
      ["Storage", "128GB"],
      ["Camera", "Dual 12MP"],
    ]),
    stock: 5,
    featured: true,
  },
  {
    name: "iPhone 12 64GB",
    slug: "iphone-12-64gb",
    description: "5G-capable with Ceramic Shield front cover and A14 Bionic chip. Brand new in box.",
    price: 5600,
    category: "Phones",
    condition: "New",
    brand: "Apple",
    images: ["/impact/evp/phones-3.jpg"],
    specs: new Map([
      ["Display", '6.1" Super Retina XDR'],
      ["Processor", "A14 Bionic"],
      ["Storage", "64GB"],
      ["5G", "Yes"],
    ]),
    stock: 4,
    featured: true,
  },
  {
    name: "iPhone 12 Pro 128GB",
    slug: "iphone-12-pro-128gb",
    description: "Pro camera system with LiDAR scanner. Surgical-grade stainless steel design. Brand new.",
    price: 9100,
    category: "Phones",
    condition: "New",
    brand: "Apple",
    images: ["/impact/evp/phones-1.jpg"],
    specs: new Map([
      ["Display", '6.1" Super Retina XDR'],
      ["Processor", "A14 Bionic"],
      ["Storage", "128GB"],
      ["Camera", "Triple 12MP + LiDAR"],
    ]),
    stock: 2,
    featured: true,
  },
  {
    name: "iPhone 13 128GB",
    slug: "iphone-13-128gb",
    description: "Cinematic Mode, advanced dual-camera system, and A15 Bionic chip. Brand new.",
    price: 9000,
    category: "Phones",
    condition: "New",
    brand: "Apple",
    images: ["/impact/evp/phones-2.jpg"],
    specs: new Map([
      ["Display", '6.1" Super Retina XDR'],
      ["Processor", "A15 Bionic"],
      ["Storage", "128GB"],
      ["Battery", "Up to 19 hours video"],
    ]),
    stock: 4,
    featured: true,
  },
  {
    name: "iPhone 14 128GB",
    slug: "iphone-14-128gb",
    description: "Emergency SOS via satellite, Crash Detection, and an upgraded camera system. Brand new.",
    price: 11700,
    category: "Phones",
    condition: "New",
    brand: "Apple",
    images: ["/impact/evp/phones-3.jpg"],
    specs: new Map([
      ["Display", '6.1" Super Retina XDR'],
      ["Processor", "A15 Bionic"],
      ["Storage", "128GB"],
      ["Camera", "Dual 12MP Advanced"],
    ]),
    stock: 2,
    featured: true,
  },
  {
    name: "Samsung Galaxy S23",
    slug: "samsung-galaxy-s23",
    description: "Flagship Samsung phone with stunning display, powerful camera system, and all-day battery life.",
    price: 9500,
    originalPrice: 15000,
    category: "Phones",
    condition: "Refurbished",
    brand: "Samsung",
    images: ["/impact/evp/phones-1.jpg"],
    specs: new Map([
      ["Display", '6.1" Dynamic AMOLED'],
      ["Processor", "Snapdragon 8 Gen 2"],
      ["RAM", "8GB"],
      ["Storage", "128GB"],
      ["Battery", "3900mAh"],
    ]),
    stock: 12,
    featured: false,
  },
  {
    name: "iPad 9th Generation",
    slug: "ipad-9th-gen",
    description: "Perfect for students and professionals. Great for note-taking, browsing, and light productivity.",
    price: 5500,
    originalPrice: 8500,
    category: "Tablets",
    condition: "Refurbished",
    brand: "Apple",
    images: ["/impact/evp/tablets1.jpg"],
    specs: new Map([
      ["Display", '10.2" Retina'],
      ["Processor", "A13 Bionic"],
      ["Storage", "64GB"],
      ["Connectivity", "Wi-Fi"],
      ["Battery", "Up to 10 hours"],
    ]),
    stock: 4,
    featured: false,
  },
  {
    name: "Samsung Galaxy Tab A8",
    slug: "samsung-galaxy-tab-a8",
    description: "Versatile Android tablet for entertainment, online learning, and everyday use.",
    price: 3200,
    originalPrice: 5000,
    category: "Tablets",
    condition: "Refurbished",
    brand: "Samsung",
    images: ["/impact/evp/tablets2.jpg"],
    specs: new Map([
      ["Display", '10.5" TFT LCD'],
      ["Processor", "Unisoc T618"],
      ["RAM", "4GB"],
      ["Storage", "64GB"],
      ["Battery", "7040mAh"],
    ]),
    stock: 7,
    featured: false,
  },
  {
    name: "Lenovo ThinkPad T480",
    slug: "lenovo-thinkpad-t480",
    description: "Business-class laptop built for reliability. Excellent keyboard, solid build quality, and great battery life.",
    price: 6500,
    originalPrice: 12000,
    category: "Laptops",
    condition: "Refurbished",
    brand: "Lenovo",
    images: ["/impact/evp/laptops2.jpg"],
    specs: new Map([
      ["Processor", "Intel Core i5 (8th Gen)"],
      ["RAM", "8GB"],
      ["Storage", "256GB SSD"],
      ["Operating System", "Windows 11 Professional"],
      ["Warranty", "3 Months"],
    ]),
    stock: 3,
    featured: true,
  },
  {
    name: "Universal Laptop Charger 65W",
    slug: "universal-laptop-charger-65w",
    description: "Compatible with most Dell, HP, and Lenovo laptops. Multiple connector tips included.",
    price: 350,
    category: "Accessories",
    condition: "New",
    brand: "Generic",
    images: ["/impact/evp/accessories1.jpg"],
    specs: new Map([
      ["Wattage", "65W"],
      ["Compatibility", "Dell, HP, Lenovo"],
      ["Cable Length", "1.8m"],
      ["Tips Included", "5"],
    ]),
    stock: 25,
    featured: false,
  },
  {
    name: "Wireless Mouse & Keyboard Combo",
    slug: "wireless-mouse-keyboard-combo",
    description: "Ergonomic wireless mouse and keyboard set. Perfect for your home office or workstation setup.",
    price: 450,
    category: "Accessories",
    condition: "New",
    brand: "Logitech",
    images: ["/impact/evp/accessories2.jpg"],
    specs: new Map([
      ["Connectivity", "2.4GHz Wireless"],
      ["Battery", "AA Batteries (included)"],
      ["Range", "Up to 10m"],
      ["Compatibility", "Windows, macOS, Linux"],
    ]),
    stock: 15,
    featured: false,
  },
  {
    name: "Laptop Sleeve 15.6 inch",
    slug: "laptop-sleeve-15-inch",
    description: "Padded laptop sleeve with water-resistant exterior. Fits most 15.6-inch laptops.",
    price: 250,
    category: "Accessories",
    condition: "New",
    brand: "Generic",
    images: ["/impact/evp/accessories3.jpg"],
    specs: new Map([
      ["Size", '15.6"'],
      ["Material", "Neoprene"],
      ["Water Resistant", "Yes"],
      ["Pockets", "1 front pocket"],
    ]),
    stock: 20,
    featured: false,
  },
  {
    name: "TP-Link 24-Port Gigabit Switch",
    slug: "tp-link-24-port-gigabit-switch",
    description: "Rack-mountable gigabit switch for small offices, labs, and branch network expansion. Suitable for structured cabling and workstation rollouts.",
    price: 1850,
    originalPrice: 2600,
    category: "IT Hardware",
    condition: "New",
    brand: "TP-Link",
    images: ["/impact/evp/accessories2.jpg"],
    specs: new Map([
      ["Ports", "24 x Gigabit Ethernet"],
      ["Mounting", "Rack or desktop"],
      ["Use Case", "Office networking"],
      ["Warranty", "Supplier warranty"],
    ]),
    stock: 9,
    featured: true,
  },
  {
    name: "APC Back-UPS 1200VA",
    slug: "apc-back-ups-1200va",
    description: "Backup power protection for workstations, routers, switches, and small office equipment during outages and voltage dips.",
    price: 2400,
    originalPrice: 3200,
    category: "IT Hardware",
    condition: "New",
    brand: "APC",
    images: ["/impact/evp/laptops3.jpg"],
    specs: new Map([
      ["Capacity", "1200VA"],
      ["Output", "Battery backup and surge protection"],
      ["Use Case", "Workstations and network cabinets"],
      ["Warranty", "Supplier warranty"],
    ]),
    stock: 6,
    featured: false,
  },
  {
    name: "ZKTeco Biometric Access Terminal",
    slug: "zkteco-biometric-access-terminal",
    description: "Fingerprint and card-based access terminal for offices, storerooms, and controlled-entry points.",
    price: 3100,
    originalPrice: 4300,
    category: "Security & Access Control",
    condition: "New",
    brand: "ZKTeco",
    images: ["/impact/mdm.jpg"],
    specs: new Map([
      ["Authentication", "Fingerprint, card, PIN"],
      ["Connectivity", "TCP/IP"],
      ["Use Case", "Door access control"],
      ["Users", "Up to 3000 templates"],
    ]),
    stock: 5,
    featured: true,
  },
  {
    name: "Hikvision 4MP IP Dome Camera",
    slug: "hikvision-4mp-ip-dome-camera",
    description: "Indoor/outdoor IP dome camera for workplace surveillance, entrances, reception areas, and stock rooms.",
    price: 1450,
    originalPrice: 2100,
    category: "Security & Access Control",
    condition: "New",
    brand: "Hikvision",
    images: ["/impact/evp/accessories3.jpg"],
    specs: new Map([
      ["Resolution", "4MP"],
      ["Lens", "Wide-angle dome"],
      ["Connectivity", "PoE IP camera"],
      ["Use Case", "Business surveillance"],
    ]),
    stock: 12,
    featured: false,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log("Cleared existing data");

    // Seed products
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Admin",
      email: "admin@impactholdings.co.za",
      password: hashedPassword,
      role: "admin",
    });
    console.log("Created admin user (admin@impactholdings.co.za / admin123)");

    await mongoose.disconnect();
    console.log("Seed complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
