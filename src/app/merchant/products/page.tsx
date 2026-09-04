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
  if (!session?.user?.id || session.user.role !== "MERCHANT") {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-zinc-950 px-4 py-16 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center space-y-3 max-w-md p-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-2xl">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">🛡️</div>
          <h1 className="text-xl font-bold text-white">Merchant Access Required</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Please log in with a verified Merchant account to access your store&apos;s live audit trail, guardrails log, and AI-attributed revenue ledger.
          </p>
        </div>
      </div>
    );
  }
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
    <div className="min-h-screen ">
      <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8">
        <ProductsManager initialProducts={formattedProducts} />
      </div>
    </div>
  );
}
