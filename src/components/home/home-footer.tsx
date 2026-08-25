import React from "react";
import Link from "next/link";
import { ShoppingBag, ArrowUpRight, Shield, Bot, Database } from "lucide-react";

export function HomeFooter() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 text-xs text-zinc-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Tagline */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-zinc-300">FlowCommerce AI</span>
            <span className="text-zinc-600 mx-2">•</span>
            <span>Razorpay AI Buildathon 2026</span>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-zinc-400">
          <Link
            href="/chat"
            className="hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <Bot className="h-3.5 w-3.5 text-indigo-400" />
            <span>AI Shopping Agent</span>
          </Link>
          <Link
            href="/merchant/products"
            className="hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <Database className="h-3.5 w-3.5 text-blue-400" />
            <span>Merchant Catalog</span>
          </Link>
          <Link
            href="/merchant/audit"
            className="hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            <span>Audit & Telemetry</span>
          </Link>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-400 font-mono text-[11px]">System Online</span>
        </div>
      </div>
    </footer>
  );
}
