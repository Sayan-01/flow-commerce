import Receipt from "./Receipt";

const steps = [
  {
    n: "01",
    title: "Database tool query",
    body: "Live stock checks prevent recommending unavailable items.",
  },
  {
    n: "02",
    title: "Reasoned upsell proposal",
    body: "Compatibility is scored and the reasoning persists for ROI proof.",
  },
  {
    n: "03",
    title: "Enforced human confirmation",
    body: "Checkout requires an explicit tap — prompt injection cannot auto-pay.",
  },
];

export function ArchitecturePreview() {
  return (
    <section
      id="agent"
      className=" mt-6 bg-emerald-2 text-[#efead9]"
    >
      <div className="mx-auto grid max-w-[1200px] items-center gap-16 px-12 py-20 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <span className="eyebrow text-[#b7c9c0]">Interactive architecture preview</span>
          <h2 className="mb-4 mt-3 text-[32px] text-white">The bounded execution, line by line</h2>
          <p className="mb-7.5 max-w-[420px] text-[15px] text-[#c8d2cc]">Every line on the receipt maps to a step the agent was — and wasn't — allowed to take on its own.</p>

          <div className="border-t border-white/15">
            {steps.map((step) => (
              <div
                key={step.n}
                className="flex gap-4 border-b border-white/15 py-4.5"
              >
                <span className="pt-0.5 font-mono text-xs text-[#b7c9c0]">{step.n}</span>
                <div>
                  <h4 className="mb-1 text-[14.5px] font-medium text-white">{step.title}</h4>
                  <p className="text-[13px] text-[#b3beb6]">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Receipt
          brand="FlowAgent Copilot"
          subtitle='"a lightweight laptop for web dev under ₹90k"'
          items={[
            { name: "UltraBook Pro 15", note: "14 units in stock · Core i7 · 32GB", price: 89999 },
            {
              name: "Compact Mechanical Keyboard",
              note: '"pairs well with pro laptops for productivity"',
              price: 4999,
            },
          ]}
          subtotal={94998}
          stamp={
            <>
              Awaiting
              <br />
              confirmation
            </>
          }
          rotate="-rotate-[1.5deg]"
        />
      </div>
    </section>
  );
}
