# THE BREAKDOWN — NEWSROOM OPERATING SYSTEM
## Deliverable 6: Phased Remediation Plan & Execution Roadmap

**Document ID:** NOS-PLAN-006  
**Status:** Engineering Roadmap (Prioritized Execution)  
**Date:** 2026-09-28  
**Scope:** Actionable, risk-scored remediation plan to close all identified vulnerabilities, disconnects, and integrity debt.

---

### Priority Summary Matrix

| Tier | Priority | Remediation Domain | Target Files | Blast Radius | Risk | Verification Test |
|---|---|---|---|---|---|---|
| **Tier 0** | **CRITICAL (P0)** | Secure Public REST APIs & Enforce Publication Gate | `app/api/v1/stories/`, `app/api/v2/stories/`, `app/api/v2/claims/` | API routes only | Low | `tests/security/api-security.test.ts` |
| **Tier 1** | **HIGH (P1)** | Wire Newsroom Signal → Research → Editorial Queue | `services/intelligence/newsroom/workflow-service.ts`, `app/intel/research/rie/actions.ts` | Internal intelligence flow | Low | `tests/research/newsroom-bridge.test.ts` |
| **Tier 2** | **HIGH (P1)** | Resolve 111 Missing Sources & Enforce F-12 Build Gate | `lib/knowledge/source-registry.ts`, `package.json` | Registry lookup | Medium | `npx tsx scripts/check-source-integrity.ts --fail-on-error` |
| **Tier 3** | **MEDIUM (P2)** | Wire EventBus Corrections Subscriber & ISR Cache | `services/editorial/corrections-service.ts`, `lib/events/` | Reader errata presentation | Low | `tests/vs8-cross-system-corrections.test.ts` |
| **Tier 4** | **MEDIUM (P2)** | Replace Mock ChangeDetector & ImpactAnalyzer | `services/lifecycle/change-detector/`, `services/lifecycle/impact-analyzer/` | Background services | Low | `tests/evidence-evolution.test.ts` |
| **Tier 5** | **LOW (P3)** | Ground AI Copilot & Unify UP403 Story Representation | `services/ai/core/grounding-validator.ts`, `lib/up403/stories.ts` | Copilot UI / UP403 explore | Low | `tests/intel-toolkit.test.ts` |

---

### Detailed Implementation Specifications

#### Tier 0 — P0 Security & Publication Gate Enforcement
* **Target Files:**
  - `app/api/v1/stories/route.ts`
  - `app/api/v1/stories/[slug]/route.ts`
  - `app/api/v2/stories/route.ts`
  - `app/api/v2/stories/[slug]/route.ts`
  - `app/api/v2/claims/route.ts`
  - `app/api/v2/sources/route.ts`
* **Changes Required:**
  1. Add `guardIntelModule('editorial')` and `getSession()` to all write handlers (`POST`, `PUT`, `DELETE`).
  2. If user lacks `'editor'` or `'owner'` role, return `403 Forbidden`.
  3. In `POST` and `PUT`, if `body.status === 'published'`:
     - Run `validateStoryForPublication({ storyId: story.id, triggeredBy: session.user.id }, story)`.
     - If `!gateResult.passed`, return `HTTP 422 Unprocessable Entity` with `{ error: 'Publication gate failed', checks: gateResult.checks }`.
  4. Ensure `transitionEditorialState()` records actor and role in the story audit trail.
* **Rollback Strategy:** Revert commit; handlers fail closed.

#### Tier 1 — Core Editorial Lifecycle Integration
* **Target Files:**
  - `services/intelligence/newsroom/workflow-service.ts`
  - `services/intelligence/research/core.ts`
  - `app/intel/research/rie/actions.ts`
* **Changes Required:**
  1. In `workflow-service.ts` under `case 'PROMOTE_TO_RESEARCH'`:
     - Import `newsroomIntelligenceCore` and call `applyNewsEventToResearch()` from `services/intelligence/research/newsroom-bridge.ts`.
     - Set `updatedSignal.researchProjectId = result.projectId`.
  2. In `generateStoryBriefActionCore()` in `app/intel/research/rie/actions.ts`:
     - When brief is generated, construct an `EditorialTask` and call `editorialQueue.enqueue()`.
     - Assign task to the relevant beat desk.

#### Tier 2 — Canonical Source Integrity (F-04 / F-12)
* **Target Files:**
  - `lib/knowledge/source-registry.ts`
  - `package.json`
* **Changes Required:**
  1. Seed the 111 missing source definitions into `lib/knowledge/source-registry.ts` so that all claims in `bjp-mission-360`, `groundwater-depletion`, `semiconductor-pli`, etc., resolve with valid titles, tiers, and URLs.
  2. Update `package.json`:
     ```json
     "check:sources": "npx tsx scripts/check-source-integrity.ts --fail-on-error"
     ```
  3. Include `check:sources` in `checkpoint:b` to guarantee zero unverified source drift in future PRs.

#### Tier 3 — Automated Corrections & Cache Invalidation Loop
* **Target Files:**
  - `services/editorial/corrections-service.ts`
  - `lib/events/subscribers/story-corrections-subscriber.ts`
* **Changes Required:**
  1. Create subscriber listening to `correction:published`.
  2. When emitted, locate target story in `RepositoryFactory.getStoryRepository()`.
  3. Append published errata record to `story.errata`.
  4. Invoke `revalidatePath('/story/' + story.slug)`.

#### Tier 4 — Graph-Based Change Propagation
* **Target Files:**
  - `services/lifecycle/impact-analyzer/ImpactAnalyzer.ts`
* **Changes Required:**
  1. Replace static `['story-1', 'story-2']` with dynamic traversal:
     - Query `sourceRegistry.getSource(diff.sourceId)`.
     - Extract `source.storyIds` and `source.chapterIds`.
     - Extract `source.claimIds`.
  2. Return real `affectedContent` structure for automated review generation.

#### Tier 5 — AI Grounding & Presentation Alignment
* **Target Files:**
  - `services/ai/core/grounding-validator.ts`
  - `lib/up403/stories.ts`
* **Changes Required:**
  1. In `GroundingValidator.validate()`: Parse brackets `[claim-id]` and check against `context.claims`. Strip any unverified assertions.
  2. Map `UP403 Story` to Canonical `Story` format so UP403 items appear in search and knowledge graph queries.
