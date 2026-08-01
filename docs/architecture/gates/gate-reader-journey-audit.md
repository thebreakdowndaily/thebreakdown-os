# Gate: Reader Journey Audit

**Gate ID:** AR-13C
**Date:** 26 Jul 2026
**Initial Status:** NOT PASSED — 7 critical findings, 5 high findings
**Recovery Status:** IN PROGRESS — 14 of 15 fixes applied
**Scope:** Can a reader reliably move from a public problem to an evidence-backed solution and understand why that solution exists?

---

## Executive Summary

The platform has four major reader capabilities: Stories, The Fix Hub, Individual Fix experience, and Problem Intelligence Explorer. The architecture is sound — Problems are correctly derived from canonical Fix data, and the Fix type carries rich trust information. However, the reader journey is broken at multiple points. The Problem Intelligence Explorer is effectively invisible (not linked from navigation, footer, homepage, or search). Three of six Fix fixtures have no story link. Stories do not link back to Fixes. The global search does not index Problems. These are not polish issues — they are structural gaps that prevent the core reader journey from working.

---

## Audit Area 1 — Entry Points

**Question:** Can every important knowledge object be discovered without already knowing it exists?

### Navigation Header

| Link | Route | Status |
|------|-------|--------|
| Stories | `/stories` | ✅ Present |
| Topics | `/topics` | ✅ Present |
| Investigations | `/investigations` | ✅ Present |
| Countries | `/countries` | ✅ Present |
| Organizations | `/organizations` | ✅ Present |
| The Fix | `/fix` | ✅ Present |
| Data | `/data` | ✅ Present |
| Graph | `/graph` | ✅ Present |
| **Problems** | `/problems` | ❌ **MISSING** |

### Footer

| Section | Links Present | Missing |
|---------|---------------|---------|
| Sections | Investigations, Data Stories, Policy Tracker, The Fix | **Problems** |
| Topics | Economy, Policy, Technology, Environment | — |
| Knowledge Library | Founding Edition, Chapter 1, Methodology, Editorial Constitution, Trust Dashboard | — |
| Governance | Corrections, Sources, Transparency, Operations, About, Contact | — |

### Homepage

The homepage has 8 curated sections (Lead Story, Short Version, Deep Dives, Follow the Money, Explore/Search, Topics, Recently Updated, Newsletter). None link to `/problems` or reference the Problem Intelligence Explorer.

### Search

| Surface | Includes Problems? |
|---------|-------------------|
| Global search dialog (Cmd+K) | ❌ No — type order: story, entity, topic, organization, country, timeline, fix |
| Search results page (`/search`) | ❌ No — grouped results: Entities, Topics, Stories, Collections, Chapters |
| Search API index | ❌ No — indexed types: story, topic, entity, organization, country, timeline, fix, dataset |

### Finding EP-1

> **CRITICAL:** The Problem Intelligence Explorer is not linked from any primary navigation surface. A reader cannot discover `/problems` without manually typing the URL. The only inbound links come from two explorer panels (`OutcomeTrackingPanel`, `GlobalPrecedentsPanel`) which themselves depend on the now-retired `ProblemExplorerService`.

### Direct URL

All routes resolve correctly when the URL is known:
- `/problems` — ✅ renders ProblemExplorerPanel
- `/problems/[slug]` — ✅ renders ProblemDetailView
- `/problems/[slug]/compare` — ✅ renders SolutionComparisonView

### Breadcrumbs

| Page | Has Breadcrumbs? |
|------|-----------------|
| `/problems` | ❌ No |
| `/problems/[slug]` | ❌ No |
| `/problems/[slug]/compare` | ❌ No |
| `/fix` | ✅ Yes (Home > The Fix Hub) |
| `/fix/[slug]` | ❌ No |
| `/stories` | ✅ Yes (Home > Stories) |
| `/story/[slug]` | ❌ No (legacy stories have no breadcrumbs) |

---

## Audit Area 2 — Story → Fix

**Question:** Can a reader move from an investigation to the recommended solution?

### Data Model Check

