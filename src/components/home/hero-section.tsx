import React from "react";
import Link from "next/link";
import {
  Bot,
  Store,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  BarChart3,
  Terminal,
} from "lucide-react";

const SAMPLE_PROMPTS = [
  "Find a developer laptop with 32GB RAM under ₹80k",
  "Recommend a mechanical keyboard for fast typing",
  "Build an ergonomic desk setup with matching accessories",
];

const ASSURANCE_BADGES = [
  {
    icon: ShieldCheck,
    title: "Server-Gated Payments",
    desc: "LLM cannot trigger charges autonomously",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Zap,
    title: "Live Inventory Truth",
    desc: "Direct database-backed stock validation",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: Lock,
    title: "Zero Money Hallucinations",
    desc: "Strict deterministic pricing rules",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    icon: BarChart3,
    title: "Attributed ROI Logs",
    desc: "Telemetry proving AI revenue lift",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
];

export function HeroSection() {
  return (
    <section className="relative px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28 overflow-hidden">
      {/* Dynamic Background Glow Gradients */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-600/20 via-cyan-500/10 to-purple-600/20 blur-3xl opacity-70" />
      <div className="pointer-events-none absolute top-1/4 -left-48 -z-10 h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-48 -z-10 h-[450px] w-[450px] rounded-full bg-indigo-600/10 blur-3xl" />

      {/* Subtle Grid Background Pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="mx-auto max-w-5xl text-center">
        {/* Track Tag Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md shadow-sm mb-8">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Razorpay AI Buildathon • Track 01: Agentic Commerce</span>
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl sm:leading-[1.12] lg:text-7xl">
          Conversational Sales with{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
            Bounded AI Execution
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-zinc-400 sm:text-lg lg:text-xl">
          An autonomous shopping copilot that reasons, validates inventory, and executes upsells in real-time. Built with{" "}
          <strong className="text-zinc-200 font-semibold">zero-hallucination server guardrails</strong>, explicit human confirmation
          gates, and verified Razorpay checkout.
        </p>

        {/* Dual Action CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
          <Link
            id="cta-chat-agent"
            href="/chat"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-600 to-cyan-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Bot className="h-5 w-5" />
            <span>Launch AI Shopping Agent</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>

          <Link
            id="cta-merchant-portal"
            href="/merchant/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-6 py-3.5 text-base font-medium text-zinc-200 backdrop-blur-sm hover:border-zinc-500 hover:bg-zinc-800/80 hover:text-white transition-all"
          >
            <Store className="h-5 w-5 text-indigo-400" />
            <span>Merchant Dashboard</span>
          </Link>

          <Link
            id="cta-audit-trail"
            href="/merchant/audit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-5 py-3.5 text-sm font-medium text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-all"
          >
            <BarChart3 className="h-4 w-4 text-emerald-400" />
            <span>Audit & Telemetry</span>
          </Link>
        </div>

        {/* Quick Starter Prompts Chips */}
        <div className="mt-8 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
            <Terminal className="h-3.5 w-3.5 text-zinc-400" />
            <span>Try asking the agent:</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl">
            {SAMPLE_PROMPTS.map((prompt, idx) => (
              <Link
                key={idx}
                href={`/chat?prompt=${encodeURIComponent(prompt)}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-300 hover:border-indigo-500/50 hover:bg-indigo-950/30 hover:text-indigo-200 transition-all"
              >
                <span>&ldquo;{prompt}&rdquo;</span>
                <ArrowRight className="h-3 w-3 text-zinc-500 group-hover:text-indigo-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* Key Assurance Badges */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-left pt-8 border-t border-zinc-800/70">
          {ASSURANCE_BADGES.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className="group flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/70"
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className={`p-1.5 rounded-lg border ${badge.bg}`}>
                    <Icon className={`h-4 w-4 ${badge.color}`} />
                  </div>
                  <span className="text-xs font-semibold text-zinc-200">{badge.title}</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">{badge.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
