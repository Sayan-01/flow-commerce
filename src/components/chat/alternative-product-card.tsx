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
  Monitor,
} from "lucide-react";
import { ProductCardData } from "./product-card";

interface AlternativeProductCardProps {
  product: ProductCardData;
  onAddToCart?: (productId: string) => Promise<void> | void;
  onAskDetails?: (productName: string) => void;
}

export function AlternativeProductCard({
  product,
  onAddToCart,
  onAskDetails,
}: AlternativeProductCardProps) {
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
    if (
      lower.includes("audio") ||
      lower.includes("headphone") ||
      lower.includes("earphone") ||
      lower.includes("earbud") ||
      lower.includes("mic") ||
      lower.includes("sound")
    ) {
      return Headphones;
    }
    return Sparkles;
  };

  const CategoryIcon = getCategoryIcon(product.category);
  const isOutOfStock = product.stock === 0;

  return (
    <div className="group relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 rounded-2xl border border-zinc-800/90 bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-zinc-950 p-3 shadow-md backdrop-blur-md transition-all duration-300 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 w-full">
      {/* Product Image Thumbnail */}
      <div className="relative h-24 w-full sm:w-28 shrink-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        {product.imageUrl && !imgError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-600">
            <CategoryIcon className="h-8 w-8 text-amber-400/60" />
          </div>
        )}

        {/* Category badge overlay on thumbnail */}
        <div className="absolute bottom-1.5 left-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-300 backdrop-blur-sm">
          {product.category}
        </div>
      </div>

      {/* Middle Section: Details & Pricing */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
              <Sparkles className="h-2.5 w-2.5" />
              Similar Match
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {isOutOfStock ? "Out of stock" : `${product.stock} available`}
            </span>
          </div>

          <h4 className="font-bold text-sm text-zinc-100 truncate group-hover:text-amber-300 transition-colors" title={product.name}>
            {product.name}
          </h4>

          <p className="mt-0.5 text-xs text-zinc-400 line-clamp-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-black text-white">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
            Verified Price
          </span>
        </div>
      </div>

      {/* Right Section: Action Buttons */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
        {onAskDetails && (
          <button
            onClick={() => onAskDetails(product.name)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/90 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Ask AI about this product"
          >
            <Info className="h-3.5 w-3.5 text-amber-400" />
            <span>About</span>
          </button>
        )}

        {onAddToCart && (
          <button
            onClick={handleAdd}
            disabled={isAdding || isOutOfStock}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              justAdded
                ? "bg-emerald-600 text-white"
                : isOutOfStock
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500 shadow-md shadow-amber-600/20 active:scale-95"
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
                <span>Add to Cart</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
