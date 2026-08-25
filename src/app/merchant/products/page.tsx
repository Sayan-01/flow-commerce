import { prisma } from "@/lib/prisma"
import { ProductsManager, MerchantProduct } from "@/components/merchant"
import { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Merchant Products — FlowCommerce",
  description: "Live product management, stock control, and catalog configuration for FlowCommerce AI.",
}

export default async function MerchantProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ createdAt: "desc" }],
  })

  const formattedProducts: MerchantProduct[] = products.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ProductsManager initialProducts={formattedProducts} />
      </div>
    </div>
  )
}
