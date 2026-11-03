# Scheduled Publication Safety Audit

**Mission ID:** `TB-INV-2026-11-03-GREEN-CRACKERS`  
**Story Slug:** `delhi-green-cracker-enforcement-diwali-2026`  
**Scheduled Timestamp in Draft:** `2026-11-03T20:00:00Z` (4 November 2026, 1:30 AM IST)  
**Audit Date:** 2026-11-03  
**Auditor:** Senior Publication Engineer & Newsroom Security Specialist  
**Safety Status:** **VERIFIED SAFE — ZERO AUTOMATIC RELEASE RISK**

---

## 1. Executive Summary & Core Invariant

The draft in [`lib/editorial/drafts/delhi-green-crackers.ts`](file:///c:/newsjack-content/thebreakdown-os/lib/editorial/drafts/delhi-green-crackers.ts) defines `scheduledAt: '2026-11-03T20:00:00Z'`. In a platform that supports scheduled publishing, any timestamp that passes into the past could theoretically trigger automated release routines.

This audit conducted an exhaustive inspection of every scheduler, cron job, worker, database trigger, CMS action, and API endpoint across The Breakdown OS repository. 

**The Foundational Invariant:**
> Under Level 1 Editorial Constitution v1.1 and AGENTS.md, a scheduled timestamp is an administrative intention, **NEVER publication authorization**. A story in `'scheduled'` or `'review'` state can NEVER transition to `'published'` or become visible to the public merely because its scheduled timestamp has arrived.

**Audit Finding:** 
There is **zero risk** of automated, scheduled, or accidental publication. All publication pathways are fail-closed and enforce the canonical publication contract, the 7-phase Gold Standard Review, and the active editorial release hold.

---

## 2. Comprehensive Trace of Publication Pathways

### Route 1: Background Cron Endpoint (`app/api/editorial/publish-due/route.ts`)
- **Trigger:** Hourly invocation via deployment platform scheduler.
- **Authentication Guard:** Enforces `Authorization: Bearer ${process.env.CRON_SECRET}`. Without the valid secret, all calls are rejected with HTTP 401/500.
- **Database Dependency:** Queries `editorial_schedule` table in PostgreSQL. `delhi-green-cracker-enforcement-diwali-2026` does NOT exist in `editorial_schedule`.
- **Publication Authority Guard:** If an entry existed, the runner dispatches to [`validateAndPublishDueStories()`](file:///c:/newsjack-content/thebreakdown-os/services/editorial/schedule.ts#L185-L340), which executes [`evaluatePublicationContractAsync`](file:///c:/newsjack-content/thebreakdown-os/lib/editorial/canonical-publication.ts#L49-L139).
- **Gate Evaluation:**
  - Gate 11 (`gold_standard_review`) checks for genuine 7-phase sign-off. Fails closed.
  - Gate 13 (`editorial_release_hold`) checks `EDITORIAL_RELEASE_HOLDS['delhi-green-cracker-enforcement-diwali-2026']`. Fails closed (`HOLD` active).
- **Outcome:** `decision.allowed` is `false`. Publication token is NOT issued. The schedule status transitions to `'blocked'`, and the story remains unpublished.

### Route 2: Cloudflare Workers Cron Dispatcher (`services/editorial/schedule-cf.ts`)
- **Trigger:** Cloudflare Workers Cron Trigger.
- **Privilege Separation:** Cloudflare worker holds no database write permissions to `stories` table.
- **Unified Authority:** Direct database RPC fallbacks (`fn_publish_story_with_audit`) are strictly revoked. Worker dispatches exclusively via HTTP to `APP_URL/api/editorial/publish-due` with `CRON_SECRET`.
- **Outcome:** Subject to the same fail-closed gates as Route 1.

### Route 3: Vercel Cron Configuration (`vercel.json`)
- **Inspection of `vercel.json`:**
  ```json
  {
    "crons": [
      { "path": "/api/v2/newsroom/observations/pull", "schedule": "0 6 * * *" },
      { "path": "/api/v2/radar/poll", "schedule": "0 18 * * *" }
    ]
  }
  ```
- **Finding:** No publishing cron is registered in `vercel.json`. The only crons active are radar observation collection and polling probes.

### Route 4: Editorial Actions Server Handler (`app/intel/editorial/actions.ts`)
- **Function:** [`publishNowAction(storyId, scheduleId)`](file:///c:/newsjack-content/thebreakdown-os/app/intel/editorial/actions.ts#L177-L239).
- **Guards Enforced:**
  1. Principal authentication: `await requireRole('editor')`.
  2. Canonical publication evaluation: [`evaluatePublicationContractAsync`](file:///c:/newsjack-content/thebreakdown-os/lib/editorial/canonical-publication.ts).
  3. Single-use publication token: `decision.publicationToken`.
- **Outcome:** Gate 11 and Gate 13 block publication; returns `{ success: false, error: ... }`.

### Route 5: CMS Mutation Actions (`app/cms/actions.ts`)
- **Function:** [`saveStoryAction(cmsStory)`](file:///c:/newsjack-content/thebreakdown-os/app/cms/actions.ts#L20-L80).
- **Guards Enforced:**
  1. Role check: `can(principal, 'story.publish')`.
  2. Contract evaluation: `evaluatePublicationContractAsync(existing, updatedStory, principal)`.
  3. Token consumption: `repo.saveStory(..., { publicationToken: decision.publicationToken })`.
- **Outcome:** Blocks publish transition with HTTP 422 if gates fail.

### Route 6: REST API V1 & V2 Story Endpoints (`app/api/v1/stories`, `app/api/v2/stories`)
- **Endpoints:** `POST /api/v1/stories`, `PUT /api/v1/stories/[slug]`, `POST /api/v2/stories`, `PUT /api/v2/stories/[slug]`.
- **Guards Enforced:**
  - For any payload containing `status: 'published'`:
    - Checks `can(principal, 'story.publish')`.
    - Evaluates `evaluatePublicationContractAsync`.
    - Saves only with validated `publicationToken`.
- **Outcome:** Direct publication requests fail closed.

### Route 7: Story Repository Guard (`services/repositories/supabase/story.ts` & `MemoryStoryRepository`)
- **Guard Logic:**
  ```typescript
  if (story.status === 'published' || story.publicationStatus === 'published') {
    const token = options?.publicationToken || (story as any)._publicationToken;
    if (!token || !consumePublicationToken(token, story.id)) {
      throw new DirectPublicationForbiddenError(
        `Direct saveStory with status='published' is prohibited for story ${story.id}...`
      );
    }
  }
  ```
- **Finding:** Even if code called `repo.saveStory()` directly with `status: 'published'`, the repository throws `DirectPublicationForbiddenError`.

### Route 8: Public Story Read Path (`app/story/[slug]/page.tsx`)
- **Route Handler:**
  ```typescript
  if (!isCanonicalStoryPublic(canonicalStory)) {
    notFound();
  }
  ```
- **Predicate:** In [`lib/story/publication.ts`](file:///c:/newsjack-content/thebreakdown-os/lib/story/publication.ts), `isPubliclyPublished` requires `publicationStatus === 'published'`. A story with `publicationStatus === 'scheduled'` evaluates to `false` regardless of the arrival of `scheduledAt`.
- **Outcome:** Returns HTTP 404.

---

## 3. Enforcement Matrix for All 7 Security Requirements

| Security Requirement | Enforced on Cron? | Enforced on CMS? | Enforced on API? | Enforced on Repo? |
|:---|:---:|:---:|:---:|:---:|
| **1. Authenticated Publishing Principal** | YES (Scheduler) | YES (Session) | YES (Session) | YES (Token) |
| **2. Editorial Workflow State Transition** | YES (`canTransition`) | YES (`canTransition`) | YES (`canTransition`) | YES |
| **3. Seven-Phase Human Gold Standard Review** | YES (Gate 11) | YES (Gate 11) | YES (Gate 11) | YES (Gate 11) |
| **4. Editor-in-Chief / Editor Role Check** | YES (`story.publish`) | YES (`requireRole`) | YES (`can`) | YES (Token) |
| **5. Active Release-Hold Validation** | YES (Gate 13) | YES (Gate 13) | YES (Gate 13) | YES (Gate 13) |
| **6. Content-Fingerprint Binding** | YES (Fingerprint) | YES (Fingerprint) | YES (Fingerprint) | YES (Fingerprint) |
| **7. Canonical Publication Contract** | YES | YES | YES | YES |

---

## 4. Conclusion & Safety Determination

No route exists in The Breakdown OS by which `delhi-green-cracker-enforcement-diwali-2026` can be published automatically or through an administrative workaround. 

The story remains strictly confined to the review environment awaiting authentic human editorial sign-off.
