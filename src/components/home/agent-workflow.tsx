import React from "react";
import { MessageSquare, Wrench, Sparkles, ShieldCheck, CheckCheck, ArrowRight } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Natural Language Query",
    icon: MessageSquare,
    desc: "Customer asks conversational questions, constraints, or requests recommendations naturally.",
    example: '"I need a laptop for development under ₹75k"',
    color: "text-indigo-400",
    border: "border-indigo-500/30",
    badge: "Intent Classification",
  },
  {
    step: "02",
    title: "Bounded Tool Invocations",
    icon: Wrench,
    desc: "AI executes strict server tools (`searchProducts`, `checkInventory`) against PostgreSQL.",
    example: "tool: searchProducts({ category, maxPrice })",
    color: "text-blue-400",
    border: "border-blue-500/30",
    badge: "Live DB Queries",
  },
  {
    step: "03",
    title: "Reasoned Upsell Proposal",
    icon: Sparkles,
    desc: "Proposes synergistic accessories with an explainable reason logged into the database.",
    example: '"Programmers pair this with an ergonomic keyboard"',
    color: "text-cyan-400",
    border: "border-cyan-500/30",
    badge: "Attributed Reason",
  },
  {
    step: "04",
    title: "Deterministic Confirm Gate",
    icon: ShieldCheck,
    desc: "Customer reviews line items and clicks explicit confirmation. LLM text cannot authorize payment.",
    example: "User Action: Click [Confirm Order ₹X]",
    color: "text-amber-400",
    border: "border-amber-500/30",
    badge: "Human-in-the-Loop",
  },
  {
    step: "05",
    title: "Razorpay Signature Verification",
    icon: CheckCheck,
    desc: "Cryptographic signature validated via server webhook; updates order and attributes merchant ROI.",
    example: "Webhook: HMAC SHA256 verified -> PAID",
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    badge: "Secure Settlement",
  },
];

export function AgentWorkflow() {
  return (
    <section className="relative border-t border-zinc-800/80 bg-zinc-950 py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-sm mb-3">
            <span>Deterministic Execution Flow</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">How Agentic Commerce Works</h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-400">A zero-hallucination 5-phase loop from conversational intent to cryptographically verified checkout.</p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900 hover:-translate-y-1 hover:shadow-xl"
              >
                <div>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black tracking-widest text-zinc-500 group-hover:text-indigo-400 transition-colors">STEP {s.step}</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700/60">
                      <Icon className={`h-4 w-4 ${s.color}`} />
                    </div>
                  </div>

                  {/* Badge */}
                  <span className="inline-block rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 mb-2 border border-zinc-700/50">{s.badge}</span>

                  {/* Title */}
                  <h3 className="font-bold text-sm text-white group-hover:text-zinc-100">{s.title}</h3>

                  {/* Description */}
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">{s.desc}</p>
                </div>

                {/* Example Payload Snippet */}
                <div className="mt-4 pt-3 border-t border-zinc-800/60 font-mono text-[10px] text-zinc-400 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80 truncate">{s.example}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
