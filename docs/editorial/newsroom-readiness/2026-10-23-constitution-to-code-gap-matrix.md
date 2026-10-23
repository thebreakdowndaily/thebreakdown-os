# Newsroom Readiness Mission: Constitution-to-Code Gap Matrix

**Status:** Draft mission contract — not an implementation acceptance report  
**Prepared:** 23 October 2026  
**Repository baseline:** `main` (verified through GitHub connector; no local test/build execution)  
**Scope:** Editorial workflow, evidence integrity, canonical publication authority, production presentation, and post-publication accountability.  
**Release posture:** PR #133 remains a draft. This document does not authorize publication, merge, deployment, or production-data changes.

## Executive finding

The repository contains meaningful editorial and technical safeguards, including a ratified Editorial Constitution, a review checklist, a canonical publication contract, an evidence-vault guard, a claim type, and a seven-phase audit representation. The main gap is not that nothing exists; it is that several constitutional requirements are represented as optional metadata or process guidance rather than enforceable, version-bound, auditable invariants.

**Confirmed critical defect:** `lib/editorial/publication-gate.ts` treats a missing `goldStandardAudit` as passing Gate 11 when the story has at least one source and one claim. That substitutes evidence density for completed review. The evaluator in `lib/editorial/gold-standard-review.ts` checks phase booleans and blocking counts but does not itself require reviewer identity/date or bind the audit to the exact reviewed story version.

**Confirmed claim-model gap:** `Claim` in `types/canonical.ts` includes core fields (id, claim text, data, source, source URL, confidence tier, confidence score, status) plus optional evidence tier/ID, verification date, source count and counterarguments. It has no first-class required exact evidence locator, accountable verifying editor, verification activity record, or claim revision history. Some source/evidence linkage may exist elsewhere; this matrix therefore says “not present on this model”, not “absent everywhere”.

**Important nuance:** `lib/editorial/canonical-publication.ts` exposes both an async contract (including the evidence-vault validation gate) and a synchronous compatibility evaluator (which runs synchronous gates only). The inspected CMS save action uses `evaluatePublicationContractAsync`. All callers and scheduled/alternate publication paths must be traced before making a repository-wide bypass claim.

This is a source inspection, not a claim that a full repository-wide caller graph, all tests, or production behavior have been independently verified.

## Evidence labels

- **Confirmed in inspected code:** directly visible in the named source file.
- **Constitutional requirement:** explicitly stated in the Editorial Constitution or Editorial Review Checklist.
- **Unverified / trace required:** repository-wide existence or behavior requires caller/schema/test inspection.
- **Proposed acceptance criterion:** future behavior that this mission must demonstrate with tests and review evidence.

## Constitution-to-Code matrix

