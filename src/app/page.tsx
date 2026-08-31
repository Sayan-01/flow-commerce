import { prisma } from "@/lib/prisma";

import Showcase from "@/components/home/Showcase"
import TrustStrip from "@/components/home/TrustStrip"
import Principles from "@/components/home/Principles"
import HowItWorks from "@/components/home/HowItWorks"
import Catalog from "@/components/home/Catalog"
import {HeroSection} from "@/components/home/hero-section";
import { InteractiveDemo } from "@/components/home/interactive-demo";
import { AgentWorkflow } from "@/components/home/agent-workflow";
import { CatalogPreview } from "@/components/home/catalog-preview";
import { HomeFooter } from "@/components/home/home-footer";
import { ArchitecturePreview } from "@/components/home/ArchitecturePreview";
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
