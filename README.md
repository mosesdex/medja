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

Pre-code: research ✅ · design spec ✅ · prototype ✅ · implementation plan next.
