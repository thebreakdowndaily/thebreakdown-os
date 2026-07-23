# Phase 0 — Story Structure Architecture Audit

**Status:** Audit only. No implementation.
**Date:** 2026-07-19
**Scope:** Story content lifecycle from source data → rendered `/story/[slug]` page + parallel outputs (metadata, JSON-LD, sitemap, RSS, search, related, APIs).
**Method:** Traced imports and runtime usage. Verified each subsystem against the repository, not filenames.

---

## A. Architecture Inventory

### A1. Story authoring / content source
| Subsystem | Actual files | Source of truth | Runtime path | Status | Problems |
|---|---|---|---|---|---|
| Legacy authoring docs | `stories/*/story.yaml`, `narrative/*.md`, `research/*.md`, `knowledge/*.yaml` | hand-authored markdown/yaml | **NONE** — no loader, importer, or compiler references these files anywhere in `app/`, `services/`, `lib/`, `features/`, `scripts/` | ORPHANED | 9 story folders exist (`kashmir-first-test` AND `kashmir-the-first-test` are duplicates of the same story). The yaml schema differs between folders (e.g. `indias-inheritance-partition/story.yaml` uses `story/status/health/version` tree; `kashmir-the-first-test/story.yaml` uses `id/status/version/theme`). This is the user-visible "broken story structure." |
| Live content store | `utils/data-layer/store.ts` | hand-authored TS mock objects (`APIStory[]`, ~5000 lines) | `bootstrapServices()` → `apiStoryToCanonical` | PARTIALLY EXISTS | This is the *actual* source for every rendered story. Stories are authored as TS literals, not from `story.yaml`. |

### A2. Schemas / types
| Subsystem | Actual files | Status | Problems |
|---|---|---|---|
| API types | `utils/data-layer/types.ts` (`APIStory`, `APIClaim`, `APISource`, `APIFact`) | EXISTS | `APIStory.status` vocabulary = `'breaking'|'developing'|'verified'|'explainer'|'archive'` — NOT the canonical lifecycle. |
| Canonical types | `types/canonical.ts` (`Story`, `Claim`, `Source`, `StoryStatus`, `CanonicalClaim`) | EXISTS | `StoryStatus` = `'draft'|'review'|'fact_check'|'scheduled'|'published'|'updated'`. Two incompatible status vocabularies. |
| Knowledge Library chapter | `types/canonical.ts` `Chapter` / `KnowledgeBlock` | EXISTS | Separate content model for long-form chapters, rendered via `StoryShell`. Divergent from `Story`. |

### A3. Normalization (the critical seam)
| Subsystem | File | Status | Problems |
|---|---|---|---|
| API→Canonical adapter | `lib/bootstrap.ts` `apiStoryToCanonical` | EXISTS | **Hard-codes `status: 'published'` (line 199) for EVERY story**, ignoring `APIStory.status`. This is the publication-leakage root cause. Also claims are randomly-IDed each call (`Math.random()`) so claim identity is non-stable across renders. `...s as unknown as Story` spreads API-only fields onto canonical type (type-unsafe). |
| Topic/Entity/Timeline/Fix adapters | `lib/bootstrap.ts` `api*ToCanonical` | EXISTS | Same `as unknown as` pattern; `apiTimelineToCanonical` leaves `entityIds`/`topicIds` empty (data loss). |

### A4. Route
| File | Status | Notes |
|---|---|---|
| `app/story/[slug]/page.tsx` | EXISTS | Dual-mode: tries `tryLoadChapter(slug)` first (Knowledge Library `Chapter`); if not found, falls back to `buildStoryPage` (legacy `Story`). Chapter path uses `StoryShell`; legacy path hand-renders inline (not via a shared shell). |

