# Deploying Medja to Vercel

The app lives in the `medja-app/` subdirectory of the repo, backed by the live
Supabase project `kgrhslfnqpniwexzjuim` (eu-west-1).

## Environment variables (set in Vercel → Project → Settings → Environment Variables)

| Key | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://kgrhslfnqpniwexzjuim.supabase.co` | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(anon key, in local `.env.local`)* | public |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Supabase dashboard → Settings → API → service_role)* | **secret** — needed for webhook + cron |
| `NEXT_PUBLIC_APP_URL` | `https://<your-vercel-domain>` | set to the deployed URL |
| `CRON_SECRET` | *(any long random string)* | Vercel Cron auto-sends it as a bearer token |
| `PAYSTACK_SECRET_KEY` | `sk_test_...` | optional until you take payments |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_test_...` | optional |

## Key project setting

**Root Directory = `medja-app`** (the Next.js app is not at the repo root — the
repo root holds the marketing site / GitHub Pages).

## Option A — GitHub integration (recommended, no CLI)

1. On vercel.com → **Add New Project** → import `mosesdex/medja`.
2. Set **Root Directory** to `medja-app`. Framework auto-detects as Next.js.
3. Add the environment variables above.
4. Deploy. Every push to `main` auto-deploys.

## Option B — Vercel CLI

```bash
npm i -g vercel
cd medja-app
vercel login          # you authenticate
vercel link
vercel env add ...    # add each variable
vercel --prod
```

## After the first deploy (required for auth to work)

In the Supabase dashboard → **Authentication → URL Configuration**:
- Set **Site URL** to your Vercel domain.
- Add `https://<your-vercel-domain>/auth/callback` to **Redirect URLs**.

Then set `NEXT_PUBLIC_APP_URL` to that domain and redeploy. Magic-link sign-in
will then redirect correctly.

## Crons

`vercel.json` schedules the two daily jobs (generate contract jobs 05:00,
invoice contracts 06:00). They require `CRON_SECRET` to be set.
