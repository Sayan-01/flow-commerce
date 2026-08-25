# 8-Day Day-by-Day Build Checklist

Ei plan ta explicitly bole dey **prottek din Frontend / Backend / API / Landing Page / Merchant Dashboard-e ki kaj hobe**, jate "dekhte pacchi na" feeling na hoy — protidin shesh e concrete kichu dekha jabe (screen, endpoint, ba flow).

Assumption: প্রতিদিন ~7-8 ঘন্টা কাজ, তুমি একা full-stack.

---

## Day 1 — Setup + Landing Page + DB Foundation

**Backend / DB**
- Next.js project init, Prisma + Postgres (Neon/Supabase) connect
- Full schema likhe felo (Merchant, Product, User, Cart, CartItem, Order, OrderItem, Payment, Conversation, Message, Recommendation, AuditLog) — `npx prisma migrate dev`
- Seed script — 15–20 product, 1 merchant

**API**
- `GET/POST /api/products` (list + create)
- `PATCH/DELETE /api/products/[id]`

**Frontend**
- **Landing page** (`/`) — simple: project name, ekta short pitch line, "Start Shopping" button (→ `/chat`), "Merchant Login" button (→ `/merchant/products`). Ekhon plain, polish porer dike.
- Basic layout/nav shared component

✅ **Day 1 shesh e ki dekha jabe:** Landing page live, seeded products DB e ache, API theke fetch kora jai (Postman/browser diye test)

---

## Day 2 — Merchant Dashboard (Product Management)

**Backend / API**
- `/api/products` finalize kora (validation: price/stock must be positive integer)

**Frontend — Merchant Dashboard**
- `/merchant/products` page:
  - Table view: shob product list (name, price, stock, status)
  - "Add Product" form (modal or separate row) — name, description, price, category, tags, stock
  - Edit/Delete inline
  - Stock quantity quickly update kora jai emon UI (+/- ba direct input)

✅ **Day 2 shesh e ki dekha jabe:** Merchant dashboard theke live product add/edit/delete kora jacche, changes DB-e reflect korche

---

## Day 3 — Chat UI (Frontend) + Agent Loop Skeleton (Backend)

**Frontend**
- `/chat` page — chat UI: message list, input box, send button, "typing..." indicator
- Cart side-panel UI (empty state e "cart khali" dekhabe)

**Backend / API**
- `/api/chat` route — LLM API call setup (tool schema define kora, but shudhu ekta dummy tool দিয়ে test)
- Tool-calling loop likha: message → LLM call → jodi tool_use → execute → result feed back → loop → final text

✅ **Day 3 shesh e ki dekha jabe:** Chat UI-te message pathale LLM-er ekta reply ashe (ekhono real product data na, khali "hello" level response hole cholbe)

---

## Day 4 — Read-only Tools (Search/Detail/Inventory) + Wiring to Chat

**Backend**
- `searchProducts`, `getProductDetails`, `checkInventory` — real Prisma query diye implement
- Ei tools gulo `/api/chat`-er tool array e register kora

**Frontend**
- Chat UI e product result gulo card hishebe render kora (shudhu text na — image placeholder, name, price, "Add to cart" button shoho)

✅ **Day 4 shesh e ki dekha jabe:** Chat e "laptop under 60k" likhle real DB product card hishebe ashe

---

## Day 5 — Cart + Upsell/Cross-sell (Full Stack)

**Backend**
- `Cart`/`CartItem` logic, `addToCart`, `removeFromCart`, `calculateTotal` tools
- Upsell recommendation logic (rule-based: same category/complementary tag + in-stock + budget-fit) + `Recommendation` model write (reason shoho)

**API**
- `/api/cart` (get current cart, mutate)

**Frontend**
- Cart side-panel e real items dekhano — item, qty, unit price, remove button
- Upsell suggestion UI card — "AI recommends: X — [reason]" shoho "Add" button
- Total breakdown (subtotal, discount, total) dekhano

✅ **Day 5 shesh e ki dekha jabe:** Product add korle cart update hoy, ekta upsell suggestion reason shoho ashe, total shothik dekha jai

