"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  ListOrdered,
  FileText,
  TrendingUp,
  Lock,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuditMetricData, AuditLogRow, MerchantOrderRow } from "./types";
import { AuditMetrics } from "./audit-metrics";
import { AuditOrders } from "./audit-orders";
import { AuditTable } from "./audit-table";

interface AuditDashboardProps {
  initialMetrics: AuditMetricData;
  initialLogs: AuditLogRow[];
  initialOrders: MerchantOrderRow[];
}

export function AuditDashboard({
  initialMetrics,
  initialLogs,
  initialOrders,
}: AuditDashboardProps) {
  const [metrics, setMetrics] = useState<AuditMetricData>(initialMetrics);
  const [logs, setLogs] = useState<AuditLogRow[]>(initialLogs);
  const [orders, setOrders] = useState<MerchantOrderRow[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<"orders" | "audit" | "attribution">("orders");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/audit");
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setLogs(data.logs);
        setOrders(data.orders);
      }
    } catch (e) {
      console.error("Failed to refresh audit data:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 text-white shadow-md shadow-indigo-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Merchant Audit & AI Revenue Dashboard
              </h1>
              <p className="text-xs text-zinc-400">
                Live Reconciled Ledger • Bounded Commerce Guardrails • AI-Attributed Revenue
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="h-9 px-3.5 text-xs rounded-xl border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
            <span>Refresh Feed</span>
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <AuditMetrics metrics={metrics} />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-1">
        <button
          onClick={() => setActiveTab("orders")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "orders"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Live Orders & Reconciliation ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "audit"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Audit Trail & Guardrails ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("attribution")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "attribution"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>AI Attribution Analytics</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "orders" && <AuditOrders orders={orders} />}

      {activeTab === "audit" && <AuditTable logs={logs} />}

      {activeTab === "attribution" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-zinc-900/90 to-zinc-950 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <span>Explainable AI Revenue Attribution Breakdown</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Proof that conversational recommendations directly increase Average Order Value (AOV).
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-indigo-300 font-bold block">
                  Lift Impact
                </span>
                <span className="text-xl font-extrabold text-emerald-400">
                  +{metrics.aiRevenueLiftPercentage}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-1">
                <span className="text-[11px] text-zinc-400 uppercase font-semibold">
                  Baseline Organic Value
                </span>
                <div className="text-lg font-bold text-white font-mono">
                  ₹{metrics.baselineRevenue.toLocaleString("en-IN")}
                </div>
                <p className="text-[10px] text-zinc-500">
                  Direct search intent & primary selections
                </p>
              </div>

              <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-4 space-y-1">
                <span className="text-[11px] text-indigo-300 uppercase font-bold">
                  AI Attributed Upsells
                </span>
                <div className="text-lg font-extrabold text-indigo-400 font-mono">
                  ₹{metrics.aiAttributedUpsellRevenue.toLocaleString("en-IN")}
                </div>
                <p className="text-[10px] text-indigo-200/80">
                  Generated via reasoned pairing suggestions
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-1">
                <span className="text-[11px] text-zinc-400 uppercase font-semibold">
                  Pairing Acceptance Rate
                </span>
                <div className="text-lg font-bold text-white font-mono">
                  {metrics.recommendationConversionRate}%
                </div>
                <p className="text-[10px] text-zinc-500">
                  {metrics.acceptedRecommendations} of {metrics.totalRecommendations} recommendations accepted
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
