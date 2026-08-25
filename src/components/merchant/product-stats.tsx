import React from "react"
import { Package, Boxes, AlertTriangle, IndianRupee } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ProductStatsData } from "./types"

interface ProductStatsProps {
  stats: ProductStatsData
}

export function ProductStats({ stats }: ProductStatsProps) {
  const statItems = [
    {
      title: "Total Products",
      value: stats.totalProducts.toString(),
      description: "Active catalog listings",
      icon: Package,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Available Stock",
      value: stats.totalStock.toLocaleString("en-IN"),
      description: "Total units across warehouse",
      icon: Boxes,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Low Stock Alert",
      value: stats.lowStockCount.toString(),
      description: "Items with ≤ 5 units left",
      icon: AlertTriangle,
      color: stats.lowStockCount > 0 ? "text-amber-400" : "text-zinc-400",
      bg: stats.lowStockCount > 0 ? "bg-amber-500/10 border-amber-500/20" : "bg-zinc-800 border-zinc-700",
    },
    {
      title: "Catalog Value",
      value: `₹${stats.totalCatalogValue.toLocaleString("en-IN")}`,
      description: "Inventory retail valuation",
      icon: IndianRupee,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon
        return (
          <Card key={index} className="border-zinc-800 bg-zinc-900/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">
                  {item.title}
                </span>
                <div className={`p-2 rounded-xl border ${item.bg}`}>
                  <Icon className={`h-4 w-4 ${item.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold tracking-tight text-white">
                  {item.value}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  {item.description}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
