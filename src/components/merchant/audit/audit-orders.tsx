"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { MerchantOrderRow } from "./types";

interface AuditOrdersProps {
  orders: MerchantOrderRow[];
}

export function AuditOrders({ orders }: AuditOrdersProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center text-zinc-400">
        <ShoppingBag className="h-8 w-8 mx-auto text-zinc-600 mb-2" />
        <p className="font-semibold text-sm text-zinc-300">No orders recorded yet</p>
        <p className="text-xs text-zinc-500 mt-1">
          When customers shop via the AI Sales Agent and checkout, orders will appear here in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const isExpanded = expandedOrderId === order.id;
        const isPaid = order.status === "PAID";
        const isAwaiting = order.status === "AWAITING_PAYMENT" || order.status === "PROPOSED";
        const hasUpsell = order.items.some((it) => it.isUpsell);
        const upsellTotal = order.items
          .filter((it) => it.isUpsell)
          .reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);

        return (
          <div
            key={order.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 transition-all hover:border-zinc-700 overflow-hidden shadow-sm"
          >
            {/* Header Summary Row */}
            <div
              onClick={() => toggleExpand(order.id)}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-zinc-900/90 gap-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isPaid
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : isAwaiting
                      ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                      : "bg-red-500/10 border border-red-500/20 text-red-400"
                  }`}
                >
                  {isPaid ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isAwaiting ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">
                      #{order.id.slice(-8)}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isPaid
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                          : isAwaiting
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                          : "bg-red-500/10 border-red-500/20 text-red-300"
                      }`}
                    >
                      {order.status}
                    </span>

                    {hasUpsell && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-indigo-600/20 border border-indigo-500/30 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300">
                        <Sparkles className="h-2.5 w-2.5" />
                        <span>AI Upsell (+₹{upsellTotal.toLocaleString("en-IN")})</span>
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                    • {order.items.length} {order.items.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">
                    Order Total
                  </span>
                  <span className="text-sm font-bold text-white font-mono">
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/order/${order.id}`}
                    onClick={(e) => e.stopPropagation()}
                    target="_blank"
                    className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                    title="View Customer Receipt"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>

                  <button className="p-1.5 rounded-lg text-zinc-400 hover:text-white">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Itemized Breakdown */}
            {isExpanded && (
              <div className="border-t border-zinc-800/80 bg-zinc-950/70 p-4 space-y-3 animate-in fade-in-0 duration-150">
                <h5 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Snapshotted Order Items
                </h5>

                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 flex flex-col gap-1.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-semibold text-indigo-400 uppercase">
                              {item.product?.category || "Product"}
                            </span>
                            {item.isUpsell && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 rounded px-1">
                                <Sparkles className="h-2 w-2 text-indigo-400" />
                                AI Attributed
                              </span>
                            )}
                          </div>
                          <h6 className="font-semibold text-xs text-zinc-100 mt-0.5">
                            {item.product?.name || "Product Name"}
                          </h6>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-white font-mono block">
                            ₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            ₹{item.unitPrice.toLocaleString("en-IN")} × {item.quantity}
                          </span>
                        </div>
                      </div>

                      {item.reason && (
                        <div className="rounded bg-zinc-950/80 border border-zinc-800 px-2 py-1 text-[11px] text-zinc-400 italic">
                          💡 &ldquo;{item.reason}&rdquo;
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer Payment & Audit Meta */}
                <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between text-[11px] text-zinc-400 gap-2 font-mono">
                  <div>
                    <span>Razorpay Order ID: </span>
                    <span className="text-zinc-200">
                      {order.razorpayOrderId || "N/A"}
                    </span>
                  </div>

                  {order.payments && order.payments.length > 0 && (
                    <div>
                      <span>Payment Ref: </span>
                      <span className="text-zinc-200">
                        {order.payments[0].razorpayPaymentId || "N/A"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
