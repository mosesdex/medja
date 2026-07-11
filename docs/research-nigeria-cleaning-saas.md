# Nigeria Cleaning-Company SaaS — Deep Research Report

*Research run: 11 July 2026. Method: 5-angle web sweep → 19 sources fetched → 86 claims extracted → top 25 adversarially verified by 3-vote panels (8 confirmed, 17 refuted).*

## Design thesis (from verified findings)

Build an **Android-first, naira-native, WhatsApp-integrated** operations app for Nigerian cleaning companies. The defensible gap is not a missing feature — it's that no purpose-built product exists for this market, and the global incumbents cannot collect money in Nigeria.

## Verified findings

| # | Finding | Confidence |
|---|---------|-----------|
| 1 | Android holds ~82.7% of Nigeria's mobile OS share (Statcounter, Jun 2026). Owner dashboard and field-staff app must be Android-first, lightweight, low-data. | High (3-0) |
| 2 | Jobber, Housecall Pro, ServiceTitan, and Salesforce Field Service have **no Nigerian payment integration** — no Paystack, Flutterwave, naira, bank transfer, or USSD. Jobber/Housecall Pro payments are US/Canada/Australia only. This is the single most defensible gap. | High (3-0) |
| 3 | No purpose-built option exists for Nigerian cleaning companies. ZenMaid is cleaning-specific but US-residential-maid focused (checklists, GPS check-in, PTO, route views = the feature bar to match). Jobber is a 50+-industry generalist. Neither covers commercial or post-construction work well. | High (3-0) |
| 4 | Nigerian field-service businesses without software run on **phone calls, WhatsApp groups, and paper job cards**. The core value prop is digitizing exactly these artifacts; WhatsApp notification delivery is likely adoption-critical. | Medium (3-0) |
| 5 | **Hiring trustworthy staff is a recurring struggle** for Nigerian cleaning owners (corroborated by news coverage of domestic-staff crime and an academic household survey). Staff vetting — ID, guarantor records, background-check status — is a core feature area. | Medium (3-0) |
| 6 | Residential cleaning is quoted by **dwelling size/room count** with "starting from" floors (e.g., one Lagos firm: single room from ₦10k, 2-bed from ₦20k, 3-bed from ₦30k, 4-bed duplex from ₦50k; independently corroborated at similar magnitudes). Exact figures are perishable under inflation; the room-count quoting *structure* is the durable insight. | Medium (3-0) |
| 7 | **Commercial clients (offices, malls, government buildings) dominate** Nigerian facility-management demand, driven partly by daily cleaning needs. Recurring commercial contracts (daily/weekly schedules, monthly invoicing, multi-site) deserve first-class treatment alongside one-off residential jobs. | Medium (3-0) |

## What did NOT survive verification (important)

Every specific market-size and growth figure was refuted: the "$8.45B Nigeria FM market", "$200M+ cleaning market", "10–15% annual growth", and "70% of urban Nigerians outsource home services" all failed 3-vote verification. **The business case must rest on structural gaps (payments, localization, WhatsApp/offline workflows), not on a citable TAM number.**

Also unconfirmed (treat as hypotheses, not facts): referral-driven client acquisition, specific 2025 price benchmarks, office room-band pricing, post-construction as a ~₦50k premium category, 20–40% profit margins, and the "WhatsApp Business + Google Sheets + Wave" tooling stack.

## Open questions (worth primary research — i.e., talking to real owners)

1. Actual market size/growth — needs interviews with Lagos/Abuja firms or industry-association data.
2. How commercial and post-construction work is actually priced and won.
3. Payroll practices for the informal workforce (cash vs transfer, daily vs monthly, deposit norms).
4. Real offline/data constraints for field cleaners — full offline-first sync vs just a low-bandwidth app.

---

# Feature Set: 40 Features, Prioritized

**P0 = MVP (launch blockers), P1 = fast-follow (first 6 months), P2 = growth/differentiation.**
Features marked ✅ trace directly to a verified finding; ⚠️ rest on general market logic (research neither confirmed nor refuted).

## A. Scheduling & Jobs

| # | Feature | Priority | Basis |
|---|---------|----------|-------|
| 1 | Job calendar (day/week/month) with drag-and-drop rescheduling | P0 | ✅ #4 |
| 2 | Digital job cards — service details, location, assigned team, checklist — replacing paper | P0 | ✅ #4 |
| 3 | Recurring-contract engine: daily/weekly/monthly schedules that auto-generate jobs | P0 | ✅ #7 |
| 4 | Three first-class job types with own checklists & pricing rules: residential, office/commercial, post-construction | P0 | ✅ #3, #7 |
| 5 | Team assignment & dispatch with double-booking/conflict detection | P0 | ✅ #4 |
| 6 | Multi-site client support (one corporate client, many locations, per-site schedules) | P1 | ✅ #7 |
| 7 | Job status pipeline (booked → en route → in progress → done → invoiced → paid) | P0 | ✅ #4 |

## B. Field-Staff App (Android-first)

