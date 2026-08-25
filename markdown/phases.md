## Phase 1 — Foundation

- **Objective:** Working Next.js + Prisma + Postgres skeleton with seeded catalog.
- **Learn:** Nothing new — this is your existing stack.
- **Build:** Prisma schema above, seed script with ~15–20 products across 2–3 categories, /merchant/products basic CRUD, /api/products.
- **Skip:** Auth polish (a single seeded demo user/session is fine), styling beyond functional.
- **Definition of Done:** Can list/search products via API; can add/edit a product from the merchant UI.

---

## Phase 2 — Agent Loop + Read-Only Tools

- **Objective:** Working conversational search/recommend, no money involved yet.
- **Learn:** Your LLM provider's tool-calling format (a few hours with their docs).
- **Build:** /api/chat running a loop: send message + tool schemas → if tool_use returned, execute the matching backend function → feed result back → repeat until plain text → stream to UI. Implement searchProducts, getProductDetails, checkInventory.
  - **Key concept:** the loop is just sequential awaited calls in one request handler — no queue, no framework needed.
- **Skip:** Streaming token-by-token polish (nice UX, not a requirement) — a simple "typing" spinner is fine for the demo.
- **Definition of Done:** You can chat "I need a laptop under ₹60k" and get a real, DB-backed recommendation with a persisted reason.

---

## Phase 3 — Cart + Upsell/Cross-sell

- **Objective:** Stateful cart with agent-driven upsell, all server-validated.
- **Build:** Cart/CartItem models wired up, addToCart/removeFromCart tools, calculateTotal tool, upsell logic that queries "frequently paired" or same-category higher-margin items and writes a Recommendation row with reason.
  - **Key concept:** the agent proposes an upsell; the cart state itself is only ever mutated through validated backend calls, never inferred from chat text.
- **Skip:** Real collaborative-filtering recommendations — rule-based (same category + in stock + under remaining budget + tagged complementary) is enough and more explainable, which actually serves the "explainable" requirement better than a black-box model would.
- **Definition of Done:** Agent adds a primary item and offers one relevant upsell with a visible reason; cart total is always backend-computed.

---

## Phase 4 — Order, Guardrails, Confirmation Gate

- **Objective:** The pending → awaiting_payment gate, fully enforced server-side.
- **Build:** createOrder, confirmOrder (real UI button, not agent-callable), all the bounded-checks from §9, AuditLog writes on every tool call (success and rejection).
  - **Key concept:** structurally separate "the tool that talks to Razorpay" from "any tool the LLM can call unsupervised" — see §8's critical design point.
- **Skip:** Multiple payment methods/currencies — INR test mode only.
- **Definition of Done:** You can try to make the agent skip confirmation (via a leading prompt) and watch it structurally fail, with a log entry to prove it.

---

## Phase 5 — Razorpay Integration

- **Objective:** Real Test Mode payment, start to finish.
- **Learn:** Razorpay Orders API + Checkout + webhook signature verification (a focused read of their Node.js integration docs — a few hours).
- **Build:** razorpay.orders.create() call inside createPayment, Checkout launch on the frontend with the returned order_id, client-side HMAC verification on the callback, /api/webhooks/razorpay verifying the webhook's own signature (raw body, x-razorpay-signature header) and flipping Payment.status/Order.status on payment.captured, handling payment.failed.
- **Skip:** Refunds, subscriptions, multiple payment methods — a single successful test-mode charge path plus one failure path is sufficient.
- **Definition of Done:** A full test-mode payment completes, and the webhook (not just the client callback) is what marks the order paid.

---

## Phase 6 — Failure Handling + Audit UI

- **Objective:** The demo's proof points.
- **Build:** The out-of-stock failure scenario (§12 below), /merchant/audit with filters and the AI-attributed-revenue calculation (sum(OrderItem.unitPrice * quantity where isUpsell=true and Order.status='paid') vs. baseline).
- **Skip:** General-purpose analytics — build exactly the one metric your X-factor needs.
- **Definition of Done:** You can run the full demo script end-to-end, including the deliberate guardrail-break and the out-of-stock recovery, without touching code.

---

## Phase 7 — Polish + Rehearsal

- **Objective:** A tight 5-minute demo.
- **Build:** Nothing new — fix rough edges, write the demo script, time it.
- **Definition of Done:** You can run the whole flow cold, twice, in under 5 minutes each.