import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting FlowCommerce database seed...");

  // Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.merchant.deleteMany();

  // 1. Create Demo Merchant
  const merchant = await prisma.merchant.create({
    data: {
      name: "Ankan Mistry",
      email: "glowren01@gmail.com",
      storeName: "Flow Commerce Electronics & Tech",
    },
  });
  console.log(`✅ Created Merchant: ${merchant.storeName} (${merchant.id})`);

  // 2. Create User linked as Merchant
  const customer = await prisma.user.create({
    data: {
      name: "Ankan Mistry",
      email: "glowren01@gmail.com",
      role: Role.MERCHANT,
    },
  });
  console.log(`✅ Created Merchant User: ${customer.name} (${customer.id})`);

  // 3. Seed 20 Products: 15 items in ₹500-₹4,000 range & 5 items in ₹8,000-₹12,000 range
  const products = [
    // ==========================================
    // Tier 1: 5 Premium Items (₹8,000 - ₹12,000)
    // ==========================================
    {
      merchantId: merchant.id,
      name: "ZenithView 24-inch FHD IPS 100Hz Monitor",
      description: "Ultra-slim bezel 1080p IPS developer monitor with sRGB 99% color accuracy, AMD FreeSync, and eye-care low blue light mode.",
      price: 9999,
      category: "Monitors",
      tags: ["monitor", "display", "developer", "ips", "fhd", "screen"],
      stock: 20,
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "AcousticPulse ANC Studio Pro Wireless Headphones",
      description: "Hybrid Active Noise Cancelling headphones with 40mm beryllium drivers, 45hr battery life, and studio-grade audio clarity.",
      price: 8999,
      category: "Audio",
      tags: ["headphones", "anc", "wireless", "audio", "noise-cancelling", "studio"],
      stock: 30,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "KeyChron Custom Q3 Full Aluminum Mechanical Keyboard",
      description: "CNC machined aluminum gasket-mount keyboard with hot-swappable Gateron Pro switches, RGB backlighting, and QMK/VIA support.",
      price: 10499,
      category: "Keyboards & Mice",
      tags: ["keyboard", "mechanical", "aluminum", "custom", "gasket", "developer"],
      stock: 18,
      imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "DevStation Thunderbolt 4 Quad-Display Docking Station",
      description: "Enterprise 12-in-1 Thunderbolt 4 dock supporting dual 4K@60Hz displays, 100W Power Delivery, SD 4.0, and 2.5Gbps Ethernet.",
      price: 11499,
      category: "Accessories",
      tags: ["dock", "thunderbolt", "hub", "usb-c", "workstation", "power"],
      stock: 15,
      imageUrl: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "StreamMaster 4K 60FPS Pro Streaming Webcam",
      description: "Ultra HD 4K webcam with dual noise-canceling stereo mics, auto-focus HDR, and privacy shutter for crisp meetings and live streaming.",
      price: 8499,
      category: "Audio",
      tags: ["webcam", "camera", "streaming", "4k", "calls", "creator"],
      stock: 25,
      imageUrl: "https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=800&auto=format&fit=crop&q=80",
    },

    // ==========================================
    // Tier 2: 15 Core Items (₹500 - ₹4,000)
    // ==========================================
    {
      merchantId: merchant.id,
      name: "ApexFlow Pro 75% Compact Wireless Mechanical Keyboard",
      description: "75% compact wireless mechanical keyboard with hot-swappable tactile switches, PBT keycaps, and multi-device Bluetooth 5.0.",
      price: 3499,
      category: "Keyboards & Mice",
      tags: ["keyboard", "mechanical", "wireless", "developer", "tactile", "rgb"],
      stock: 45,
      imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "ErgoGlide Precision Vertical Ergonomic Mouse",
      description: "Ergonomic 57-degree natural handshake angle wireless mouse reducing wrist fatigue with silent clicks and thumb scroll wheel.",
      price: 1999,
      category: "Keyboards & Mice",
      tags: ["mouse", "ergonomic", "wireless", "productivity", "silent"],
      stock: 55,
      imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "DeskMatrix Extended Dual-Sided Desk Mat (900x400mm)",
      description: "Spacious waterproof PU leather & felt dual-sided desk protector mat for seamless mouse tracking and clean workspace aesthetics.",
      price: 899,
      category: "Keyboards & Mice",
      tags: ["desk-mat", "mat", "desk-accessory", "aesthetic", "mousepad"],
      stock: 80,
      imageUrl: "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "HyperStrike RGB Silent Gaming Mouse",
      description: "Lightweight 68g honeycomb gaming mouse with 12,000 DPI optical sensor, braided cable, and dynamic RGB lighting.",
      price: 1499,
      category: "Keyboards & Mice",
      tags: ["mouse", "gaming", "rgb", "optical", "lightweight"],
      stock: 40,
      imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "SonicPro True Wireless Earbuds with ENC",
      description: "In-ear TWS earbuds with Environmental Noise Cancellation (ENC), 32hr playtime, IPX5 sweat resistance, and low-latency gaming mode.",
      price: 2499,
      category: "Audio",
      tags: ["earbuds", "tws", "audio", "wireless", "bluetooth", "enc"],
      stock: 60,
      imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "StreamCast Studio USB-C Condenser Microphone",
      description: "Studio cardioid condenser mic with touch tap-to-mute, gain control knob, built-in pop filter, and zero-latency headphone jack.",
      price: 3199,
      category: "Audio",
      tags: ["microphone", "streaming", "calls", "audio", "podcasting", "usb-c"],
      stock: 35,
      imageUrl: "https://images.unsplash.com/photo-1590658006821-04f4008d5717?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "AcousticBar Compact Dual-Driver Desktop Soundbar",
      description: "Sleek under-monitor stereo soundbar with dual passive bass radiators, Bluetooth 5.3, AUX input, and customizable LED accent lighting.",
      price: 1899,
      category: "Audio",
      tags: ["soundbar", "speaker", "desktop", "audio", "stereo", "bluetooth"],
      stock: 30,
      imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "OmniPower 65W GaN Fast Wall Charger",
      description: "Compact GaN III fast charger with 2x USB-C Power Delivery and 1x USB-A QC 4.0 ports for fast charging laptops and phones.",
      price: 1999,
      category: "Accessories",
      tags: ["charger", "gan", "power", "fast-charging", "usb-c"],
      stock: 90,
      imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "HyperHub 7-in-1 4K HDMI USB-C Multiport Hub",
      description: "Aircraft aluminum USB-C hub featuring 4K@60Hz HDMI, 100W PD pass-through charging, 3x USB 3.0 ports, and SD/TF card reader.",
      price: 2299,
      category: "Accessories",
      tags: ["hub", "usb-c", "adapter", "hdmi", "dongle", "accessories"],
      stock: 50,
      imageUrl: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "ArmorShield Waterproof Padded Laptop Sleeve (14-16 inch)",
      description: "Shockproof memory foam padded laptop case with water-repellent exterior fabric and dedicated zippered front accessory organizer.",
      price: 799,
      category: "Accessories",
      tags: ["sleeve", "bag", "protection", "case", "laptop-sleeve"],
      stock: 100,
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "FlexiStand Ergonomic Foldable Aluminum Laptop Riser",
      description: "Sturdy foldable aluminum laptop stand with anti-slip silicone pads and 6-level angle adjustment for ergonomic cooling and posture.",
      price: 1299,
      category: "Accessories",
      tags: ["stand", "laptop-stand", "ergonomic", "aluminum", "riser"],
      stock: 70,
      imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "LumiBar Screen-Mounted Eye-Care Monitor Light Bar",
      description: "Asymmetric optical monitor lamp with touch brightness dimmer, 3 color temperatures, USB-powered, and zero screen glare.",
      price: 2199,
      category: "Accessories",
      tags: ["light-bar", "lamp", "desk-lamp", "monitor-light", "eye-care"],
      stock: 40,
      imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "VoltBeam 15W Qi Magnetic Fast Wireless Charger",
      description: "Ultra-thin aluminum alloy Qi fast wireless charger with intelligent temperature control and magnetic snap alignment.",
      price: 999,
      category: "Accessories",
      tags: ["wireless-charger", "qi", "magnetic", "fast-charging", "power"],
      stock: 65,
      imageUrl: "https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "CableNest 10-Pack Magnetic Silicone Cable Organizers",
      description: "Premium magnetic cable clips with reusable adhesive backing to keep desktop charging cables neatly routed and tangle-free.",
      price: 499,
      category: "Accessories",
      tags: ["cable-organizer", "clips", "desk-accessory", "cable-management"],
      stock: 120,
      imageUrl: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "AirBreeze Silent Dual-Fan USB Laptop Cooling Pad",
      description: "Aerodynamic metal mesh laptop cooling pad with twin ultra-quiet 140mm blue LED fans and dual USB pass-through ports.",
      price: 1199,
      category: "Accessories",
      tags: ["cooling-pad", "cooler", "laptop-fan", "usb", "accessories"],
      stock: 50,
      imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
    },
  ];

  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    });
    console.log(`📦 Seeded: ${created.name} (₹${created.price}) [${created.category}]`);
  }

  // 4. Initial Audit Log entry
  await prisma.auditLog.create({
    data: {
      merchantId: merchant.id,
      actor: "SYSTEM",
      action: "CATALOG_SEED",
      entityType: "CATALOG",
      payload: JSON.stringify({ productCount: products.length }),
      status: "SUCCESS",
      reason: "Initial catalog seeded with 20 demo tech products across affordable and premium tiers",
    },
  });

  console.log(`\n🎉 Database successfully seeded with ${products.length} products!`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