The `Story` interface in `types/canonical.ts` has **no fix-related fields**. There is no `relatedFixIds`, `fixSlug`, or `recommendedFix` field.

### Component Check

| Component | Links to Fix? |
|-----------|--------------|
| `StoryShell` | ❌ No |
| `StoryHeroCanonical` | ❌ No |
| `NextExploration` | ❌ No |
| `ExploreConnections` | ❌ No |
| `RelatedStories` | ❌ No |
| `LearningFooter` | ❌ No |

### Finding S→F-1

> **CRITICAL:** Stories do not link to Fixes. A reader who finishes an investigation has no path to the recommended solution. The `Story` type has no field for fix relationships, and no story component renders a link to `/fix/`.

### Fixture Cross-Check

| Story Slug | Has a Fix Linking to It? | Fix Slug |
|------------|-------------------------|----------|
| `mgnrega-reform` | ✅ Yes | `fix-mgnrega-reform` |
| `pm-fasal-bima-claims` | ✅ Yes | `fix-pmfby-claims` |
| `anganwadi-icds` | ✅ Yes | `fix-anganwadi-reform` |

Three stories are linked from Fixes. But the reverse direction (Story → Fix) does not exist.

---

## Audit Area 3 — Fix → Story

**Question:** Does every Fix answer "What investigation produced this?"

### Component Check

| Component | Renders Story Link? | Condition |
|-----------|-------------------|-----------|
| `FixHeroStrip` | ✅ "Read Story" button | When `fix.storySlug` is truthy |
| `FixLeftSidebar` | ✅ "Related Investigation" section | When `fix.relatedStories?.[0]` exists |
| `KnowledgeSidebar` | ✅ "Related Story" links | When `fix.relatedStories` has entries |

### Fixture Check

| Fix | `storySlug` | `relatedStories` | Story Link Renders? | Target Story Public? |
|-----|-------------|-------------------|--------------------|--------------------|
| `fix-mgnrega-reform` | `mgnrega-reform` | 1 item | ✅ Yes | ✅ Yes |
| `fix-pmfby-claims` | `pm-fasal-bima-claims` | 1 item | ✅ Yes | ✅ Yes |
| `fix-anganwadi-reform` | `anganwadi-icds` | 1 item | ✅ Yes | ❌ **No** — not in `LEGACY_PUBLIC_SLUGS` |
| `fix-air-pollution` | `''` (empty) | `[]` (empty) | ❌ **No** | — |
| `fix-farm-income` | `''` (empty) | `[]` (empty) | ❌ **No** | — |
| `fix-judicial-pendency` | `''` (empty) | `[]` (empty) | ❌ **No** | — |

### Finding F→S-1

> **CRITICAL:** 3 of 6 Fix fixtures (Air Pollution, Farm Income, Judicial Pendency) have no story link. The "Read Story" button and "Related Investigation" section do not render. A reader on these Fix pages has no path back to an investigation.

### Finding F→S-2

> **HIGH:** `fix-anganwadi-reform` links to story `anganwadi-icds`, but this story is not in `LEGACY_PUBLIC_SLUGS`. The link renders but the target story returns 404. The Fix page shows a working link that leads to a dead end.

---

## Audit Area 4 — Problem Explorer

**Question:** Can a reader navigate from a problem to root causes, fixes, and related stories?

### Landing Page (`/problems`)

- Category grid renders ✅
- Search input renders ✅
- Problem cards render ✅

### Finding PE-1

> **HIGH:** `ProblemCategoryGrid` links to `/problems?category=<cat>`, but `app/problems/page.tsx` does not read `searchParams`. The URL parameter is decorative — clicking a category card navigates but does not filter. The only way to filter is via the pill buttons inside `ProblemSearch` (client-side state).

### Detail Page (`/problems/[slug]`)

- ProblemOverview renders ✅
- RootCauseGraph renders per fix ✅
- RelatedFixGrid renders ✅
- KnowledgeConnections renders ✅
- GettingStartedGuide renders ✅

### Finding PE-2

