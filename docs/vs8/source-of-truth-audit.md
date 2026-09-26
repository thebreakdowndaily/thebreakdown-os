# The Breakdown OS — Source-of-Truth Forensic Audit (VS8)

**Phase:** VS8 — Certified Platform Integration, Capability Discovery & Architecture Reconciliation  
**Date:** 2026-09-26  
**Status:** Certified Source-of-Truth Audit  
**Governing Rule:** Single Canonical Source of Truth (No Competing Authorities)

---

## 1. Executive Summary

This forensic audit evaluates the 11 core data and lifecycle concepts of The Breakdown OS to ensure that each concept has exactly one authoritative source of truth, one verified write path, and zero competing or shadowed definitions.

---

## 2. Source-of-Truth Concept Inventory

### 1. Story
- **Canonical Source:** `public.stories` (PostgreSQL) / Canonical `Story` interface in `types/canonical.ts`.
- **Read Paths:** `services/repositories/supabase/story.ts`, `lib/story/resolver.ts`, `app/story/[slug]/page.tsx`.
- **Write Paths:** `services/repositories/supabase/story.ts`, `features/editorial/knowledge-service.ts`.
- **Who Can Mutate It:** Authenticated editorial staff with `editor` or `administrator` role.
- **Audit Mechanism:** PostgreSQL trigger `trg_stories_archive` archiving full JSON snapshot into `audit.story_versions` upon version bump.
- **Potential Duplicate:** Legacy story records in memory store; eliminated via canary flags in `lib/story/resolver.ts`.
- **Conflicting Source:** None.

---

### 2. Claim
- **Canonical Source:** `editorial.claims` (Migration 002) / Canonical `Claim` interface in `types/canonical.ts`.
- **Read Paths:** `editorial.story_claims`, `lib/knowledge/source-validator.ts`, `components/story/ClaimCard.tsx`.
- **Write Paths:** Editorial authoring tools in `/cms`, batch ingestion seeds.
- **Who Can Mutate It:** Editorial verification bureau staff.
- **Audit Mechanism:** `updated_at` triggers and snapshot inclusion in `audit.story_versions`.
- **Potential Duplicate:** Inlined claim strings in legacy story bodies; canonical claims now use explicit IDs (`claim-*-*`).
- **Conflicting Source:** None.

---

### 3. Evidence
- **Canonical Source:** `editorial.evidence_items` (Migration 002) / Canonical `Source` interface in `types/canonical.ts`.
- **Read Paths:** `lib/knowledge/source-validator.ts`, `components/story/EvidencePanel.tsx`.
- **Write Paths:** Verification bureau ingestion routines.
- **Who Can Mutate It:** Verification bureau staff.
- **Audit Mechanism:** Provenance URL validation and Tier attribution (Tier 1 Primary vs Tier 2 Secondary).
- **Potential Duplicate:** None.
- **Conflicting Source:** None.

---

### 4. Verification
- **Canonical Source:** `lib/editorial/gold-standard-review.ts` & `lib/editorial/publication-gate.ts` (Gate 11).
- **Read Paths:** Pre-publication gate evaluator, editorial quality dashboard.
- **Write Paths:** Expert reviewer and verification bureau sign-offs recorded in story metadata.
- **Who Can Mutate It:** Authorized subject-matter experts and verification bureau editors.
- **Audit Mechanism:** 7-phase audit records with timestamps and blocking issue counts.
- **Potential Duplicate:** None.
- **Conflicting Source:** None.

---

### 5. Research Project / Case
- **Canonical Source:** `public.workspace_cases` (Migration 010).
- **Read Paths:** `services/intelligence/research/`, `app/research/`.
- **Write Paths:** `NewsroomResearchBridge.promoteSignalToInvestigationCase()`, research staff actions.
- **Who Can Mutate It:** Research bureau analysts and investigative leads.
- **Audit Mechanism:** Status lifecycle tracking (`lead` -> `active` -> `completed` -> `archived`).
- **Potential Duplicate:** None.
- **Conflicting Source:** None.

---

### 6. Newsroom Signal
- **Canonical Source:** `newsroom.signals` (Migration 011).
- **Read Paths:** `NewsroomIntelligenceCore`, `/intel` dashboard queries.
- **Write Paths:** `NewsroomPIBAdapter`, RSS intake workers.
- **Who Can Mutate It:** Automated ingestion worker agents.
- **Audit Mechanism:** Ingestion run IDs and observation deduplication hashes.
- **Potential Duplicate:** None.
- **Conflicting Source:** None.

---

### 7. Reader Correction
- **Canonical Source:** `public.reader_corrections` (Migration 013).
- **Read Paths:** `services/editorial/corrections-service.ts` (`listReaderCorrections`).
- **Write Paths:** `POST /api/corrections/submit` (anonymous intake), `triageReaderCorrection()` (staff triage).
- **Who Can Mutate It:** Public readers (INSERT initial `received` status only); Staff editors (UPDATE status to `in_review`, `resolved`, `rejected`).
- **Audit Mechanism:** Strict RLS enforcement, immutable submission records, state transition timestamps and notes.
- **Potential Duplicate:** None.
- **Conflicting Source:** None.

---

### 8. Publication State
- **Canonical Source:** `lib/story/publication.ts` (`isPubliclyPublished()`, `isCanonicalStoryPublic()`).
- **Read Paths:** App Router pages (`/story/[slug]`, `/series/*`), sitemap, robots, search API.
- **Write Paths:** Canonical publication pipeline (`lib/editorial/publication-gate.ts`).
- **Who Can Mutate It:** Authorized editors passing all 11 publication gates.
- **Audit Mechanism:** Immutable audit versions in `audit.story_versions`.
- **Potential Duplicate:** None; centralized in `lib/story/publication.ts`.
- **Conflicting Source:** None.

---

### 9. Errata / Published Correction
- **Canonical Source:** `public.corrections` (Migration 013).
- **Read Paths:** `/transparency/corrections`, `CorrectionNoticeBanner.tsx`.
- **Write Paths:** `services/editorial/corrections-service.ts` (`triageReaderCorrection` on `resolved`).
- **Who Can Mutate It:** Editors only (INSERT/UPDATE). No role has DELETE permissions (immutable append-only projection).
- **Audit Mechanism:** Idempotency constraint `uq_public_corrections_event`, previous/corrected wording diffs.
- **Potential Duplicate:** None.
- **Conflicting Source:** None.

---

### 10. Operational State
- **Canonical Source:** `lib/operations/pipeline-health.ts` (10-stage aggregator) & `lib/control-plane/` (Control Plane).
- **Read Paths:** `/operations`, `/intel/operations`, Mission Control UI.
- **Write Paths:** Health evaluators, worker job status transitions.
- **Who Can Mutate It:** Operational runtimes, systems operators.
- **Audit Mechanism:** Structured operational alerts and audit logging via `logSecurityEvent`.
- **Potential Duplicate:** None.
- **Conflicting Source:** None.

---

### 11. Audit History
- **Canonical Source:** `audit.story_versions` (Migration 002) & application audit logs (`logSecurityEvent`).
- **Read Paths:** Version history components, security audit suites.
- **Write Paths:** Automated database triggers (`trg_stories_archive`), security log sinks.
- **Who Can Mutate It:** System/Triggers only; append-only.
- **Audit Mechanism:** Cryptographic timestamps and immutable search paths.
- **Potential Duplicate:** None.
- **Conflicting Source:** None.

---

## 3. Audit Verdict

There are **ZERO** competing authorities for any of the 11 core platform concepts. The architectural boundaries established across P0–VS7 are cleanly segmented and enforce unambiguous authority.