### A5. Page rendering / view model
| File | Status | Notes |
|---|---|---|
| `features/story/view-model.ts` `buildStoryPage` | EXISTS | Returns `StoryTerminalViewModel`. Calls `services.stories.getStoryBySlug`. |
| Pipeline builders | `services/stories/pipeline/{entities,visuals,timeline,reading,quality}.ts` | EXISTS | Each is a `StoryBuilder` in `KnowledgeStoryPipeline`. Reading modes built in `lib/view-models/story-builders.ts` (`buildQuickView`, `buildDeepView`). Page reads `?mode=quick|standard|deep` from `searchParams` (correct — query-param, not separate URLs). |
| Block rendering | `components/story/blocks/registry.tsx` | EXISTS | Renders `StoryBlock[]`. |

### A6. Evidence & Claims
| Subsystem | Status | Notes |
|---|---|---|
| Embedded claims (legacy) | `Story.claims: Claim[]` | EXISTS | Claims live inside each story. `Claim.status` = `'verified'|'strong'|'moderate'|'unverified'`. |
| Canonical claim registry | `lib/knowledge/claim-registry.ts` + `knowledge-core.ts` | EXISTS (parallel) | `CanonicalClaim` with `appearsIn`, `sourceIds`, `documentIds`. Used ONLY by Knowledge Library chapters, NOT by legacy `Story` pipeline. |
| Relationship between the two | DUPLICATED | Two claim models, two storage strategies, no bridge. Legacy pipeline never consults the registry. |

### A7. Quality / confidence scoring
| Value | Origin | Status |
|---|---|---|
| `evidenceScore` (page header, e.g. "98% Quality Score") | `rawStory.evidenceScore` (from `APIStory.evidenceScore`, hand-authored in store.ts) | MANUALLY AUTHORED |
| `Quality Score` in sidebar (`qualityScore.score`) | `QualityBuilder` — computed checklist of present/missing blocks + hero image tier | CALCULATED (runtime) |
| `Claim confidence` | `APIClaim.confidence` (hand-authored) → mapped to `Claim.confidence` (0–1) | MANUALLY AUTHORED |
| `claims verified` count | `view-model.ts`: `claims.filter(status==='verified'||'strong')` | DERIVED |
| `source tier` | `APISource.tier` (hand-authored 1–5) | MANUALLY AUTHORED |

**Provenance gap:** The displayed "Quality Score" (from `evidenceScore`, manual) and the computed `qualityScore.score` (from `QualityBuilder`) are two different numbers with two different meanings, both labeled "Quality Score" in the UI (`page.tsx` line 324 vs sidebar). ~45% vs 36% style metric conflicts (e.g. India–Russia defence imports) are hand-authored literals in `store.ts` with no provenance linkage.

### A8. Sources
| Subsystem | Status | Notes |
|---|---|---|
| Legacy sources | `APISource` → `Story.sources: Source[]` (title, url, tier) | EMBEDDED |
| Canonical sources | `CanonicalSource` (`claimIds`, `documentIds`, `chapterIds`) | EXISTS (parallel, Knowledge Library only) |
| Provenance | DUPLICATED | Two source models. No shared canonical source identity. Charts/facts cite source strings independently (`APIFact.source`). |

### A9. Metrics
| Subsystem | Status | Notes |
|---|---|---|
| `APIFact` / `Story.facts` | EMBEDDED | `value`+`label`+`source` string. No denominator/period/uncertainty. |
| `APIChart` / `Story.charts` | EMBEDDED | `type`/`data`/`xKey`/`yKey`. No `ChartSpec` (canonical `ChartSpec` is defined but unused by legacy pipeline). |
| Metric abstraction | MISSING | No `Metric` model used by story pipeline. |

### A10. Charts
| Subsystem | Status | Notes |
|---|---|---|
| Chart library | **NONE** — no `recharts`/`d3`/`chart.js` import anywhere. | Charts rendered as inline SVG/table likely via `components/story/blocks`. Accessibility wrapper does not exist. |
| Canonical `ChartSpec`/`ChartDef` | `ChartDef` used; `ChartSpec` UNUSED. | Two chart type defs, one unused. |