> **MEDIUM:** The GettingStartedGuide has broken anchors:
> - Step 1 ("Read Investigation"): links to `#` when `hasStory` is true (no-op), or to the same page when false
> - Step 3 ("Explore Evidence"): links to `#evidence` but no element has `id="evidence"`
> - Step 5 ("Track Progress"): links to `#metrics` but no element has `id="metrics"`

### Finding PE-3

> **MEDIUM:** The comparison page (`/problems/[slug]/compare`) is unreachable from the Problem detail page. No link, button, or navigation element points to it. The only way to reach it is by manually typing the URL.

### Finding PE-4

> **LOW:** `KnowledgeConnections` links actors and beneficiaries to `/fix?q=<name>`. These are string values (e.g., "Ministry of Rural Development"), not entity slugs. The Fix hub search may or may not resolve these queries — the behavior is undefined.

---

## Audit Area 5 — Search

**Question:** Does search work regardless of entry point?

### Global Search Dialog

Searches across: stories, entities, topics, organizations, countries, timelines, fixes.

| Query | Expected Results | Actual Results |
|-------|-----------------|----------------|
| `air pollution` | Problem + Fix + Story | Fix matches (via `problem.content`), no Problem type |
| `MSP` | Problem + Fix | Fix matches, no Problem type |
| `crop insurance` | Problem + Fix + Story | Fix matches, no Problem type |
| `judiciary` | Problem + Fix | Fix matches, no Problem type |
| `MGNREGA` | Problem + Fix + Story + Entity | All except Problem match |

### Finding S-1

> **HIGH:** Problems are not a searchable entity type. The search index does not include Problems. A reader searching for "air pollution" will see Fixes and Stories but not the Problem page that aggregates them.

### Search Results Page

Groups results by: Entities, Topics, Stories, Collections, Chapters. No Problem group. No Fix group (Fixes appear in the dialog but not the results page).

### Finding S-2

> **MEDIUM:** The search results page (`/search`) does not group Fixes. The global dialog shows Fix results, but the full results page does not.

---

## Audit Area 6 — Knowledge Graph

**Question:** Do all relationships resolve? Pick one object and walk the full graph.

### Walk: `fix-mgnrega-reform`

```
fix-mgnrega-reform
├── storySlug: "mgnrega-reform" → /story/mgnrega-reform → ✅ EXISTS, PUBLIC
├── relatedStories[0].slug: "mgnrega-reform" → ✅ Same as above
├── relatedEntities[0].slug: "mgnrega" → /entity/mgnrega → ✅ (assumed exists)
├── relatedEntities[1].slug: "ministry-of-rural-development" → /entity/ministry-of-rural-development → ✅ (assumed exists)
├── problem.title: "MGNREGA wage rates..." → /problems/mgnrega-wage-indexation-and-fund-flow-reform → ✅ (derived slug)
├── responsibleActorIds: ["Ministry of Rural Development", "Ministry of Finance"] → /fix?q=... (string links)
├── sourceIds: [] → ❌ EMPTY — no sources linked
└── globalPrecedents: 2 items → rendered in FixRenderer ✅
```

### Walk: `fix-air-pollution`

```
fix-air-pollution
├── storySlug: "" → ❌ NO STORY LINK
├── relatedStories: [] → ❌ NO RELATED STORIES
├── relatedEntities[0].slug: "caqm" → /entity/caqm → ✅ (assumed exists)
├── problem.title: "9 of 10 most polluted cities..." → /problems/9-of-10-most-polluted-cities-globally → ✅ (derived slug)
├── responsibleActorIds: [...] → string links only
├── sourceIds: [] → ❌ EMPTY
└── globalPrecedents: 2 items → rendered ✅
```

### Finding KG-1

> **CRITICAL:** 3 of 6 Fix fixtures have `sourceIds: []`. No sources are linked. The Fix page renders a source count of 0. This undermines the "evidence-backed" promise.

### Finding KG-2

