const steps = [
  {
    n: "01",
    title: "Intent classification",
    body: "The customer asks a conversational question, states a constraint, or requests a recommendation naturally.",
    quote: '"I need a laptop for development"',
  },
  {
    n: "02",
    title: "Live DB tool invocation",
    body: "The agent runs strict server tools — searchProducts, checkInventory — against PostgreSQL.",
    quote: "tool: searchProducts(category)",
  },
  {
    n: "03",
    title: "Attributed reason proposal",
    body: "Synergistic accessories are proposed with an explainable reason logged into the database.",
    quote: '"programmers pair this with…"',
  },
  {
    n: "04",
    title: "Human-in-the-loop gate",
    body: "The customer reviews line items and taps to confirm — LLM text alone cannot authorize payment.",
    quote: "user action: tap confirm",
  },
  {
    n: "05",
    title: "Secure settlement",
    body: "A cryptographic signature is verified via Razorpay's webhook, and merchant ROI is attributed.",
    quote: "webhook: HMAC SHA256 ✓",
  },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-[1180px] px-8 pb-24">
      <div className="mb-14 max-w-[560px]">
        <span className="eyebrow mb-3.5 block">Deterministic execution flow</span>
        <h2 className="mb-3.5 text-[34px]">How agentic commerce works</h2>
        <p className="text-[15.5px] text-ink-soft">
          A five-phase loop from conversational intent to a cryptographically
          verified checkout — no step is skippable.
        </p>
      </div>

      <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-line bg-card sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, i) => (
          <div
            key={step.n}
            className={`p-7 ${i > 0 ? "border-line sm:border-l" : ""} ${
              i > 0 && i % 2 === 0 ? "border-t sm:border-t-0" : ""
            }`}
          >
            <span className="stroke-number mb-5 block text-2xl">{step.n}</span>
            <h4 className="mb-2 text-[15px] font-semibold">{step.title}</h4>
            <p className="mb-3.5 text-[13px] text-ink-soft">{step.body}</p>
            <div className="border-t border-dashed border-line pt-3 font-mono text-[11px] text-ink-faint">
              {step.quote}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
