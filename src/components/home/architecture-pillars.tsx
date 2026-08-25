import React from "react";
import {
  Cpu,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  Database,
  ArrowUpRight,
} from "lucide-react";

const PILLARS = [
  {
    icon: Cpu,
    title: "Reasoned Upsell Engine",
    badge: "Explainable AI",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    accentGlow: "from-indigo-500/10 to-transparent",
    description:
      "The agent proposes complementary high-margin additions (e.g. matching mechanical keyboards with pro laptops) and permanently logs the exact rationalization into the database for transparent attribution.",
    features: [
      "Rule-based compatibility check",
      "Explainable recommendation reasoning",
      "Persistent audit tagging",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Deterministic Confirmation Gate",
    badge: "Prompt-Injection Proof",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    accentGlow: "from-emerald-500/10 to-transparent",
    description:
      "Cart mutation, price calculation, and payment triggers can NEVER be executed autonomously by LLM text. A strictly enforced server-rendered human confirmation button is mandatory.",
    features: [
      "No autonomous unauthorized charge",
      "Server-side price verification",
      "Explicit user sign-off required",
    ],
  },
  {
    icon: BarChart3,
    title: "Attributed Revenue Telemetry",
    badge: "Merchant ROI Proof",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    accentGlow: "from-cyan-500/10 to-transparent",
    description:
      "Merchant dashboard measures incremental revenue derived exclusively from agent upselling versus organic intent, backed by verifiable event logs and conversion timestamps.",
    features: [
      "Isolated upsell revenue tracking",
      "Tool invocation replay",
      "Live conversion analytics",
    ],
  },
  {
    icon: Database,
    title: "Live Database Stock Guardrails",
    badge: "Zero Phantom Carts",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    accentGlow: "from-amber-500/10 to-transparent",
    description:
      "Before any product is suggested or placed into checkout, database constraints verify inventory counts in real-time, eliminating out-of-stock checkouts and phantom inventory.",
    features: [
      "PostgreSQL row-level validation",
      "Instant out-of-stock prevention",
      "Real-time stock decrement sync",
    ],
  },
];

export function ArchitecturePillars() {
  return (
    <section className="relative border-y border-zinc-800/80 bg-zinc-900/40 py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-800/60 px-3 py-1 text-xs font-semibold text-zinc-300 backdrop-blur-sm mb-3">
            <span>Enterprise Safety Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Engineered for Enterprise Trust & Safety
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-400">
            FlowCommerce resolves the fundamental trade-off between AI agency and financial integrity through bounded runtime contracts.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 p-6 shadow-xl hover:border-zinc-700 transition-all duration-300 hover:shadow-2xl"
              >
                {/* Subtle top glow */}
                <div
                  className={`pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-2xl bg-gradient-to-b ${pillar.accentGlow} opacity-50 group-hover:opacity-100 transition-opacity`}
                />

                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${pillar.bg} transition-transform group-hover:scale-105`}>
                      <Icon className={`h-5 w-5 ${pillar.color}`} />
                    </div>
                    <span className="inline-flex items-center rounded-full bg-zinc-800/80 px-2.5 py-0.5 text-[11px] font-medium text-zinc-300 border border-zinc-700/60">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-zinc-100 transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-zinc-800/70 space-y-2">
                  {pillar.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-zinc-300">
                      <CheckCircle2 className={`h-3.5 w-3.5 ${pillar.color} shrink-0`} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
