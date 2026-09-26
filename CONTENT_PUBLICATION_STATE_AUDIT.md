# THE BREAKDOWN — CONTENT PUBLICATION STATE AUDIT

**Audit Date:** 26 September 2026  
**Auditor:** Content-Model / CMS Architect & Publication Reliability Engineer  
**Scope:** 100% of Content Records (55 Stories, 15 Topics, 4 Trackers, 1 Investigation)

---

## 1. Publication State Governance

The Breakdown operates a strict fail-closed publication gate governed by `lib/story/publication.ts`:

```
Content Lifecycle:
[IDEA] → [RESEARCH] → [DRAFT] → [EDITORIAL_REVIEW] → [FACTCHECK] → [READY] → [PUBLISHED]
```

### The Strict Public Boundary Rule:
Only content with `publicationStatus: 'published'` and a valid past `publishedAt` timestamp is eligible to:
1. Appear in the Homepage lead or briefing feeds.
2. Appear in the Stories archive (`/stories`).
3. Appear in Topic hubs (`/topic/:slug`).
4. Be indexed in XML sitemaps and RSS feeds.
5. Be resolved by unauthenticated public readers at `/story/:slug`.

Any story marked `draft`, `research`, or `scheduled` returns `404 Not Found` for unauthenticated readers, preventing accidental leaks of unfinished newsroom work.

---

## 2. Content Inventory Classification

| Category | Total Records | Published | Draft / Quarantined | Classification Notes |
|---|---|---|---|---|
| **Standalone Explanatory Stories** | 40 | 40 | 0 | All 40 verified stories have past timestamps, verified primary sources, and complete multi-section narratives. |
| **Namami Gange Investigation Chapters** | 15 | 0 | 15 | Chapters `ng-ch-01` through `ng-ch-15` are investigative drafts under internal fact-check. **Quarantined from public listings.** |
| **Topics Directory** | 15 | 15 | 0 | All 15 policy/economic topics active with descriptions and story mappings. |
| **Systemic Fix Solutions** | 3 | 3 | 0 | Farm income, air pollution, judicial pendency solutions active in `/fix`. |
| **Quantitative Data Trackers** | 4 | 4 | 0 | UPI, PMFBY, Semiconductor PLI, MGNREGA active with decadal time-series. |

---

## 3. Quarantined Draft Inventory (Confidential Newsroom Internal)

The following 15 chapters of the Namami Gange investigation have been audited and quarantined from public discovery pending final editorial sign-off:

1. `ng-ch-01-the-promise` — *DRAFT: Under editorial review*
2. `ng-ch-02-follow-the-money` — *DRAFT: Sourcing verification pending*
3. `ng-ch-03-the-sewage-problem` — *DRAFT: Technical data verification pending*
4. `ng-ch-04-the-audit-trail` — *DRAFT: Legal review pending*
5. `ng-ch-05-procurement-and-accountability` — *DRAFT: Contractor response pending*
6. `ng-ch-06-why-stps-dont-work` — *DRAFT: Engineering audit pending*
7. `ng-ch-07-water-quality` — *DRAFT: CPCB sensor comparison pending*
8. `ng-ch-08-city-report-cards` — *DRAFT: Municipal data pending*
9. `ng-ch-09-contractors` — *DRAFT: Corporate registry verification pending*
10. `ng-ch-10-timeline-of-delays` — *DRAFT: Project milestone review pending*
11. `ng-ch-11-ecology` — *DRAFT: Gangetic dolphin survey pending*
12. `ng-ch-12-voices-from-the-river` — *DRAFT: Field reporting in progress*
13. `ng-ch-13-government-response` — *DRAFT: Official RTI replies pending*
14. `ng-ch-14-what-worked` — *DRAFT: Positive case study verification pending*
15. `ng-ch-15-recommendations` — *DRAFT: Expert panel review pending*

**Enforcement Guarantee:** None of these slugs appear on `/stories`, `/topics`, `/`, or search feeds.

