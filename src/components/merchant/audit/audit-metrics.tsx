"use client";

import React from "react";
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Lock,
  ArrowUpRight,
  Target,
} from "lucide-react";
import { AuditMetricData } from "./types";

interface AuditMetricsProps {
  metrics: AuditMetricData;
}

export function AuditMetrics({ metrics }: AuditMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. AI-Attributed Revenue Card (Hero Highlight) */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/60 via-zinc-900/90 to-zinc-950 p-5 shadow-xl transition-all duration-200 hover:border-indigo-500/50 hover:shadow-indigo-500/10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            AI-Attributed Revenue
          </span>
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl font-extrabold text-white tracking-tight">
            ₹{metrics.aiAttributedUpsellRevenue.toLocaleString("en-IN")}
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 font-bold text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />
              {metrics.aiRevenueLiftPercentage}% Lift
            </span>
            <span className="text-zinc-400">
              from {metrics.paidUpsellItemsCount} upsell pairings
            </span>
          </div>
        </div>
      </div>

      {/* 2. Total Realized Gross Revenue */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg transition-all duration-200 hover:border-zinc-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Total Realized Revenue
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl font-extrabold text-white tracking-tight">
            ₹{metrics.totalGrossRevenue.toLocaleString("en-IN")}
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
            <span>Baseline: ₹{metrics.baselineRevenue.toLocaleString("en-IN")}</span>
            <span className="font-mono text-zinc-500">
              {metrics.totalPaidOrdersCount} paid orders
            </span>
          </div>
        </div>
      </div>

      {/* 3. AI Recommendations Conversion Rate */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg transition-all duration-200 hover:border-zinc-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Recommendation Conversion
          </span>
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Target className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {metrics.recommendationConversionRate}%
          </div>

          <div className="mt-2 text-xs text-zinc-400">
            <span className="font-semibold text-white">
              {metrics.acceptedRecommendations}
            </span>{" "}
            accepted of {metrics.totalRecommendations} generated pairings
          </div>
        </div>
      </div>

      {/* 4. Enterprise Guardrails Enforced */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg transition-all duration-200 hover:border-zinc-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Guardrails Interceptions
          </span>
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {metrics.guardrailBlocks}
          </div>

          <div className="mt-2 flex items-center gap-1 text-xs text-zinc-400">
            <Lock className="h-3 w-3 text-cyan-400" />
            <span>Zero price tampering & stock breaches</span>
          </div>
        </div>
      </div>
    </div>
  );
}
