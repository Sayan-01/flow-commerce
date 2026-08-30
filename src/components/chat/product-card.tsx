"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Laptop,
  Keyboard,
  Headphones,
  Sparkles,
  Check,
  Loader2,
  Info,
  Monitor,
  Package,
} from "lucide-react";

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
  const [imgError, setImgError] = useState(false);

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
    const lower = (cat || "").toLowerCase();
    if (lower.includes("laptop")) return Laptop;
    if (lower.includes("monitor") || lower.includes("display")) return Monitor;
    if (lower.includes("keyboard") || lower.includes("mouse")) return Keyboard;
    if (lower.includes("audio") || lower.includes("headphone") || lower.includes("mic") || lower.includes("sound")) return Headphones;
    return Sparkles;
  };

  const CategoryIcon = getCategoryIcon(product.category);
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-indigo-500/40 hover:bg-zinc-900/90 hover:shadow-2xl hover:shadow-indigo-500/10">
      {/* Product Image Area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-900 border-b border-zinc-800/80">
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 text-zinc-700">
            <CategoryIcon className="h-12 w-12 opacity-40 text-indigo-400" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-black/30 pointer-events-none" />

        {/* Category Pill on Image */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-zinc-200 backdrop-blur-md border border-white/10">
          <CategoryIcon className="h-3 w-3 text-indigo-400" />
          <span>{product.category}</span>
        </div>

        {/* Stock Badge on Image */}
        <div className="absolute top-2.5 right-2.5">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md border ${
              isOutOfStock
                ? "bg-red-950/80 border-red-500/30 text-red-300"
                : isLowStock
                ? "bg-amber-950/80 border-amber-500/30 text-amber-300"
                : "bg-emerald-950/80 border-emerald-500/30 text-emerald-300"
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
            {isOutOfStock ? "Out of Stock" : isLowStock ? `${product.stock} left` : "In Stock"}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col justify-between flex-1 p-3.5">
        <div>
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
                  className="inline-flex items-center rounded bg-zinc-900 border border-zinc-800/80 px-1.5 py-0.5 text-[9px] font-mono text-zinc-400"
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
            <span className="text-base font-black text-white">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onAskDetails && (
              <button
                onClick={() => onAskDetails(product.name)}
                className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
                title="Ask AI more details"
              >
                <Info className="h-4 w-4" />
              </button>
            )}

            {onAddToCart && (
              <button
                onClick={handleAdd}
                disabled={isAdding || isOutOfStock}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  justAdded
                    ? "bg-emerald-600 text-white"
                    : isOutOfStock
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500 shadow-md shadow-indigo-600/20 active:scale-95"
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
    </div>
  );
}
