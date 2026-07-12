# Boutika — Startup Document

**Boutika is the operating system for Nigerian boutiques.** Know your stock, your money, and who owes you — then sell everywhere from the same place. Business management first; a storefront and marketplace attached on top of a back office the owner already trusts.

*All figures below trace to the [research report](research-nigeria-boutique-saas.md), which carries per‑claim confidence tags. ✅ = adversarially verified; 🟡 = reported/directional; 🔵 = our judgement.*

---

## 1. The problem

A Nigerian boutique owner — selling ready‑to‑wear, thrift ("okrika"), shoes, bags and accessories from a shop, an Instagram page, or both — runs a real business on **memory, a notebook, and WhatsApp.** The consequences are measurable:

- **She loses money she can't see.** Memory‑based management causes *"undetected revenue leakages, stock mismanagement, and unrecorded debts."* ✅
- **Staff theft goes undefended.** Many Nigerian SMEs have *"no preventive measures against employee theft."* ✅
- **Credit sales pile up untracked.** Selling on credit is *"a Nigerian small business reality"* — receivables scatter across notebooks and chats until unpaid debt threatens the shop. 🟡
- **Existing software is out of reach or too hard.** Accountants and accounting software are *"prohibitive,"* and foreign tools (QuickBooks/Excel) demand documentation discipline owners don't have. ✅

She does not want accounting. She wants to **stop losing money to stock, staff, and debtors — without becoming a bookkeeper.**

---

## 2. Why now

- **The market already buys SaaS like this.** Bumpa has 100k+ installs at 4.41★ — the combined management‑plus‑storefront model is *proven* in Nigeria. ✅
- **The rails exist.** Instant bank transfer (NIP), USSD, and QR are how the market already pays; 48% restock by transfer. ✅
- **Social commerce is large and growing** (~US$2.04B in 2025 → ~US$3.96B by 2030). 🟡
- **The incumbents are horizontal.** Nobody owns the *fashion boutique* vertical with the depth it needs (size/colour variants, thrift one‑of‑ones, layaway, restock trips). 🔵

---

## 3. Who it serves

**Primary user (Phase 1):** the owner‑operator boutique — 1 shop and/or an active Instagram/WhatsApp page, 1–3 staff, restocking on trips (Balogun/Yaba/Onitsha/Aba locally; Istanbul/Guangzhou/Dubai/UK abroad).

**Secondary user (Phase 1):** the **shop attendant**, who logs sales under her own PIN — turning staff from a theft risk into an accountable node.

**Eventual user (Phase 3+):** the **buyer**, who discovers verified boutiques in a trust‑engineered marketplace and pays on delivery / pay‑to‑release.

---

## 4. Product

### Core loop
**Log stock → log sales (auto‑decrement) → see money & debtors → collect what you're owed → restock smarter → (turn on) sell online.**

Every step must beat the notebook on speed. Core actions complete in **under 5 seconds, one‑handed, offline‑tolerant**, on a cheap Android — because the verified barriers are inconsistent documentation, time, and low digital literacy. ✅

### Modules

**Tier 0 — Trust‑winning core (MVP). This is the product.**
- **One‑tap sale** (cash/transfer, optional customer tag)
- **Variant inventory** (product → size → colour, cost & price, auto‑decrement, low‑stock alerts)
- **Debtor ledger** ("who owes me, since when") with one‑tap WhatsApp reminder
- **Money view** (sales, expenses, owed, rough profit — plain language)
- **Staff accountability** (per‑attendant PIN, owner sees every sale/discount/adjustment)
- **Expense logging** (restock, rent, transport)
- **Offline‑first PWA** (syncs when back online)

**Tier 1 — Selling, attached to the trusted core**
- **Instant storefront** — the catalog she already keeps becomes `hername.boutika.shop`, zero re‑entry
- **WhatsApp‑native checkout** — "Order" opens WhatsApp pre‑filled; confirmed orders drop into sales + inventory automatically
- **Reconciling payments** — transfer/USSD/QR/card, proof‑of‑payment, **auto‑match to invoice**
- **Social sync** — catalog ↔ Instagram; channel‑level sales analytics

**Tier 2 — The moat (later)**
- **Restock‑trip planner** — "based on what sold, here's your shopping list"
- **Boutika Marketplace** — verified boutiques, ratings, pay‑on‑delivery/pay‑to‑release
- **Layaway/instalments**; later, **naira‑safe restock financing** underwritten on real history

