"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Bot, Search, Check, Tag, ArrowRight } from "lucide-react";
import { Product } from "./types";

interface CatalogPreviewProps {
  initialProducts: Product[];
}

const CATEGORIES = ["All", "Laptops", "Keyboards & Mice", "Audio", "Accessories"];

export function CatalogPreview({ initialProducts = [] }: CatalogPreviewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredProducts = initialProducts.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      searchQuery.trim() === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Live Inventory Catalog</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">Explore Demo Tech Inventory</h2>
          <p className="mt-1.5 text-sm text-zinc-400 max-w-xl">Query any of these items through natural conversation with the AI Agent. Real stock & pricing verified instantly.</p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search bar */}
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-9 pr-3.5 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30">
          <p className="text-sm text-zinc-400">No products match the selected criteria.</p>
          {(searchQuery || selectedCategory !== "All") && (
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/90 bg-zinc-900/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-xl hover:shadow-indigo-500/5"
            >
              <div>
                {/* Category & Stock Pill */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-block rounded-md bg-zinc-800/90 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 border border-zinc-700/50">{product.category}</span>
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${product.stock > 10 ? "text-emerald-400" : product.stock > 0 ? "text-amber-400" : "text-red-400"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${product.stock > 10 ? "bg-emerald-400" : product.stock > 0 ? "bg-amber-400" : "bg-red-400"}`} />
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-zinc-100 line-clamp-1 group-hover:text-indigo-300 transition-colors">{product.name}</h3>

                {/* Description */}
                <p className="mt-1.5 text-xs text-zinc-400 line-clamp-2 leading-relaxed">{product.description}</p>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {product.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-zinc-800/70 px-1.5 py-0.5 text-[10px] text-zinc-400 border border-zinc-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & Action Button */}
              <div className="mt-4 pt-3.5 border-t border-zinc-800/70 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Price</span>
                  <span className="text-base font-extrabold text-white">₹{product.price.toLocaleString("en-IN")}</span>
                </div>

                <Link
                  href={`/chat?prompt=${encodeURIComponent(`Tell me about ${product.name} and suggest any compatible accessories`)}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600/20 px-3 py-1.5 text-xs font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all"
                >
                  <Bot className="h-3.5 w-3.5" />
                  <span>Ask AI</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