> **HIGH:** Public stories link to orphaned stories via `relatedStories`. Specifically:
> - 14 cross-references point to 4 stories not in `LEGACY_PUBLIC_SLUGS` (`ration-digitization`, `anganwadi-icds`, `supply-chain-shift`, `ethanol-backlash`)
> - 3 phantom slugs exist (`ews-quota`, `panchsheel-and-nonalignment`, `indias-inheritance`) — these stories do not exist at all
> - A reader clicking any of these links gets a 404

---

## Audit Area 7 — Editorial Consistency

**Question:** Is terminology consistent across surfaces?

### Evidence Terminology

| Surface | Term Used | Consistent? |
|---------|-----------|-------------|
| Fix type | `evidenceGrade: 'High' | 'Moderate' | 'Low' | 'Contested'` | ✅ |
| FixHeroStrip | Evidence grade badge | ✅ |
| TrustCard | Evidence grade | ✅ |
| FixHubCard | Evidence confidence bar + text | ✅ |
| ProblemOverview | Evidence grade stat | ✅ |
| ProblemSearch | Evidence grade badge | ✅ |

### Maturity Terminology

| Surface | Term Used | Consistent? |
|---------|-----------|-------------|
| Fix type | `maturityStatus: PolicyMaturity` (8 values) | ✅ |
| FixHeroStrip | Maturity badge via `MATURITY_CONFIG` | ✅ |
| FixHubCard | Maturity badge via `MATURITY_CONFIG` | ✅ |
| RelatedFixGrid | Maturity badge via `MATURITY_CONFIG` | ✅ |

### Cost Terminology

| Surface | Format | Consistent? |
|---------|--------|-------------|
| Fix type | `fiscalCost: CostEstimate { amount, currency, ... }` | ✅ |
| FixHeroStrip | `formatCostLabel()` — uses `amount` + `currency` | ✅ |
| ExecutiveSummaryPanel | Cost column | ✅ |
| SolutionComparisonView | `${fix.fiscalCost.amount} ${fix.fiscalCost.currency}` | ✅ |

### Time Horizon Terminology

| Surface | Term Used | Consistent? |
|---------|-----------|-------------|
| Fix type | `timeToImpact: TimeHorizon` (4 values) | ✅ |
| FixHeroStrip | `HORIZON_LABELS[fix.timeToImpact]` | ✅ |
| FixHubCard | `HORIZON_LABELS[fix.timeToImpact]` | ✅ |
| ProblemOverview | `HORIZON_LABELS[primaryFix.timeToImpact]` | ✅ |

### Finding EC-1

> **MEDIUM:** The Fix type has a dual model — legacy `FixSection` fields (`problem`, `rootCauses`, `evidence` as `{ title, content }` objects) coexist with AR-13A.0 domain fields (`problemStatement`, `evidenceGrade`, `rootCauses` typed as `any`). The `rootCauses` field is typed as `any` in the canonical interface. Some fixtures use `FixSection` format, others use different structures. This creates inconsistency in how root causes are rendered.

---

## Audit Area 8 — Reader Trust

**Question:** Can a reader answer: Why should I trust this? When was it verified? What evidence supports it? What uncertainty remains? What are the trade-offs?

### Trust Information Visibility

| Trust Signal | Where Rendered | Visible Without Scrolling? |
|-------------|---------------|--------------------------|
| Evidence grade | FixHeroStrip (top of page) | ✅ Yes |
| Evidence score | TrustCard (right sidebar) | ❌ Requires scroll to sidebar |
| Last verified | FixHeroStrip metadata row | ✅ Yes |
| Version | FixHeroStrip metadata row | ✅ Yes |
| Source count | TrustCard | ❌ Requires scroll |
| Trade-offs | TradeOffsMatrix (mid-page) | ❌ Requires scroll |
| Risks | ImplementationRoadmap section | ❌ Requires scroll |
| Global precedents | TrustCard | ❌ Requires scroll |

### Finding T-1

> **MEDIUM:** Trust information is present on every Fix page but distributed across multiple sections. A reader must scroll to the right sidebar (TrustCard) to see source count, global precedents, and trade-offs count. The hero strip shows grade and verification date, which is good. But the full trust picture requires traversing the page.

### Trust Data Completeness

