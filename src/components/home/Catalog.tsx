"use client";

import React, { useMemo, useState } from "react";
import { Search, ShoppingBag, X, Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "@prisma/client";

interface CatalogProps {
  products?: Product[];
}

export default function Catalog({ products = [] }: CatalogProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");

  // Categories & item counts
  const { categoryList, categoryCounts } = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    const cats = new Set<string>();

    products.forEach((p) => {
      if (p.category) {
        cats.add(p.category);
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });

    return {
      categoryList: ["All", ...Array.from(cats)],
      categoryCounts: counts,
    };
  }, [products]);

  // Filter products by category and query
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.slice(0, 8).filter((product) => {
      const matchesCategory =
        activeCategory === "All" ||
        product.category.toLowerCase() === activeCategory.toLowerCase();

      if (!q) return matchesCategory;

      const matchesName = product.name.toLowerCase().includes(q);
      const matchesDesc = product.description.toLowerCase().includes(q);
      const matchesCat = product.category.toLowerCase().includes(q);
      const matchesTags = product.tags?.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && (matchesName || matchesDesc || matchesCat || matchesTags);
    });
  }, [products, activeCategory, query]);

  return (
    <section id="catalog" className="mx-auto max-w-[1180px] px-8 pb-20 pt-4">
      {/* Header & Search */}
      <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <span className="eyebrow mb-2 block">Live inventory catalog</span>
          <h2 className="text-[32px] tracking-tight text-ink">
            Explore the demo tech inventory
          </h2>
          <p className="mt-2 text-[15px] text-ink-soft max-w-2xl">
            Real stock & pricing verified server-side. Query any of these products directly through natural conversation with the shopping agent.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, specs, tags…"
            className="w-full rounded-sm border border-line bg-card pl-10 pr-9 py-2.5 text-[13.5px] text-ink placeholder:text-ink-faint focus:border-emerald focus:outline-none focus:ring-1 focus:ring-emerald transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-4 border-b border-line scrollbar-thin">
        {categoryList.map((cat) => {
          const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
          const count = categoryCounts[cat] || 0;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-sm text-[13px] font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald text-paper font-semibold shadow-sm"
                  : "bg-card text-ink-soft hover:text-ink hover:bg-[#1e2027] border border-line"
              }`}
            >
              <span>{cat}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  isActive
                    ? "bg-emerald-2 text-emerald font-bold"
                    : "bg-[#252830] text-ink-faint"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results Meta */}
      <div className="mb-6 flex items-center justify-between text-xs text-ink-soft">
        <div>
          Showing <span className="font-semibold text-ink">{visible.length}</span>{" "}
          {visible.length === 1 ? "product" : "products"}
          {activeCategory !== "All" && (
            <span>
              {" "}in <span className="text-emerald font-medium">{activeCategory}</span>
            </span>
          )}
          {query && (
            <span>
              {" "}matching &ldquo;<span className="text-ink">{query}</span>&rdquo;
            </span>
          )}
        </div>

        {(query || activeCategory !== "All") && (
          <button
            onClick={() => {
              setActiveCategory("All");
              setQuery("");
            }}
            className="text-emerald hover:underline font-medium cursor-pointer"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Product Grid */}
      {visible.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-md border border-dashed border-line bg-card">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-paper-2 text-ink-faint">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-ink">No products found</h3>
          <p className="mt-1 text-xs text-ink-soft max-w-sm mx-auto">
            No products match "{query}" in {activeCategory}. Try adjusting your search or category filter.
          </p>
          <button
            onClick={() => {
              setActiveCategory("All");
              setQuery("");
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-sm bg-emerald px-4 py-2 text-xs font-semibold text-paper hover:opacity-90 transition-all cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Show all products</span>
          </button>
        </div>
      )}
    </section>
  );
}
