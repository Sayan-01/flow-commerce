"use client"

import React, { useState } from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MerchantProduct } from "./types"
import {
  Search,
  Plus,
  Minus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
  AlertTriangle,
} from "lucide-react"

interface ProductTableProps {
  products: MerchantProduct[]
  onEdit: (product: MerchantProduct) => void
  onDelete: (id: string) => Promise<void>
  onUpdateStock: (id: string, newStock: number) => Promise<void>
  onToggleStatus: (id: string, currentActive: boolean) => Promise<void>
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  onUpdateStock,
  onToggleStatus,
}: ProductTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [stockFilter, setStockFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL")
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null)

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))]

  const filteredProducts = products.filter((product) => {
    // Search
    const matchesSearch =
      searchQuery.trim() === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.tags && product.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())))

    // Category
    const matchesCategory =
      categoryFilter === "All" ||
      product.category.toLowerCase() === categoryFilter.toLowerCase()

    // Stock Filter
    let matchesStock = true
    if (stockFilter === "IN_STOCK") matchesStock = product.stock > 0
    if (stockFilter === "LOW_STOCK") matchesStock = product.stock > 0 && product.stock <= 5
    if (stockFilter === "OUT_OF_STOCK") matchesStock = product.stock === 0

    return matchesSearch && matchesCategory && matchesStock
  })

  const handleStockChange = async (id: string, delta: number, currentStock: number) => {
    const nextStock = Math.max(0, currentStock + delta)
    if (nextStock === currentStock) return

    setUpdatingStockId(id)
    try {
      await onUpdateStock(id, nextStock)
    } finally {
      setUpdatingStockId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2.5 flex-1 max-w-2xl">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <Input
              placeholder="Filter by name, description, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-zinc-900/60 border-zinc-800 text-xs h-9"
            />
          </div>

          {/* Stock Filter Selector */}
          <div className="flex rounded-xl bg-zinc-900/60 border border-zinc-800 p-0.5 text-xs">
            <button
              onClick={() => setStockFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                stockFilter === "ALL"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStockFilter("IN_STOCK")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                stockFilter === "IN_STOCK"
                  ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setStockFilter("LOW_STOCK")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                stockFilter === "LOW_STOCK"
                  ? "bg-amber-600/30 text-amber-300 border border-amber-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Low (≤5)
            </button>
            <button
              onClick={() => setStockFilter("OUT_OF_STOCK")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                stockFilter === "OUT_OF_STOCK"
                  ? "bg-red-600/30 text-red-300 border border-red-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Empty
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1 items-center">
          {categories.slice(0, 6).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                categoryFilter === cat
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 overflow-hidden shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 bg-zinc-900/80">
              <TableHead className="w-[300px]">Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead className="w-[180px]">Inventory / Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-zinc-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-sm">No products match the selected filters.</p>
                    {(searchQuery || categoryFilter !== "All" || stockFilter !== "ALL") && (
                      <button
                        onClick={() => {
                          setSearchQuery("")
                          setCategoryFilter("All")
                          setStockFilter("ALL")
                        }}
                        className="text-xs text-indigo-400 hover:underline"
                      >
                        Reset filters
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                const isLowStock = product.stock > 0 && product.stock <= 5
                const isOutOfStock = product.stock === 0
                const isUpdating = updatingStockId === product.id

                return (
                  <TableRow key={product.id} className="border-zinc-800/60 hover:bg-zinc-900/40">
                    {/* Product Name & Details */}
                    <TableCell>
                      <div>
                        <div className="font-semibold text-sm text-zinc-100 line-clamp-1">
                          {product.name}
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                          {product.description}
                        </p>
                        {product.tags && product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {product.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center text-[10px] text-zinc-500 font-mono"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <Badge variant="indigo" className="text-[11px] font-medium">
                        {product.category}
                      </Badge>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <div className="font-bold text-sm text-white">
                        ₹{product.price.toLocaleString("en-IN")}
                      </div>
                    </TableCell>

                    {/* Stock with Quick +/- Inline Stepper */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center rounded-xl border border-zinc-800 bg-zinc-900/90 p-1">
                          <button
                            type="button"
                            disabled={isUpdating || product.stock <= 0}
                            onClick={() => handleStockChange(product.id, -1, product.stock)}
                            className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30 transition-all"
                            title="Decrease stock by 1"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>

                          <span className="w-10 text-center font-mono text-xs font-bold text-white">
                            {product.stock}
                          </span>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStockChange(product.id, +1, product.stock)}
                            className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30 transition-all"
                            title="Increase stock by 1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Stock Badges */}
                        {isOutOfStock ? (
                          <Badge variant="destructive" className="text-[10px]">
                            Out
                          </Badge>
                        ) : isLowStock ? (
                          <Badge variant="warning" className="text-[10px]">
                            Low
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <button
                        onClick={() => onToggleStatus(product.id, product.isActive)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                          product.isActive
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:bg-zinc-700"
                        }`}
                        title="Click to toggle active status"
                      >
                        {product.isActive ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(product)}
                          className="h-8 w-8 p-0 border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800"
                          title="Edit product"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(product.id)}
                          className="h-8 w-8 p-0 border-zinc-800 bg-zinc-900 text-red-400 hover:text-red-300 hover:bg-red-950/40"
                          title="Deactivate product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