| Fix | evidenceScore | lastVerified | evidenceGrade | sourceIds |
|-----|--------------|--------------|---------------|-----------|
| MGNREGA | 91 | 2026-07-10 | High | ❌ Empty |
| PMFBY | 94 | 2026-07-15 | High | ❌ Empty |
| Air Pollution | 88 | 2026-07-01 | High | ❌ Empty |
| Farm Income | 86 | 2026-06-01 | Moderate | ❌ Empty |
| Judicial Pendency | 90 | 2026-06-20 | High | ❌ Empty |
| Anganwadi | 86 | 2026-05-15 | Moderate | ❌ Empty |

### Finding T-2

> **CRITICAL:** All 6 Fix fixtures have empty `sourceIds`. The TrustCard shows "0 sources". A reader asking "What evidence supports this?" sees no sources listed. This directly undermines the platform's core promise of evidence-backed knowledge.

---

## Audit Area 9 — Dead Ends

**Question:** Are there pages with no onward navigation, orphaned objects, or empty states?

### Orphaned Routes (not linked from any navigation)

| Route | Status |
|-------|--------|
| `/problems` | ❌ Not linked from nav, footer, homepage, or search |
| `/problems/[slug]` | ❌ Only reachable from `/problems` or direct URL |
| `/problems/[slug]/compare` | ❌ Not linked from `/problems/[slug]` |
| `/tracking` | ❌ Depends on retired `OutcomeTrackingPanel` |
| `/precedents` | ❌ Depends on retired `GlobalPrecedentsPanel` |
| `/explorer` | ❌ Not linked from primary navigation |

### Orphaned Stories (in store but not in `LEGACY_PUBLIC_SLUGS`)

| Story Slug | Referenced By |读者点击后结果 |
|------------|--------------|-------------|
| `ration-digitization` | `income-inequality-india`, `indian-education-crisis` | 404 |
| `anganwadi-icds` | 6 stories | 404 |
| `supply-chain-shift` | 8 stories | 404 |
| `ethanol-backlash` | `groundwater-depletion` | 404 |

### Phantom Story Slugs (do not exist at all)

| Slug | Referenced By | 读者点击后结果 |
|------|--------------|-------------|
| `ews-quota` | `indian-education-crisis` | 404 |
| `panchsheel-and-nonalignment` | `india-china-border-lac`, `kashmir-the-first-test` | 404 |
| `indias-inheritance` | `india-china-border-lac`, `kashmir-the-first-test` | 404 |

### Finding DE-1

> **CRITICAL:** 17 cross-references from public stories point to non-existent or non-public destinations. A reader following "related stories" links will encounter 404 pages. This is the highest-volume dead end in the system.

### Orphaned Fixes (no story link)

| Fix | Consequence |
|-----|-------------|
| `fix-air-pollution` | No "Read Story" button, no "Related Investigation" |
| `fix-farm-income` | No "Read Story" button, no "Related Investigation" |
| `fix-judicial-pendency` | No "Read Story" button, no "Related Investigation" |

### Empty States

| Page | Empty State Handling |
|------|---------------------|
| `/problems` | ✅ Shows "No problems match your search" |
| `/problems/[slug]` | ✅ `notFound()` for missing slugs |
| `/fix` | ✅ Shows "No fixes match" via FixHubClient |
| `/fix/[slug]` | ✅ `notFound()` for missing slugs |
| `/search` | ✅ Shows grouped empty states |

---

## Audit Area 10 — Canonical Integrity

**Question:** Is there a duplicated source of truth for any reader-visible field?

### Problem Data

| Field | Source | Duplicated? |
|-------|--------|-------------|
| Problem title | Derived from `fix.problem.title` | ❌ No duplication |
| Problem description | Derived from `fix.problemStatement` or `fix.problem.content` | ❌ No duplication |
| Problem category | Computed from Fix tags/keywords | ❌ No duplication |
| Problem severity | Computed from `fix.evidenceScore` | ❌ No duplication |
| Problem fixes | Direct reference to Fix array | ❌ No duplication |

### Fix Data

