# Medja — native app (React Native / Expo)

Native iOS + Android app for Medja, sharing the same Supabase backend as the web
app (`../medja-app`). Built with Expo + expo-router + supabase-js.

## What's here

- **Auth:** email + 6-digit OTP (`supabase.auth.signInWithOtp` / `verifyOtp`) — no
  deep-link needed on mobile. Session persisted in AsyncStorage.
- **Screens:** login, onboarding, tabs (Home / Jobs / Money / Staff / Clients),
  job detail (checklist + WhatsApp), invoice detail (WhatsApp + mark paid).
- **Shared logic** ported from the web app under `src/lib` and `src/features`
  (money, aging, churn, rollup, recurrence, attendance, payroll, plans, vetting,
  geo, whatsapp, schedule) — pure TypeScript, identical behaviour.
- **Backend:** the same Supabase project + 18 migrations. No backend changes.

## Run locally

```bash
cd medja-native
npm install
cp .env.example .env      # add EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY
npx expo start            # press i (iOS sim) / a (Android) / scan QR (Expo Go)
```

`.env` already points at the Medja Supabase project (restore it first — it is
free-tier paused). Auth OTP needs email delivery enabled in Supabase.

## Build & ship (EAS — the "push to TestFlight via API" path)

One-time:
```bash
npm i -g eas-cli
eas login                 # your Expo account
eas init                  # links this app to an EAS project id
```

Builds (run in Expo's cloud — no local Xcode/Android SDK required):
```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

Submit to stores **via API** (fills `submit.production` in `eas.json`):
- **iOS / TestFlight:** create an App Store Connect API key (`.p8`), put it in
  `secrets/asc-api-key.p8`, set `ascApiKeyId` + `ascApiKeyIssuerId` in `eas.json`.
  ```bash
  eas submit --platform ios --profile production --latest
  ```
  Uploads to App Store Connect; the build appears in TestFlight automatically.
- **Android / Play internal:** put a Play service-account JSON in
  `secrets/play-service-account.json`.
  ```bash
  eas submit --platform android --profile production --latest
  ```

`secrets/` is gitignored — never commit keys.

## Not done here (would need your accounts / credentials)

- Apple Developer Program + App Store Connect app record.
- Google Play Console + app record.
- Code signing (EAS manages certs once you `eas login` + confirm).
- Full feature parity with web (more screens: staff/job creation, GPS check-in,
  photo capture, receivables, reports). Core loop is in; the rest ports the same
  way.
