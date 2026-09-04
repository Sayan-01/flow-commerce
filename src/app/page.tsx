import { prisma } from "@/lib/prisma";

import { ArchitecturePreview } from "@/components/home/ArchitecturePreview";
import Catalog from "@/components/home/Catalog";
import { HeroSection } from "@/components/home/hero-section";
import { HomeFooter } from "@/components/home/home-footer";
import HowItWorks from "@/components/home/HowItWorks";
import Principles from "@/components/home/Principles";
import TrustStrip from "@/components/home/TrustStrip";
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ stock: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="relative min-h-screen overflow-hidden  text-zinc-100 selection:bg-indigo-500 selection:text-white">
      <HeroSection />
      <Catalog products={products}/>

      <ArchitecturePreview />
      <TrustStrip />
      <Principles />
      <HowItWorks />

      <HomeFooter />
    </div>
  );
}
