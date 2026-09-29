# THE BREAKDOWN — NEWSROOM OPERATING SYSTEM
## Deliverable 1: Current State Architecture & Editorial Lifecycle Map

**Document ID:** NOS-AUDIT-001  
**Status:** Canonical Forensic Baseline  
**Date:** 2026-09-28  
**Scope:** Complete map of all existing editorial lifecycle stages, components, models, authorities, and enforcement mechanisms.

---

### Executive Summary

A comprehensive architectural audit of `thebreakdown-os` reveals an editorial ecosystem composed of **four disconnected subsystems**:

1. **Newsroom Intelligence Subsystem (`services/intelligence/newsroom/`, `app/newsroom/`)**: Real-time signal ingestion, PIB adapter, 16-beat clustering, velocity, and triage actions. Fully authenticated and version-controlled, but structurally disconnected from story drafting and canonical claims.
2. **Research Intelligence Subsystem (`services/intelligence/research/`, `app/intel/research/`)**: Approved-source discovery, entity resolution, and dossier/brief generation. Capable of generating `ResearchStoryBrief` with lineage, but handoff to the editorial drafting queue is manual.
3. **Canonical Editorial & Knowledge Subsystem (`lib/editorial/`, `lib/knowledge/`, `lib/story/`)**: Gold Standard 7-Phase review, canonical claim/source registries, presentation models, and fail-closed publication gates (`publication-gate.ts`).
4. **Public & Internal REST APIs (`app/api/v1/`, `app/api/v2/`)**: Exposes direct database and memory mutations that completely bypass the state machine and publication gates (Critical P0 vulnerabilities).

---

### 1. Stage-by-Stage Forensic Lifecycle Map

| Stage | Subsystem / Component | Input Model | Output Model | Authorized Actor | Entry / Exit Evidence Gate | Decision Record | Enforcement Type | Status |
|---|---|---|---|---|---|---|---|---|
| **1. LEAD** | `pib-adapter.ts`, `services/intelligence/newsroom/` | RSS Feed / PIB XML / Manual Observation | `Observation`, `Cluster`, `NewsroomSignal` | Ingestion cron (`x-vercel-cron`), Reporter | Entry: Tier 1/2 government release or reporter tip. Exit: Score threshold (velocity ≥ 40, priority P0/P1/P2). | `state.json` / Supabase `newsroom_signals` | **Code (Deterministic)** | `IMPLEMENTED` |
| **2. RESEARCH** | `newsroom-bridge.ts`, `services/intelligence/research/core.ts` | `NewsroomSignal` / `NewsroomEventInput` | `ResearchProject`, `ResearchRun`, `ResearchDossier` | Researcher, Research Desk Lead (`guardIntelModule`) | Entry: `evaluateResearchTrigger()` (P0, or P1 + primary source, or keyword match). Exit: Min 3 approved sources, contradiction check. | `research_projects`, `research_runs` | **Code (Bridge) / Manual (Promotion)** | `PARTIAL` |
| **3. EVIDENCE** | `services/intelligence/research/source-registry.ts`, `lib/knowledge/evidence-registry.ts` | Raw Document / Excerpt / Citation | `ResearchEvidenceCapture`, `CanonicalEvidence` | Fact Checker, Research Analyst | Entry: Tier 1–3 primary/academic document. Exit: Verifiable excerpt, locator (page/doc), weight assessment. | `claims.yaml`, `evidence` array in dossiers | **Manual / Isolated Code** | `PARTIAL` |
| **4. DRAFT** | `stories/[slug]/narrative/draft.md`, `lib/editorial/chapter-factory.ts` | `ResearchStoryBrief` / Markdown draft | `StoryDraft`, `Chapter` model | Writer, Beat Reporter | Entry: Approved story brief or editorial assignment. Exit: Complete Narrative Spine + Claim annotations. | Git Commit / Markdown file | **Manual** | `MANUAL` |
| **5. REVIEW** | `lib/editorial/workflow-state-machine.ts`, `lib/editorial/eos/eos-workflow.ts` | Draft Story Markdown / JSON | `EditorialStateRecord` (`research_complete`) | Section Editor | Entry: Draft submitted by writer. Exit: Editorial structure satisfies 6 Questions Framework. | In-memory `auditTrail[]` / Git PR | **Code (Unwired to DB)** | `PARTIAL` |
| **6. FACT-CHECK** | `lib/knowledge/source-validator.ts`, `services/entities/builders/claims.ts` | Extracted Story Claims | Verified Claims (`status: 'verified'`) | Fact Checker, Research Desk | Entry: All factual assertions isolated into claims. Exit: Zero unsupported or unresolved claims. | `claims.yaml`, `verification.md` | **Manual / Code Validator** | `PARTIAL` |
| **7. EDITORIAL REVIEW** | `lib/editorial/gold-standard-review.ts` | Fact-checked Chapter/Story | Gold Standard Audit Record (Phases 1–4) | Senior Editor, Bureau Chief | Entry: Fact-check signoff. Exit: Phase 1 (Expert), Phase 2 (Reader), Phase 3 (Evidence), Phase 4 (Bias) pass. | `goldStandardAudit` JSON | **Code (Evaluator)** | `IMPLEMENTED` |
| **8. VISUAL REVIEW** | `lib/editorial/gold-standard-review.ts` (Phase 5) | Story Charts, Maps, Images | Approved Visual Spine | Visual Editor, Design Lead | Entry: Visuals attached to story blocks. Exit: Every visual has provenance, pedagogical purpose, WCAG AA contrast. | `phase5VisualAudit.passed` | **Code (Evaluator)** | `IMPLEMENTED` |
| **9. APPROVAL** | `lib/editorial/gold-standard-review.ts` (Phases 6–7), `workflow-state-machine.ts` | Fully Audited Chapter Record | `EditorialStateRecord` (`approved`) | Editor-in-Chief (`role: 'owner'` or `'editor'`) | Entry: Phase 6 (Density) + Phase 7 (Defensibility: 0 blockers). Exit: Formal EIC signoff. | Immutable audit entry in `auditTrail` | **Code (Unwired to API)** | `PARTIAL` |
| **10. PUBLISH** | `lib/editorial/publication-gate.ts`, Cloudflare Calendar Worker | Approved Story Record | Public HTML / JSON-LD / API | Autonomous Scheduler / EIC | Entry: 11 fail-closed gates in `validateStoryForPublication()`. Exit: Status changed to `published`, `publishedAt` stamped. | Cloudflare Worker logs / Supabase audit | **Code (Fail-Closed on Worker; Bypassed on API)** | `PARTIAL` |
| **11. UPDATE** | `services/lifecycle/change-detector/ChangeDetector.ts`, `lib/evolution/` | Upstream Source Diff / New Observation | `DiffResult`, `EditorialTask` | Automated Ingestion / Lead Editor | Entry: Source content modified or new contradictory evidence. Exit: Impact assessed, story assigned for revision. | None (Mock return `['story-1', 'story-2']`) | **Stub / Mock** | `ABSENT` |
| **12. CORRECT** | `services/editorial/corrections-service.ts`, `tests/vs8-cross-system-corrections.test.ts` | Reader Correction Submission | `PublishedCorrection`, Errata notice | Managing Editor / Senior Desk | Entry: Reader submission via public UI. Exit: Staff triage, claim match, published errata notice. | `memoryPublishedCorrections` / Supabase `corrections` | **Code (Service) / Disconnected (No story update)** | `PARTIAL` |
| **13. ARCHIVE** | `lib/editorial/workflow-state-machine.ts`, `services/lifecycle/archive/ArchiveService.ts` | Published Story | `archived` Story Record | Managing Editor | Entry: Outdated or superseded analysis. Exit: Replaced by updated monograph or canonical tombstone. | `auditTrail[]` entry | **Manual** | `PARTIAL` |