| ID | Standard / obligation | Current implementation evidence | Gap / risk | Priority | Acceptance evidence |
|---|---|---|---|---|---|
| CR-01 | Gold Standard Review: seven distinct review phases; all must pass; blockers resolved | Constitution Article XI and review checklist define seven phases. `gold-standard-review.ts` models phase outcomes. | **Confirmed:** `publication-gate.ts` allows the review gate to pass without an audit record if sources and claims exist. This makes a substitute condition look like a completed process. | **P0** | Tests prove absent, malformed, partial, stale, or failed audits always block publication; no density fallback remains. |
| CR-02 | Reviewer accountability: named reviewer, dates, independence and role-specific checks | Review checklist assigns expert reviewers, reader profiles, independent fact-checker, non-writer bias editor, visual reviewer and Editor-in-Chief. Audit fields `auditorId` and `auditDate` are optional. | **Confirmed in data type:** the audit record can represent a phase as passed without recording reviewer or date. Whether writes validate these fields elsewhere is unverified. | **P0** | Server-side schema/validator rejects passed phase without required identity, timestamp, role/independence evidence, finding notes and disposition. |
| CR-03 | Audit applies to exact story version | `GoldStandardAuditRecord` carries storyId and lastAuditTimestamp. `Story` has optional numeric version/history metadata. | **Confirmed in inspected type:** audit contains no reviewed content hash/version. A pass can’t be proven to refer to the bytes subsequently published using this record alone. | **P0** | Audit records immutable reviewed revision ID + content hash; any editorially meaningful content change invalidates approval and requires re-review. |
| CR-04 | Claims must have stable ID, precise wording, evidence, confidence, counterargument, verification date, responsible editor and version history | Constitution Articles III–IV; `Claim` in `types/canonical.ts` contains id, claim, data, source/sourceUrl, tier, confidence, status, optional evidence metadata and counterarguments. | **Confirmed on Claim model:** exact locator, responsible editor and per-claim version/verification event history are not first-class fields. Required/optional values and any relational schema need a broader inventory. | **P0/P1** | Typed schema and DB constraints cover required metadata; migration/backfill strategy documents legacy claims; invalid claim cannot pass publication validation. |
| CR-05 | Source provenance and independence; assess evidence at the original source and record contrary evidence | Constitution Article III; claim has source and sourceUrl; evidence guard checks archive identity and integrity for non-legacy claims. | Existence of a source URL/archive does not establish source independence, that the cited passage supports exact wording, or that contrary evidence was searched. Those review findings need structured records. | **P1** | Evidence records include publisher/author/date/type, origin/primary-source lineage, exact locator, access/verification time, archive hash, support/contradiction relation and reviewer disposition. Independence is asserted only with recorded rationale, not inferred from URL count. |
| CR-06 | Evidence Vault preserves claim-critical artifacts and verifies cryptographic integrity | `lib/story/evidence-guard.ts` requires archiveId for non-legacy claims. Async gate calls guard. | **Confirmed caveat:** guard returns valid immediately when `REQUIRE_EVIDENCE_VAULT_FOR_PUBLICATION === 'false'`; if the guard is called with no vault object, it checks archive ID presence but not artifact existence/integrity. Configuration and async contract's vault-provider behavior need a fail-closed test. Legacy exemption is intentional but needs defined limits. | **P0** | Production configuration cannot silently disable guard; required vault unavailable => block; artifact must exist, be retained/locked and hash-verified; legacy exemptions are explicitly scoped, visible and auditable. |
| CR-07 | One canonical publication authority across manual and scheduled publishing | `lib/editorial/canonical-publication.ts` documents a canonical server-side contract; inspected `app/cms/actions.ts` uses async contract for published save. | Async and sync evaluators both exist; all callers, cron jobs, alternate actions, RPCs and DB functions have not yet been exhaustively traced. `publishedAt` being present is a gate requirement but must not act as authorization. | **P0** | Caller inventory covers route/action/cron/RPC/DB/deploy paths. All public transitions pass the same fail-closed authority or DB-enforced fence. Tests show direct writes, scheduled runs, retries, fallbacks and races cannot bypass it. |
| CR-08 | Publish the exact reviewed revision with immutable/auditable approval | Canonical contract returns a publication token and updates story state; story type has optional version/versionHistory. | Token binding, single-use semantics, hash/revision binding, expiry, database enforcement and TOCTOU race protections have not been fully verified in this mission. | **P0** | Review decision and publish token bind to storyId + immutable revision/hash + gate result; token is single-use, scoped and atomic; changed revision or consumed token blocks. Concurrency tests prove no stale approval can publish. |
| CR-09 | Format-specific reporting standards; no misleading universal checklist | Story type/reportingType fields can distinguish explainer, analysis, investigation and document analysis. PR #133 labels itself a document-led explainer. | Whether format-specific required reporting plans are enforced is unverified. Generic density rules can mislead by treating more sources or blocks as higher quality. | **P1** | Commission schema selects format-specific rubric (explainer, original reporting, data analysis, investigation, interview, etc.); each defines required inputs, methods, limits, contact/response handling and sign-off without inventing work. |
| CR-10 | Conflicts, anonymous sourcing, AI use, plagiarism and legal risk are handled explicitly | Constitution Article II states conflict disclosure, recusal, restrictions for anonymous sources, AI disclosure/review and plagiarism policy. | Existence of those policies does not prove intake fields, enforcement, escalation workflow or evidence of checks. Legal-risk workflow and reviewer authority require path tracing. | **P1** | Required disclosure and check records; escalations have named owner, reason, decision and resolution; relevant high-risk stories block until the authorized disposition is recorded. |
| CR-11 | Visual accuracy, provenance, rights and accessibility | Constitution Article II and review checklist Phase 5. Story has hero-image metadata and canonical media models include credit/license/provenance-related fields. PR #131 documents past image-integrity defects and fixes. | A model field or automated topic-match does not prove this story uses the right image, correct caption, legal asset or accessible description. Actual rendering and rights verification need independent evidence. | **P1** | Every published visual resolves to a curated asset; provenance/rights/caption/alt and factual relevance pass; screenshots and HTTP asset checks validate the rendered story across breakpoints. |
| CR-12 | Reader-facing transparency: evidence strength, uncertainty, sources, limitations, reviewers, version and changelog | Constitution Articles XII–XIII specify freshness and transparency metadata. Story model has some freshness/uncertainty/version fields. | Full mapping from canonical fields to public output and freshness calculations is unverified. Never expose an invented numeric trust score if its inputs are missing or stale. | **P1** | Public response/render test proves required metadata is present, internally consistent and sourced from stored records; stale/unknown values are labelled honestly. |
| CR-13 | Accessible public challenge/correction channel and durable corrections | Constitution Article II requires public correction channel and logged correction with related-object review. Repository PR #132 describes changes to make correction ledger durable. | Actual end-to-end public submission, persistence, triage, reader response, correction display and downstream propagation have not been independently validated here. | **P1** | Integration test submits challenge, persists it, assigns owner/SLA, records decision, displays correction history and enqueues linked claim/story reviews. Failure cannot silently drop a correction. |
| CR-14 | Monitor source changes/retractions and trigger dependent-claim/story review | Gate checks retracted-source states from story sources and source registry. Freshness fields exist. | A publication-time lookup cannot by itself prove ongoing monitoring, source-change detection, or dependency propagation. | **P1** | Deterministic test changes/retracts a source; dependent claims and stories transition to review-required; readers see a versioned update/correction when warranted. |
| CR-15 | Exact public output, citations, APIs, SEO and cache state are correct | CMS save action revalidates paths and tag. Repository contains deployment/SEO systems, but this matrix has not traced every public route. | A successful internal gate does not prove public HTML, API payload, metadata, sitemap, CDN cache or image URLs show the reviewed version correctly. | **P1** | Preview smoke tests compare rendered story/API/version/hash; citation URLs resolve; metadata/sitemap are correct; cache invalidation is observed; accessible/responsive screenshot and request evidence retained. |
| CR-16 | Auditability of editorial decisions and permissions | Constitution Article XV defines decision records; canonical publication builds a state-transition audit record. | Exact durable persistence, ACLs, tamper resistance and completeness of the editorial-decision ledger are unverified. A generated in-memory object is not evidence of durable audit storage. | **P1** | Persisted, access-controlled, append-only decision and approval records; audit read-back after request/process restart; authorized roles and separation-of-duties tests. |
| CR-17 | Pilot through adversarial synthetic stories before a real release | PR #133 says the canonical gate has not run and evidence records are not ingested; current PR is draft. | A single real-story success would not validate failure coverage, production safety or quality of reporting. | **P0** | Non-production synthetic corpus covers missing/fabricated/contradictory evidence, source dependency, stale audit, modified revision, reviewer conflict, retracted source, visual mismatch, rights gaps, CMS race and deployment/cache failure. Zero unresolved critical failures. |

