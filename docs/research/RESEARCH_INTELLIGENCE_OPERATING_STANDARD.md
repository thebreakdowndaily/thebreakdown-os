# Research Intelligence Operating Standard (RIE v1.0)

**Status:** Ratified (Level 4 — Project Document)
**Version:** 1.0
**Date:** 15 Aug 2026
**Governance:** Subordinate to the Editorial Constitution (Level 1) and AGENTS.md (Level 2). Additive Level A surface only — no schema migration, no navigation change, no baseline change.

---

## 1. Purpose

The Research Intelligence Engine (RIE) transforms a research question into a **verified, provenance-complete evidence base** that the Editorial Bureau can turn into knowledge objects. It is the research arm of the Verification Bureau's operating loop: every claim it emits carries the evidence spine (claim → evidence → document → source → retrieved-at → hash) that the Editorial Constitution requires.

RIE is deliberately **deterministic, lexicon-driven, and honest about its limits**. At v1.0 it recognizes named entities and patterns; it does not "understand" them. Where understanding is required (contradiction adjudication, bias audit, interpretive judgment), RIE stops and surfaces the open item for a human. It never silently resolves a contradiction and never promotes an unverified claim to fact.

## 2. Scope

In scope:

- Topic expansion → query generation → source discovery → fetch → deduplication → claim extraction → evidence linking → corroboration → contradiction detection → timeline → gap detection → social signals → monitoring change events.
- Durable project state (memory / file / Supabase providers), research-pack export, Story OS brief export.
- Programmatic API surface (`/api/v2/research/*`) and the researcher workspace (`/intel/research`).

Out of scope (deferred, registered as gaps, never faked):

- AI-based entity resolution and semantic understanding.
- Automated contradiction adjudication.
- Bias audits (Verification Bureau process, human).
- Primary-source digitization.

## 3. Evidence Standard

Every artifact must answer "How do we know this?":

| Artifact | Provenance carried |
|----------|--------------------|
| ResearchSource | URL, canonical URL, discovered-at, adapter, source class/type, status, failure reason |
| ResearchDocument | content hash, retrieved-at, parse status, provenance block |
| ResearchClaim | document + source id, evidence span, first-seen-at, verification state |
| ResearchEvidence | claim + document + source, paragraph locator, excerpt |
| ResearchContradiction | both claim ids, both source ids, classification, next action, OPEN until adjudicated |
| ResearchGap | type, severity, recommended action, suggested queries |
| ResearchChangeEvent | type, severity, related ids, detected-at |

**Rules:**
1. Nothing is silently dropped. Duplicates are kept-but-tagged (`syndicatedFrom`/`syndicatedCopies`) or recorded as duplicates in the run counts. Failed fetches become `ACCESS_UNAVAILABLE` sources with a recorded reason.
2. Corroboration never counts syndicated copies as independent.
3. Contradictions are never auto-resolved. They carry a classification, a next action, and remain `OPEN` until a human adjudicates.
4. Extraction ≠ verification. Claims start `SIGNAL_ONLY`.

## 4. Verification States

| State | Meaning |
|-------|---------|
| `SIGNAL_ONLY` | Extracted, not yet corroborated (social signal or first sighting) |
| `UNVERIFIED` | No supporting source resolved |
| `PARTIALLY_CORROBORATED` | One independent publisher |
| `CORROBORATED` | ≥2 independent publishers, no primary source |
| `PRIMARY_SOURCE_CONFIRMED` | ≥1 primary source (OFFICIAL/REGULATORY/JUDICIAL/PARLIAMENTARY/PRIMARY) |
| `DISPUTED` | Contradiction recorded against it |
| `FALSE_OR_MISLEADING` | Human-adjudicated false |

## 5. Contradiction Classifications

`TRUE_CONTRADICTION` / `TEMPORAL_DIFFERENCE` / `SCOPE_DIFFERENCE` / `DEFINITION_MISMATCH` / `UNRESOLVED`.

Predicate-key method: two claims whose non-value skeletons match but whose metric values differ are candidates. Every detected contradiction is recorded with `nextAction`. Status stays `OPEN` until `acknowledgeContradiction`/`resolveContradiction` records a human decision.

## 6. Acceptance Criteria (v1.0)

For the acceptance topic **"India-US trade tariffs"**, the deterministic fixture corpus (`services/intelligence/research/adapters/fixture.ts`) must, end to end:

- Discover primary, secondary, academic, and social sources (≥13 sources).
- Deduplicate the ANI reprint at content level without dropping evidence.
- Corroborate the almond/pistachio agreement claim to `PRIMARY_SOURCE_CONFIRMED`.
- Detect the 25% vs 15% steel-tariff contradiction as `TRUE_CONTRADICTION`, left `OPEN`.
- Build a dated timeline, record the social signal, emit `NEW_PRIMARY_SOURCE` change events.
- Export markdown/json/csv research packs and a Story OS brief with full lineage.

These are encoded in `tests/research/acceptance.test.ts`. A run that passes them satisfies the RIE v1.0 definition of done.

## 7. Pipeline Contract

- Synchronous, bounded (`maxQueries` 24, `maxSources` 40, per-fetch timeout 30s via `AbortSignal.timeout`). A single request completes one run.
- Every run produces a `ResearchRun` with per-stage counts and error strings. Stage failures degrade the run to `PARTIAL`; a run with no surviving stage is `FAILED`. Failures are never hidden.
- Runs are idempotent within a project: existing sources/documents/claims/clusters/gaps are not re-created.
- Change detection uses the run's own window so monitoring can report "what's new this run."

## 8. Durable State

Authoritative state is a versioned snapshot (`ResearchPersistedState`, version 1). Providers:

| Provider | Selection | Use |
|----------|-----------|-----|
| `memory` | default (non-production) | tests, unconfigured local dev |
| `file` | `RESEARCH_STATE_PROVIDER=file` (+ `RESEARCH_STATE_FILE`) | single-instance local runs |
| `supabase` | production default | durable authoritative state, `newsroom.pipeline_metrics` snapshot row `1f0a7b3e-c5d8-4a2e-9b6f-3d2c7e8a9b01` |

No process-local variable is the source of truth. The snapshot is written after every authoritative mutation and reloaded on bootstrap.

## 9. Source Adapters

| Adapter | Id | Capabilities | Use |
|---------|----|--------------|-----|
| Fixture | `fixture` | discover, fetch | deterministic acceptance corpus |
| RSS | `rss` | discover, fetch | real feeds (RSS/Atom + HTML extraction, retries) |

Adapters expose an `AdapterContext` with an injectable fetcher (testability) and honor `maxResults`. The registry is process-wide; the bootstrap (`lib/intelligence/research-bootstrap.ts`) provisions adapters idempotently.

## 10. Story OS Integration

`generateStoryBrief` produces `ResearchStoryBrief` with `provenance.claimEvidenceLineage` (claim → evidence → document → source → url) so the Editorial Bureau can trace every sentence of a draft to its underlying evidence. This is the handoff artifact from Research to Editorial.

## 11. Definition of Done

- `npx tsc --noEmit` clean.
- `npm run test:research` passes all suites that do not require a live external database (`db-integration.test.ts` requires a reachable Supabase instance; it is excluded from RIE acceptance).
- `npm run build` regression passes.
- No new top-level folders, no schema migration, no navigation change, no public route breakage (Level A).

## 12. Traceability

Every implementation file in `lib/intel/research/`, `services/intelligence/research/`, and the research tests carries a header comment citing this document. This satisfies the AGENTS.md Implementation Traceability requirement.
