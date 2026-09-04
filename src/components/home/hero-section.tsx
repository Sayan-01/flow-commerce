import Receipt from "./Receipt";


export function HeroSection() {
  return (
    <section
      id="overview"
      className="relative mx-auto max-w-[1180px] px-8 pb-15 pt-[15vh] min-h-[calc(100vh-78.5px)]"
    >
      {/* Background Grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,var(--color-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-line)_1px,transparent_1px)] [background-size:48px_48px] opacity-40 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_60%,transparent_100%)]" />

      <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="eyebrow mb-5 block">Razorpay AI Buildathon — Track 01, Agentic Commerce</span>

          <h1 className="max-w-[560px] text-[53px] leading-[1.06] font-bold">
            Every conversation
            <br />
            ends in a verified
            <br />
            receipt.
          </h1>

          <p className="mb-8.5 mt-5.5 text-[17px] text-ink-soft">
            FlowCommerce pairs a conversational shopping agent with server-enforced guardrails — live inventory, deterministic pricing, and a Razorpay-signed checkout the agent can never bypass on its
            own.
          </p>

          <div className="mb-10 flex flex-wrap items-center gap-4">
            <a
              href="#agent"
              className="rounded-sm bg-emerald px-5.5 py-3.5 text-sm font-medium text-paper hover:opacity-90"
            >
              Launch shopping agent →
            </a>
            <a
              href="#catalog"
              className="rounded-sm border border-ink px-5.5 py-3.5 text-sm font-medium text-ink hover:bg-ink hover:text-paper"
            >
              Merchant dashboard
            </a>
            <a
              href="#audit"
              className="px-1 py-3.5 text-sm text-ink-soft hover:text-ink"
            >
              Audit &amp; telemetry
            </a>
          </div>

          
        </div>

        <Receipt
          brand="FlowCommerce"
          subtitle="session · flow_preview · razorpay verified"
          items={[
            { name: "UltraBook Pro 15", note: "Core i7 · 32GB · 14 in stock", price: 89999 },
            { name: "Compact Mechanical Keyboard", note: "agent upsell · reasoned pairing", price: 4999 },
          ]}
          subtotal={94998}
          stamp={
            <>
              Signature
              <br />
              verified
            </>
          }
        />
      </div>

    </section>
  );
}