---

## Day 6 — Order + Guardrails + Confirmation Gate + Razorpay Integration Start

**Backend**
- `createOrder` (proposal, Razorpay order create — test mode)
- Server-side guardrail validation (price/stock/amount re-check)
- `confirmOrder` endpoint (UI-click only, LLM tool list-e nei)
- `AuditLog` write shuru kora — shob tool call e (success/reject)

**Frontend**
- Checkout summary UI — itemized breakdown + **"Confirm ₹X Payment"** button (real button, agent trigger korte pare na)
- Razorpay Checkout SDK integrate (button click e open hoy)

**API**
- `/api/orders`, `/api/orders/[id]/confirm`

✅ **Day 6 shesh e ki dekha jabe:** Order propose hoy, confirm button chaple Razorpay Test Checkout popup ashe (payment ekhono complete na o hote pare)

---

## Day 7 — Payment Completion + Webhook + Order Status Page + Failure Scenario

**Backend / API**
- `/api/payment/verify` (client-side signature check)
- `/api/webhooks/razorpay` (webhook signature verify, `payment.captured`/`payment.failed` handle, order status update)
- Out-of-stock failure scenario logic (createOrder re-check e reject hole, agent-ke alternative suggest korার path)

**Frontend**
- `/order/[id]` — order status page (paid/failed/pending)
- Chat UI e graceful failure message dekhano ("eta out of stock hoye geche, ei ta try koro?")

✅ **Day 7 shesh e ki dekha jabe:** Ekta full test-mode payment success theke shesh porjonto complete hoy, webhook order paid kore; out-of-stock scenario live test kora jai

---

## Day 8 — Merchant Audit Dashboard + Polish + Demo Rehearsal

**Backend / API**
- `/api/audit` (filterable audit log endpoint)
- AI-Attributed Revenue calculation query

**Frontend — Merchant Dashboard**
- `/merchant/audit` page:
  - Order list (status shoho)
  - Audit trail table (filter by action/entity)
  - "AI-Attributed Revenue" metric card (baseline vs upsell revenue)

**Polish (both sides)**
- Landing page-e final copy/style
- Chat UI, cart UI, merchant dashboard-er rough edge fix
- Full run-through 2 bar — timing check (5 min target)
- Guardrail-break demo moment rehearse kora (prompt injection try kore dekhano block hocche)

✅ **Day 8 shesh e ki dekha jabe:** Full end-to-end demo-ready product — landing page → chat shopping → checkout → payment → order status → merchant audit dashboard

---

## Quick Summary Table

| Day | Landing Page | Merchant Dashboard | Chat/User Frontend | Backend/API |
|---|---|---|---|---|
| 1 | ✅ Build | — | — | Schema + seed + product API |
| 2 | — | ✅ Product CRUD | — | Product API finalize |
| 3 | — | — | ✅ Chat UI skeleton | Agent loop skeleton |
| 4 | — | — | ✅ Product cards in chat | Read-only tools |
| 5 | — | — | ✅ Cart + upsell UI | Cart/upsell tools |
| 6 | — | — | ✅ Confirm + Checkout UI | Order/guardrail/Razorpay start |
| 7 | — | — | ✅ Order status + failure UI | Webhook + verify + failure logic |
| 8 | Polish | ✅ Audit dashboard | Polish | Audit API + rehearsal |

---

## Sabse risky din kon gula (extra buffer rakho)

- **Day 3–4** (agent loop + tool calling first time) — jodi tool-calling format e atke jao, ekta din beshi lagte pare
- **Day 6–7** (Razorpay + webhook) — sabcheye common jaygay atke thake shobai (ngrok, signature mismatch)

Ei duita jaygay ekhon-i, kaj shuru korar age, ekbar chhoto separate test kore rakhle (Anthropic tool-use docs + Razorpay Node quickstart) — 8 din er modhe onek smooth hobe.

Chao to ami tomake **Day 1-er exact code** (Prisma schema file + seed script + landing page) ekhoni likhe dite pari, jate kaal shokal theke shuru korte paro.