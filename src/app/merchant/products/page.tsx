import { prisma } from "@/lib/prisma";
import { ProductsManager, MerchantProduct } from "@/components/merchant";
import { Metadata } from "next";
import { auth } from "../../../../auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Merchant Products — FlowCommerce",
  description: "Live product management, stock control, and catalog configuration for FlowCommerce AI.",
};

export default async function MerchantProductsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "MERCHANT")
    return (
      <div className="min-h-screen bg-zinc-950 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-center ">
          <h1 className="text-2xl font-bold text-white">need merchant acount to view products</h1>
        </div>
      </div>
    );
  const products = await prisma.product.findMany({
    where: {
      merchantId: session.user.id,
    },
    orderBy: [{ createdAt: "desc" }],
  });

  const formattedProducts: MerchantProduct[] = products.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ProductsManager initialProducts={formattedProducts} />
      </div>
    </div>
  );
}
