"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  Laptop,
  Keyboard,
  Headphones,
  Sparkles,
  Check,
  Loader2,
  Info,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ProductCardData {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags?: string[];
  stock: number;
  imageUrl?: string | null;
}

interface ProductCardProps {
  product: ProductCardData;
  onAddToCart?: (productId: string) => Promise<void> | void;
  onAskDetails?: (productName: string) => void;
}

export function ProductCard({
  product,
  onAddToCart,
  onAskDetails,
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAddToCart || isAdding || product.stock <= 0) return;

    setIsAdding(true);
    try {
      await onAddToCart(product.id);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2500);
    } finally {
      setIsAdding(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    const lower = cat.toLowerCase();
    if (lower.includes("laptop")) return Laptop;
    if (lower.includes("keyboard") || lower.includes("mouse")) return Keyboard;
    if (lower.includes("audio") || lower.includes("headphone")) return Headphones;
    return Sparkles;
  };

  const CategoryIcon = getCategoryIcon(product.category);
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-950/90 p-3.5 shadow-lg backdrop-blur-md transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/90 hover:shadow-xl">
      <div>
        {/* Header / Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <CategoryIcon className="h-3.5 w-3.5" />
            </div>
            <span className="text-[10px] font-semibold text-zinc-300">
              {product.category}
            </span>
          </div>

          {/* Stock Indicator */}
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              isOutOfStock
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : isLowStock
                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isOutOfStock
                  ? "bg-red-400"
                  : isLowStock
                  ? "bg-amber-400 animate-pulse"
                  : "bg-emerald-400"
              }`}
            />
            {isOutOfStock ? "Out of Stock" : isLowStock ? `${product.stock} left` : `${product.stock} in stock`}
          </span>
        </div>

        {/* Title */}
        <h4 className="font-bold text-sm text-zinc-100 line-clamp-1 group-hover:text-indigo-300 transition-colors">
          {product.name}
        </h4>

        {/* Description */}
        <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 text-[9px] font-mono text-zinc-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Pricing & Actions */}
      <div className="mt-3.5 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between gap-2">
        <div>
          <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">
            Price
          </span>
          <span className="text-sm font-extrabold text-white">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onAskDetails && (
            <button
              onClick={() => onAskDetails(product.name)}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
              title="Ask AI more about this"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          )}

          {onAddToCart && (
            <button
              onClick={handleAdd}
              disabled={isAdding || isOutOfStock}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                justAdded
                  ? "bg-emerald-600 text-white"
                  : isOutOfStock
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-600/20 active:scale-95"
              }`}
            >
              {isAdding ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : justAdded ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Add</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