---

### 2. Disconnect & Isolation Analysis

```
[ PIB RSS / Ingestion ] ──────┐
                              ▼
               [ Newsroom Intelligence ] (Isolated State)
                              │
                    (PROMOTE_TO_RESEARCH)
                              │
                              ▼ (No programmatic handoff)
               [ Research Intelligence ]
                              │
                    (generateStoryBrief)
                              │
                              ▼ (Manual copy-paste)
                 [ Narrative Writing Desk ] ─── (Markdown Drafts in Git)
                              │
                              ▼
                 [ Gold Standard Review ] ─── (Evaluator Module)
                              │
                              ▼
            ┌───────── Publication Gate ─────────┐
            │                                    │
            ▼                                    ▼
[ Cloudflare Calendar Worker ]       [ REST APIs: /api/v1/stories, /api/v2/stories ]
   (Enforces 11 Gates)                    (COMPLETELY UNPROTECTED - P0 BYPASS)
            │                                    │
            └───────────────┬────────────────────┘
                            ▼
               [ Public Web & Readers ]
                            │
               (Reader Correction Submitted)
                            │
                            ▼
               [ Corrections Service ]
                            │
                 (correction:published)
                            │
                            ▼ (ZERO Listeners - No Story Mutation)
                      [ Event Void ]
```

---

### 3. Gap Severity Summary

1. **API Publication Bypass (Severity: CRITICAL P0)**: Public endpoints (`/api/v1/stories`, `/api/v2/stories`) permit unauthenticated `POST`, `PUT`, and `DELETE` operations, creating or altering published stories without touching the state machine or publication gate.
2. **Missing Automated Change Propagation (Severity: HIGH P1)**: `ChangeDetector` and `ImpactAnalyzer` return static hardcoded arrays (`['story-1', 'story-2']`). When a source changes, no automated alert or review ticket reaches the editorial desk.
3. **Event Bus Disconnect on Corrections (Severity: HIGH P1)**: When a correction is approved and published via `corrections-service.ts`, `eventBus.publish('correction:published')` is emitted, but zero system listeners update the underlying story file or canonical claim record.
4. **Canonical Source Reference Debt (Severity: MEDIUM P2)**: `npm run check:sources` proves that 111 out of 148 referenced source IDs in published claims fail to resolve against `lib/knowledge/source-registry.ts`.
