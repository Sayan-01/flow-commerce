const principles = [
  {
    tag: "Explainable AI",
    title: "Reasoned upsell engine",
    body: "The agent proposes complementary, higher-margin additions — like pairing a mechanical keyboard with a developer laptop — and logs the exact rationale for attribution.",
    points: [
      "Rule-based compatibility check",
      "Explainable recommendation reasoning",
      "Persistent audit tagging",
    ],
  },
  {
    tag: "Prompt-injection proof",
    title: "Deterministic confirmation gate",
    body: "Cart mutation, pricing, and payment triggers can never execute from LLM text alone. A server-rendered confirmation is mandatory before any charge.",
    points: [
      "No autonomous charge authority",
      "Server-side price verification",
      "Explicit user sign-off required",
    ],
  },
  {
    tag: "Merchant ROI proof",
    title: "Attributed revenue telemetry",
    body: "The merchant dashboard isolates incremental revenue from agent upselling versus organic intent, backed by verifiable event logs.",
    points: ["Isolated upsell revenue tracking", "Tool invocation replay", "Live conversion analytics"],
  },
  {
    tag: "Zero phantom carts",
    title: "Live database stock guardrails",
    body: "Before anything is suggested or placed in a cart, PostgreSQL constraints verify inventory — eliminating out-of-stock and phantom checkouts.",
    points: ["Row-level stock validation", "Instant out-of-stock prevention", "Real-time decrement sync"],
  },
];

export default function Principles() {
  return (
    <section className="mx-auto max-w-[1180px] px-8 py-24">
      <div className="mb-14 max-w-[560px]">
        <span className="eyebrow mb-3.5 block">Enterprise safety architecture</span>
        <h2 className="mb-3.5 text-[34px]">Where agency ends and control begins</h2>
        <p className="text-[15.5px] text-ink-soft">
          FlowCommerce resolves the trade-off between a persuasive AI and a
          merchant's financial integrity with four bounded runtime contracts.
        </p>
      </div>

      <div className="bento grid-cols-1 md:grid-cols-2">
        {principles.map((p) => (
          <div key={p.title} className="bg-card p-9.5">
            <span className="mb-4.5 block font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-faint">
              {p.tag}
            </span>
            <h3 className="mb-3 text-[19px]">{p.title}</h3>
            <p className="mb-4.5 text-[14.5px] text-ink-soft">{p.body}</p>
            <ul>
              {p.points.map((point) => (
                <li key={point} className="relative mb-1.5 pl-4 text-[13px]">
                  <span className="absolute left-0 text-brass">—</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
