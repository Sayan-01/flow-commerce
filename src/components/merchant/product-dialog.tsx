"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MerchantProduct, ProductFormData } from "./types"
import { Loader2, Plus, Sparkles } from "lucide-react"

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: MerchantProduct | null
  onSave: (data: ProductFormData) => Promise<boolean>
}

const CATEGORY_SUGGESTIONS = [
  "Laptops",
  "Keyboards & Mice",
  "Audio",
  "Accessories",
  "Monitors",
  "Wearables",
]

export function ProductDialog({
  open,
  onOpenChange,
  product,
  onSave,
}: ProductDialogProps) {
  const isEditing = Boolean(product)

  const [name, setName] = useState("")
  const [category, setCategory] = useState("Laptops")
  const [customCategory, setCustomCategory] = useState("")
  const [price, setPrice] = useState<string>("")
  const [stock, setStock] = useState<string>("")
  const [description, setDescription] = useState("")
  const [tagsInput, setTagsInput] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (product) {
      setName(product.name)
      if (CATEGORY_SUGGESTIONS.includes(product.category)) {
        setCategory(product.category)
        setCustomCategory("")
      } else {
        setCategory("Custom")
        setCustomCategory(product.category)
      }
      setPrice(product.price.toString())
      setStock(product.stock.toString())
      setDescription(product.description)
      setTagsInput(product.tags ? product.tags.join(", ") : "")
      setImageUrl(product.imageUrl || "")
    } else {
      setName("")
      setCategory("Laptops")
      setCustomCategory("")
      setPrice("")
      setStock("10")
      setDescription("")
      setTagsInput("")
      setImageUrl("")
    }
    setErrorMessage(null)
  }, [product, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!name.trim()) {
      setErrorMessage("Product name is required")
      return
    }

    const finalCategory = category === "Custom" ? customCategory.trim() : category.trim()
    if (!finalCategory) {
      setErrorMessage("Category is required")
      return
    }

    const numPrice = Number(price)
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage("Price must be a valid positive amount")
      return
    }

    const numStock = Number(stock)
    if (isNaN(numStock) || numStock < 0) {
      setErrorMessage("Stock must be a non-negative number")
      return
    }

    if (!description.trim()) {
      setErrorMessage("Description is required")
      return
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0)

    setIsSubmitting(true)

    try {
      const success = await onSave({
        name: name.trim(),
        category: finalCategory,
        price: Math.round(numPrice),
        stock: Math.round(numStock),
        description: description.trim(),
        tags,
        imageUrl: imageUrl.trim() || undefined,
      })

      if (success) {
        onOpenChange(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save product")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update product pricing, inventory counts, or description."
              : "Create a new catalog item that the AI Shopping Agent can search and recommend."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Product Name <span className="text-red-400">*</span>
            </label>
            <Input
              placeholder="e.g. UltraBook Pro 15 M3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Category <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {CATEGORY_SUGGESTIONS.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => {
                    setCategory(cat)
                    setCustomCategory("")
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    category === cat
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCategory("Custom")}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  category === "Custom"
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                + Custom
              </button>
            </div>

            {category === "Custom" && (
              <Input
                placeholder="Enter custom category name"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
                className="mt-2"
              />
            )}
          </div>

          {/* Price & Stock Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Price (INR ₹) <span className="text-red-400">*</span>
              </label>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 59999"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Stock Quantity <span className="text-red-400">*</span>
              </label>
              <Input
                type="number"
                min="0"
                placeholder="e.g. 20"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Description <span className="text-red-400">*</span>
            </label>
            <Textarea
              placeholder="Describe specs, target users, and key features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Search Tags <span className="text-zinc-500 font-normal">(comma-separated)</span>
            </label>
            <Input
              placeholder="e.g. laptop, coding, 32gb, ultrabook"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Image URL <span className="text-zinc-500 font-normal">(optional)</span>
            </label>
            <Input
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 text-white hover:bg-indigo-500"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  <span>Saving...</span>
                </>
              ) : isEditing ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
