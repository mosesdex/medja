# Medja — Design Spec

*Date: 2026-07-11 · Status: draft for founder review*
*Grounding research: [docs/research-nigeria-cleaning-saas.md](../../research-nigeria-cleaning-saas.md)*

## 1. What Medja is

Medja is a multi-tenant SaaS that lets Nigerian cleaning-company owners run their whole operation — clients, jobs, field staff, quotes, invoices, and payments — from an Android phone. It replaces the WhatsApp-group + paper-job-card + phone-call workflow with a single app, and it collects money through Nigerian rails (Paystack: card, bank transfer, USSD), which no global competitor does.

**First users:** the founder's own cleaning company plus other owners the founder can reach — so multi-tenant from day one, validated on a real business immediately.

## 2. Decisions made (founder-confirmed)

| Decision | Choice |
|---|---|
| Tenancy | Multi-tenant SaaS from day one |
| Scope | Full P0 + key P1 (~25 features, phased delivery below) |
| Platform | **PWA** — one codebase serving the owner dashboard and the cleaner field app; installable to Android home screen; native app deferred until workflows stabilize |

## 3. Defaults set by Claude — review these

These were not explicitly decided; each is a reasonable default flagged for founder sign-off:

1. **Stack:** Next.js (App Router, TypeScript) PWA on Vercel + **Supabase** (Postgres, Auth, Storage, Row-Level Security) — Supabase is already connected to the dev environment. Tailwind CSS + shadcn/ui components.
2. **Payments:** **Paystack** as the launch payment provider (cards, bank transfer, USSD, and virtual accounts for transfer reconciliation). Flutterwave can be added later; supporting both at launch doubles integration work for little pilot value.
3. **WhatsApp:** launch with **`wa.me` share links** (zero approval needed — owner taps "Send via WhatsApp" and the message opens pre-filled). Upgrade to the WhatsApp Business API (automated notifications) in Phase 4 once volume justifies Meta approval.
4. **Pricing (hypothesis to validate with pilots, monthly, naira):**
   - Starter — ₦15,000/mo: 1 owner + up to 5 staff
   - Growth — ₦35,000/mo: up to 20 staff, recurring contracts, payroll
   - Pro — ₦75,000/mo: unlimited staff, multi-site clients, reports, API
   - 14-day free trial; SaaS subscription itself collected via Paystack.
5. **Offline strategy:** low-bandwidth PWA with cached reads (today's jobs viewable offline) and queued writes for job completion; **not** full offline-first sync in v1 (research open-question — revisit after field testing).

## 4. Architecture

```
Android phone (owner / supervisor / cleaner / accountant)
        │  PWA (Next.js, installable, service worker cache)
        ▼
Next.js app ── Supabase JS client ──► Supabase
                                       ├─ Postgres (RLS: every row scoped by company_id)
                                       ├─ Auth (phone/email OTP; roles in JWT claims)
                                       ├─ Storage (job photos, staff ID docs)
                                       └─ Edge Functions (Paystack webhooks, invoice numbering,
                                                          recurring-job generation cron)
External: Paystack (payment links, virtual accounts, webhooks) · wa.me links
```

- **Multi-tenancy:** single database; every table carries `company_id`; RLS policies enforce isolation; user→company membership with role (`owner`, `supervisor`, `accountant`, `cleaner`).
- **One PWA, role-shaped UI:** cleaners see a stripped "My Jobs" experience; owners see the full dashboard. Same deployment, routes gated by role.
- **Recurring contracts:** a `contracts` table holds the schedule rule (e.g., Mon–Fri daily); a scheduled Edge Function materializes `jobs` rows 14 days ahead.
- **Money flow:** invoice → Paystack payment link (or recorded cash) → webhook marks invoice paid → dashboard updates. Virtual account per company for bank-transfer reconciliation (Phase 3).

## 5. Data model (core tables)

`companies`, `members` (user+role), `clients`, `client_sites`, `staff_profiles` (ID/NIN doc, guarantor name/phone/address/ID, vetting_status), `contracts` (recurrence rule, site, monthly amount), `jobs` (type: residential/commercial/post_construction; status pipeline: booked → en_route → in_progress → done → invoiced → paid), `job_assignments`, `job_checklist_items`, `job_photos` (before/after), `job_events` (GPS check-in/out with lat/lng+time), `quotes` (+ template floors by property type/room count), `invoices` (+ VAT flag, deposit tracking), `payments` (paystack/cash/transfer, reconciliation ref), `expenses`, `payroll_runs` + `payroll_items`, `ratings`, `inventory_items` (P2, schema reserved).

## 6. Feature set by phase (~26 features)

**Phase 1 — Operate (owner can run the business):** company onboarding & auth · client CRM with sites & access notes · job calendar (day/week/month) · digital job cards · 3 job types with per-type checklists templates · quote builder with room-count "starting from" templates · naira invoices (VAT optional) · WhatsApp share for quotes/invoices · owner dashboard (today's jobs, cash, outstanding).

**Phase 2 — Field (cleaners on the app):** role-based cleaner view ("My Jobs") · dispatch & assignment with conflict warnings · status pipeline updates · GPS check-in/out · before/after photos · on-site checklist ticking · staff profiles with ID + guarantor + vetting status · verified-cleaner profile share to client.

**Phase 3 — Money:** Paystack payment links on invoices · cash-collection logging · deposits/part-payments · automated payment reminders (wa.me prefilled + SMS later) · recurring contracts with auto job generation · auto monthly contract invoicing · virtual-account transfer reconciliation · expense tracking.

**Phase 4 — Scale:** attendance from GPS events · payroll computation (per-job/daily/monthly) · public booking link · post-job client ratings · reports (revenue by type, top clients, staff utilization) · multi-site rollups · WhatsApp Business API notifications · SaaS billing & plan limits · offline hardening.

## 7. Error handling & edge cases

- **Flaky connectivity:** service-worker caches the cleaner's day; completion actions queue locally and retry; UI always shows sync state ("saved on phone, will upload").
- **GPS unavailable/refused:** check-in still allowed, flagged "no location" for the owner's attention.
- **Payment webhook missed:** nightly reconciliation poll of Paystack; manual "mark as paid" with audit note always available.
- **Double-booking:** warn (not block) on staff-time conflicts — real operations sometimes intentionally overlap.
- **Photo uploads on poor data:** client-side compression (~200 KB target) before upload.
- **Tenant isolation:** RLS tested with cross-company access attempts in CI.

## 8. Testing

- Unit tests for pricing/invoice math (VAT, deposits, naira formatting — always kobo-integer internally).
- RLS policy tests (the multi-tenant security boundary).
- Playwright happy-path e2e per phase: create client → book job → assign → complete with photos → invoice → pay (test mode).
- Pilot verification: founder's company runs a real week per phase before the next phase starts.

## 9. Out of scope for v1

Native Android/iOS apps · full offline-first sync · Flutterwave · WhatsApp Business API (until Phase 4) · chemical inventory & equipment register (P2, schema reserved) · client self-service portal · route optimization · English-only UI (Pidgin/Hausa/Yoruba/Igbo later).

## 10. Success criteria

1. Founder's company runs a full week — every job, quote, invoice — inside Medja (no paper, no scheduling in WhatsApp groups).
2. At least one payment collected via a Medja Paystack link.
3. A second company onboards without a code change.
4. Cleaner app usable on a low-end Android over 3G: first load < 3s on repeat visits, job completion possible with photos.
