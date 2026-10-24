# MASTER EXECUTION REPORT — Story Quality & Image Intelligence P0

**Date:** 2026-10-24  
**Repository:** thebreakdowndaily/thebreakdown-os  
**Production SHA:** `3018a3b057da82590e08cd8a4fce6ed6bf8f58ca`  
**Candidate base SHA:** `24edd636ba6c7c7d5177e2718c870f4e920ae108`  
**Repair branch:** `fix/p0-story-quality-image-intelligence-2026-10-24`  
**Release status:** HOLD — no production story rows changed, no merge or deployment performed.

## Executive decision

The three recently published stories are not publication-ready. The read-only production database records contain approximately 300 words of narrative each, inconsistent reading-time labels, five source records and five claims each, three timeline entries, no charts, and broad category images rather than documented story-specific hero assignments.

Do not treat the new editorial graphics as approved publication media. They are original draft assets with pending editorial approval. The semiconductor graphic must be corrected before use: it currently reflects an older July 2026 milestone (three commercial-production units), while later September 2026 government releases state five operational plants. This is exactly why time-stamped evidence and explicit approval matter.

## Baseline from production story records

Narrative counts were calculated from reader-facing paragraph blocks, excluding headline, summary, claims, sources, FAQs, timeline and metadata. These are database-content counts, not a verified browser DOM word count.

| Story | Narrative words | Paragraphs | Declared read | Estimated at 220 wpm | Source records | Claim records | Charts | Timeline |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| AI literacy and Indian schools | 311 | 6 | 8 min | 2 min | 5 | 5 | 0 | 3 |
| Semiconductor mission and fab reality | 304 | 5 | 11 min | 2 min | 5 | 5 | 0 | 3 |
| BCCI domestic mandate and Ranji economics | 320 | 5 | 10 min | 2 min | 5 | 5 | 0 | 3 |

A reading-time estimate is a rough guide, not an editorial quality score. The variance is sufficiently large to require correction.

## Supported root causes

1. `lib/image-intelligence/context-matcher.ts`: one filename-token overlap could return a successful match; category placeholders could return a successful aligned match. A match score was being treated as stronger evidence than it is.
2. `lib/image-intelligence/service.ts`: hero selection fell through to the first related-entity image, then tag image, then category placeholder without story-specific editorial approval.
3. `lib/image-intelligence/manifest.ts`: a record named “verified” could describe a branded placeholder and did not require stable asset ID, asset rights basis, approval status/timestamp, dimensions, caption, or a story-specific relevance rationale.
4. `app/api/intelligence/resolve-image/route.ts`: the request checked `storyId` but fetched by `slug`; missing or ambiguous inputs were not given a consistent contract.
5. `components/story/StoryResearchAppendix.tsx`: claims are rendered as cards with source links and the full sources list is rendered again, causing repeated evidence apparatus.

## Branch changes made

- Added `lib/story/narrative-metrics.ts` and `tests/story/narrative-metrics.test.ts` to count only narrative prose and calculate reading time.
- Added `lib/image-intelligence/publication-validation.ts` and `tests/image-intelligence/publication-validation.test.ts` to fail closed when feature-story media lacks documented provenance, rights, alt text, dimensions, evidence sources or explicit human approval.
- Expanded `VerifiedImageRecord` with asset identity, provenance, rights basis, alt text, caption, relevance rationale, dimensions, format, evidence URLs and approval status/timestamp.
- Reclassified the three new original SVG graphics as pending editorial graphics, not authentic photographs and not approved heroes.
- Removed arbitrary entity/tag fallback selection for story hero media. A category placeholder is an explicit failure state, not proof of successful resolution.
- Updated `resolve-image` to accept either a non-empty `storyId` or a non-empty `slug`, validate supplied types, and retrieve by the field actually provided.
- Existing development release-hold registry records the three story-specific blockers.

## Evidence gaps and factual corrections

