# Medja Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Medja — a multi-tenant, Android-first PWA for Nigerian cleaning companies to run scheduling, staff, quoting, invoicing and Nigerian-rail payments — across four phases, each a working, pilotable slice.

**Architecture:** Next.js (App Router, TypeScript) PWA on the front, Supabase (Postgres + Auth + Storage + RLS) as the backend. Every table carries `company_id`; Row-Level Security enforces tenant isolation. A single deployment serves owner, supervisor, accountant and cleaner roles, with the UI shaped by role. Server code talks to Supabase via server components and route handlers; the field app uses a service worker for low-bandwidth/offline tolerance.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase JS v2, Supabase CLI migrations, Paystack, `next-pwa` (Serwist), Vitest + Testing Library, Playwright, Vercel.

## Global Constraints

- **Currency:** all money stored as **integer kobo** (₦1 = 100 kobo); never floats. Format for display as `₦{amount/100}` with thousands separators.
- **Tenancy:** every domain table has `company_id uuid not null`; every query path is RLS-guarded. No table is readable across companies.
- **Android-first:** target low-end Android + 3G. Repeat-visit first paint < 3s. Compress uploaded images client-side to ~200 KB.
- **Auth identity:** Supabase Auth; a `members` row links `auth.uid()` → `company_id` + `role` (`owner` | `supervisor` | `accountant` | `cleaner`).
- **Naming:** product is **Medja** (never "Mesjia"). Package/repo slug `medja`.
- **Time:** store timestamps as `timestamptz` UTC; display in Africa/Lagos (WAT, UTC+1).
- **Payments provider:** Paystack only at launch (card, bank transfer, USSD, dedicated virtual accounts).
- **WhatsApp:** launch via `wa.me` prefilled share links; WhatsApp Business API deferred to Phase 4.

---

## File / Module Structure

```
medja/
├── supabase/
│   ├── migrations/                  # versioned SQL — one file per logical change
│   └── config.toml
├── src/
│   ├── app/
│   │   ├── (auth)/                  # login, onboarding — unauthenticated
│   │   ├── (owner)/                 # owner/supervisor/accountant dashboard
│   │   │   ├── dashboard/ jobs/ money/ staff/ clients/ reports/ settings/
│   │   ├── (cleaner)/               # cleaner "My Jobs" field app
│   │   ├── book/[slug]/             # public booking link (Phase 4)
│   │   └── api/                     # route handlers: paystack webhook, cron
│   ├── components/                  # shared UI (shadcn-based)
│   ├── lib/
│   │   ├── supabase/                # server + browser + middleware clients
│   │   ├── money.ts naira.ts        # kobo helpers, formatting
│   │   ├── paystack.ts              # Paystack SDK wrapper
│   │   ├── whatsapp.ts              # wa.me link builder
│   │   └── auth.ts rbac.ts          # session + role guards
│   ├── features/                    # domain logic by feature (clients, jobs, invoices…)
│   └── types/database.ts            # generated Supabase types
├── tests/                           # Vitest unit + Playwright e2e
└── ...config
```

---

# PHASE 0 — Foundation

### Task 0.1: Scaffold Next.js + Tailwind + tooling
**Files:** Create `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `.env.local.example`, `.gitignore`.
**Deliverable:** `npm run dev` serves a themed landing placeholder; `npm run build` passes; Tailwind + design tokens (primary `#2563EB`, accent `#059669`) wired.
**Test:** Vitest smoke test renders `<Home/>`; `npm run build` exits 0.

### Task 0.2: Supabase clients + env
**Files:** Create `src/lib/supabase/server.ts`, `browser.ts`, `middleware.ts`; `src/middleware.ts`; extend `.env.local.example` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
**Interfaces:** Produces `createServerClient()`, `createBrowserClient()`, `updateSession(req)`.
**Deliverable:** Server & browser Supabase clients; auth cookie refresh in middleware.

