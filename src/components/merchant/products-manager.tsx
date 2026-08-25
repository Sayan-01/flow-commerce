"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { ProductStats } from "./product-stats"
import { ProductTable } from "./product-table"
import { ProductDialog } from "./product-dialog"
import { MerchantProduct, ProductFormData, ProductStatsData } from "./types"
import { Plus, Store, Sparkles, RefreshCw } from "lucide-react"

interface ProductsManagerProps {
  initialProducts: MerchantProduct[]
}

export function ProductsManager({ initialProducts }: ProductsManagerProps) {
  const [products, setProducts] = useState<MerchantProduct[]>(initialProducts)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<MerchantProduct | null>(null)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Calculate live dynamic metrics
  const stats: ProductStatsData = {
    totalProducts: products.filter((p) => p.isActive).length,
    totalStock: products.reduce((acc, p) => acc + (p.isActive ? p.stock : 0), 0),
    lowStockCount: products.filter((p) => p.isActive && p.stock > 0 && p.stock <= 5).length,
    totalCatalogValue: products.reduce((acc, p) => acc + (p.isActive ? p.price * p.stock : 0), 0),
  }

  // Open create dialog
  const handleOpenAddDialog = () => {
    setEditingProduct(null)
    setIsDialogOpen(true)
  }

  // Open edit dialog
  const handleOpenEditDialog = (product: MerchantProduct) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  // Handle Save (Create or Update)
  const handleSaveProduct = async (formData: ProductFormData): Promise<boolean> => {
    if (editingProduct) {
      // Update existing
      try {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        const data = await res.json()

        if (!data.success) {
          throw new Error(data.error || "Failed to update product")
        }

        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? data.product : p))
        )
        showToast(`Updated "${data.product.name}" successfully!`)
        return true
      } catch (err: any) {
        showToast(err.message, "error")
        return false
      }
    } else {
      // Create new
      try {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        const data = await res.json()

        if (!data.success) {
          throw new Error(data.error || "Failed to create product")
        }

        setProducts((prev) => [data.product, ...prev])
        showToast(`Created "${data.product.name}" successfully!`)
        return true
      } catch (err: any) {
        showToast(err.message, "error")
        return false
      }
    }
  }

  // Quick inline stock updater
  const handleUpdateStock = async (id: string, newStock: number) => {
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
    )

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      })
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to update stock")
      }
    } catch (err: any) {
      showToast(err.message, "error")
      // Revert from server
      const refresh = await fetch("/api/products")
      const refreshedData = await refresh.json()
      if (refreshedData.success) {
        setProducts(refreshedData.products)
      }
    }
  }

  // Toggle active status
  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    const nextActive = !currentActive
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: nextActive } : p))
    )

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextActive }),
      })
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to toggle status")
      }
      showToast(
        nextActive
          ? `Product activated and visible to AI agent`
          : `Product deactivated from AI shopping catalog`
      )
    } catch (err: any) {
      showToast(err.message, "error")
    }
  }

  // Deactivate product
  const handleDelete = async (id: string) => {
    const target = products.find((p) => p.id === id)
    if (!target) return

    const confirmDeactivate = window.confirm(
      `Are you sure you want to deactivate "${target.name}"? It will no longer appear in the AI shopping recommendations.`
    )
    if (!confirmDeactivate) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to deactivate product")
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: false } : p))
      )
      showToast(`Deactivated "${target.name}"`)
    } catch (err: any) {
      showToast(err.message, "error")
    }
  }

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur-md transition-all border animate-in slide-in-from-bottom-5 ${
            toastMessage.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-500/10"
              : "bg-red-950/90 border-red-500/40 text-red-200 shadow-red-500/10"
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-sm mb-2">
            <Store className="h-3.5 w-3.5" />
            <span>Merchant Inventory Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Product Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Control real-time catalog items, prices, and stock limits queried by the AI Shopping Agent.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleOpenAddDialog}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-blue-500 transition-all"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Add New Product</span>
          </Button>
        </div>
      </div>

      {/* Overview Stats Bar */}
      <ProductStats stats={stats} />

      {/* Main Interactive Table */}
      <ProductTable
        products={products}
        onEdit={handleOpenEditDialog}
        onDelete={handleDelete}
        onUpdateStock={handleUpdateStock}
        onToggleStatus={handleToggleStatus}
      />

      {/* Add / Edit Modal */}
      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  )
}
