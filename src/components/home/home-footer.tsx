export function HomeFooter() {
  return (
    <footer
      id="audit"
      className="border-t border-line py-9"
    >
      <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-4 px-8 text-[12.5px] text-ink-faint sm:flex-row sm:justify-between">
        <span>FlowCommerce AI · Razorpay Buildathon 2026</span>
        <div className="flex gap-6.5">
          <a
            href="#agent"
            className="hover:text-ink-soft"
          >
            Shopping Agent
          </a>
          <a
            href="#catalog"
            className="hover:text-ink-soft"
          >
            Merchant Catalog
          </a>
          <a
            href="#audit"
            className="hover:text-ink-soft"
          >
            Audit &amp; Telemetry
          </a>
        </div>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
          System online
        </span>
      </div>
    </footer>
  );
}