### Task 0.3: Money + naira helpers (TDD)
**Files:** Create `src/lib/money.ts`, `tests/money.test.ts`.
**Interfaces:** Produces `toKobo(naira: number): number`, `formatNaira(kobo: number): string`, `addKobo(...n): number`, `applyVat(kobo, rate=7.5): {vat, total}`.
**Test:** `formatNaira(5500000)` → `"₦55,000"`; `applyVat(5500000)` → `{vat: 412500, total: 5912500}`; rounding is integer-safe.

### Task 0.4: Core schema migration — tenancy + auth mapping
**Files:** Create `supabase/migrations/0001_core.sql`.
**Contents:** `companies`, `members` (user_id, company_id, role, name), helper `auth_company_id()` SQL function reading the caller's membership, RLS enabled on both, policies. Trigger to create a `companies` row + owner `members` row on signup-onboarding RPC `create_company(name)`.
**Test:** SQL test — a member of company A cannot select company B's row.

### Task 0.5: Generate DB types + CI
**Files:** Create `src/types/database.ts` (generated), `.github/workflows/ci.yml` (typecheck, lint, unit, build).
**Deliverable:** `supabase gen types` output committed; CI green.

---

# PHASE 1 — Operate

**Exit test:** the founder schedules and invoices a real week of jobs in Medja.

### Task 1.1: Auth — phone/email OTP login
**Files:** `src/app/(auth)/login/page.tsx`, `src/lib/auth.ts`, `tests/auth.test.ts`.
**Interfaces:** Produces `getSession()`, `requireUser()`, `signInWithOtp(identifier)`.
**Deliverable:** OTP login; unauthenticated users redirected to `/login`; authenticated-but-no-company users redirected to `/onboarding`.

### Task 1.2: Company onboarding
**Files:** `src/app/(auth)/onboarding/page.tsx`, `src/features/company/actions.ts`.
**Interfaces:** Consumes `create_company` RPC. Produces server action `createCompany(formData)`.
**Deliverable:** New user creates a company (name, city, service types), becomes owner, lands on dashboard.

### Task 1.3: RBAC guards + app shells
**Files:** `src/lib/rbac.ts`, `src/app/(owner)/layout.tsx`, `src/app/(cleaner)/layout.tsx`.
**Interfaces:** Produces `requireRole(...roles)`, `getMember()`. Owner shell = sidebar nav; cleaner shell = bottom nav.
**Deliverable:** Owner routes 403 for cleaners and vice-versa; nav matches the prototypes.

### Task 1.4: Clients schema + CRM
**Files:** `supabase/migrations/0002_clients.sql` (`clients`, `client_sites`), `src/features/clients/*`, `src/app/(owner)/clients/*`.
**Interfaces:** Produces `listClients()`, `getClient(id)`, `createClient(input)`, `addSite(clientId, input)`.
**Deliverable:** Create/list/view clients with multiple sites, access notes, service history stub. RLS-scoped. CRUD tested.

### Task 1.5: Jobs schema + job types + calendar
**Files:** `supabase/migrations/0003_jobs.sql` (`jobs` with `type` enum residential|commercial|post_construction, `status` enum booked→en_route→in_progress→done→invoiced→paid, `checklist_templates`, `job_checklist_items`), `src/features/jobs/*`, `src/app/(owner)/jobs/*`.
**Interfaces:** Produces `listJobs(range)`, `createJob(input)`, `updateJobStatus(id, status)`, `getJob(id)`.
**Deliverable:** Week/day calendar; create a job (client, site, type, team, time); per-type default checklist seeded onto the job. Double-booking warning (non-blocking).

### Task 1.6: Digital job card
**Files:** `src/app/(owner)/jobs/[id]/page.tsx`, `src/features/jobs/checklist.ts`.
**Interfaces:** Produces `toggleChecklistItem(jobId, itemId)`.
**Deliverable:** Job card shows client, site, access notes, team, checklist with progress, value; matches mobile prototype.