### A11. Timelines
| Subsystem | Status | Root cause |
|---|---|---|
| Timeline components | **≥6 implementations**: `story/Timeline.tsx`, `story/blocks/TimelineBlock.tsx`, `story/blocks/InteractiveTimelineBlock.tsx`, `knowledge-library/blocks/TimelineBlock.tsx`, `entity/*Timeline*.tsx`, `home/timeline/*`, `timeline/TimelineRenderer.tsx` | Separate datasets + separate components. Legacy `Story.timeline` (typed `TimelineEvent`) vs Knowledge Library `KLEvent` vs `APITimelineEvent` vs `CanonicalTimelineEvent`. No single canonical event model projected per context. |

### A12. Entities / knowledge graph
| Subsystem | Status | Notes |
|---|---|---|
| Entity registry | `services/entities/*`, `services/entities/legacy-adapter.ts` | EXISTS |
| Graph | `services/graph/service.ts`, `types/canonical.ts` `Graph` | EXISTS |
| Legacy story→entity | `apiStoryToCanonical` maps `relatedEntityIds` from `APIRelatedEntity[].id`; `EntityBuilder` in pipeline resolves them. | `relatedEntities` are embedded objects in `APIStory`, not resolved from a registry at authoring time. |

### A13. Reading modes
| Subsystem | Status | Notes |
|---|---|---|
| Modes | `quick`/`standard`/`deep` via `?mode=` query param | GOOD — no duplicate URLs. `buildQuickView`/`buildDeepView` in `lib/view-models/story-builders.ts`. Standard renders `StoryBlock[]`; quick renders `keyPoints`; deep adds methodology. |

### A14. Metadata / JSON-LD / sitemap / RSS / search / related / APIs
| Output | File | Publication filter? | Notes |
|---|---|---|---|
| Metadata | `app/story/[slug]/page.tsx` `generateMetadata` | none | Uses `getStoryBySlug`; all stories get public metadata. |
| JSON-LD | `createJsonLd` (same file) | none | Emits `TheBreakdownKnowledgeStory` + Article + Breadcrumb + FAQ. |
| Sitemap | `app/sitemap.ts` | **none** — every `getStories()` entry included | Line 8: `getStories().data.map(...)`. No status check. (Contrast: `chapter.status` IS checked at line 57.) |
| RSS | `app/rss/route.ts` | **none** | All 20 most-recent stories. |
| Search | `services/search/*` + `services/bootstrap.ts` `search.rebuild` | none | All stories indexed regardless of status. |
| Related | `view-model.ts` `relatedStoryIds` | only by explicit id links | Stories can link to non-existent slugs. |
| APIs | `app/api/stories/route.ts`, `app/api/v1/stories/...` | depends on repo | `v1` uses `CanonicalStoryService` (Supabase); public `/api/stories` uses `store.ts`. Two APIs. |

---

## B. Dependency Graph (legacy story path)

```
utils/data-layer/store.ts  (APIStory[]  — hand-authored TS, status field IGNORED)
        │
        ▼
lib/bootstrap.ts  apiStoryToCanonical   ← HARD-CODES status:'published', random claim IDs
        │  (also createBlocksFromStory builds StoryBlock[])
        ▼
services/init.ts  initDefaultServices  → MemoryStoryService / CanonicalStoryService
        │
        ▼
features/story/view-model.ts  buildStoryPage  → KnowledgeStoryPipeline
        │  (EntityBuilder → VisualIntelligenceBuilder → TimelineBuilder → ReadingBuilder → QualityBuilder)
        ▼
app/story/[slug]/page.tsx   (renders StoryBlock[] inline; ?mode= quick|standard|deep)
   ├─ generateMetadata
   ├─ createJsonLd
   └─ (no publication gate)

Parallel:  app/sitemap.ts, app/rss/route.ts, services/search  all read store.ts directly (bypass canonical status entirely)
```

---

## C. Duplication Matrix