### AI literacy
- CBSE's 2026–27 CT&AI curriculum and resource-book circulars establish curricular material, not student learning outcomes by themselves.
- BaSE survey claims must be linked to the actual report/table and must state population, fieldwork date, sample, question wording and limitations.
- Do not infer students can verify generated answers from self-reported AI familiarity.
- Draft visual is a workflow recommendation, not survey data.

### Semiconductor mission
- PIB's 17 September 2026 update says 12 approved units, more than ₹1.64 lakh crore cumulative investment, and five units had commenced commercial production. Source: https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=160020
- PIB's 18 September 2026 release says five semiconductor manufacturing plants had commenced commercial production. Source: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2311726
- The new SVG currently says three production units and cites the July 2026 release. It is stale relative to the September updates and MUST NOT be used until corrected and re-reviewed.
- Approval, construction, commissioning, commercial production, product mix, yield and domestic value addition are distinct measures. No inference about leading-edge wafer-fab maturity follows from aggregate approval numbers alone.

### BCCI / Ranji economics
- The 2021 domestic first-class fee schedule is historical and must be labelled with its date; it does not establish the latest current payment schedule without a later BCCI source.
- The Test incentive scheme must distinguish playing XI and non-playing XI eligibility and state the qualifying season condition.
- The claimed 42% increase in appearances by India-capped / India A players remains unsupported absent a reproducible match-level dataset and defined comparison windows.
- Do not conflate match fees, Test incentives, central retainers, IPL contracts, allowances, prize money and total annual earnings.

## Acceptance matrix

| Requirement | Status | Evidence / reason |
|---|---|---|
| Production record baseline | PASS | Read-only production database query returned all three story records |
| Narrative/read-time mismatch | PASS | Word counts and declared reading times above |
| Candidate/deployed source distinction | PASS | Production SHA 3018a3b…; candidate base 24edd636… |
| Fail-closed hero validation module | NOT VERIFIED | Source and tests committed; suite not executed in a local checkout |
| One-token false-positive regression | NOT VERIFIED | Matcher changed; existing tests not executed or extended in this run |
| Image resolver API contract | NOT VERIFIED | Source changed; route tests and runtime behavior not executed |
| Source appendix consolidation | FAIL | Duplicate claim/source display identified; component not yet consolidated |
| Story-specific media provenance | BLOCKED | Metadata added but approval status remains pending; no human approval timestamp |
| Semiconductor graphic currentness | FAIL | SVG has July three-unit figure; September official update reports five |
| Corrected full-length drafts | BLOCKED | Reporting outlines and fact corrections established; drafts need more primary-source verification and substantial narrative revision |
| Public-page image load and responsive rendering | NOT VERIFIED | No authorized browser screenshot run available |
| Mobile/desktop screenshots for all stories | NOT VERIFIED | No browser evidence captured |
| Full test suite, typecheck, lint, a11y, build | NOT VERIFIED | No local checkout/runner result available |
| Production mutation/deployment | PASS (safety) | None performed |

## Exact next actions

1. Correct the semiconductor SVG from the September 17–18 releases and annotate the source date.
2. Finish matcher regression tests (one-word false positive, first-entity/tag fallback, placeholder classification) and API tests (ID-only, slug-only, both, neither, invalid type, missing story).
3. Wire `validateStoryHeroMedia` into the actual canonical publication gate. A standalone validator not called by the gate is not an effective control.
4. Consolidate claim/source UI into inline claim links plus one de-duplicated expandable Sources and methodology appendix; preserve claim-to-source relationships.
5. Rewrite the three drafts with complete claim-source matrices and second-pass editorial critiques. Keep the existing live stories unchanged.
6. Run full project checks and capture actual 390px and 1440px browser screenshots. Record exact commands, output, build SHA and browser errors.
7. Obtain editorial approval for the original graphics and factual content before changing manifest status to approved. Never assign an approval timestamp programmatically to bypass review.
8. Re-evaluate the release hold only after all blockers pass. No merge or deploy without authorization.