### Task 1.7: Quote builder (room-count naira templates)
**Files:** `supabase/migrations/0004_quotes.sql` (`quote_templates`, `quotes`, `quote_lines`), `src/features/quotes/*`, `src/app/(owner)/money/quotes/*`.
**Interfaces:** Produces `listTemplates()`, `createQuote(clientId, lines)`, `quoteToInvoice(quoteId)`.
**Deliverable:** Property-type/room-count templates with editable "starting from" kobo floors; build a quote, adjust lines, total in naira.

### Task 1.8: Invoices (naira, VAT, deposits)
**Files:** `supabase/migrations/0005_invoices.sql` (`invoices`, `invoice_lines`, sequence per company), `src/features/invoices/*`, `src/app/(owner)/money/*`.
**Interfaces:** Consumes `applyVat`. Produces `createInvoice(input)`, `getInvoice(id)`, `recordManualPaid(id)`, `invoiceNumber(companyId)`.
**Deliverable:** Invoice with lines, optional VAT, deposit tracking, balance due; per-company sequential numbering; statuses draft/sent/balance_due/overdue/paid.

### Task 1.9: WhatsApp share
**Files:** `src/lib/whatsapp.ts`, `tests/whatsapp.test.ts`, share buttons on quote/invoice/job.
**Interfaces:** Produces `waLink(phone, message): string`.
**Deliverable:** One-tap "Send via WhatsApp" opens `wa.me` with a prefilled quote/invoice message including a summary. Nigerian number normalization (0803… → 234803…) tested.

### Task 1.10: Owner dashboard
**Files:** `src/app/(owner)/dashboard/page.tsx`, `src/features/dashboard/queries.ts`.
**Interfaces:** Produces `dashboardSummary(companyId)` → jobs today, collected today, outstanding, needs-attention.
**Deliverable:** Dashboard matching the web prototype: KPI tiles, today's jobs, needs-attention, staff-on-duty stub. **Phase-1 exit-test target.**

### Task 1.11: Phase-1 e2e
**Files:** `tests/e2e/phase1.spec.ts`.
**Deliverable:** Playwright: sign in → create company → add client+site → book a job → build quote → convert to invoice → mark paid → see it on dashboard.

---

# PHASE 2 — Field

**Exit test:** a real job completed end-to-end by a cleaner on their phone, with photos the client receives.

### Task 2.1: Staff schema + vetting
**Files:** `supabase/migrations/0006_staff.sql` (`staff_profiles`: nin_doc, id_photo, guarantor_{name,phone,address,id}, vetting_status, background_check; `teams`, `team_members`), Storage bucket `staff-docs` (private, RLS).
**Interfaces:** Produces `createStaff(input)`, `setVettingStatus(id, status)`, `uploadStaffDoc(id, file)`.
**Deliverable:** Staff profiles with ID/guarantor docs and vetting-status tracker; teams.

### Task 2.2: Dispatch & assignment
**Files:** `supabase/migrations/0007_assignments.sql` (`job_assignments`), `src/features/dispatch/*`.
**Interfaces:** Produces `assignJob(jobId, staffIds[])`, conflict check `staffConflicts(staffId, window)`.
**Deliverable:** Assign staff/team to jobs; conflict warnings surfaced (non-blocking).

### Task 2.3: Cleaner "My Jobs" app
**Files:** `src/app/(cleaner)/my-jobs/*`.
**Interfaces:** Consumes `listJobs` scoped to `assigned_to = me`.
**Deliverable:** Cleaner sees today's assigned jobs, site + access notes; matches mobile prototype cleaner view.

### Task 2.4: GPS check-in/out
**Files:** `supabase/migrations/0008_job_events.sql` (`job_events`: type, lat, lng, at), `src/features/field/checkin.ts`, cleaner UI.
**Interfaces:** Produces `checkIn(jobId, coords)`, `checkOut(jobId, coords)`.
**Deliverable:** Geolocation check-in stamps time+coords on the job; "no location" flag when denied; owner sees check-in on job card.

