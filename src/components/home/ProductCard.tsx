"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/data/products";
import type { Product as PrismaProduct } from "@prisma/client";
import type { Product as StaticProduct } from "@/data/products";

export type AnyProduct = PrismaProduct | StaticProduct;

interface ProductCardProps {
  product: AnyProduct;
  tag?: string;
}

export default function ProductCard({ product, tag }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group flex flex-col justify-between rounded-sm border border-line bg-card  transition-colors hover:border-emerald/40 hover:bg-[#1e2027]">
      <div>
        {/* Minimal Image / Category Placeholder */}
        <div className="mb-4 flex aspect-[4/2.8] w-full items-center justify-center overflow-hidden rounded-t-sm bg-paper-2 font-mono text-[11px] uppercase tracking-wider text-ink-faint border border-line">
          {product.imageUrl && !imgError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <span>{product.category}</span>
          )}
        </div>
        <div className="px-4">
          {/* Category / Tag */}
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-faint">{tag ? `${tag} · ${product.category}` : product.category}</div>

          {/* Product Name */}
          <h4 className="mb-1.5 text-[14.5px] font-medium leading-snug text-ink line-clamp-2 group-hover:text-emerald transition-colors">{product.name}</h4>

          {/* Stock Status */}
          <div className="mb-4 font-mono text-[11.5px] text-brass">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</div>
        </div>
      </div>

      {/* Price & Action */}
      <div className="mt-auto flex items-center justify-between border-t border-line/60 p-3.5">
        <span className="font-mono text-[15px] font-medium text-ink">{formatPrice(product.price)}</span>

        <Link
          href={`/chat?prompt=${encodeURIComponent(`Tell me about ${product.name} and suggest accessories`)}`}
          className="rounded-sm border border-emerald px-3 py-1.5 font-mono text-xs text-emerald transition-colors hover:bg-emerald hover:text-paper"
        >
          Ask AI
        </Link>
      </div>
    </div>
  );
}
