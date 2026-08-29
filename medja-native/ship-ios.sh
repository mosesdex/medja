#!/usr/bin/env bash
# One-shot: build Medja for iOS and push to TestFlight.
# PREREQS (yours, one-time — cannot be automated):
#   1. Apple Developer Program membership ($99/yr): https://developer.apple.com/programs/
#   2. Expo account + CLI logged in:   npm i -g eas-cli && eas login
#   3. App Store Connect API key (.p8): App Store Connect → Users and Access →
#      Integrations → App Store Connect API → generate. Then:
#        - put the .p8 at   secrets/asc-api-key.p8
#        - set ascApiKeyId + ascApiKeyIssuerId in eas.json  (submit.production.ios)
#
# Then run:  bash ship-ios.sh
set -euo pipefail
cd "$(dirname "$0")"

command -v eas >/dev/null || { echo "Install eas-cli: npm i -g eas-cli"; exit 1; }

# Link to an EAS project (first run only; safe to re-run).
eas whoami >/dev/null 2>&1 || { echo "Run 'eas login' first."; exit 1; }
[ -f .easproject ] || eas init --non-interactive || true

echo "▸ Building iOS (production) in Expo's cloud…"
eas build --platform ios --profile production --non-interactive

echo "▸ Submitting latest build to App Store Connect / TestFlight…"
eas submit --platform ios --profile production --latest --non-interactive

echo "✓ Uploaded. It appears in TestFlight after Apple finishes processing (~10-30 min)."