## P0 acceptance contract — release authority

These checks are **blocking release criteria**. Every row needs a named owner and linked automated or human evidence. “Exists”, “configured”, “green in a different workflow”, or “AI says complete” does not count as passed.

### A. Gold Standard review cannot be synthesized

1. Missing `goldStandardAudit` always fails; source/claim counts must never substitute for review.
2. All seven phase records must exist and be structurally valid.
3. A passed phase needs reviewer identity, role, timestamp, findings/notes, and blocking-issue disposition.
4. Review independence requirements are enforced for expert reviewers, fact-checker and bias editor; author cannot satisfy an independent-review role.
5. Review carries exact immutable story revision/content hash. Any relevant content or claim/evidence change invalidates the associated review.
6. The overall decision is derived from valid phase records and unresolved blockers, not trusted from caller-supplied `overallPassed` or `completedPhasesCount`.
7. Invalid, missing, duplicate, stale or self-approved phase records fail closed with specific diagnostic output.

### B. Evidence must be available to verify, not only referenced

1. For non-legacy claims, claim-critical supporting evidence must map to an archived artifact ID.
2. Production fails closed if evidence-vault configuration/provider is unavailable; no environment toggle may unintentionally disable this control in production.
3. The referenced artifact must be present, readable, retained according to policy, and cryptographically intact at publication time.
4. Exact source locator (page/paragraph/table/row/timecode or equivalent) resolves to the preserved artifact.
5. Unsupported claims, contradictory evidence, inaccessible documents and source corrections are explicit blocking findings unless a named editor documents a defensible disposition allowed by policy.
6. Source counts are not treated as corroboration counts unless independence/origin lineage is recorded.

