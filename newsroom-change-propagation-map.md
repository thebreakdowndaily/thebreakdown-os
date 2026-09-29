# THE BREAKDOWN — NEWSROOM OPERATING SYSTEM
## Deliverable 3: Source Change Propagation & Dependency Breakage Map

**Document ID:** NOS-AUDIT-003  
**Status:** Canonical Forensic Audit  
**Date:** 2026-09-28  
**Scope:** Forensic analysis of how upstream source modifications, retractions, and new evidence propagate (or fail to propagate) to published knowledge.

---

### 1. Canonical Ideal vs. Actual Reality

The core mission of The Breakdown OS is:
> *"Transform evidence into verified public knowledge and continuously update that knowledge when evidence changes."*

Under this doctrine, a source change should follow this automated pipeline:

```
[ Upstream Source Change Detected ]
                 │
                 ▼
      [ ChangeDetector.compare() ]
                 │
                 ▼
      [ ImpactAnalyzer.analyze() ]
                 │
                 ▼
     [ Graph Dependency Traversal ]
      (Identifies all affected Claims & Stories)
                 │
                 ▼
   [ Automated Editorial Review Ticket ]
      (Flags Claim as 'Needs Verification')
                 │
                 ▼
      [ Human Editorial Triage ]
                 │
                 ▼
        [ Publication Gate ]
                 │
                 ▼
   [ Next.js ISR Cache Revalidation ]
      (`revalidatePath(/story/[slug])`)
                 │
                 ▼
  [ Public Knowledge Updated with Errata ]
```

---

### 2. Forensic Trace of Actual Propagation Pipeline

We traced an actual modification to a source (e.g. an official PIB correction or revised statistical release from the Ministry of Statistics and Programme Implementation):

| Step | Ideal Action | Actual System Behavior | File / Line Reference | Failure Mode |
|---|---|---|---|---|
| **1. Ingestion** | Ingestion adapter picks up revised document | PIB Cron (`POST /api/v2/newsroom/observations/pull`) pulls RSS item once every 24 hours at 06:00 UTC. | `app/api/v2/newsroom/observations/pull/route.ts:6` | **24-hour latency window** |
| **2. Diff Detection** | `ChangeDetector` computes semantic & text diff between old and new source | `ChangeDetector.compare()` contains a placeholder stub that returns a fake diff structure. | `services/lifecycle/change-detector/ChangeDetector.ts:29-34` | **MOCK IMPLEMENTATION (Broken Link 1)** |
| **3. Impact Analysis** | Graph traversal locates all claims, stories, and entities citing the source | `ImpactAnalyzer.analyze()` hardcodes: `const affectedStories = ['story-1', 'story-2'];` | `services/lifecycle/impact-analyzer/ImpactAnalyzer.ts:9-11` | **MOCK IMPLEMENTATION (Broken Link 2)** |
| **4. Task Queuing** | Affected stories are pushed to `EditorialQueue` and marked for review | `EditorialQueue` operates as an isolated in-memory `Map<string, EditorialTask>`. | `services/lifecycle/queue/EditorialQueue.ts:4` | **VOLATILE MEMORY (Broken Link 3)** |
| **5. Claim Status Invalidation** | Canonical Claim confidence downgraded to `'provisional'` or `'debated'` | Canonical claims in `lib/knowledge/claim-registry.ts` are hardcoded in TypeScript. No runtime mutation API exists. | `lib/knowledge/claim-registry.ts:40-60` | **CODE-FROZEN STATE (Broken Link 4)** |
| **6. Newsroom Notification** | Editor receives High/Critical alert on Newsroom Dashboard | `NewsroomAlertService` evaluates signals, but only for P0/P1 velocity, never for source retractions. | `services/intelligence/newsroom/alert-engine.ts:45` | **ABSENT ALERT LOGIC** |
| **7. Reader Warning** | Published story banner warns: *"Evidence under review"* | `StoryShell` and `app/story/[slug]/page.tsx` render static `presentationModel`. No flag is displayed unless manual code edit is deployed. | `app/story/[slug]/page.tsx:108` | **STALE PUBLIC DATA** |
| **8. Cache Invalidation** | Next.js cache purged for affected stories | Next.js uses static ISR (`revalidate = 60`). No programmatic `revalidatePath()` is called when a source changes. | `app/story/[slug]/page.tsx:29` | **CACHE BLINDNESS** |

---

### 3. Detailed Failure Scenario Analysis

#### Scenario A: Upstream Retraction of a Critical Primary Source
* **Event:** The Ministry of Finance withdraws an expenditure figure used in a story claim.
* **Execution Path:** An editor uses `services/intelligence/newsroom/workflow-service.ts` to execute `SUPPRESS_SOURCE`.
* **Result:** `reputationStore` updates the source's `reliabilityScore` to 0.
* **Failure:** Zero stories citing that source are updated. The 1,132 statically generated routes on Vercel continue serving the retracted claim with 100% confidence.

#### Scenario B: Reader Submits a Valid Factual Correction
* **Event:** A reader reports an incorrect date in a historical story.
* **Execution Path:** `submitReaderCorrection()` receives input, and staff editor runs `triageReaderCorrection()` with `status: 'resolved'`.
* **Result:** `PublishedCorrection` is written to `memoryPublishedCorrections` (in memory) and `eventBus.publish('correction:published')` is emitted.
* **Failure:** There are **zero system event subscribers** to `correction:published`. The story markdown file in `stories/`, the chapter data in `chapter-1-data.ts`, and the static cache on Vercel remain untouched.

#### Scenario C: Upstream Source API Schema Drift
* **Event:** An external API or dataset changes schema.
* **Execution Path:** Uncaught exceptions in background workers.
* **Result:** Fails quietly or gets logged to worker memory without surfacing an incident in the Newsroom Command Center.

---

### 4. Dependency Breakage Architecture Diagram

```
[ Upstream Source Modified / Retracted ]
                  │
                  ▼
   [ Newsroom Intelligence Ingestion ]
                  │
                  ├── (Updates in-memory Signal)
                  │
                  ▼
         ❌ BREAKAGE POINT 1: ChangeDetector
         (Returns hardcoded mock diff: "Old claim" -> "New claim")
                  │
                  ▼
         ❌ BREAKAGE POINT 2: ImpactAnalyzer
         (Hardcoded return: ['story-1', 'story-2'])
                  │
                  ▼
         ❌ BREAKAGE POINT 3: Editorial Queue
         (Isolated in-memory Map, never rendered on editorial dashboard)
                  │
                  ▼
         ❌ BREAKAGE POINT 4: Canonical Claim Registry
         (2,832 lines of hardcoded TS code, cannot be mutated by runtime events)
                  │
                  ▼
         ❌ BREAKAGE POINT 5: Next.js Cache / Vercel Edge
         (No revalidatePath() triggered; CDN serves stale pre-rendered HTML)
```

**Forensic Conclusion:**  
There is currently **NO end-to-end change propagation**. When upstream evidence changes, the public platform remains 100% unaware until a software engineer manually updates TypeScript source code and triggers a git push to Vercel.
