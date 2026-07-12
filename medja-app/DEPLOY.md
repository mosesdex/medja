# Deploying Medja to Vercel

The app lives in the `medja-app/` subdirectory of the repo, backed by the live
Supabase project `kgrhslfnqpniwexzjuim` (eu-west-1).

## Current status (2026-07-12)

- ✅ App builds cleanly locally: `npm ci && npm run build` exits 0 (31 routes).
- ✅ Runs locally against the live Supabase DB (auth page renders, RLS verified).
- ⏸️ **Vercel deploy deferred.** A Vercel project (`medja-ojp2`, team `dcl00245`)
  exists and is connected to the GitHub repo. The Next.js build **fails on
  Vercel** even though it passes locally. Ruled out so far: filename casing,
  the `vercel.json` cron config (fails with it removed too), and lockfile sync.
  **To resume: read the Vercel build log** (Deployments → the failed one →
  Build Logs) and fix the specific error — it's environmental (likely Node
  version or an Edge-runtime/middleware detail), not the app code.

## Environment variables (Vercel → Project → Settings → Environment Variables)

| Key | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://kgrhslfnqpniwexzjuim.supabase.co` | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(anon key, in local `.env.local`)* | public |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Supabase dashboard → Settings → API → service_role)* | **secret** — webhook + cron |
| `NEXT_PUBLIC_APP_URL` | `https://<your-vercel-domain>` | set after first deploy |
| `CRON_SECRET` | *(any long random string)* | Vercel Cron auto-sends it as a bearer token |
| `PAYSTACK_SECRET_KEY` | `sk_test_...` | optional until you take payments |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_test_...` | optional |

## Key project setting

**Root Directory = `medja-app`** — the Next.js app is not at the repo root (the
repo root holds the marketing site / GitHub Pages). This is already set on the
`medja-ojp2` project.

## Resuming the deploy

1. Get the build error: Deployments → newest failed → **Build Logs** → copy the
   first red `Error:` line and the lines around it.
2. Common fixes for "builds locally, fails on Vercel":
   - Pin Node: add `"engines": { "node": "22.x" }` to `medja-app/package.json`.
   - If it's an Edge-runtime error from middleware, ensure the middleware only
     uses `@supabase/ssr` (it does) and no Node-only APIs.
3. Push the fix — the connected project auto-redeploys.

## After the first successful deploy

Supabase dashboard → **Authentication → URL Configuration**:
- Set **Site URL** to your Vercel domain.
- Add `https://<your-vercel-domain>/auth/callback` to **Redirect URLs**.

Then set `NEXT_PUBLIC_APP_URL` to that domain and redeploy so magic-link sign-in
redirects correctly.

## Local development (works today)

```bash
cd medja-app
npm install
# .env.local already has the live Supabase URL + anon key
npm run dev        # http://localhost:3000
```

## Crons

`vercel.json` schedules the two daily jobs (generate contract jobs 05:00,
invoice contracts 06:00). They require `CRON_SECRET` to be set. (Confirmed these
are **not** the cause of the build failure.)