| Concept | Implementation A | Implementation B | Root cause |
|---|---|---|---|
| Story record | `APIStory` (store.ts) | `Story` (canonical.ts) | Two models; adapter bridges them but loses/forces status. |
| Claims | `Story.claims` (embedded) | `CanonicalClaim` registry (knowledge-core) | Legacy pipeline vs Knowledge Library; no bridge. |
| Sources | `APISource`→`Story.sources` | `CanonicalSource` | Same split; no shared identity. |
| Timeline | `Story.timeline` (`TimelineEvent`) | `KLEvent` / `APITimelineEvent` / `CanonicalTimelineEvent` | 4 event shapes; ≥6 components. |
| Quality score | `evidenceScore` (manual) | `QualityBuilder.score` (computed) | Two numbers, same label. |
| Chart def | `ChartDef` | `ChartSpec` | `ChartSpec` unused. |
| Status vocab | `APIStory.status` (breaking/developing/…) | `StoryStatus` (draft/review/…/published) | Incompatible; adapter discards A. |
| Authoring | `stories/*.yaml` + markdown | `store.ts` TS literals | yaml is orphaned; live source is TS. |

---

## D. Publication Leakage Analysis

**Symptom:** Any story present in `utils/data-layer/store.ts` is publicly reachable, indexable, and fed to RSS/sitemap/search — even if it is a draft.

**Root cause (not symptom):**
1. `APIStory` is the only live content source, and its `status` field is in a vocabulary (`breaking|developing|verified|explainer|archive`) that has **no `draft`/`unpublished` state** and is **never read** by `apiStoryToCanonical` (which forces `status:'published'`).
2. Consequently there is **no draft concept** in the live store, and **no consumer filters on status** (sitemap, RSS, search, page all assume published).
3. The canonical `StoryStatus` lifecycle (`draft|review|fact_check|scheduled|published`) exists in types only — it is never populated from real data and never enforced.

→ A future-dated or unfinished story cannot be kept out of public surfaces without adding a real status + a centralized visibility predicate. The fix is NOT "treat missing status as published" — that is exactly the current bug.

---

## E. Score Provenance (example)

| Displayed | Code origin | Nature |
|---|---|---|
| Header "98% Quality Score" (`page.tsx:324`) | `qualityScore.score` ← `QualityBuilder` (block presence + hero tier) | CALCULATED |
| Sidebar "Quality Score" | same `qualityScore.score` | CALCULATED |
| Header `story.evidenceScore` (e.g. 92) | `APIStory.evidenceScore` (store.ts literal) | MANUAL |
| `1/2 claims verified` | `view-model.ts` filter on `Claim.status` | DERIVED |
| `Primary Sources: N` | `story.freshness.primarySourcesCount` | MANUAL (often absent → not shown) |

Note: the header shows `qualityScore.score` (computed), while `story.evidenceScore` (manual) is shown elsewhere as "Confidence." Two different axes, inconsistently labeled.

---

## F. India–Russia Data Integrity Findings (do NOT edit during audit)

Story `india-russia-relations` (slug, store.ts ~line 1236). Flagged, not modified:
- `APIFact` "India-Russia Defence Imports (2020-25): $15 billion" (SIPRI) vs narrative prose "remain strong despite Western sanctions" — no linked `APIClaim`/`CanonicalClaim`, so unverifiable from the claim registry.
- `tags` include `India-US` and `India-Russia` but no matching `relatedEntityIds`/entity records necessarily exist.
- No `status` field → would be forced `published` if rendered.
- Classification: **EDITORIAL DATA ISSUE** (unsupported metric) + **DATA-MODEL DEFECT** (no provenance link). Do not silently change the value.

---

## G. Proposed Canonical Architecture (emerges from repo, not assumptions)

**Guiding principle:** Collapse the dual models at the seam; do not add a third.

1. **Single story source of truth.** `utils/data-layer/store.ts` (`APIStory`) is the live source. Keep it, but:
   - Extend `APIStory.status` to the canonical vocabulary (or add `publishedAt` + a `draft` flag) so drafts are representable.
   - Stop hard-coding `status:'published'` in `apiStoryToCanonical`; map conservatively.
2. **Centralize visibility policy** (one function, multiple predicates):
   - `isPubliclyPublished(story)` — gates page render + sitemap + RSS + search index.
   - `canPreview(story)` — for CMS/authenticated.
   - `shouldIndex(story)` / `shouldIncludeInFeed(story)` — may differ (archived stays viewable, excluded from feed).
   Default: **conservative** — if status cannot be determined safely, flag, do not publish.
