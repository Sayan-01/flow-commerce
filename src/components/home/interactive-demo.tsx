"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  User,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  CornerDownRight,
} from "lucide-react";

export function InteractiveDemo() {
  const [upsellAccepted, setUpsellAccepted] = useState(true);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Glow accent */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-cyan-600/15 blur-3xl" />

        <div className="flex flex-col lg:flex-row gap-10 items-center justify-between relative z-10">
          {/* Left Column: Explanation */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300 backdrop-blur-sm mb-4">
              <Zap className="h-3.5 w-3.5" />
              <span>Interactive Architecture Preview</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              See the Bounded Execution in Action
            </h2>

            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              Experience how the agent combines natural conversations with strict database tools, reasoned upsells, and deterministic human-in-the-loop payment gates.
            </p>

            <div className="mt-6 space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Database Tool Query</h4>
                  <p className="text-[11px] text-zinc-400">
                    Real-time stock checks prevent recommending unavailable items.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Reasoned Upsell Proposal</h4>
                  <p className="text-[11px] text-zinc-400">
                    Agent calculates compatibility and persists reason for ROI proof.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Enforced Human Confirmation</h4>
                  <p className="text-[11px] text-zinc-400">
                    Checkout requires explicit user click; prompt injection cannot auto-pay.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20"
              >
                <span>Try Live Interactive Chat</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Simulated Chat Box */}
          <div className="w-full lg:max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/90 p-4 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-zinc-200">FlowAgent Copilot</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">session: live_preview</span>
            </div>

            {/* Simulated Messages */}
            <div className="space-y-3">
              {/* User Bubble */}
              <div className="flex items-start gap-2 justify-end">
                <div className="rounded-2xl rounded-tr-sm bg-indigo-600 px-3.5 py-2 text-xs text-white max-w-[85%]">
                  Looking for a lightweight laptop for web development under ₹90k.
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 text-[10px] shrink-0">
                  <User className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Agent Bubble */}
              <div className="flex items-start gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[10px] shrink-0">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-2xl rounded-tl-sm border border-zinc-800 bg-zinc-900/90 p-3 text-xs text-zinc-300 space-y-2.5 max-w-[90%]">
                  <p>
                    I found the <strong className="text-white">UltraBook Pro 15</strong> (₹89,999) — 14 units in stock with Core i7 and 32GB RAM.
                  </p>

                  {/* Upsell Card */}
                  <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-2.5 text-[11px] text-indigo-200">
                    <div className="flex items-center gap-1.5 font-semibold text-indigo-300 mb-1">
                      <Sparkles className="h-3 w-3 text-indigo-400" />
                      <span>Recommended Upsell</span>
                    </div>
                    <p className="text-zinc-300">
                      Add <strong className="text-white">Compact Mechanical Keyboard</strong> for +₹4,999.
                    </p>
                    <p className="text-[10px] text-indigo-400 mt-1 italic">
                      &ldquo;Developers frequently pair high-tactility keyboards with pro laptops for ergonomic productivity.&rdquo;
                    </p>
                  </div>

                  {/* Simulated Human Gate */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5">
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span className="text-zinc-400">Order Subtotal:</span>
                      <span className="font-bold text-white">
                        {upsellAccepted ? "₹94,998" : "₹89,999"}
                      </span>
                    </div>

                    <button
                      onClick={() => setUpsellAccepted(!upsellAccepted)}
                      className="w-full py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-600 hover:text-white transition-all"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{upsellAccepted ? "Click to Toggle Base Only" : "Click to Include Upsell"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
