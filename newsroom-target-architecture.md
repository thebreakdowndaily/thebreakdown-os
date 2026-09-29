# THE BREAKDOWN — NEWSROOM OPERATING SYSTEM
## Deliverable 5: Target Architecture & Unification Specification

**Document ID:** NOS-ARCH-005  
**Status:** Architecture Blueprint (Platform Beta Compliant)  
**Date:** 2026-09-28  
**Scope:** Blueprint for unifying the four disconnected subsystems into an integrated, fail-closed Newsroom Operating System without introducing speculative generic infrastructure.

---

### 1. Architectural Doctrine & Beta Constraints

In strict accordance with `AGENTS.md` (Platform Beta v1.0):
* ❌ **NO NEW GENERIC INFRASTRUCTURE:** Do not create a new database engine, new abstract base registries, or alternate service layers.
* ✅ **EXTEND & WIRE EXISTING ARCHITECTURE:** Connect the existing `NewsroomIntelligenceCore`, `ResearchIntelligenceCore`, `EditorialQueue`, `publication-gate.ts`, and `eventBus`.
* ✅ **TRACEABILITY TO GOVERNANCE:** Every component maps directly to the `Editorial Constitution v1.1` and `AGENTS.md`.

---

### 2. Unified Target Topology

```
                  ┌──────────────────────────────────────────────┐
                  │          EXTERNAL EVIDENCE SOURCES           │
                  │   (PIB Ingestion, Court Rulings, ECI Data)   │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │       NEWSROOM INTELLIGENCE COMMAND          │
                  │    (16-Beat Clustering, Signals, Velocity)   │
                  └──────────────────────┬───────────────────────┘
                                         │
                 Triage Action: "PROMOTE_TO_RESEARCH"
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │            RESEARCH INTELLIGENCE             │
                  │   (Source Registry, Contradictions, Runs)    │
                  └──────────────────────┬───────────────────────┘
                                         │
                 Export: `ResearchStoryBrief` with Lineage
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │        CANONICAL EDITORIAL WORKFLOW          │
                  │  (EditorialStateRecord, 6-Questions Spine)   │
                  └──────────────────────┬───────────────────────┘
                                         │
                 Phase 1–7 Gold Standard Review Signoff
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │           FAIL-CLOSED PUBLICATION GATE       │
                  │   (11 Gates: Title, Claims, Sources, Density)│
                  │        PROTECTS BOTH WORKER & REST APIs      │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │          PUBLIC PRESENTATION & READER        │
                  │     (Next.js ISR, JSON-LD, Reading Modes)    │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │         PUBLIC CORRECTIONS & ERRATA          │
                  │  (Reader Intake → Staff Triage → EventBus)   │
                  └──────────────────────┬───────────────────────┘
                                         │
                     `correction:published` Event Subscriber
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │      AUTOMATED CACHE & EVIDENCE REVALIDATION │
                  │  (`revalidatePath`, Story & Claim Patching)  │
                  └──────────────────────────────────────────────┘
```

---

### 3. Core Architectural Unification Contracts

#### Contract 1: Signal → Research Project Handoff
* **Current Gap:** `PROMOTE_TO_RESEARCH` in `workflow-service.ts` only sets a flag and string note.
* **Target Behavior:**
  When `PROMOTE_TO_RESEARCH` is invoked by an authorized editor:
  1. Call `applyNewsEventToResearch()` in `services/intelligence/research/newsroom-bridge.ts`.
  2. Resolve or create a `ResearchProject` mapped to the signal's beat and entities.
  3. Attach the resulting `projectId` to `signal.researchProjectId`.
  4. Emit audit log entry recording the cross-subsystem promotion.

#### Contract 2: Research Brief → Editorial Queue Handoff
* **Current Gap:** `generateStoryBriefActionCore()` generates a brief in memory for RIE UI but leaves the editorial drafting queue empty.
* **Target Behavior:**
  When a researcher or editor executes "Generate Story Brief":
  1. Construct a new `EditorialTask` in `EditorialQueue` with `priority: 'high'` and `stage: 'draft'`.
  2. Map brief claims to the initial draft claims structure.
  3. Notify the assigned beat reporter in `NewsroomOperationalMetrics`.

#### Contract 3: Unified API Security & Gate Enforcement (P0 Remediation)
* **Current Gap:** REST endpoints (`/api/v1/stories`, `/api/v2/stories`, `/api/v2/claims`, `/api/v2/sources`) lack auth, state machines, and publication gates.
* **Target Behavior:**
  1. Apply `guardIntelModule('editorial')` and require authenticated session with minimum role `'editor'`.
  2. For any payload attempting `status: 'published'`, execute `validateStoryForPublication()`.
  3. If any gate fails, reject with `HTTP 422 Unprocessable Entity` containing the detailed gate check report.
  4. Enforce `transitionEditorialState()` to record the audit log with actor ID and role.

#### Contract 4: Change Propagation & ISR Invalidation Pipeline
* **Current Gap:** `ChangeDetector` and `ImpactAnalyzer` return static mock data. No cache invalidation occurs.
* **Target Behavior:**
  1. Implement graph lookup in `ImpactAnalyzer` using `source-registry.ts`'s `chapterIds` and `storyIds`.
  2. When a source is modified or suppressed:
     - Downgrade linked claims to `'provisional'` or `'needs_verification'`.
     - Invalidate Next.js cache via `revalidatePath('/story/[slug]')` and `revalidatePath('/knowledge-library/[slug]')`.
     - Emit a High/Critical incident to `NewsroomAlertService`.

#### Contract 5: EventBus Subscriber for Errata & Corrections
* **Current Gap:** `correction:published` event has zero production listeners.
* **Target Behavior:**
  1. Register an event worker in `lib/events/subscribers/correction-subscriber.ts`.
  2. Upon receiving `correction:published`:
     - Update the target story's `errata` array in repository.
     - Call `revalidatePath('/story/' + event.payload.storySlug)`.
     - Append entry to the public transparency ledger.

#### Contract 6: Grounded AI Copilot Validator
* **Current Gap:** `GroundingValidator.validate()` returns the response directly without checks.
* **Target Behavior:**
  1. Check generated response against provided `context.claims` and `context.evidence`.
  2. Ensure all citations map to registered source IDs (`[s1]`, `[doc-nehru-tryst]`).
  3. Flag or strip ungrounded assertions before returning stream.