---

## 4. Publicly Published Editorial Inventory (40 Stories)

All 40 stories have been audited, remediated, and verified for narrative integrity, primary source linkages, and image validity:

1. `mgnrega-reform` (Economy) — MGNREGA 2026: 125-Day Guarantee Explained
2. `digital-payments-boom` (Technology) — Digital Payments in Rural India: UPI Revolution
3. `pm-fasal-bima-claims` (Policy) — PM Fasal Bima Yojana: Claims Assessment
4. `semiconductor-pli` (Technology) — India's Semiconductor Push: Fab & OSAT
5. `dpdp-bill` (Policy) — Digital Personal Data Protection Act
6. `rbi-repo-rate` (Economy) — RBI Monetary Policy & Rate Easing Cycle
7. `climate-finance` (Environment) — India's ₹11 Lakh Crore Climate Finance Challenge
8. `education-budget` (Policy) — Education Budget: Spending vs Learning Outcomes
9. `groundwater-depletion` (Environment) — India's Groundwater Crisis (CGWB 2025)
10. `ration-digitization` (Economy) — Digitizing PDS: Food Security Net
11. `anganwadi-icds` (Health) — Anganwadi Centres: Frontline Nutrition Workers
12. `supply-chain-shift` (Economy) — China+1 Opportunity & Supply Chain Shift
13. `ethanol-backlash` (Environment) — E20 Ethanol Push & Consumer Response
14. `ews-quota-upsc-investigation` (Policy) — Investigation into UPSC EWS Selections
15. `us-iran-relations` (Politics) — US-Iran Relations & Strategic Implications
16. `indian-education-crisis` (Policy) — ASER Learning Outcomes & School Reforms
17. `income-inequality-india` (Economy) — Wealth Concentration in India
18. `india-china-border-tensions` (Politics) — LAC Standoff & Border Infrastructure
19. `indias-foreign-policy` (Politics) — Strategic Autonomy & Multi-Alignment
20. `satluj-ban` (Policy) — Cinematograph Act & Film Certification
21. `india-us-relations` (Geopolitics) — iCET & Critical Technology Partnership
22. `india-indonesia-relations` (Geopolitics) — Maritime Security & Sabang Port
23. `india-china-relations` (Geopolitics) — Strategic Rivalry in South Asia
24. `india-europe-relations` (Geopolitics) — EU-India FTA & Carbon Border Tax
25. `india-uk-relations` (Geopolitics) — Post-Brexit Trade & Bilateral Ties
26. `india-russia-relations` (Geopolitics) — Energy Trade & Defense Logistics
27. `81-crore-data-breach` (Technology) — Aadhaar & Digital Identity Security
28. `bjp-mission-360` (Politics) — Electoral Strategy & Regional Coalitions
29. `india-5g-rollout` (Technology) — Telecom Infrastructure & 5G Monetization
30. `india-ev-paradox` (Environment) — Electric Vehicles & Grid Coal Reliance
31. `ayushman-bharat` (Health) — PM-JAY Tertiary Healthcare Coverage
32. `electoral-bonds` (Policy) — Supreme Court Constitution Bench Ruling
33. `who-cancer-report-2026` (Health) — WHO Global Cancer Status Assessment
34. `us-iran-war-strait-of-hormuz` (Geopolitics) — Energy Transit & Oil Chokepoints
35. `epf-scheme-2026` (Economy) — EPFO Wage Ceilings & Formalization
36. `youth-mental-health-crisis` (Health) — Tele-MANAS & Public Healthcare Support
37. `gig-worker-rights` (Employment) — Social Security Code & Platform Workers
38. `namami-gange-under-fire` (Environment) — NGT Directives & River Basin Cleanup
39. `india-china-border-lac` (Geopolitics) — Buffer Zones & Patrol Agreements
40. `kashmir-the-first-test` (Geopolitics) — 1947–48 Conflict & UN Ceasefire Line
