# Medja

**Run your cleaning company from your phone.** Medja is a multi-tenant SaaS for Nigerian cleaning companies — residential, office/commercial, and post-construction — replacing paper job cards, WhatsApp-group scheduling, and untracked cash with one Android-first PWA.

## Why it wins

- **Collects money in Nigeria.** Paystack payment links (card / bank transfer / USSD), cash logging, and naira invoicing — none of the global tools (Jobber, ZenMaid, Housecall Pro) support Nigerian payments at all.
- **Built for how Nigerian cleaning firms actually work.** Room-count quoting in naira, staff vetting with guarantor records, recurring commercial contracts with daily job generation, WhatsApp-native client messaging.
- **Android-first PWA.** Installs to the home screen, light on data, works on cheap phones — for the owner and every cleaner in the field.

## Documents

| Doc | What's in it |
|---|---|
| [Research report](docs/research-nigeria-cleaning-saas.md) | Verified market findings + 40 prioritized features |
| [Design spec](docs/superpowers/specs/2026-07-11-medja-saas-design.md) | Architecture, data model, phases, decisions & flagged defaults |
| [Roadmap](docs/roadmap.md) | Phase-by-phase delivery plan |
| [Mobile prototype](prototype/medja-prototype.html) | Clickable mock of the key screens |

## Stack (planned)

Next.js (TypeScript) PWA · Supabase (Postgres + Auth + Storage + RLS) · Tailwind + shadcn/ui · Paystack · Vercel

## Status

Research ✅ · design spec ✅ · prototypes ✅ · implementation plan ✅ · **app built (Phases 1–4) ✅**

The working application lives in [`medja-app/`](medja-app/) — Next.js + Supabase + Paystack,
all four phases implemented (auth, clients, jobs, quotes, invoices, staff vetting,
cleaner field app with GPS + photos, Paystack payments, recurring contracts,
payroll, reports, booking link, billing). See [`medja-app/README.md`](medja-app/README.md)
to run it and [`docs/superpowers/plans/2026-07-12-medja-implementation.md`](docs/superpowers/plans/2026-07-12-medja-implementation.md)
for the plan. 30 unit tests pass; production build is clean (31 routes).

---

## Related startup explorations

This repo also hosts other Nigerian-market startup concepts explored in the same research-first style:

| Concept | What it is | Where |
|---|---|---|
| **Boutika** | Business-management + storefront SaaS for Nigerian **boutique / fashion retail** owners (management first, selling second) | [Website](boutika/index.html) · [Research](docs/research-nigeria-boutique-saas.md) · [Startup doc](docs/boutika-startup-doc.md) · [Mobile](boutika/prototype-mobile.html) · [Web](boutika/prototype-web.html) |
| **Handwork** | B2B verified-workforce platform for Nigeria's **building trades** | [Startup doc](docs/handwork-startup-doc.md) |

Live sites (GitHub Pages): **[Medja](https://mosesdex.github.io/medja/)** · **[Boutika](https://mosesdex.github.io/medja/boutika/)**
