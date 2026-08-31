import React from "react";
import { products, Product } from "@/data/products";
import ProductCard from "./ProductCard";

export default function Showcase() {
  const featured = products.filter((p: Product) => p.featured);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Live Inventory Catalog
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
            Shop What the Agent Recommends
          </h2>
        </div>
        <a
          href="#catalog"
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors underline"
        >
          View full catalog →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {featured.map((product: Product) => (
          <ProductCard key={product.id} product={product} tag="Featured" />
        ))}
      </div>
    </section>
  );
}
