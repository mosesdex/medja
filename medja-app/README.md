# Medja — application

The real Medja app: a multi-tenant, Android-first PWA for Nigerian cleaning
companies. Next.js (App Router, TypeScript) + Supabase + Paystack.

Built across four phases — see [`docs/superpowers/plans/2026-07-12-medja-implementation.md`](../docs/superpowers/plans/2026-07-12-medja-implementation.md).

## What's implemented

| Phase | Area | Highlights |
|---|---|---|
| 0 | Foundation | Multi-tenant RLS schema, Supabase clients, kobo money helpers |
| 1 | Operate | Magic-link auth, company onboarding, clients CRM, jobs + calendar, digital job cards with checklists, quotes, naira/VAT invoices, WhatsApp share, owner dashboard |
| 2 | Field | Staff vetting (NIN/guarantor), dispatch, cleaner app, GPS check-in, photo capture (client-compressed), verified-cleaner share |
| 3 | Money | Paystack links (card/transfer/USSD), signed webhook, cash logging, recurring contracts (job + invoice crons), reminders, expenses |
| 4 | Scale | Payroll runs, reports, public booking link, ratings, plan/billing, WhatsApp Business API, offline service worker |

## Local setup

### Option A — fully local database (recommended for development)

Runs a complete local Supabase stack (Postgres + Auth + Storage) on your machine.
**Requires Docker** (Docker Desktop or `colima start`).

```bash
cd medja-app
npm install
npm run dev:local     # starts local Supabase, applies all migrations, wires .env.local, runs the app
```

Then open http://localhost:3000. Sign-in magic-link emails are caught locally by
**Inbucket at http://localhost:54324** (no real email needed). The local database
Studio is at http://localhost:54323. All 16 migrations — including the rating RPC —
apply automatically, so every feature works locally.

To stop the local stack: `supabase stop`.

### Option B — point at a hosted Supabase project

```bash
cd medja-app
npm install
cp .env.local.example .env.local   # fill in your project's URL + keys
npm run dev
```

### Environment (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=...          # from your Supabase project
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...         # server-only (webhooks, cron)
PAYSTACK_SECRET_KEY=sk_test_...       # Phase 3+
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=...                       # protects /api/cron/* (optional locally)
```

## Database

Migrations live in [`supabase/migrations/`](supabase/migrations) (0001–0015),
each with RLS. To apply to a Supabase project:

```bash
supabase link --project-ref <your-ref>
supabase db push
npm run gen:types      # regenerate typed DB schema, restores full type-safety
```

Enable **Email OTP** auth in the Supabase dashboard. Storage buckets
`job-photos` and `staff-docs` are created by migration `0009`.

## Payments & cron

- Point a Paystack webhook at `POST /api/paystack/webhook` (signature-verified).
- Schedule (e.g. Vercel Cron) `GET /api/cron/generate-jobs` and
  `GET /api/cron/invoice-contracts` daily, sending `Authorization: Bearer $CRON_SECRET`.

## Testing & build

```bash
npm test          # 30 unit tests (money, invoices, scheduling, vetting, geo, paystack, recurrence, payroll, plans)
npm run build     # production build (31 routes, type-checked)
```

## Notes

- All money is integer **kobo**; `src/lib/money.ts` is the single source.
- The Supabase client is schema-permissive until `npm run gen:types` runs against
  your linked project (the intended schema is in `src/types/database.ts` and the
  migrations).
- Deploy target: Vercel. The marketing site + prototypes live in the repo root.
