# MVP.md — AI Merchant Sales & Checkout Agent

**Razorpay AI Buildathon — Track 01: AI Growth & Agentic Commerce**

This file is your **single source of truth**. It contains — what the MVP is, what will be available on the User side, what will be available on the Merchant dashboard, and how every feature will be built phase by phase.

---

## 0. MVP — In One Line

> A conversational AI shopping agent that recommends products and performs upselling/cross-selling for customers, but **can never charge a payment on its own** — all money-related actions are bounded, gated, and audited on the backend. On the merchant side, there will be a dashboard where the catalog can be managed and the merchant can see exactly how much revenue the AI generated (with proof).

---

## 1. Who Does What (Roles)

| Role | What they do |
| --- | --- |
| **Customer (User)** | Searches for products through chat, views agent recommendations, adds products to the cart, confirms the order, and pays using Razorpay Test Mode |
| **Merchant** | Manages products/inventory, views orders, and monitors the audit trail + AI-attributed revenue dashboard |

For a demo/hackathon, having a single seeded merchant is enough — multi-tenant merchant onboarding is not required.

---

## 2. USER (Customer) Side — All Features

### 2.1 Pages

- `/chat` — main conversational shopping UI (core screen, always the main focus)
- `/order/[id]` — order confirmation + status page

### 2.2 Feature List (User-facing)

| Feature | What it does | Depends on |
| --- | --- | --- |
| **Product search (through chat)** | The customer can search for products using natural language messages such as: `"I need a laptop under ₹60,000 for programming"` | `searchProducts` tool |
| **View product details** | Shows the selected product's complete details (price, description, stock) | `getProductDetails` tool |
| **Live stock check** | Checks whether the product is available in real time — stale data will never be shown | `checkInventory` tool |
| **Reasoned recommendation** | The agent does not only suggest a product — it also explains in one line why it recommended it ("programmers buy this more often with this laptop", "within budget and in stock") | `Recommendation` model, `reason` field |
| **Upsell/Cross-sell** | Suggests related items along with the main product (such as a keyboard or RAM upgrade), with a "why" tag | Recommendation engine |
| **Cart** | Add/remove items and change quantity — everything is validated on the server (latest price/stock is re-checked from the DB, the LLM is never trusted) | `addToCart`, `removeFromCart` |
| **Itemized total** | Shows a breakdown including unit price × quantity, discount, and tax — the total is always calculated by the backend; the LLM can never generate the number on its own | `calculateTotal` |
| **Order proposal** | Creates an order from the cart (no charge has happened yet, only a `"proposed"` state) | `createOrder` |
| **Explicit confirmation gate** | A real button — `"Confirm ₹X payment"` — payment can never start unless this button is clicked; the LLM cannot skip this step | `confirmOrder` (UI-click-only) |
| **Razorpay Test Mode Checkout** | After confirmation, the real Razorpay Checkout opens, where a test card/UPI can be used for payment | `createPayment` |
| **Payment verification** | Shows payment success/failure, with signature verification + webhook confirmation | `verifyPayment`, webhook |
| **Graceful failure recovery** | If a product goes out of stock during checkout, the agent automatically suggests an alternative — there will be no crash or double charge | Guardrail + fallback logic |
| **Order status page** | Shows all statuses of the order — paid/failed/pending | `/order/[id]` |

### 2.3 User Journey (Step by Step)

1. Customer types in chat: *"I need a laptop, budget 60k, for programming"*
2. Agent calls `searchProducts` and shows the top matches
3. Agent calls `getProductDetails` + `checkInventory`, highlights the best match, and also suggests a reasoned upsell (such as a keyboard)
4. When the customer says `"add it"` → `addToCart` (backend re-checks price/stock)
5. Cart total is displayed (`calculateTotal` — pure backend math)
6. When the customer says `"checkout"` → `createOrder` (proposal, not a charge)
7. The UI shows an itemized breakdown + **"Confirm ₹X payment"** button
8. Customer clicks the button → `confirmOrder` (the LLM cannot perform this step; only a real click can)
9. Razorpay Test Mode Checkout opens
10. Payment happens → client-side signature verification + server-side webhook (`payment.captured`) — the webhook is the real source of truth
11. Order becomes `"paid"`, and the customer sees the confirmation at `/order/[id]`
12. Every step is recorded in `AuditLog`

---

## 3. MERCHANT Side — All Features (Dashboard)

### 3.1 Pages

- `/merchant/products` — Catalog & Inventory management
- `/merchant/audit` — Audit Trail + AI-Attributed Revenue Dashboard (**This is the most important page — the X-factor "proof" will be shown here**)

### 3.2 Feature List (Merchant-facing)

| Feature | What it does |
| --- | --- |
| **Product add/edit** | Full CRUD for name, description, price, category, tags, and stock quantity |
| **Inventory update (real-time)** | Stock can be decreased/increased, and the chat agent immediately uses the new value |
| **Order list view** | Shows all orders — pending / awaiting_payment / paid / failed — along with their status |
| **Audit Trail viewer** | Every action (search, cart add, guardrail reject, payment verify) is shown with timestamp, actor (agent/user/system), and reason — with filtering/search |
| **AI-Attributed Revenue metric** | Shows "how much revenue came from AI upsell/cross-sell" — a live number comparing the baseline cart vs. the recommended cart |
| **Guardrail-reject log** | Shows separately whether any unsafe/invalid action was blocked — these logs are very effective for the demo |
| **Recommendation reasoning log** | Shows why a particular product was recommended and whether the customer accepted it — the complete history |

