# THE BREAKDOWN — NEWSROOM OPERATING SYSTEM
## Phase 0 Deliverable: Complete Mutation Route & Publication Surface Inventory

**Document ID:** NOS-INV-001  
**Status:** Canonical Discovery Inventory (Phase 0)  
**Date:** 2026-09-28  
**Scope:** Complete inventory of all HTTP routes and Server Actions capable of creating, updating, publishing, or deleting editorial state.

---

### Git Forensic Baseline
* **Branch:** `main`
* **HEAD Commit:** `550b9e263d283dcf308a9707c606dc279ec7d6d3`
* **Recent Commits:**
  - `550b9e2` docs(deploy): record loop 6 final green closure audit report
  - `7f43920` fix(deploy): anchor vercelignore production boundaries
  - `7fb8666` test(deploy): production canary verification
  - `c4121cd` docs(deploy): record loop 4 post-remediation observability audit
  - `1eef2e2` fix(deploy): use cross-platform commit diffing and support Vercel git env in ignore filter

---

### Complete Mutation Route Inventory Table

| Route / Surface | Method | Auth | Role Check | State Transition | Publication Gate | Evidence Validation | Audit Log | Risk Classification |
|---|---|---|---|---|---|---|---|---|
| `app/api/v1/stories` | POST | ❌ None | ❌ None | ❌ None (accepts `status: 'published'`) | ❌ None | ❌ None | ❌ None | **CRITICAL (P0)** |
| `app/api/v1/stories/[slug]` | PUT | ❌ None | ❌ None | ❌ None (accepts `status: 'published'`) | ❌ None | ❌ None | ❌ None | **CRITICAL (P0)** |
| `app/api/v1/stories/[slug]` | DELETE | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | **CRITICAL (P0)** |
| `app/api/v2/stories` | POST | ❌ None | ❌ None | ❌ None (direct Supabase insert) | ❌ None | ❌ None | ❌ None | **CRITICAL (P0)** |
| `app/api/v2/stories/[slug]` | PUT | ❌ None | ❌ None | ❌ None (direct Supabase update) | ❌ None | ❌ None | ❌ None | **CRITICAL (P0)** |
| `app/api/v2/stories/[slug]` | DELETE | ❌ None | ❌ None | ❌ None (direct Supabase delete) | ❌ None | ❌ None | ❌ None | **CRITICAL (P0)** |
| `app/cms/actions.ts` (`saveStoryAction`) | Server Action | ❌ None | ❌ None | ❌ None (accepts `status: 'published'`) | ❌ None | ❌ None | ❌ None | **CRITICAL (P0)** |
| `app/api/v2/claims` | POST | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | **HIGH (P1)** |
| `app/api/v2/sources` | POST | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | **HIGH (P1)** |
| `app/api/v1/entities` | POST | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | **MEDIUM (P2)** |
| `app/api/v1/entities/[slug]` | PUT | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | **MEDIUM (P2)** |
| `app/api/v1/entities/[slug]` | DELETE | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | **MEDIUM (P2)** |
| `app/api/v1/fixes` | POST | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | **MEDIUM (P2)** |
| `app/api/v1/fixes/[slug]` | PUT | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | **MEDIUM (P2)** |
| `app/api/v1/fixes/[slug]` | DELETE | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | **MEDIUM (P2)** |
| `app/api/v1/timelines` | POST | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | **MEDIUM (P2)** |
| `app/api/v1/timelines/[id]` | PUT | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | **MEDIUM (P2)** |
| `app/api/v1/timelines/[id]` | DELETE | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | **MEDIUM (P2)** |
| `app/api/v1/topics` | POST | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | **MEDIUM (P2)** |
| `app/api/v1/topics/[slug]` | PUT | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | **MEDIUM (P2)** |
| `app/api/v1/topics/[slug]` | DELETE | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | ❌ None | **MEDIUM (P2)** |
| `app/api/corrections/submit` | POST | ✅ Public rate limit | N/A (Public intake) | N/A | N/A | Text format checks | In-memory ID | **LOW (P3)** (Safe intake) |
| `app/api/v2/newsroom/seed` | POST | ✅ `guardIntelModule` | ✅ `editor` or above | N/A | N/A | Baseline fixture | Audit log | **SECURE** |
| `app/api/v2/newsroom/authorize` | POST | ✅ `guardIntelModule` | ✅ `owner` / `managing_editor` | N/A | N/A | N/A | Audit log | **SECURE** |
| `app/api/v2/newsroom/observations/pull` | POST | ✅ `x-vercel-cron` + Bearer | ✅ Cron Secret | N/A | N/A | Schema validation | Ingestion log | **SECURE** |
| `app/api/v2/newsroom/signals/[id]/actions` | POST | ✅ `guardIntelModule` + Session | ✅ Role matrix | ✅ Version checked | N/A | Signal scores | Audit Service | **SECURE** |
| `app/api/v2/newsroom/alerts/[id]/ack` | POST | ✅ `guardIntelModule` + Session | ✅ Authenticated | N/A | N/A | N/A | Alert ACK log | **SECURE** |
| `app/api/v2/research/projects` | POST | ✅ Session | ✅ Researcher | N/A | N/A | Schema validation | Research log | **SECURE** |
| `app/api/v2/research/projects/[id]` | PATCH | ✅ Session | ✅ Researcher | N/A | N/A | Schema validation | Research log | **SECURE** |
| `app/api/v2/research/projects/[id]/run` | POST | ✅ Session | ✅ Researcher | N/A | N/A | Source registry checks | Run log | **SECURE** |
| `app/api/v2/research/projects/[id]/brief` | POST | ✅ Session | ✅ Researcher | N/A | N/A | Claim evidence lineage | Brief log | **SECURE** |
| `app/intel/editorial/actions.ts` (`publishNowAction`) | Server Action | ✅ `requireRole` | ✅ `editor` | N/A | ✅ `validateStoryForPublication` | ✅ Gate checks | Gate audit | **SECURE** |
| `app/intel/story-builder/actions.ts` | Server Action | ✅ `getSession` | ✅ `canAccessIntelModule` | ✅ `transitionStory` | ✅ Verification gate | Verification link | Story audit | **SECURE** |

---

### Critical Exposure Summary

1. **Seven Primary Publication Bypasses (P0):**
   - `POST /api/v1/stories`
   - `PUT /api/v1/stories/[slug]`
   - `DELETE /api/v1/stories/[slug]`
   - `POST /api/v2/stories`
   - `PUT /api/v2/stories/[slug]`
   - `DELETE /api/v2/stories/[slug]`
   - `app/cms/actions.ts:saveStoryAction`
2. **Two Knowledge Island Injection Vectors (P1):**
   - `POST /api/v2/claims`
   - `POST /api/v2/sources`
3. **Contrast with Secure Enclaves:**
   - The Newsroom Command Center (`/api/v2/newsroom/`) and Editorial Calendar Actions (`app/intel/editorial/actions.ts`) are **completely secured** with strict session resolution, role validation, publication-gate evaluation, and audit logging.
   - The vulnerability is that the legacy v1 and v2 CRUD REST endpoints and CMS server action sit alongside these secure enclaves without any guards.