### C. One fenced publication path; exact-revision approval

1. Enumerate every route, server action, cron/scheduler, fallback, retry, RPC, trigger and database function capable of changing public visibility.
2. Every path uses the same canonical publication authority or an equivalent database-enforced atomic fence. No sync evaluator may publish without async evidence verification.
3. Approval and publish token bind to story ID, exact revision/content hash, gate result, authorized publisher and expiry; consumption is atomic and single-use.
4. Any edit after approval requires re-review. Concurrent edits, duplicate scheduled jobs and replayed tokens cannot publish a stale revision.
5. Story state change, audit record and public-event/outbox record are transactionally consistent or have tested recovery/idempotency semantics.
6. No direct published-state save, SQL shortcut, seed/demo action, migration, API route, or administrative fallback can bypass the policy.

### D. Negative acceptance suite (must run in CI)

- No audit record.
- Audit with one missing phase.
- All phases true but no reviewers/timestamps.
- Writer reviews own work as the independent fact-checker.
- Audit belongs to another story ID or earlier revision.
- Story changed after final approval.
- Evidence URL exists but archive bytes do not.
- Archive hash mismatch, retention unlocked, vault unavailable, or production guard disabled.
- Citation fabricated, locator wrong, claim phrasing stronger than source, and source repeated through dependent outlets.
- Source retracted/changed after publication.
- Rights missing, hero image unrelated, caption overstates what image shows, alt text missing.
- User has writer role but attempts publish; editor lacks required elevated approval on high-risk story.
- Scheduled publish is replayed; two jobs race; token is reused; DB write fails after gate.
- Public page/API/cache/sitemap still serves the pre-approved or partially updated revision.
- Correction challenge is accepted by UI but not durably persisted.

Each case must assert both (a) publication is prevented or content is correctly marked for review and (b) a durable, actionable reason is recorded.

## P1 implementation tracks

1. **Commission and reporting plan:** record question, public interest, format, known facts, unknowns, hypotheses/alternatives, reporting tasks, required sources/interviews/data, response requests, constraints, and explicit evidence that would change the conclusion.
2. **Research workbench:** preserve files and source versions; annotate exact locators; track source origin/dependency, access attempts, contact records, response deadlines and contradictions.
3. **Claim verification:** normalize claim records and change history; model evidence supporting/contradicting each claim; support re-verification and dependency impact.
4. **Workflow & roles:** distinct assign/report/fact-check/line-edit/bias/legal/visual/final approval records with conflict disclosure and least-privilege permissions.
5. **Reader experience:** exact reviewed content, citations, captions, source notes, uncertainty/limitations, responsive and accessible narrative layout, metadata, sitemap and cache acceptance.
6. **Post-publication accountability:** public challenge intake, correction ledger, linked-claim review queue, source monitoring, version history and reader-visible change explanation.
7. **Observability:** publication decision logs include gate version, story revision hash, reviewer records, vault artifact hashes and failed check IDs; alert on any failed or bypass-attempted publish.

## Format-specific editorial bars

A common foundation is required, but evidence density alone is not a reporting standard. Apply a rubric based on declared story type.

- **Document-led explainer:** central question, document/source inventory, provenance and locator for each material claim, competing interpretations, limitations, and distinction between what documents establish and what remains inference.
- **Original reporting / interview:** reporting plan, independently verified notes/recordings as appropriate, attribution/consent context, right-of-response records when fair and relevant, corroboration, and explicit separation of on-record fact from anonymous-source or reporter interpretation.
- **Data analysis:** original dataset and provenance, reproducible transformation/queries, definitions, missingness, denominator checks, uncertainty and sensitivity tests.
- **Investigation:** testable hypothesis plus alternatives, source protection/security plan where needed, document and data trail, subject response opportunity, adversarial verification, legal-risk review, and editor-approved unresolved-risk disposition.
- **Analysis/opinion:** factual claims sourced and verified, argument separated from facts, strongest counterargument fairly addressed, author conflicts disclosed.
- **Briefing/update:** date/time scope, primary-source check, what changed, uncertainty, update monitoring and correction path.