### What Boutika deliberately is NOT
- ❌ Not a POS‑terminal / agency‑banking hardware business (this killed Kippa's funded bet). ✅
- ❌ Not a lender before it has data and a naira‑resistant model.
- ❌ Not a horizontal "any business" tool — ruthlessly *fashion boutique*.

---

## 5. Business model

Calibrated to hard constraints: **44% of owners earn <₦20k/day** ✅ and **Nigerian micro‑merchants revolt at price rises** (Kippa's ₦25→₦35→₦25). ✅

| Tier | Price | For | Includes |
|---|---|---|---|
| **Free (Starter)** | ₦0 | Acquisition; beat the notebook | Capped catalog, sale/stock/debtor logging, 1 staff |
| **Boutika Pro** | **₦3,500/mo** (₦9,000/qtr) | The serious owner | Unlimited catalog, full debtor tools + reminders, staff PINs, storefront, analytics |
| **Boutika Store+** | **₦6,500/mo** (₦18,000/qtr) | Selling online seriously | Everything + payment reconciliation, social sync, custom domain, priority support |

- **Anchor deliberately at/under Bumpa's ₦5,000/mo floor.** ✅ Value is framed as *money recovered* (debt collected, shrinkage caught), not features.
- **Quarterly/annual billing** matches how the market already buys (Bumpa) and smooths cash‑flow shocks.
- **Optional, near‑invisible transaction fee** only on *online storefront* payments the owner chooses to accept — never a tax on her core in‑shop takings.
- **No dollar‑denominated cost base.** Software margins, not hardware.

🔵 *Unit‑economics test: a Pro subscriber must recover more than ₦3,500/mo in visible debt or caught shrinkage within her first month, or the price won't hold.*

---

## 6. Competition & moat

- **Bumpa** (100k+ installs, 4.41★, ₦5k–₦10k/mo) is horizontal — "any business." ✅ Boutika wins by **vertical depth**: variant/thrift catalogs, debtor tools, layaway, staff accountability, restock analytics — things a generalist treats generically. 🔵
- **The real competitor is the status quo:** WhatsApp + a notebook (free). We beat it on **speed and trust**, not features.
- **Moat compounds** from (1) the switching cost of her living inventory + debtor + sales history, (2) vertical depth, and (3) eventually a marketplace fed by our own supply of verified boutiques.

---

## 7. Go‑to‑market

1. **Concierge Phase 0** — hand‑onboard 15–25 boutiques in one cluster (e.g., a Lagos plaza or an active Instagram‑vendor circle). Log their stock and debtors *for* them; watch what they actually use.
2. **Land free, beat the notebook** — the wedge is faster sale/stock/debtor logging, not a website.
3. **Recover money → convert to Pro** — the upgrade trigger is visible debt collected via WhatsApp reminders.
4. **Turn on selling** — once she trusts Boutika with her numbers, the storefront is one toggle.
5. **Cluster‑by‑cluster density** — boutiques refer boutiques within a market/plaza/niche; density feeds the eventual marketplace.

Channels: Instagram/WhatsApp vendor communities, market‑association partnerships, fashion micro‑influencers, and referral loops.

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| Price ceiling too low to sustain SaaS ✅ | Value = money recovered; free acquisition tier; quarterly billing; invisible optional fees |
| Bumpa entrenched & funded ✅ | Own the fashion vertical with depth; don't fight horizontally |
| Marketplace trust collapse 🟡 | Delay marketplace until supply + reliability exist; pay‑on‑delivery/escrow; verified sellers |
| Macro/FX fragility ✅/🟡 | No dollar‑cost base; software‑margin business |
| Abandonment poisons trust 🟡 | Data export/portability + uptime as features |
| Low digital literacy → churn ✅ | <5s actions, one‑handed, photo/voice input, offline‑first |

---

## 9. Relationship to Medja & Handwork

Boutika is the third vertical explored in this portfolio (after **Medja**, cleaning companies, and **Handwork**, building trades). It shares the reusable core the others need — **naira payments, WhatsApp‑native messaging, Android‑first PWA, staff/role management, offline sync** — but the catalog/inventory model is boutique‑specific and not shared. Sequencing across the three remains a portfolio decision; Boutika has the clearest *proven* comparable (Bumpa) and the clearest *verified* failure to learn from (Kippa).

---

## 10. Roadmap (phases with exit tests)

### Phase 0 — Validation (4–6 weeks, minimal code)
- Concierge‑onboard 15–25 boutiques; log their stock + debtors manually.
- **Exit test:** ≥10 owners say "don't take this away," and ≥5 verbally commit to ₦3,500/mo *after* seeing recovered debt/shrinkage.

### Phase 1 — Trust‑winning core (8–10 weeks)
- Ship Tier 0: one‑tap sale, variant inventory, debtor ledger + WhatsApp reminders, money view, staff PINs, offline PWA.
- **Exit test:** 50 active boutiques logging daily; median core action <5s; ≥30% free→Pro conversion in cohort 1.

### Phase 2 — Selling attached (8–12 weeks)
- Instant storefront, WhatsApp checkout, reconciling payments, social sync.
- **Exit test:** ≥40% of Pro users turn on a storefront; first ₦X in reconciled online GMV; storefront users retain better than non‑storefront.

### Phase 3 — Moat: analytics + marketplace beta (12+ weeks)
- Restock‑trip planner; invite‑only marketplace in 1–2 dense clusters with pay‑on‑delivery.
- **Exit test:** buyers complete repeat purchases; verified‑seller trust metrics beat cold social selling; supply density sufficient for a category to feel "full."

### Phase 4 — Scale
- New clusters/cities; layaway; naira‑safe restock financing underwritten on real history.

---

## 11. Open questions to resolve in Phase 0

1. Will owners pay ₦3,500/mo *after* recovering visible debt/shrinkage?
2. Thrift/okrika one‑of‑one items: separate mode, or out of v1 scope?
3. Cheapest WhatsApp path that still auto‑captures the order (Business API vs. click‑to‑chat)?
4. How many trusted active boutiques before a buyer marketplace is worth launching?
5. Can we auto‑reconcile a bank transfer to an invoice without full open‑banking access?

---

*Companion documents: [Research report](research-nigeria-boutique-saas.md) · interactive [mobile](../boutika/prototype-mobile.html) and [web](../boutika/prototype-web.html) prototypes.*
