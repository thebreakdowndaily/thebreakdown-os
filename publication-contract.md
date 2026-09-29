# THE BREAKDOWN — NEWSROOM OPERATING SYSTEM
## Deliverable: Canonical Publication Contract

**Document ID:** NOS-PUB-CONTRACT-001  
**Status:** Supreme Publication Specification (Platform Beta v1.0)  
**Date:** 2026-09-28  
**Governing Documents:** Level 1 Editorial Constitution v1.1 (Articles I, III, IV, XI, XIII), AGENTS.md

---

### Core Principle: Fail-Closed Publication Authority

Publication is **never** a client-side flag or a simple database column update.
Publication is a **constitutional domain event** that transitions a verified knowledge object from private editorial workspace into public reader trust.

```
API / User / Cron / Server Action
              │
              ▼
  [ 1. AUTHENTICATION GATE ] ── (Valid session / verified principal)
              │
              ▼
  [ 2. AUTHORIZATION GATE ] ── (Permission: 'story.publish')
              │
              ▼
  [ 3. STATE MACHINE GATE ] ── (Legal transition: approved/scheduled -> published)
              │
              ▼
  [ 4. PUBLICATION GATE ] ── (11 fail-closed gates pass)
              │
              ▼
  [ 5. AUDIT EVENT CREATION ] ── (Who, what, when, why, before, after)
              │
              ▼
  [ 6. DOMAIN PERSISTENCE ] ── (Persist to repository / Supabase)
              │
              ▼
  [ 7. CACHE & CDN REVALIDATION ] ── (`revalidatePath()`)
```

---

### Contract Specification

#### 1. Valid Transitions to "Published"
* A story can transition to `published` **only** from:
  - `approved` (after Gold Standard Review signoff)
  - `scheduled` (via autonomous or manual calendar release)
  - `corrected` (when publishing an updated revision of an already published story)
* Direct transitions from `draft`, `research`, `writing`, or `fact_check` are **strictly invalid** and return `HTTP 409 Conflict`.

#### 2. Authorized Roles
* Evaluated strictly via `can(principal, 'story.publish')`:
  - **Permitted:** `owner`, `managing_editor`, `editor`
  - **Denied:** `reporter`, `researcher`, `analyst`, `fact_checker`, `guest`, anonymous (`null`)
  - Calling without permission returns `HTTP 403 Forbidden`.

#### 3. Required Evidence & Density
* `has_sources`: Story must contain at least 1 verified primary or academic source (`tier <= 3`).
* Sources must resolve in `lib/knowledge/source-registry.ts`.
* Evidence density must satisfy Article XI requirements for its story archetype.

#### 4. Required Fact-Check & Verification State
* `has_claims`: Story must contain at least 1 verified claim.
* Zero claims may remain in `Needs Verification`, `Unsupported`, or `disputed` without explicit editorial override and documented scholarly disagreement.
* Any unverified factual claim immediately blocks publication.

#### 5. Required Editorial Review State
* Must satisfy the 11 gates of `lib/editorial/publication-gate.ts`:
  1. `story_exists`: Story exists and is not soft-deleted.
  2. `status_eligible`: Story status is eligible for publication.
  3. `has_title`: Non-empty canonical headline/title.
  4. `has_summary`: Non-empty editorial abstract/summary.
  5. `has_content`: Non-empty content blocks (`blocks.length > 0`).
  6. `has_sources`: Evidence sources present.
  7. `has_claims`: Editorial claims present.
  8. `has_published_at`: Valid ISO-8601 publishedAt timestamp.
  9. `not_archived`: Not archived or superseded.
  10. `not_blocked`: No active editor blocking reason.
  11. `gold_standard_review`: All 7 phases passed with 0 blocking issues.

#### 6. Canonical Audit Event
Every publication must emit an immutable audit log entry containing:
* `actorId`: User ID of the authorizing editor (never client-supplied)
* `actorRole`: Authoritative role rank
* `storyId` & `slug`: Target knowledge object
* `fromStage`: Prior stage (`approved` / `scheduled`)
* `toStage`: `published`
* `timestamp`: ISO-8601 timestamp
* `gateChecks`: Snapshot of all 11 evaluated publication gate results

#### 7. Failure Semantics
* **Authentication Failure:** `HTTP 401 Unauthorized`
* **Authorization Failure:** `HTTP 403 Forbidden`
* **Invalid State Transition:** `HTTP 409 Conflict`
* **Failed Publication Gate:** `HTTP 422 Unprocessable Entity` with full list of failing checks.
* **On Any Failure:** Story remains completely unpublished in its prior state. Zero partial mutations occur.
