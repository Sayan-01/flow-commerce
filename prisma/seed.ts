import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

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
      name: "Sayan Merchant Admin",
      email: "merchant@flowcommerce.dev",
      storeName: "Flow Commerce Electronics & Tech",
    },
  });
  console.log(`✅ Created Merchant: ${merchant.storeName} (${merchant.id})`);

  // 2. Create Demo Customer
  const customer = await prisma.user.create({
    data: {
      name: "Alex Dev",
      email: "alex.shopper@example.com",
      role: "CUSTOMER",
    },
  });
  console.log(`✅ Created Demo Customer: ${customer.name} (${customer.id})`);

  // 3. Seed 16 Products across 4 Core Categories
  const products = [
    // Category 1: Laptops
    {
      merchantId: merchant.id,
      name: "ZenithBook Pro 14 (M3 Max / 32GB / 1TB)",
      description: "Flagship developer ultrabook with 14.2-inch Liquid OLED display, all-day 18hr battery, and supreme multi-core compile speeds.",
      price: 149999,
      category: "Laptops",
      tags: ["laptop", "developer", "flagship", "high-end", "portable"],
      stock: 12,
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "DevStudio Creator 16 (Core i7 / 16GB / 512GB)",
      description: "Workhorse laptop designed for programming, full-stack development, and 4K creative workflows with dedicated RTX 4060 graphics.",
      price: 84999,
      category: "Laptops",
      tags: ["laptop", "programming", "creator", "coding", "gaming"],
      stock: 18,
      imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "SwiftAir 13 Ultralight (Ryzen 5 / 16GB / 512GB)",
      description: "Ultra-portable 1.1kg aluminum laptop ideal for college students, lightweight coding, and remote work on a budget.",
      price: 54999,
      category: "Laptops",
      tags: ["laptop", "budget", "under-60k", "student", "lightweight", "portable"],
      stock: 25,
      imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "CodeCraft Book 15 (Core i5 / 16GB / 512GB SSD)",
      description: "Balanced developer laptop under ₹60k featuring high-refresh anti-glare display, backlit mechanical-feel keyboard, and dual NVMe slots.",
      price: 58999,
      category: "Laptops",
      tags: ["laptop", "budget", "under-60k", "programming", "student"],
      stock: 15,
      imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
    },

    // Category 2: Keyboards & Mice
    {
      merchantId: merchant.id,
      name: "ApexFlow Pro Wireless Mechanical Keyboard (Brown Switches)",
      description: "75% compact wireless mechanical keyboard with hot-swappable switches, PBT keycaps, gasket mount, and multi-device Bluetooth/2.4G.",
      price: 4999,
      category: "Keyboards & Mice",
      tags: ["keyboard", "mechanical", "wireless", "developer", "accessory", "complementary-laptop"],
      stock: 40,
      imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "ErgoGlide Precision Wireless Mouse",
      description: "Ergonomic vertical wireless mouse with ultra-low latency optical sensor, customizable thumb gesture buttons, and quiet clicks.",
      price: 2499,
      category: "Keyboards & Mice",
      tags: ["mouse", "ergonomic", "wireless", "productivity", "complementary-laptop"],
      stock: 50,
      imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "HyperStrike RGB Low-Profile Mechanical Keyboard (Red Switches)",
      description: "Ultra-slim CNC aluminum mechanical keyboard with linear quiet switches and custom RGB per-key backlighting.",
      price: 6499,
      category: "Keyboards & Mice",
      tags: ["keyboard", "mechanical", "gaming", "low-profile", "complementary-laptop"],
      stock: 20,
      imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "DeskMatrix Extended Wool Felt Desk Mat",
      description: "900x400mm premium water-resistant wool desk mat providing smooth mouse gliding and desk surface protection.",
      price: 1299,
      category: "Keyboards & Mice",
      tags: ["desk-mat", "desk-accessory", "aesthetic", "complementary-keyboard"],
      stock: 60,
      imageUrl: "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=800&auto=format&fit=crop&q=80",
    },

    // Category 3: Audio & Communication
    {
      merchantId: merchant.id,
      name: "AcousticPulse ANC Over-Ear Headphones",
      description: "Hybrid Active Noise Cancelling headphones with 40mm beryllium drivers, 45hr battery life, and studio-grade call clarity.",
      price: 8999,
      category: "Audio",
      tags: ["headphones", "anc", "wireless", "audio", "noise-cancelling", "complementary-laptop"],
      stock: 30,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "SonicPro True Wireless Earbuds with ANC",
      description: "Pocket-sized TWS earbuds with transparency mode, IPX5 water resistance, and fast wireless Qi charging case.",
      price: 3999,
      category: "Audio",
      tags: ["earbuds", "tws", "audio", "portable", "wireless"],
      stock: 45,
      imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "StreamCast Studio USB-C Condenser Microphone",
      description: "Cardioid condenser studio mic with built-in pop filter, zero-latency headphone monitoring, and tap-to-mute sensor.",
      price: 4499,
      category: "Audio",
      tags: ["microphone", "streaming", "calls", "audio", "podcasting"],
      stock: 22,
      imageUrl: "https://images.unsplash.com/photo-1590658006821-04f4008d5717?w=800&auto=format&fit=crop&q=80",
    },

    // Category 4: Accessories & Power
    {
      merchantId: merchant.id,
      name: "OmniPower 100W GaN Fast Charger (3x USB-C, 1x USB-A)",
      description: "Next-gen Gallium Nitride multi-port fast charger capable of powering high-demand laptops, phones, and tablets simultaneously.",
      price: 2999,
      category: "Accessories",
      tags: ["charger", "gan", "power", "fast-charging", "complementary-laptop"],
      stock: 75,
      imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "HyperHub 8-in-1 Dual 4K HDMI USB-C Dock",
      description: "Aluminum USB-C hub with dual 4K@60Hz HDMI, 100W Power Delivery pass-through, SD card reader, and Gigabit Ethernet.",
      price: 3499,
      category: "Accessories",
      tags: ["hub", "dock", "usb-c", "monitor", "complementary-laptop"],
      stock: 35,
      imageUrl: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "TurboVault 1TB Portable NVMe USB 3.2 Gen2 SSD",
      description: "Pocket-sized 1050MB/s rugged external solid state drive with hardware encryption for seamless backup and dev environments.",
      price: 6999,
      category: "Accessories",
      tags: ["ssd", "storage", "nvme", "backup", "complementary-laptop"],
      stock: 28,
      imageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "FlexiStand Aluminum Ergonomic Laptop Riser",
      description: "Heavy-duty foldable aluminum laptop stand with hollow heat dissipation design and adjustable height settings.",
      price: 1899,
      category: "Accessories",
      tags: ["stand", "ergonomic", "desk-accessory", "complementary-laptop"],
      stock: 50,
      imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80",
    },
    {
      merchantId: merchant.id,
      name: "ArmorShield 14-16 inch Waterproof Laptop Sleeve",
      description: "Shock-absorbing memory foam inner padded sleeve with water-resistant polyester exterior and front accessory pouch.",
      price: 1199,
      category: "Accessories",
      tags: ["sleeve", "bag", "protection", "case", "complementary-laptop"],
      stock: 80,
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80",
    },
  ];

  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    });
    console.log(`📦 Seeded product: ${created.name} (₹${created.price}) [${created.category}]`);
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
      reason: "Initial catalog seeded with 16 demo tech products across 4 categories",
    },
  });

  console.log("\n🎉 Database seeded successfully with 16 products!");
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