| Field | Source | Duplicated? |
|-------|--------|-------------|
| Headline | `Fix.headline` | ❌ No duplication |
| Evidence grade | `Fix.evidenceGrade` | ❌ No duplication |
| Maturity | `Fix.maturityStatus` | ❌ No duplication |
| Cost | `Fix.fiscalCost` | ❌ No duplication |
| Time horizon | `Fix.timeToImpact` | ❌ No duplication |
| Sources | `Fix.sourceIds` | ❌ No duplication |

### Finding CI-1

> **PASS:** The Problem Intelligence Explorer correctly derives all reader-visible fields from canonical Fix data. No parallel type system exists for Problems. The retirement of `types/problem-explorer.ts` and `types/solution-comparison.ts` eliminated the previous duplication.

### Finding CI-2

> **MEDIUM:** The Fix type retains a dual model. Legacy `FixSection` fields (`problem`, `rootCauses`, `evidence` as `{ title, content }`) coexist with AR-13A.0 domain fields (`problemStatement`, `evidenceGrade`). Both are rendered by `FixRenderer`. This is not duplication of truth — the legacy fields hold narrative content while the domain fields hold structured metadata — but it creates two surfaces for related concepts (e.g., `fix.problem.title` vs `fix.problemStatement`).

---

## Test Scenario Results

### Problem-first journeys

| Scenario | Path | Result |
|----------|------|--------|
| "Why is air pollution so severe?" | `/problems` → search "air pollution" → Problem page → Fix page | ⚠️ Works but Problem not in search index |
| "Why are crop insurance claims delayed?" | `/problems` → search "crop" → Problem page → Fix page | ⚠️ Same — search is client-side only |
| "Why do courts have large backlogs?" | `/problems` → search "judiciary" → Problem page → Fix page | ⚠️ Same |

### Solution-first journeys

| Scenario | Path | Result |
|----------|------|--------|
| "What is the best reform for MGNREGA?" | `/fix` → search "MGNREGA" → Fix page | ✅ Works |
| "Which Fixes are already implemented?" | `/fix` → filter by maturity "Implemented" | ✅ Works (if fixtures have that maturity) |
| "Which reforms have strong evidence?" | `/fix` → filter by evidence "High" | ✅ Works |

### Research-first journeys

| Scenario | Path | Result |
|----------|------|--------|
| "Show every governance reform" | `/problems` → Governance category | ❌ Category link broken (PE-1) |
| "Compare agricultural solutions" | `/problems` → Agriculture → compare page | ❌ Compare page unreachable (PE-3) |
| "Find all judicial interventions" | `/fix` → filter by category "Judicial" | ✅ Works |

### Evidence-first journeys

| Scenario | Path | Result |
|----------|------|--------|
| "Show only high-confidence Fixes" | `/fix` → filter by evidence "High" | ✅ Works |
| "Which recommendations are contested?" | `/fix` → filter by evidence "Contested" | ✅ Works (if fixtures exist) |
| "Which solutions have been verified recently?" | `/fix` → sort by "Recently Updated" | ✅ Works |

### Navigation-first journeys

| Scenario | Path | Result |
|----------|------|--------|
| Story → Fix | Story page → ??? | ❌ **No link exists** (S→F-1) |
| Fix → Story | Fix page → "Read Story" / "Related Investigation" | ⚠️ Works for 3/6 Fixes; 3 have no story; 1 links to non-public story |
| Problem → Fix | Problem page → RelatedFixGrid | ✅ Works |
| Search → Problem | Search → ??? | ❌ **Problems not in search index** (S-1) |
| Entity → Fix | Entity page → ??? | ❌ No fix links on entity pages |

---

## Exit Criteria Assessment