### Task 2.5: Photos (before/after, compressed)
**Files:** `supabase/migrations/0009_job_photos.sql` (`job_photos`), Storage bucket `job-photos`, `src/lib/image.ts` (client compression), cleaner UI.
**Interfaces:** Produces `compressImage(file, ~200KB)`, `uploadJobPhoto(jobId, kind, file)`.
**Deliverable:** Before/after photo capture, compressed client-side, attached to job card, visible to owner.

### Task 2.6: On-site checklist ticking + completion
**Files:** cleaner job detail, `completeJob(jobId)`.
**Deliverable:** Cleaner ticks checklist, adds photos, completes job → status `done`, owner notified (in-app).

### Task 2.7: Verified-cleaner share
**Files:** `src/features/staff/verified-card.ts`.
**Interfaces:** Produces `verifiedCleanerMessage(staffId)`.
**Deliverable:** Owner shares a cleaner's photo/first-name/vetting badge to the client via `wa.me` before the visit.

### Task 2.8: Phase-2 e2e
**Files:** `tests/e2e/phase2.spec.ts`.
**Deliverable:** Assign job → cleaner logs in → check-in (mock geo) → tick checklist → upload photo → complete → owner sees completion + photos.

---

# PHASE 3 — Money

**Exit test:** a client pays a Medja invoice via Paystack; a monthly contract invoices itself.

### Task 3.1: Paystack wrapper + config
**Files:** `src/lib/paystack.ts`, `tests/paystack.test.ts`, env `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`.
**Interfaces:** Produces `initTransaction({invoiceId, amountKobo, email})`, `verifyTransaction(ref)`, `createDedicatedAccount(customer)`.
**Deliverable:** Server wrapper for Paystack init/verify (mocked in tests).

### Task 3.2: Payment links on invoices
**Files:** `supabase/migrations/0010_payments.sql` (`payments`: method paystack|cash|transfer, ref, reconciliation), `src/features/payments/*`, invoice UI.
**Interfaces:** Produces `createPaymentLink(invoiceId)`, `recordPayment(input)`.
**Deliverable:** "Pay with Paystack" generates a checkout link (card/transfer/USSD) on the invoice.

### Task 3.3: Paystack webhook + reconciliation
**Files:** `src/app/api/paystack/webhook/route.ts`.
**Deliverable:** Verified webhook marks invoice paid, records `payments` row; signature-checked; idempotent. Nightly verify-poll fallback.

### Task 3.4: Cash logging + confirm
**Files:** cleaner "record cash" UI, owner "confirm cash".
**Interfaces:** Produces `logCash(jobId, amountKobo)`, `confirmCash(paymentId)`.
**Deliverable:** Field cash logged against a job/invoice, pending owner confirmation, then reconciled.

### Task 3.5: Deposits & part-payments
**Deliverable:** Record deposits/part-payments against an invoice; balance recomputed; already-modeled deposit fields wired end-to-end.

### Task 3.6: Payment reminders
**Files:** `src/features/reminders/*`.
**Interfaces:** Produces `reminderMessage(invoiceId)`.
**Deliverable:** Overdue invoices produce a `wa.me` prefilled reminder with the payment link (SMS/API later).

### Task 3.7: Recurring contracts + auto job generation
**Files:** `supabase/migrations/0011_contracts.sql` (`contracts`: rrule, site, monthly_kobo), `src/app/api/cron/generate-jobs/route.ts`.
**Interfaces:** Produces `materializeJobs(horizonDays=14)`.
**Deliverable:** A contract's recurrence rule auto-generates `jobs` 14 days ahead via scheduled function; idempotent.

### Task 3.8: Auto monthly contract invoicing
**Files:** `src/app/api/cron/invoice-contracts/route.ts`.
**Deliverable:** On each contract's billing day, an invoice is auto-created for the monthly amount.