No format may claim interviews, tests, field reporting, independent corroboration or original data work unless the newsroom record substantiates that work.

## Pilot plan and stop/go rule

**Stage 0 — test fixtures only:** create synthetic stories and mocked evidence-vault artefacts in an isolated, non-production environment. Verify invariants and negative cases; no public content or production data mutation.

**Stage 1 — end-to-end non-production:** exercise one story of each relevant format through commission, sources, claims, reviews, approval, rendering and post-publication correction simulation. Retain logs, test reports and rendered screenshots.

**Stage 2 — supervised editorial pilot:** only after the complete automated suite is green and a named human editorial board has reviewed the workflow, run one real draft through every stage. The AI-literacy PR may be considered as the document-led explainer candidate, but it is not pre-approved and its current evidence-ingestion gap remains blocking.

**Go criteria:** all P0 cases pass; no unresolved critical/high publication bypass; approval/content hash verified end-to-end; production credentials and environment remain untouched by tests; public-route preview is correct; named editor signs off on the exact revision.

**Stop criteria:** missing audit evidence, any unexplained bypass path, evidence archive failure, stale approval, incomplete CI, unverified rendered assets, or a reviewer asserting a check without recording the underlying evidence.

## Explicit exclusions / safety

- Do not merge or publish PR #133 as a way of demonstrating readiness.
- Do not write, seed, or backfill production story/evidence rows as part of this mission.
- Do not weaken guardrails to make legacy content pass. Handle legacy exemptions explicitly and visibly.
- Do not infer a whole-repository bypass from the existence of a compatibility function. Trace and test every caller first.
- Do not remove existing published stories solely because these gaps exist. Audit them by documented risk and sampling plan, then remediate confirmed defects.
- Do not declare constitutional compliance on the basis of CI alone; human editorial judgment and source-level evidence remain necessary.

## Source evidence inspected

- `docs/editorial/editorial-constitution.md` — ratified Constitution v1.1, especially Articles II–IV and XI–XV.
- `docs/editorial/editorial-review-checklist.md` — seven-phase human review criteria and sign-off table (document status shown as Draft; governance/operational status should be resolved).
- `types/canonical.ts` — `Story`, `Claim`, `MediaItem`, `StoryType` and `reportingType` data contracts.
- `lib/editorial/publication-gate.ts` — Gate 11 audit fallback and gate composition.
- `lib/editorial/gold-standard-review.ts` — audit record shape/evaluator.
- `lib/story/evidence-guard.ts` — evidence archive enforcement and emergency environment bypass.
- `lib/editorial/canonical-publication.ts` — asynchronous and synchronous publication evaluators, publication token issuance, state transition.
- `app/cms/actions.ts` — inspected CMS save/publish action calls the asynchronous canonical publication contract.
- `AGENTS.md` — code-change rules, production safety and verification expectations.
- [PR #133](https://github.com/thebreakdowndaily/thebreakdown-os/pull/133) — open draft; explicitly identifies production evidence-ingestion and human approval blockers.
- [PR #132](https://github.com/thebreakdowndaily/the-breakdown-os/pull/132) — security remediation PR claims a durable correction-ledger change; implementation and integration acceptance still need verification.

## Outstanding evidence required before implementation planning is complete

- Complete source-level call graph for all direct publication writes, cron/scheduler/fallback paths, Supabase RPCs, PostgreSQL functions/triggers and storage policies.
- Test inventory for the specific gate, Gold Standard Review, vault guard, token, workflow state machine and publication entry points.
- Production configuration inventory proving the evidence guard cannot be disabled or omitted.
- Schema/RLS/ACL inspection proving audit, reviewer, source, evidence and correction records are durable and appropriately protected.
- Exact content-hash/token semantics and transaction boundaries under concurrent edits/retries.
- Preview tests of rendered HTML, public APIs, assets, cache invalidation, sitemap and corrections.
- Named human owner for each review phase and documented separation-of-duties policy.

**Mission acceptance:** This document is a prioritized test contract and confirmed-gap snapshot. It is not proof of newsroom readiness and does not authorize publication.