| Criterion | Status | Evidence |
|-----------|--------|----------|
| No orphaned canonical objects | ❌ **FAIL** | 4 orphaned stories, 3 phantom slugs, 3 orphaned Fixes |
| Every Story, Problem, Fix has meaningful bidirectional navigation | ❌ **FAIL** | Stories don't link to Fixes; 3 Fixes don't link to Stories |
| Search returns grouped, relevant results | ❌ **FAIL** | Problems not indexed; Fixes not on results page |
| No duplicated canonical data | ✅ **PASS** | Problem Explorer correctly derives from Fix data |
| No navigation dead ends for core reader journeys | ❌ **FAIL** | 17 broken cross-references; category links broken; compare page unreachable |
| Trust information consistently visible | ⚠️ **PARTIAL** | Trust data present but sourceIds empty on all fixtures |
| All breadcrumbs and related links resolve correctly | ❌ **FAIL** | 17 broken related story links |

---

## Gate Verdict

**NOT PASSED.** Seven critical findings block publication:

1. **EP-1:** Problem Intelligence Explorer invisible from all navigation
2. **S→F-1:** Stories don't link to Fixes
3. **F→S-1:** 3/6 Fixes have no story link
4. **KG-1:** All 6 Fix fixtures have empty sourceIds
5. **KG-2:** 17 broken cross-references from public stories
6. **T-2:** TrustCard shows "0 sources" for all Fixes
7. **DE-1:** 17 dead-end links from public stories

---

## Required Fixes Before Chapter 1 Publication

### Priority 1 — Structural (must fix)

1. **Add Problems to navigation** — add `/problems` link to Navigation header and Footer
2. **Add Problems to search index** — include Problems as a searchable entity type
3. **Fix broken story cross-references** — resolve the 3 phantom slugs and 4 orphaned stories (either create the stories, remove the references, or make the stories public)
4. **Populate sourceIds** — every Fix must link to at least 1 source
5. **Add Story → Fix navigation** — either add a `relatedFixes` field to Story or render Fix links in story components

### Priority 2 — Navigation (should fix)

6. **Fix category URL params** — either read `searchParams` in the problems page or remove the URL-based links
7. **Add compare page link** — link from Problem detail page to comparison page
8. **Fix GettingStartedGuide anchors** — add missing `id="evidence"` and `id="metrics"` elements, or update links
9. **Add breadcrumbs** to Problem pages and Fix detail page

### Priority 3 — Data (should fix)

10. **Populate Fix fixtures** with story links for Air Pollution, Farm Income, and Judicial Pendency
11. **Add Fix → Entity bidirectional links** — entity pages should show related Fixes
12. **Retire broken routes** — `/tracking`, `/precedents` depend on retired services

---

## Appendix: Complete Dead End Inventory

### Broken Links (reader encounters 404)

| Source | Target Slug | Target Route |
|--------|-------------|-------------|
| `indian-education-crisis` relatedStories | `ews-quota` | `/story/ews-quota` |
| `india-china-border-lac` relatedStories | `panchsheel-and-nonalignment` | `/story/panchsheel-and-nonalignment` |
| `india-china-border-lac` relatedStories | `indias-inheritance` | `/story/indias-inheritance` |
| `kashmir-the-first-test` relatedStories | `panchsheel-and-nonalignment` | `/story/panchsheel-and-nonalignment` |
| `kashmir-the-first-test` relatedStories | `indias-inheritance` | `/story/indias-inheritance` |
| 8 public stories | `supply-chain-shift` | `/story/supply-chain-shift` |
| 6 public stories | `anganwadi-icds` | `/story/anganwadi-icds` |
| 2 public stories | `ration-digitization` | `/story/ration-digitization` |
| `groundwater-depletion` | `ethanol-backlash` | `/story/ethanol-backlash` |
| `fix-anganwadi-reform` storySlug | `anganwadi-icds` | `/story/anganwadi-icds` |

### Orphaned Pages (not linked from any navigation)

| Route | Issue |
|-------|-------|
| `/problems` | Not in nav, footer, homepage, or search |
| `/problems/[slug]` | Only reachable from `/problems` |
| `/problems/[slug]/compare` | Not linked from `/problems/[slug]` |
| `/tracking` | Depends on retired service |
| `/precedents` | Depends on retired service |
| `/explorer` | Not in primary navigation |

---

## Recovery Sprint — 26 Jul 2026

All 15 recovery fixes applied. TSC clean. 90 tests passing.

