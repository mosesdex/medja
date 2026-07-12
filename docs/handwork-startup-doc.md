# Handwork — Startup Document

**Working name:** Handwork *(Nigerian English for a skilled trade — "learn handwork". Placeholder, rename freely.)*
**One-liner:** The verified-workforce platform for Nigeria's building trades — contractors get vetted crews with attendance and payroll built in; artisans get a portable, provable work record.
**Date:** July 2026
**Evidence base:** [research-nigeria-field-businesses.md](research-nigeria-field-businesses.md) (110-agent verified research + 3 follow-up investigations)

---

## 1. The problem (all figures from verified research)

Nigeria's construction industry cannot staff itself with trusted local labour:

- The sector needs **~1.5 million artisans per year** and operates at **less than 30% of required skilled manpower** (REDAN).
- Contractors respond by importing artisans from Togo, Benin and Ghana — **$4.5 billion/year leaves the country** — and they pay the premium explicitly for *reliability of character and competence*. They are already paying for verification; nobody has productized it.
- **Lagos alone has ~48,000 live construction projects.**
- The skill pipeline is collapsing: technical-college enrolment is falling, experienced tradesmen were trained in the 1980s–90s, and young workers are abandoning apprenticeships (japa + digital work drain).
- There is **no credible Nigerian skills benchmark**. LaborHack — the only funded player — certifies artisans against a *UK* standard (ECITB) because nothing local exists. NIOB registers artisans and the new Sector Skills Council targets 1M trained in 5 years, but neither has a digital rail.
- Hiring today runs through foremen and word of mouth. Skill claims are unverifiable; quality failures cost Nigerian companies up to **50% of profit margins** in rework and wastage (LaborHack CEO).

The buyer's pain is concentrated and monied: developers and contractors — businesses, not ₦20k/day informal workers. This matters because the research's hardest finding is that **individual informal workers cannot pay for software**; the payer must be a business.

## 2. Why now

1. **The gap is widening** — housing deficit programs, 48k live Lagos projects, and the artisan supply crisis are all worsening simultaneously.
2. **The Sector Skills Council is new** — a national certification push with no digital registry partner yet. First mover to digitize it owns the standard.
3. **The rails exist** — WhatsApp utility messages cost ~₦11 (free in-session), agent-banking penetration means artisans can receive digital wages, and embedded-credit partners (Moniepoint-style 2–3%/month working capital, Carbon, FairMoney) cover the artisan's <$2,000 tool-financing ticket.
4. **The failure pattern is now legible** — consumer marketplaces died (SweepSouth, VConnect, Eden Life); B2B tooling with escrow/vetting/finance layers survived (LaborHack, wrkman, Oze). Handwork is designed to the surviving pattern from day one.

## 3. Who it serves

| Actor | Today | With Handwork |
|---|---|---|
| **Contractor / developer** (the payer) | Sources crews via foremen, can't verify skills, pays foreign premium, loses margin to rework, pays cash with no records | Searches verified registry, books whole crews, sees attendance daily, runs payroll digitally, gets replacement guarantee |
| **Foreman / crew lead** (the channel) | Assembles crews from personal network via WhatsApp calls | Manages crew roster, dispatch, and attendance in-app; earns a lead commission |
| **Artisan** (the supply; pays nothing) | Invisible: skill lives in word of mouth; no work history; can't finance tools | Portable verified profile: certifications, site history, attendance record, ratings → unlocks better day rates + tool financing + wage advances |

**Design rule carried over from Medja:** the artisan-facing experience is Android-first and WhatsApp-native (dispatch, check-in, wage alerts as WhatsApp messages). The contractor-facing experience is a web dashboard.

## 4. Product

### Core loop
1. Contractor posts a crew requirement (trade, headcount, site, duration, day rate).
2. Handwork assembles a crew from the verified registry (foreman-led where possible).
3. Artisans confirm via WhatsApp; daily attendance via geo-tagged WhatsApp check-in or foreman roll call.
4. Contractor approves the week's attendance sheet; payroll disburses to artisan accounts; Handwork takes its cut.
5. Every completed engagement enriches the artisan's verified work record — the asset that keeps both sides on-platform.

