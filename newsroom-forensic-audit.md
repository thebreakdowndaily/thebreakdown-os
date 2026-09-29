# THE BREAKDOWN — NEWSROOM OPERATING SYSTEM
## Master Forensic Audit Report: Architecture, Lineage, Failure Modes & Remediation

**Document ID:** NOS-FORENSIC-008  
**Status:** Comprehensive Institutional Certification  
**Author:** Principal Newsroom Systems Architect & Editorial Reliability Engineer  
**Date:** 2026-09-28  
**Target Repository:** `thebreakdown-os`  
**Governing Documents:** Level 1 Editorial Constitution v1.1, AGENTS.md (Platform Beta v1.0)

---

### Executive Forensic Summary

Across 23 rigorous audit phases—encompassing static analysis, execution tracing, failure injection, test execution, and live production inspection—we completed a forensic audit of the Newsroom Operating System of The Breakdown.

#### The Verdict:
The Breakdown possesses **extraordinary, world-class domain specifications and local components**:
- The Level 1 Editorial Constitution and Gold Standard 7-Phase review are unparalleled in depth.
- The Newsroom Intelligence engine (`services/intelligence/newsroom/`) has robust 16-beat clustering, deterministic velocity scoring, optimistic concurrency locking, and idempotent mutations.
- The Canonical Presentation Layer (`StoryShell`, presentation model, reading modes) renders rich, beautifully structured knowledge objects.
- Cloudflare calendar workers enforce fail-closed publication gates.

**However, the institution is currently running as 4 disconnected architectural islands:**
1. **Newsroom Intelligence** (Signals/Observations)
2. **Research Intelligence** (Projects/Briefs)
3. **Canonical Knowledge Registries** (Claims/Sources/Chapters)
4. **Public REST APIs** (`/api/v1/`, `/api/v2/`)

Because the pipelines connecting these islands are either **manual, in-memory stubs, or completely bypassed by unprotected APIs**, the answer to the central architectural question is:

> **Can The Breakdown currently take new evidence, determine what knowledge it changes, route that change through accountable editorial review, publish the verified update, and preserve an auditable history of what changed and why?**

### **ANSWER: NO — NOT CURRENTLY IN AN END-TO-END AUTOMATED, FAIL-CLOSED MANNER.**

**Why?**
1. **Detection to Research Disconnect:** An observation from PIB can become an escalated signal, but promoting it via `PROMOTE_TO_RESEARCH` merely appends a string note to the signal; it does not programmatically initiate a research project.
2. **Research to Draft Disconnect:** `ResearchStoryBrief` generates claim-evidence lineages, but leaves the drafting queue empty, requiring a human to manually copy and paste the brief into Markdown files.
3. **Mock Change Propagation:** `ChangeDetector` and `ImpactAnalyzer` return static mock arrays (`['story-1', 'story-2']`). Upstream source modifications do not traverse the knowledge graph.
4. **P0 Publication Bypass:** Public REST APIs (`/api/v1/stories`, `/api/v2/stories`) allow anyone on the internet to send `POST` or `PUT` with `status: 'published'`, completely bypassing all 11 publication gates and role checks.
5. **Event Bus Void:** Publishing a reader correction emits an event on the event bus, but zero system listeners update the story or invalidate Next.js caches.
6. **Integrity Debt:** 111 out of 148 referenced source IDs in published content fail to resolve in the canonical source registry (`check:sources` reports 106 errors).

---

### Phase 3: Publication Integrity Audit (P0 Security Matrix)

Our forensic scan examined every route and execution vector capable of mutating or publishing content:

| Endpoint / Mutation Vector | Handler File | Authentication Guard | State Machine Enforced? | Publication Gate Enforced? | Required Role | Audit Trail Recorded? | Vulnerability Severity |
|---|---|---|---|---|---|---|---|
| `POST /api/v1/stories` | `app/api/v1/stories/route.ts:20` | ❌ None | ❌ None | ❌ None | None | ❌ None | **CRITICAL (P0)** |
| `PUT /api/v1/stories/[slug]` | `app/api/v1/stories/[slug]/route.ts:23` | ❌ None | ❌ None | ❌ None | None | ❌ None | **CRITICAL (P0)** |
| `DELETE /api/v1/stories/[slug]` | `app/api/v1/stories/[slug]/route.ts:42` | ❌ None | ❌ None | ❌ None | None | ❌ None | **CRITICAL (P0)** |
| `POST /api/v2/stories` | `app/api/v2/stories/route.ts:28` | ❌ None | ❌ None | ❌ None | None | ❌ None | **CRITICAL (P0)** |
| `PUT /api/v2/stories/[slug]` | `app/api/v2/stories/[slug]/route.ts:17` | ❌ None | ❌ None | ❌ None | None | ❌ None | **CRITICAL (P0)** |
| `DELETE /api/v2/stories/[slug]`| `app/api/v2/stories/[slug]/route.ts:31` | ❌ None | ❌ None | ❌ None | None | ❌ None | **CRITICAL (P0)** |
| `POST /api/v2/claims` | `app/api/v2/claims/route.ts:23` | ❌ None | ❌ None | ❌ None | None | ❌ None | **HIGH (P1)** |
| `POST /api/v2/sources` | `app/api/v2/sources/route.ts:23` | ❌ None | ❌ None | ❌ None | None | ❌ None | **HIGH (P1)** |
| `POST /api/v2/newsroom/signals/[id]/actions` | `app/api/v2/newsroom/.../route.ts:7` | ✅ `guardIntelModule` | ✅ Version locked | N/A (Signal Triage) | Editor / Owner | ✅ Audit Service | **SECURE** |
| `POST /api/v2/newsroom/observations/pull` | `app/api/v2/newsroom/.../route.ts:23` | ✅ `x-vercel-cron` + Bearer | N/A (Ingestion) | N/A (Ingestion) | Cron Only | ✅ Ingestion log | **SECURE** |
| Autonomous Calendar Worker | `cloudflare-workers/.../dist/index.js` | ✅ Env Worker Secret | ✅ Eligible Status | ✅ 11/11 Gates Pass | System Service | ✅ Supabase Gate Log | **SECURE** |

---

### Phase 4–14: Subsystem Forensic Findings

#### 1. Claim & Source Traceability (Phases 4–5)
* **The 4 Parallel Claim Formats:**
  1. `lib/knowledge/claim-registry.ts`: `claim.partition.security-consciousness` (TypeScript records)
  2. `stories/indias-inheritance-partition/knowledge/claims.yaml`: `partition-001` (YAML records)
  3. `stories/india-china-border-lac/knowledge/claims.yaml`: `C01` (Markdown table inside YAML)
  4. Database / Supabase: `clm-bjp-mission-360-001` (Database records)
* **The Missing Source Debt (F-04 / F-12):** Running `npx tsx scripts/check-source-integrity.ts --fail-on-error` fails with **106 errors and 111 unresolved sources** across published stories (`bjp-mission-360`, `groundwater-depletion`, `semiconductor-pli`).

#### 2. Change Propagation & Cache Invalidation (Phase 6)
* `services/lifecycle/change-detector/ChangeDetector.ts:29`: Explicit comment: `"In a real implementation, this would run a diffing algorithm. For now, we return a mock diff structure."`
* `services/lifecycle/impact-analyzer/ImpactAnalyzer.ts:9`: Hardcodes: `const affectedStories = ['story-1', 'story-2'];`
* `app/story/[slug]/page.tsx:29`: Uses Next.js ISR with `revalidate = 60`. No programmatic `revalidatePath()` is called when sources or claims change.

#### 3. Entity & Tracker Islanding (Phase 7 & UP403 Mapping)
* `lib/up403/stories.ts` defines its own custom `Story` interface with heuristic match functions (`match: r => r.victory_margin_pct_2022 >= 20`).
* These stories do not exist in the canonical `StoryRepository` and cannot be queried by the Knowledge Explorer or Newsroom Intelligence.