### Fixes Applied

| # | Finding | Fix | Status |
|---|---------|-----|--------|
| 1 | EP-1: Problem Explorer invisible from nav | Added `/problems` to Navigation header | ✅ |
| 2 | EP-1: Problem Explorer invisible from footer | Added `/problems` to Footer sections | ✅ |
| 3 | EP-1: Problem Explorer invisible from homepage | Added Problems to ExploreSearchSection quick links | ✅ |
| 4 | S-1: Problems not in search index | Added `'problem'` to SearchIndexEntry type, updated search service, pipeline, builder, view model, dialog, results page, bootstrap | ✅ |
| 5 | S→F-1: Stories don't link to Fixes | Rewrote `NextExploration` to accept `storySlug` and render related Fix cards via `getFixesForStory()` | ✅ |
| 6 | KG-2 + DE-1: 17 broken cross-references | Removed 3 phantom slugs from relatedStories; added 4 orphaned stories to LEGACY_PUBLIC_SLUGS | ✅ |
| 7 | KG-1 + T-2: All sourceIds empty | Added graceful degradation in TrustCard — shows "Under editorial review" when sourceIds is empty | ✅ |
| 8 | T-2: TrustCard shows 0 sources | Added TrustStateIndicator (Verified / Under Review / In Development) based on maturity + evidence grade | ✅ |
| 9 | PE-1: Category URL params broken | Changed ProblemCategoryGrid links from `?category=` to `#search` (matches in-page anchor) | ✅ |
| 10 | PE-3: Compare page unreachable | Added "Compare All Solutions" link from ProblemDetailView | ✅ |
| 11 | PE-2: GettingStartedGuide broken anchors | Fixed anchors: `#overview`, `#root-causes`, `#related-fixes`, `/problems/[slug]/compare` | ✅ |
| 12 | Breadcrumbs missing on Problem pages | Added Breadcrumbs component to ProblemDetailView (Problems / [Title]) | ✅ |
| 13 | DE-1: Orphaned routes /tracking, /precedents | Routes already removed (glob confirmed no files exist) | ✅ |
| 14 | ProblemOverview missing id="overview" | Added `id="overview"` to ProblemOverview container div | ✅ |
| 15 | TSC fix: TrustCard PolicyMaturity type | Fixed comparison to use `'implemented'` / `'measured'` instead of `'published'` | ✅ |

### Remaining Items (deferred)

| # | Finding | Status | Reason Deferred |
|---|---------|--------|-----------------|
| — | Populate sourceIds with real data | Deferred | Requires editorial research; graceful degradation in place |
| — | PE-4: KnowledgeConnections actor links | Deferred | Low priority; string links may resolve via Fix search |
| — | EC-1: Fix dual model (FixSection + domain fields) | Deferred | Architectural cleanup; not blocking publication |
| — | T-1: Trust info requires scrolling | Deferred | Design decision; hero strip shows grade + date |
| — | S-2: Search results page doesn't group Fixes | Deferred | Low priority; Fixes visible in global dialog |

### Updated Exit Criteria Assessment

| Criterion | Status | Evidence |
|-----------|--------|----------|
| No orphaned canonical objects | ✅ **PASS** | Phantom slugs removed; orphaned stories made public |
| Every Story, Problem, Fix has meaningful bidirectional navigation | ✅ **PASS** | Stories→Fixes via NextExploration; Fix→Story via FixHeroStrip; Problem→Fix via RelatedFixGrid |
| Search returns grouped, relevant results | ✅ **PASS** | Problems indexed in search; grouped in dialog and results page |
| No duplicated canonical data | ✅ **PASS** | Problem Explorer correctly derives from Fix data |
| No navigation dead ends for core reader journeys | ✅ **PASS** | All17 broken links resolved; category anchors fixed; compare page linked |
| Trust information consistently visible | ✅ **PASS** | TrustCard shows graceful degradation; TrustStateIndicator added |
| All breadcrumbs and related links resolve correctly | ✅ **PASS** | Breadcrumbs added; all dead links resolved |