### Modules
- **Verified registry** — identity (NIN), trade-test result, certification records (NIOB / Skills Council / NEMSA for electricians), past-site photo evidence, ratings. Vetting is the product, not a cost line.
- **Crew dispatch** — WhatsApp-native job offers and confirmations (~₦11/message, free in-session replies).
- **Attendance & site log** — daily check-ins, headcount reports to the contractor every morning.
- **Payroll rail** — weekly wage runs from contractor escrow to artisan accounts; handles the cash reality (site cash payments can be recorded/reconciled, mirroring Medja's cash-job reconciliation).
- **Certification wallet** — the artisan's portable proof-of-skill, aligned to whatever standard the Sector Skills Council lands on; Handwork positions as *the digital registry* for it.
- **Finance layer (Phase 3+)** — tool financing and wage advances via licensed lending partners, underwritten by attendance/earnings history (the proven Oze/Moniepoint pattern: the app's data is the credit score).

### What Handwork deliberately is NOT
- Not a consumer handyman app (that's wrkman/LaborHack's home segment — and households are disintermediation-prone one-off buyers).
- Not a gig marketplace for solo jobs — crews and contracts, minimum one-week engagements.
- Not a training academy (partner with trainers; digitize their output).

## 5. Business model (calibrated to verified naira benchmarks)

Proven Nigerian SaaS clusters: entry ₦3,200–5,000/mo, mid ₦9,200–15,400/mo, team ₦22,900–45,800/mo — and every survivor layers transaction or credit revenue on top of subscription.

| Stream | Mechanics | Notes |
|---|---|---|
| **Payroll take** (primary) | 5% of wages processed | A 20-artisan crew at ₦15,000/day avg ≈ ₦300k/day payroll → **₦15,000/day per crew** to Handwork. Devaluation-resistant (% of naira flow, failure-pattern #1 proof). |
| **Contractor subscription** | Registry access + dashboard: ₦35,000/mo standard, ₦75,000/mo multi-site | Sits inside the proven team tier; matches Medja's ₦35k/₦75k anchors. |
| **Placement fee** | One-off ₦5,000–10,000 per verified artisan placed on first engagement | Covers vetting cost recovery. |
| **Finance referral** (Phase 3) | Revenue share on tool loans / wage advances via lender partners | Validated wedge: <$2,000 tickets, ~₦13T unmet demand, 2% of adults have bank credit. |
| **Artisans pay** | **₦0** | Respects the ₦20k/day income ceiling. Supply must be free. |

**Unit sketch:** 10 active crews ≈ ₦150k/day payroll take (~₦3M/month at 20 working days) + subscriptions. Breakeven is a handful of mid-size Lagos contractors — not a blitzscale requirement. Bill subscriptions quarterly (Bumpa retention pattern).

## 6. Competition and moat

| Player | Position | Why the gap remains |
|---|---|---|
| **LaborHack** | Closest comp: vetted artisans, homes + construction, Kenya expansion | $320K raised — subscale vs a $4.5B/yr problem; UK-standard certification; no payroll/attendance rail |
| **wrkman** | Household handyman marketplace, 28k artisans | Consumer one-off jobs; no crew/site model |
| **Foreign artisan pipelines** | The real incumbent | Manual, informal, expensive — the $4.5B to beat |
| **Foremen networks** | The channel, not the enemy | Handwork gives foremen a commission + tools instead of competing with them |

**Moat:** the compounding data asset. Certification + attendance + payroll history lives on Handwork. A contractor can poach one bricklayer (disintermediation, failure-pattern #2) but cannot reproduce the vetted-crew pipeline, the replacement guarantee, or the payroll records for the next site. The artisan won't leave because the work record *is* their credit score and their next job.

## 7. Go-to-market

1. **Association-first distribution** (cheapest aggregation channel, per research): NIOB artisan register, Sector Skills Council partnership pitch (be their digital registry), NEMSA directory for electricians.
2. **Foreman recruitment** — sign 20 respected foremen in Lagos as founding crew leads; their networks are the supply.
3. **Contractor pilots** — 5 mid-size Lagos contractors (active on the 48k live projects), free 3-month pilot on 1–2 sites each, converting to payroll take.
4. **Land-and-expand trades:** start with **masonry/bricklaying + tiling** (deepest shortage, REDAN-flagged) and **electrical** (NEMSA gives an existing certification signal). Add carpentry, welding, plumbing after.
5. **Geography:** Lagos only until the model proves; Abuja/PH second.

## 8. Risks (stated plainly)

| Risk | Severity | Mitigation |
|---|---|---|
| Ops-heavy vetting (trade tests, site checks) | High | Partner with existing trainers/associations for testing; charge placement fee to recover cost; vet per-trade, not all at once |
| Slow construction payment cycles → payroll float risk | High | Contractor funds weekly escrow *before* the work week; no escrow, no crew |
| On-site quality/injury liability | Medium | Replacement guarantee (not outcome guarantee); insurance partner exploration; clear T&Cs — Handwork supplies verified labour, contractor supervises |
| Foremen bypass the platform | Medium | Commission alignment + payroll/attendance tooling they can't get elsewhere |
| Certification standard never materializes locally | Medium | Ship our own trade-test rubric (as LaborHack did with ECITB) and align later |
| Thin engineering resources (solo founder) | High | Shares the Medja field-service core (below); Phase 1 is deliberately registry + WhatsApp only — no marketplace machinery |

## 9. Relationship to Medja

Medja (cleaning-company SaaS) and Handwork share one insight and one codebase:

> **Field teams doing recurring jobs at customer premises need scheduling, attendance, cash-aware payroll, and WhatsApp-native comms.**

Shared core modules: team roster · job/site assignment · attendance & time tracking · payroll + cash reconciliation · WhatsApp notification rail · verified-worker profiles. Divergent layers: Medja adds client CRM/invoicing for cleaning companies; Handwork adds the registry, certification wallet, and contractor escrow.

**Strategic sequencing decision to make:** (a) finish Medja Phase 1, then reuse the core for Handwork; or (b) pivot the core build to Handwork now and treat cleaning as vertical #2. The research supports either — cleaning is whitespace again, but Handwork's documented gap ($4.5B/yr) and payer quality are stronger. This document assumes Handwork becomes the lead product; the roadmap below is written standalone.

## 10. Roadmap (phases with exit tests, Medja-style)

### Phase 0 — Validation (4–6 weeks, no code)
- 15 structured interviews: 8 contractors/developers, 4 foremen, 3 association officers (NIOB, Skills Council, NEMSA zone office).
- Test willingness to pay: 5% payroll take + ₦35k/mo dashboard.
- Map the actual escrow appetite: will contractors prefund a week of wages?
- **Exit test:** ≥3 contractors sign a pilot LOI naming a real site and start month; ≥10 foremen commit their crews to registration.

### Phase 1 — Verified registry + WhatsApp dispatch MVP (8–10 weeks)
- Artisan onboarding: NIN, trade, photo evidence, referee; manual trade-test day with a partner trainer (masonry + electrical only).
- Contractor web dashboard: browse/search verified artisans, request a crew.
- Dispatch + confirmations over WhatsApp. No in-app payments yet — record day rates, generate the weekly attendance sheet as PDF.
- Stack: same as Medja (Supabase backend, Android-first PWA, WhatsApp Business API).
- **Exit test:** 200 verified artisans in 2 trades; 2 pilot sites running weekly attendance sheets through the system for 4 consecutive weeks.

### Phase 2 — Attendance + payroll rail (8–12 weeks)
- Geo-tagged daily check-in (artisan phone or foreman roll call).
- Contractor escrow account; weekly wage runs to artisan bank/wallet accounts; cash-payment recording for the holdouts; take the 5%.
- Morning headcount report to the contractor (WhatsApp utility message).
- **Exit test:** ₦10M cumulative payroll processed; ≥2 contractors converted from pilot to paying (subscription + take); crew no-show rate below the contractor's pre-Handwork baseline.

### Phase 3 — Certification wallet + finance layer (12+ weeks)
- Portable artisan profile page (shareable link — becomes the artisan's CV).
- Formal partnership bid: digital registry for Sector Skills Council / NIOB certification.
- Lender partnership for tool financing + wage advances underwritten on platform history.
- **Exit test:** first 100 finance-qualified artisans; one association partnership signed; artisan 90-day retention >60%.

### Phase 4 — Scale (thereafter)
- Trades 3–6 (carpentry, welding, plumbing, tiling crews), Abuja/PH, replacement-guarantee SLA productized, insurance partner.

## 11. Open questions to resolve in Phase 0

1. Escrow mechanics: will mid-size contractors genuinely prefund weekly wages, or is net-7 after attendance approval the realistic ask?
2. Trade-test partner: which trainer/association can run credible practical tests at ≤₦5,000/artisan?
3. Does the foreman commission (suggested 2% of crew payroll) clear their informal "settlement" expectations?
4. Real day-rate bands per trade in Lagos right now (research verified electricians at ₦10k–50k in 2026; need masonry/tiling/carpentry equivalents from interviews).
5. Legal shape: labour supply in Nigeria may require a recruiter's licence (Ministry of Labour) — confirm before Phase 2 payroll.