#### 4. AI Copilot Grounding (Phase 10)
* `services/ai/core/grounding-validator.ts:11`:
  ```typescript
  // For now, we perform a basic safety check and return the response.
  if (!response) return "No response generated.";
  return response;
  ```
  The validator is a pass-through stub that does not verify facts against the Evidence Spine.

#### 5. Public Corrections Loop (Phase 13)
* `services/editorial/corrections-service.ts` successfully receives reader reports, rate-limits submissions, and allows staff editors to publish errata notices.
* However, upon resolution, `eventBus.publish({ type: 'correction:published', ... })` is fired into an **event void**—zero production listeners subscribe to update the target story or trigger CDN revalidation.

---

### Phase 15: Failure Injection Results

| Scenario | Input | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **FI-1: Missing Source** | Claim with unregistered source ID | Build blocked | Blocked only with `--fail-on-error`; default build succeeds | ⚠️ Debt |
| **FI-2: Unauthenticated Publish** | `POST /api/v1/stories` with `status: 'published'` | 401/403 Rejected | `HTTP 201 Created` (Saved to repo) | ❌ Bypass |
| **FI-3: Concurrent Signal Edit** | Stale `expectedVersion` | 409 Conflict | `HTTP 409 Version Conflict` | ✅ Pass |
| **FI-4: PIB Adapter Timeout** | Upstream feed hangs > 2s | Graceful error, state intact | `HTTP 502`, local memory intact | ✅ Pass |
| **FI-5: Unresolved Claim Gate** | Story with claim `Needs Verification` | Gate fails | `validateStoryForPublication()` rejects | ✅ Pass |

---

### Phase 18–22: Unification & Remediation Roadmap

The 8-step roadmap to achieve complete, fail-closed newsroom integrity:

1. **Lock Down Public APIs (Tier 0 — P0):**
   - Apply `guardIntelModule('editorial')` and require authenticated session for all mutating endpoints (`/api/v1/stories`, `/api/v2/stories`, `/api/v2/claims`, `/api/v2/sources`).
   - Wire `validateStoryForPublication()` directly into the API request pipeline so no story can transition to `published` without satisfying all 11 gates.
2. **Reconcile Canonical Source Debt (Tier 1 — P1):**
   - Populate the 111 missing source definitions into `lib/knowledge/source-registry.ts`.
   - Add `--fail-on-error` to `npm run check:sources` and integrate into `checkpoint:b`.
3. **Bridge Newsroom Signals to Research Projects (Tier 2 — P1):**
   - Implement programmatic invocation of `applyNewsEventToResearch()` when `PROMOTE_TO_RESEARCH` is selected on the Newsroom dashboard.
4. **Bridge Research Briefs to Editorial Drafting Queue (Tier 2 — P1):**
   - When `generateStoryBrief()` completes, auto-enqueue an `EditorialTask` in `EditorialQueue` and link to the author's workspace.
5. **Implement Real Impact Graph Traversal (Tier 3 — P2):**
   - Replace the mock in `ImpactAnalyzer.ts` with graph queries on `CanonicalSource.storyIds` and `claimIds`.
6. **Wire EventBus Corrections Subscriber (Tier 3 — P2):**
   - Register a subscriber for `correction:published` that patches `story.errata` and calls `revalidatePath('/story/' + slug)`.
7. **Harden AI Grounding Validator (Tier 4 — P3):**
   - Parse bracketed citations and enforce that all assertions match context claims.
8. **Unify UP403 into Canonical Knowledge Models (Tier 4 — P3):**
   - Map UP403 story matches into canonical presentation models.

---

### Final Certification

With the delivery of these 8 forensic reports:
1. `newsroom-current-state-map.md`
2. `claim-traceability-audit.md`
3. `newsroom-change-propagation-map.md`
4. `newsroom-failure-injection-report.md`
5. `newsroom-target-architecture.md`
6. `newsroom-remediation-plan.md`
7. `newsroom-integrity-regression-suite.md`
8. `newsroom-forensic-audit.md`

The Breakdown newsroom operating system now has an **exhaustive forensic diagnosis, exact line-by-line failure maps, empirical failure-injection proof, and an actionable, Platform Beta-compliant engineering blueprint** for unification.
