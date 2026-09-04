const items = [
  { n: "01", title: "Server-gated payments", body: "The agent cannot trigger a charge on its own." },
  { n: "02", title: "Live inventory truth", body: "Every suggestion checks the database first." },
  { n: "03", title: "Zero money hallucinations", body: "Prices are computed server-side, always." },
  { n: "04", title: "Attributed ROI logs", body: "Every upsell is timestamped and traceable." },
];

export default function TrustStrip() {
  return (
    <div className="w-full px-4 bg-card py-10">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8  border-line bg-card p-7.5 px-[42px] lg:grid-cols-4 lg:gap-0">
        {items.map((item, i) => (
          <div
            key={item.n}
            className={`${i > 0 ? "lg:border-l lg:border-zinc-700 lg:pl-6" : ""}`}
          >
            <span className="font-mono text-[11px] text-brass">{item.n}</span>
            <h4 className="mb-1 mt-1 text-sm font-semibold">{item.title}</h4>
            <p className="text-[12.5px] text-ink-soft">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