### Task 3.9: Virtual-account transfer reconciliation
**Deliverable:** Dedicated virtual account per company; incoming transfers auto-match open invoices by amount/reference via webhook.

### Task 3.10: Expenses
**Files:** `supabase/migrations/0012_expenses.sql` (`expenses`), UI.
**Deliverable:** Log expenses (supplies, transport, advances); simple profit-per-period view.

### Task 3.11: Phase-3 e2e
**Deliverable:** Create invoice → pay via Paystack (test mode) → webhook marks paid; run contract cron → job + invoice appear.

---

# PHASE 4 — Scale

**Exit test:** a second company onboards self-serve and subscribes on a paid plan.

### Task 4.1: Attendance from GPS events
**Deliverable:** Derive attendance/hours per staff from `job_events` check-in/out; attendance view.

### Task 4.2: Payroll runs
**Files:** `supabase/migrations/0013_payroll.sql` (`payroll_runs`, `payroll_items`).
**Interfaces:** Produces `computePayroll(companyId, period)` (per-job/daily/monthly rates).
**Deliverable:** Generate a payroll run with per-staff totals; payout log.

### Task 4.3: Public booking link
**Files:** `src/app/book/[slug]/page.tsx`.
**Deliverable:** Shareable per-company booking page creates a job request + client lead.

### Task 4.4: Client ratings
**Files:** `supabase/migrations/0014_ratings.sql` (`ratings`).
**Deliverable:** Post-job rating request; staff scores aggregate onto profiles.

### Task 4.5: Reports
**Deliverable:** Revenue by service type, top clients, staff utilization, churned clients — with the dataviz-validated palette.

### Task 4.6: Multi-site rollups
**Deliverable:** Corporate client with many sites: per-site schedules + rolled-up invoicing/reporting.

### Task 4.7: WhatsApp Business API
**Files:** `src/lib/whatsapp-api.ts`.
**Deliverable:** Automated notifications (booking, en route, completed, invoice) via WhatsApp Business API, replacing manual `wa.me` where approved.

### Task 4.8: SaaS billing & plan limits
**Files:** `supabase/migrations/0015_billing.sql` (`subscriptions`, plan enum starter|growth|pro), Paystack subscriptions.
**Interfaces:** Produces `enforcePlanLimit(companyId, resource)`.
**Deliverable:** Naira-priced plans (₦15k/₦35k/₦75k) billed via Paystack; staff-seat/feature limits enforced; 14-day trial.

### Task 4.9: Offline hardening
**Files:** service worker (Serwist), cached cleaner day, queued completion writes.
**Deliverable:** Cleaner can view today's jobs and record completion offline; writes sync on reconnect with visible sync state.

### Task 4.10: Phase-4 e2e
**Deliverable:** Second company self-serve onboards → subscribes (Paystack test) → plan limits apply; booking link creates a lead; a report renders.

---

## Self-Review

- **Spec coverage:** every feature in the design spec's §6 phase list maps to a task above (Phase 1 → 1.1–1.10; Phase 2 → 2.1–2.7; Phase 3 → 3.1–3.10; Phase 4 → 4.1–4.9). Error-handling items from spec §7 are folded into the owning tasks (webhook idempotency 3.3, GPS-denied flag 2.4, image compression 2.5, double-booking 1.5/2.2, RLS tests 0.4).
- **Money:** all amounts kobo-integer per Global Constraints; `money.ts` (0.3) is the single source.
- **Tenancy:** every migration enables RLS + `company_id`; verified by the 0.4 cross-tenant test pattern, reused per table.
- **Types:** interfaces name their produced signatures so later tasks consume exact names.

## Execution note

Phases are sequenced; within a phase, schema tasks precede the features that consume them. Each phase ends with an e2e that is its pilot exit-test. Commit after every task.
