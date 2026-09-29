# THE BREAKDOWN — NEWSROOM OPERATING SYSTEM
## Deliverable: P0 Publication Integrity Remediation Design

**Document ID:** NOS-DESIGN-001  
**Status:** Engineering Architecture Design (Phase 4)  
**Date:** 2026-09-28  
**Scope:** Remediation design for securing all REST endpoints and Server Actions against unauthorized mutation and publication bypass.

---

### 1. The Core Architecture Problem

Currently, the application contains two parallel worlds:
1. **The Secure Enclaves:** The Newsroom Command Center (`/api/v2/newsroom/`) and Editorial Calendar Actions (`app/intel/editorial/actions.ts`) which enforce role permissions and publication gates.
2. **The Unprotected CRUD Endpoints:** Legacy REST endpoints (`/api/v1/stories`, `/api/v2/stories`, `/api/v2/claims`, `/api/v2/sources`) and CMS server actions (`app/cms/actions.ts`) that directly write to storage without authentication or gate evaluation.

---

### 2. Unified Request Processing Flow

```
                      INCOMING HTTP REQUEST / SERVER ACTION
                                         │
                                         ▼
                           [ 1. Request Validation ]
                     (Parse JSON body, check ID/slug formats)
                                         │
                                         ▼
                     [ 2. Authentication Verification ]
                      (`requireApiPermission('story.*')`)
                       ├── Unauthenticated: HTTP 401
                                         │
                                         ▼
                     [ 3. Authorization Verification ]
                      (`can(principal, 'story.publish')`)
                       ├── Low Privilege (Reporter trying to publish): HTTP 403
                                         │
                                         ▼
                      [ 4. Workflow State Transition ]
                      (`canTransition(story.status, to)`)
                       ├── Invalid Stage Jump: HTTP 409
                                         │
                                         ▼
                     [ 5. Publication Gate Evaluation ]
                     (`validateStoryForPublication()`)
                       ├── Missing Evidence/Claims: HTTP 422
                                         │
                                         ▼
                         [ 6. Immutable Audit Event ]
                      (`transitionEditorialState()`)
                                         │
                                         ▼
                     [ 7. Atomic Repository Persistence ]
                           (`repo.saveStory(story)`)
                                         │
                                         ▼
                      [ 8. Cache & Search Invalidation ]
                       (`revalidatePath(/story/[slug])`)
```

---

### 3. Implementation Blueprint

#### Component A: `lib/editorial/canonical-publication.ts`
A single authoritative server-side domain module that orchestrates publication:
```typescript
export interface CanonicalPublicationResult {
  success: boolean;
  status: 200 | 201 | 401 | 403 | 409 | 422 | 500;
  story?: Story;
  gateResult?: PublicationGateResult;
  error?: string;
  details?: unknown;
}

export async function executeCanonicalStoryPublication(
  existingStory: Story | undefined,
  targetStory: Story,
  principal: Principal,
  options?: { scheduleId?: string; notes?: string }
): Promise<CanonicalPublicationResult>
```

#### Component B: Route Handlers Lockdown
1. **`app/api/v1/stories/route.ts` (POST):**
   - Check `requireApiPermission('story.create')`.
   - If `body.status === 'published'`: Require `requireApiPermission('story.publish')` AND run `executeCanonicalStoryPublication()`.
   - If draft: Ensure status is `'draft'`, save as draft.
2. **`app/api/v1/stories/[slug]/route.ts` (PUT, DELETE):**
   - PUT: Check `requireApiPermission('story.update')`. If attempting transition to `'published'`, require `'story.publish'` and publication gate.
   - DELETE: Check `requireApiPermission('story.delete')` (managing_editor or owner only).
3. **`app/api/v2/stories/route.ts` (POST) & `app/api/v2/stories/[slug]/route.ts` (PUT, DELETE):**
   - Apply same authentication and publication gate guards before any Supabase mutation.
4. **`app/cms/actions.ts` (`saveStoryAction`):**
   - Import `getCurrentPrincipal()`. Reject unauthenticated with error.
   - If `cmsStory.status === 'published'`, require `'story.publish'` and pass publication gate.
5. **`app/api/v2/claims/route.ts` & `app/api/v2/sources/route.ts`:**
   - Require authenticated session with minimum role `'fact_checker'` or `'reporter'` for writes.

---

### 4. HTTP Status Code Conventions
* **401 Unauthorized:** Authentication session is missing or expired.
* **403 Forbidden:** Authenticated user lacks required permission (e.g. reporter attempting publication or editor attempting deletion).
* **409 Conflict:** State machine violation (e.g. attempting to jump directly from `draft` to `published` without review).
* **422 Unprocessable Entity:** Publication gate failed (e.g. missing claims, missing sources, missing summary, unverified evidence).