### 3.3 Merchant Flow (Step by Step)

1. Merchant logs in/accesses `/merchant/products`
2. Adds a product (name, price, stock, category, tags)
3. Customers shop through chat (according to the User flow)
4. Merchant goes to `/merchant/audit` and sees:
   - How many orders were placed and their statuses
   - How many upsells were accepted and how much additional revenue was generated
   - Whether any guardrail was triggered/blocked (proof that the system is safe)
5. If necessary, the merchant updates stock — the agent immediately respects the update

---

## 4. Phase-by-Phase Build Plan (User + Merchant, Combined)

### **Phase 1 — Foundation (Catalog + Merchant Basic CRUD)**

**Goal:** Product database is ready, and the merchant can add/edit products.

- Build: Prisma schema (Merchant, Product), seed script (15–20 products), `/merchant/products` CRUD, `/api/products`
- User-side: Nothing yet
- Merchant-side: **Product add/edit/list** ✅
- Skip: Auth polish, styling
- Done when: Products can be added/edited from the Merchant UI, and the list can be retrieved from the API

### **Phase 2 — Agent Loop + Search (Read-only)**

**Goal:** Products can be searched through chat and recommendations can be generated (no money-related actions yet)

- Build: `/api/chat` agent loop, `searchProducts`, `getProductDetails`, `checkInventory` tools
- User-side: **Chat search + product recommendation** ✅
- Merchant-side: Nothing new
- Done when: Typing `"laptop under 60k"` in chat returns a real DB-based answer

### **Phase 3 — Cart + Upsell/Cross-sell**

**Goal:** The cart works and the agent provides reasoned upsell recommendations

- Build: `Cart`/`CartItem` model, `addToCart`, `removeFromCart`, `calculateTotal`, upsell logic + `Recommendation` model (with reason)
- User-side: **Cart add/remove, itemized total, upsell suggestion** ✅
- Merchant-side: Nothing new (data is being collected in the background)
- Done when: An item can be added to the cart, an upsell is suggested with a reason, and the total always comes from the backend

### **Phase 4 — Order + Guardrails + Confirmation Gate**

**Goal:** Order proposal + explicit human confirmation, with everything bounded

- Build: `createOrder`, `confirmOrder` (UI-only button), server-side price/stock/amount validation, `AuditLog` written for every tool call
- User-side: **Order proposal, "Confirm ₹X payment" button** ✅
- Merchant-side: **Audit log (raw data) starts in the background**
- Done when: Even if someone tries to make the agent skip confirmation through prompt injection, it structurally fails, and the attempt is captured in the log

### **Phase 5 — Razorpay Integration (Real Payment)**

**Goal:** Real Test Mode payment works from start to finish

- Build: `razorpay.orders.create()`, Checkout launch, client-side signature verification, `/api/webhooks/razorpay` (webhook signature verification + order status update)
- User-side: **Real Razorpay Test Mode Checkout, payment verification, order status page** ✅
- Merchant-side: **Real payment status appears in the order list** ✅
- Done when: A complete test-mode payment successfully finishes and the webhook changes the order to `"paid"`

### **Phase 6 — Failure Handling + Merchant Audit Dashboard**

**Goal:** Graceful failure demo + complete Merchant audit/revenue dashboard

- Build: Out-of-stock mid-checkout scenario (agent gracefully suggests an alternative), `/merchant/audit` page — filter, AI-attributed revenue calculation
- User-side: **Graceful failure recovery (alternative suggestion)** ✅
- Merchant-side: **Full Audit Trail viewer + AI-Attributed Revenue dashboard** ✅ (X-factor payoff)
- Done when: An out-of-stock situation can be triggered live, the agent recovers automatically, and the revenue number is visible on the dashboard

### **Phase 7 — Polish + Demo Rehearsal**

**Goal:** Make the 5-minute demo tight

- Build: Nothing new — UI polish, bug fixes, demo script
- Done when: The full flow (search → upsell → cart → confirm → pay → audit dashboard → failure demo) can be run cold twice within 5 minutes

---

## 5. Feature-to-Phase Quick Reference Table

| Feature | Side | Phase |
| --- | --- | --- |
| Product CRUD | Merchant | 1 |
| Chat search & recommendation | User | 2 |
| Reasoned upsell/cross-sell | User | 3 |
| Cart (add/remove/total) | User | 3 |
| Order proposal + confirm gate | User | 4 |
| Guardrail validation | Backend (both) | 4 |
| Audit log (raw writes) | Backend | 4 |
| Razorpay Checkout + payment | User | 5 |
| Payment webhook verification | Backend | 5 |
| Order status page | User | 5 |
| Order list view | Merchant | 5 |
| Out-of-stock graceful recovery | User | 6 |
| Audit Trail viewer (UI) | Merchant | 6 |
| AI-Attributed Revenue dashboard | Merchant | 6 |
| Demo polish | Both | 7 |

---

## 6. P0 / P1 / P2 (Judging Priority)

**P0 — Must-have for judging**

Catalog + search, agent loop, cart (server-validated), order creation, confirmation gate, real Razorpay Test Mode payment, webhook verification, basic audit log, and one graceful failure demo.

**P1 — Strong differentiator**

Reasoned upsell/cross-sell (with reason), AI-Attributed Revenue dashboard, and a live guardrail-break demo.

**P2 — If there is time**

Catalog browse page polish, richer merchant product form, secondary payment-failure scenario, and promo-code discount.

---

*If you want to add something new or need code details for any phase, let me know — we can start with the Phase 1 Prisma schema + seed script.*
