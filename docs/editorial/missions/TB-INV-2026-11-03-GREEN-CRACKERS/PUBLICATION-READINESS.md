# Publication Readiness — Delhi-NCR Green-Cracker Investigation

**Mission:** TB-INV-2026-11-03-GREEN-CRACKERS  
**Last reviewed:** 3 November 2026 (IST)  
**Status:** HOLD — research package and draft article exist; not approved for publication  
**Branch:** research/green-cracker-enforcement-2026-11-03  
**PR:** https://github.com/thebreakdowndaily/thebreakdown-os/pull/153

## Editorial authority

The Editorial Constitution v1.1 is locked and takes precedence. The Editorial Review Checklist states that all seven review phases must pass before a chapter can be marked Published. The story must not be labelled Fact-Checked or Published merely because the desk research package is complete.

## Canonical publication contract findings

The repository's current canonical publication authority is `lib/editorial/canonical-publication.ts` plus `lib/editorial/publication-gate.ts`. Publication requires an authenticated principal with `story.publish`, a valid workflow transition, all fail-closed publication gates, a Gold Standard Review audit bound to the exact content fingerprint, and Evidence Vault reconstructibility. The API's published-story path evaluates the asynchronous contract before saving; a direct CMS/API write is not an acceptable bypass.

The current article draft is approximately **2,064 narrative words**. It clears the 1,800-word minimum for an `explainer` but not the 2,200-word minimum for an `investigation_chapter`. Given that this is presently a desk-researched synthesis with no independent field visit or QR test, the defensible provisional classification is:
- `storyType: explainer`
- `reportingType: document_analysis` (or `aggregated` if the editor judges secondary reporting to dominate)
- Do not classify as `original_reporting` or claim independent field investigation.

The story still lacks a verified hero asset with provenance/licence and image-manifest approval, a canonical source/claim/evidence-vault package, a complete Gold Standard audit with independent reviewer identities, and the remaining editorial sign-offs. The CMS form's local draft behavior is not proof of canonical persistence; use the established repository/API and publication authority only after inspecting its current state and required contracts.

## Current state

| Gate | Requirement | Status | Evidence / blocker |
|---|---|---|---|
| Scope and assignment | Defined editorial question and boundaries | PASS | Reporting package |
| Desk research | Relevant court order, NEERI material, public AQI methodology and attributed reporting reviewed | PARTIAL | See Public Evidence Log; current product list not retrieved |
| Claim registry | Each material claim has evidence ID, source tier, status and limitations | PARTIAL | Verification ledger exists; needs final claim-by-claim audit and evidence IDs in publication model |
| Independent verification | Primary sources checked; third-party reporting attributed; counter-evidence considered | PARTIAL | Public sources checked; no independent market inspection or QR validation |
| Right of reply | Relevant authorities/manufacturers offered a fair opportunity to respond | NOT STARTED | Questions prepared only; no outreach sent; explicit approval required before sending |
| Field reporting | Lawful independent observations, if needed, documented with provenance | NOT STARTED | No independent field visit, product inspection or QR scan |
| Environmental/health data | Appropriate time-series, completeness and methodology assessed | NOT AVAILABLE YET | Court-directed reporting windows continue through 30 Nov; health data period not closed |
| Visuals | Every image has provenance, rights, caption, purpose and alt text | NOT STARTED | No image asset approved; no synthetic documentary imagery |
| Expert review | Minimum two experts from different disciplinary/interpretive perspectives | NOT STARTED | No expert reviewers appointed or consulted |
| Reader review | Four prescribed reader profiles; confusion points logged and revisions assessed | NOT STARTED | No reader review conducted |
| Evidence audit | Independent fact-checker checks each claim against original sources and counter-evidence | NOT STARTED | No independent fact-checker sign-off |
| Bias audit | Independent editor completes checklist | NOT STARTED | No independent editor sign-off |
| Defensibility audit | Editor-in-Chief reviews major interpretive claims and rationale | NOT STARTED | No editor-in-chief approval recorded |
| Technical package | Canonical story data, metadata, citations, images and route integration pass schema checks | NOT STARTED | No canonical CMS/story object created |
| Preview QA | Staging/preview rendered, mobile/desktop, accessibility, links, schema, canonical, sitemap and RSS checked | NOT STARTED | No story preview exists |
| Publication approval | Explicit human editor approval and all required gates passed | BLOCKED | Not authorised |
| Production publication | Canonical publishing workflow publishes approved object | BLOCKED | No CMS publication performed |
| Post-publication observation | Live URL, indexing, analytics, correction channel and first review logged | BLOCKED | Depends on publication |

## Evidence findings that may be reported with careful attribution

1. The Supreme Court's 29 October 2026 order sets temporary manufacture, sale and bursting windows and detailed requirements for sealed boxes, product/batch QR codes, designated sales sites, police patrols, QR checks, sample referrals, seizures/prosecutions, AQI reporting and hospital-admission reporting.
2. Hindustan Times reported market visits on 22 October and 2 November and described products displayed before the permitted sales window, missing/difficult-to-scan QR codes and vendor accounts of conventional products being available. These are attributed observations by that newsroom, not The Breakdown's own fieldwork.
3. A separate Hindustan Times report quoted Delhi Police district officers on FIRs and seizure quantities and described residential-area patrol limitations. Delhi Police's public press-release index also lists 15 October recoveries of 2,260 kg and 338.5 kg. These are separate reported entries, not a consolidated police dataset; figures must not be added or double-counted without incident-level reconciliation.
4. NEERI's official page says its official online registration certificates and test reports are the only authentic documents and links to its registered-manufacturer list. The current list has not been retrieved and audited.
5. NEERI's 16 October 2025 press note says manufacturers develop product-specific QR codes and regulators such as PESO/CPCB verify them. The 2026 order adds explicit product-and-batch non-transferability; the 2026 batch-level validation process remains untested.
6. AQI before/after changes cannot establish fireworks causation without station completeness, pollutant-level data, meteorology and a defensible attribution method.

## Mandatory no-RTI constraint

No RTI application is authorised or to be filed. Do not prepare, submit, pay for, or request applicant identity for an RTI. Use public records and, only after separate approval, ordinary right-of-reply outreach. No outreach has been sent.

## Release rule

Do not merge this research PR into main as a publication action. Do not write directly to production CMS or trigger production deployment. The next permissible release step is to complete the missing evidence and editorial gates, create the canonical story object through the repository's established workflow, run the complete relevant verification suite, obtain human approval, and publish through the existing publication authority. If any mandatory gate remains open, publication stays on hold.

## Next work queue

1. Retrieve and archive the actual current NEERI registered-manufacturer/product list; note the page/list update date and match the order's eligible product scope.
2. Locate actual 2026 district designated-site notifications and 2026 Delhi Police licensing/deployment instructions from public sources.
3. Reconcile the attributed district enforcement figures with any publicly released police summaries; do not combine incompatible district/time windows.
4. Retrieve hourly station-level AQI/pollutant data for the court-defined windows as the observations become available; preserve missingness and QC flags.
5. Prepare a source-specific right-of-reply request and submit only after explicit authorisation.
6. Conduct an independent fact-check and all required editorial reviews.
7. Only then prepare the canonical CMS object, preview, technical QA and final publication approval.