| # | Feature | Priority | Basis |
|---|---------|----------|-------|
| 8 | Lightweight Android app / PWA optimized for low-end devices and low data use | P0 | ✅ #1 |
| 9 | Offline tolerance: view today's jobs and record completion offline, sync later | P1 | ⚠️ (open question 4) |
| 10 | GPS check-in / check-out at the job site | P0 | ✅ #3 (ZenMaid bar) |
| 11 | Before/after photo capture attached to the job card | P0 | ✅ #3 |
| 12 | Room-by-room cleaning checklists the cleaner ticks off on site | P0 | ✅ #3 |
| 13 | In-app issue reporting (damaged item, no access, client complaint) with photo | P1 | ⚠️ |

## C. Staff Management & Vetting

| # | Feature | Priority | Basis |
|---|---------|----------|-------|
| 14 | Staff profiles with ID document upload (NIN), photo, and vetting-status tracker | P0 | ✅ #5 |
| 15 | Guarantor records (name, address, phone, ID) per staff member | P0 | ✅ #5 |
| 16 | Client-facing "verified cleaner" profile (photo, vetting badge) sent before the visit | P1 | ✅ #5 |
| 17 | Attendance & hours derived automatically from GPS check-ins | P1 | ✅ #3, #5 |
| 18 | Payroll computation: per-job, per-day, or monthly rates; payout history log | P1 | ⚠️ (open question 3) |
| 19 | Staff performance scores from client ratings and job-completion quality | P2 | ⚠️ |
| 20 | Staff availability / leave management feeding the scheduler | P2 | ⚠️ |

## D. Quoting & Invoicing (naira-native)

| # | Feature | Priority | Basis |
|---|---------|----------|-------|
| 21 | Quote templates by property type/room count with "starting from" floors and per-job adjustment | P0 | ✅ #6 |
| 22 | One-tap quote sending via WhatsApp (also SMS/email) | P0 | ✅ #4, #6 |
| 23 | Naira invoicing with optional VAT line | P0 | ✅ #2 |
| 24 | Deposit / part-payment tracking against an invoice | P1 | ⚠️ |
| 25 | Auto monthly invoicing for recurring commercial contracts | P1 | ✅ #7 |

## E. Payments — the defensible gap

| # | Feature | Priority | Basis |
|---|---------|----------|-------|
| 26 | Paystack and/or Flutterwave integration: card, bank transfer, USSD payment links on every invoice | P0 | ✅ #2 |
| 27 | Bank-transfer reconciliation — dedicated virtual account per business so transfers auto-match invoices | P1 | ✅ #2 |
| 28 | Cash-collection logging by field staff, reconciled against the job | P0 | ⚠️ |
| 29 | Automated payment reminders via WhatsApp/SMS for overdue invoices | P1 | ✅ #2, #4 |
| 30 | Expense tracking (supplies, transport, staff advances) for simple profit-per-job view | P1 | ⚠️ |

## F. Clients & Communication (WhatsApp-centric)

| # | Feature | Priority | Basis |
|---|---------|----------|-------|
| 31 | Client CRM: contacts, property details, access notes, full service history | P0 | ✅ #4 |
| 32 | WhatsApp notifications: booking confirmed, cleaner en route (with verified profile), job completed (with photos), invoice | P0 | ✅ #4 |
| 33 | Public booking link (shareable on WhatsApp status/Instagram) that creates a job request | P1 | ⚠️ |
| 34 | Post-job client rating & feedback request | P1 | ⚠️ |
| 35 | Client self-service portal: upcoming visits, invoices, pay online | P2 | ⚠️ |

## G. Inventory & Operations

| # | Feature | Priority | Basis |
|---|---------|----------|-------|
| 36 | Chemical & supplies inventory with low-stock alerts and per-job usage deduction | P2 | ⚠️ |
| 37 | Equipment register: assign machines/tools to teams, track condition | P2 | ⚠️ |

## H. Owner Dashboard & Admin

| # | Feature | Priority | Basis |
|---|---------|----------|-------|
| 38 | Owner dashboard: today's jobs map/list, cash collected, outstanding invoices, staff on duty | P0 | ✅ #4 |
| 39 | Reports: revenue by service type, top clients, staff utilization, churned clients | P1 | ⚠️ |
| 40 | Role-based access (owner, supervisor, accountant, cleaner) + naira-priced SaaS tiers billed via local rails | P0 | ✅ #1, #2 |

## MVP cut (the P0 set, ~16 features)

Calendar + digital job cards + recurring contracts + 3 job types + dispatch + status pipeline; Android field app with GPS check-in, photos, checklists; staff profiles with ID/guarantor vetting; room-count quote templates sent via WhatsApp; naira invoicing + Paystack/Flutterwave payment links + cash logging; client CRM + WhatsApp notifications; owner dashboard + roles + local-rail SaaS billing.

## Key sources

- Statcounter Nigeria mobile OS share — gs.statcounter.com/os-market-share/mobile/nigeria (primary)
- Jobber payment-integration docs; Paystack integrations directory (primary, verified the payments gap)
- ZenMaid / Jobber / Housecall Pro comparison pages (competitor feature bar)
- data2bots — field-service software in Nigeria; TechEconomy — WhatsApp as African SME operating system
- counseal.com cleaning-business guide; Palmacedar Lagos price list (+ viscorner, daibau corroboration)
- Allied Market Research / Mordor Intelligence Nigeria FM segmentation (structure only — dollar figures refuted)