3. **Stabilize claim identity.** Replace `Math.random()` IDs in `apiStoryToCanonical` with deterministic IDs (`claim-${slug}-${i}`). Optionally bridge to `CanonicalClaim` registry later; do not normalize prematurely.
4. **Consolidate timelines.** One canonical `StoryEvent` model; project per context. Remove duplicate components only after datasets unified.
5. **Unify sources.** Canonical source identity shared by claims/facts/charts. Keep embedded for legacy, but reference `CanonicalSource` where present.
6. **No new Claim API / no new lifecycle table / no chart-lib swap** until a demonstrated consumer requires it (per review directives 8, 11, 14).
7. **Orphaned `stories/*.yaml`:** decide intentionally — either wire a compiler from `story.yaml` → `APIStory` (so authors use yaml), or delete the folders. Do not leave them as a misleading "structure."

---

## H. Revised Implementation Plan (P0/P1/P2)

### P0 — Audit (this document)
- [x] Inventory, dependency graph, duplication matrix, leakage analysis, score provenance, data-integrity flags.
- **STOP. Return for review.** No code changes.

### P1A — Publication lifecycle + safety predicates (highest priority)
- Files: `utils/data-layer/types.ts` (extend `APIStory.status` / add `draft`), `lib/bootstrap.ts` (`apiStoryToCanonical` — remove hard-coded published), new `lib/story/visibility.ts` (`isPubliclyPublished`, `canPreview`, `shouldIndex`, `shouldIncludeInFeed`).
- Consumers to gate: `app/story/[slug]/page.tsx` (notFound if not published & not preview), `app/sitemap.ts:8`, `app/rss/route.ts`, `services/search` `rebuild`, `features/story/view-model.ts` `buildStoryPage`.
- Acceptance: a story with `status:'draft'` (or missing status) is excluded from sitemap/RSS/search and returns 404 (or preview) on its URL; existing published stories unchanged.
- Tests: `tests/` (Jest) — predicate unit tests + sitemap/RSS exclusion behavioral tests.
- Rollback: revert `apiStoryToCanonical` + add `status:'published'` back only if regression.

### P1B — Normalization hardening
- Files: `lib/bootstrap.ts` (deterministic claim IDs; drop `as unknown as` where safe; preserve `APIStory.status`), `services/stories/pipeline/*` (confirm no double-transform).
- Acceptance: stable claim IDs across renders; no type-unsafe spreads for fields used at runtime.
- Tests: snapshot-free behavioral test asserting claim id stability.

### P1C — Story IA consolidation (decide yaml fate)
- Either implement `scripts/compile-story-yaml.ts` (`story.yaml` → `APIStory`) OR remove `stories/` orphan folders; de-duplicate `kashmir-first-test` vs `kashmir-the-first-test`.
- Acceptance: one authoring path; no two folders for one story.

### P1D — Evidence/provenance UX
- Unify the two "Quality Score" labels (header computed vs `evidenceScore` manual); surface metric provenance.
- Files: `app/story/[slug]/page.tsx`, `features/story/view-model.ts`.

### P1E — Reading modes + accessibility (already query-param based — keep)
- Add accessible data-table/figcaption to chart blocks (no lib swap); confirm no duplicate URLs.

### P1F — Migration cleanup
- After P1A–E stable: remove dead `CanonicalStoryService` vs `MemoryStoryService` ambiguity if one is unused; consolidate duplicate timeline components; wire orphaned `story.yaml` or delete.

### P2 — Deferred (requires demonstrated need)
- Claim registry bridge for legacy stories.
- Metric abstraction (`Metric` model) — only if metrics proven duplicated/ambiguous.
- New `/api/stories/[slug]/claims` — only with a consumer.
- Chart library accessibility wrapper — only if `recharts`/existing lib proves limiting (currently no chart lib in use).

---

## Stop Condition
Phase 0 complete. Awaiting review of this audit before any structural change.
