import { prisma } from "@/lib/prisma";
import { HeroSection, ArchitecturePillars, InteractiveDemo, AgentWorkflow, CatalogPreview, HomeFooter } from "@/components/home";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ stock: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100 selection:bg-indigo-500 selection:text-white">
      {/* 1. Hero Section (RSC) */}
      <HeroSection />

      {/* 2. Enterprise Safety Pillars (RSC) */}
      <ArchitecturePillars />

      {/* 3. Interactive Bounded Flow Simulation (Client Component) */}
      <InteractiveDemo />

      {/* 4. 5-Phase Agent Workflow Pipeline (RSC) */}
      <AgentWorkflow />

      {/* 5. Live Product Inventory Catalog (Client Interactive with Server-Loaded Data) */}
      <CatalogPreview initialProducts={products} />

      {/* 6. Footer (RSC) */}
      <HomeFooter />
    </div>
  );
}
