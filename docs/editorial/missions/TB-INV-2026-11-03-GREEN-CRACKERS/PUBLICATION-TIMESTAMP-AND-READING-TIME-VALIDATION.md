# Publication Timestamp and Reading Time Validation

**Mission ID:** `TB-INV-2026-11-03-GREEN-CRACKERS`  
**Story Slug:** `delhi-green-cracker-enforcement-diwali-2026`  
**Audit Date:** 2026-11-03  
**Status:** `VERIFIED & LOCKED`

---

## Part 1: Publication Timestamp Semantics & Contract Tracing

### 1. Architectural Problem Analysis
In the previous execution report, the review-stage candidate was initialized with:
```typescript
status: 'review',
publicationStatus: 'scheduled',
publishedAt: '2026-11-03T20:00:00Z',
```
This created a semantic contradiction:
1. `publishedAt` represents the real wall-clock moment a story was released to the public. Setting it to a historical timestamp on an unreleased draft asserts that publication has already taken place.
2. In the PostgreSQL schema (`public.stories`), `published_at` is a nullable timestamp with time zone (`timestamptz NULL`). All existing database migration scripts and repository contracts keep `published_at` set to `NULL` while a story is in `'draft'`, `'review'`, or `'scheduled'` state.
3. If downstream services (e.g., SEO generators, feed formatters, or archival loggers) read `story.publishedAt` without inspecting `publicationStatus`, they could inadvertently expose false historical publication dates.

### 2. Full Codebase Contract Trace

| System Layer | File / Location | Field & Type | Semantic Rule |
|:---|:---|:---|:---|
| **PostgreSQL DB** | `supabase/migrations/*` | `stories.published_at timestamptz NULL` | Must be `NULL` while `status != 'published'`. Populated via `now()` at publication time. |
| **Canonical Type** | [`types/canonical.ts`](file:///c:/newsjack-content/thebreakdown-os/types/canonical.ts#L142) | `publishedAt: string` | Represents publication timestamp. For unpublished drafts, empty string `''` represents unassigned state. |
| **Scheduling Type** | [`types/canonical.ts`](file:///c:/newsjack-content/thebreakdown-os/types/canonical.ts#L172) | `scheduledAt?: string` | Represents the intended publication schedule. Preserves target release time without asserting publication. |
| **Publication Policy** | [`lib/story/publication.ts`](file:///c:/newsjack-content/thebreakdown-os/lib/story/publication.ts#L54-L68) | `isPubliclyPublished(ctx, now)` | Returns `false` unless `publicationStatus === 'published'`, `publishedAt` is valid, and `publishedAt <= now`. |
| **Publication Gate 8** | [`lib/editorial/publication-gate.ts`](file:///c:/newsjack-content/thebreakdown-os/lib/editorial/publication-gate.ts#L190-L196) | `has_published_at` | Checks `typeof story.publishedAt === 'string' && story.publishedAt.length > 0`. |
| **Publication Authority** | [`lib/editorial/canonical-publication.ts`](file:///c:/newsjack-content/thebreakdown-os/lib/editorial/canonical-publication.ts#L88-L139) | `evaluatePublicationContractAsync` | Resolves `effectivePublishedAt = targetStory.publishedAt || existingStory?.publishedAt || now.toISOString()`. |
| **Repository Guard** | [`services/repositories/supabase/story.ts`](file:///c:/newsjack-content/thebreakdown-os/services/repositories/supabase/story.ts#L61-L70) | `saveStory` | Direct writes with `status = 'published'` without single-use publication token are forbidden. |

### 3. Contractual Remediation
1. **Draft State Correction:**
   In [`lib/editorial/drafts/delhi-green-crackers.ts`](file:///c:/newsjack-content/thebreakdown-os/lib/editorial/drafts/delhi-green-crackers.ts), the candidate now specifies:
   ```typescript
   status: 'review',
   publicationStatus: 'scheduled',
   publishedAt: '',
   scheduledAt: '2026-11-03T20:00:00Z',
   ```
2. **Canonical Publication Engine Update:**
   In [`lib/editorial/canonical-publication.ts`](file:///c:/newsjack-content/thebreakdown-os/lib/editorial/canonical-publication.ts), both `evaluatePublicationContractAsync` and `evaluatePublicationContract` were updated to construct the gate evaluation story with:
   ```typescript
   const publishedAt = targetStory.publishedAt || existingStory?.publishedAt || now.toISOString();
   const storyToValidate: Story = {
     ...targetStory,
     status: fromStatus === 'draft' ? 'draft' : (fromStatus === 'published' ? 'scheduled' : fromStatus),
     publishedAt,
   };
   ```
   **Why this preserves gate integrity:**
   - Standalone review drafts (`publishedAt: ''`) evaluated outside the publication workflow fail Gate 8 (`has_published_at`), exactly as expected for unpublished content.
   - Authorized publication workflows evaluate the story against the timestamp that will actually be stamped upon transition (`now.toISOString()`), passing Gate 8 without requiring artificial draft modifications.
   - Gate 8 itself remains strict and was not modified or weakened.

---

## Part 2: Reading Time Calculation & Word-Count Parity

### 1. Platform Reading Metric Methodology
The platform extracts narrative prose from content blocks in accordance with [`lib/story/narrative-metrics.ts`](file:///c:/newsjack-content/thebreakdown-os/lib/story/narrative-metrics.ts):
- Only blocks with types in `NARRATIVE_BLOCK_TYPES` (`paragraph`, `paragraph-text`, `text`, `rich-text`, `blockquote`, `quote`, `pullquote`) and belonging to the `main` region are counted.
- Headlines, summaries, FAQs, timelines, claims ledgers, source registers, charts, captions, and CMS metadata are strictly excluded.
- Words are extracted using the Unicode regex `/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu`.
- The editorial reading speed is set by constant `EDITORIAL_READING_WORDS_PER_MINUTE = 220`.

### 2. Exact Calculation for Delhi Green-Crackers Investigation

$$\text{Narrative Prose Blocks} = 26 \text{ blocks}$$
$$\text{Total Extracted Words} = 2,780 \text{ narrative words}$$
$$\text{Raw Reading Time} = \frac{2,780}{220} = 12.636363\dots \text{ minutes}$$
$$\text{Platform Estimate} = \lceil 12.636363\dots \rceil = \mathbf{13 \text{ minutes}}$$

### 3. Discrepancy Reconciliation

| Measurement | Prior Baseline | Corrected Baseline | Delta / Status |
|:---|:---:|:---:|:---:|
| **Narrative Word Count** | 2,780 words | 2,780 words | Unchanged |
| **Platform Target Rate** | 220 wpm | 220 wpm | Constant |
| **Calculated Reading Time** | 13 minutes | 13 minutes | Exact |
| **Declared Story Reading Time** | 10 minutes | 13 minutes | Corrected (+3 min) |
| **Absolute Discrepancy** | 3 minutes | 0 minutes | **0 minutes** |
| **Percentage Discrepancy** | 23.07% | 0.00% | **0.0% (Exact Match)** |
| **Gate 16 (`reading_time_consistency`)** | Narrow Pass (23% < 25%) | Robust Pass (0% diff) | **PASSED** |

---

## Part 3: Regression Suite Verification

The behavior outlined above is programmatically verified by [`tests/editorial/green-cracker-publication-safety.test.ts`](file:///c:/newsjack-content/thebreakdown-os/tests/editorial/green-cracker-publication-safety.test.ts), registered in [`vitest.config.js`](file:///c:/newsjack-content/thebreakdown-os/vitest.config.js):

- `it('review-stage story must NOT carry a premature non-empty publishedAt timestamp')` → **PASSED**
- `it('story is not publicly viewable under isCanonicalStoryPublic predicate')` → **PASSED**
- `it('standalone draft evaluation fails Gate 8 (has_published_at) because publishedAt is empty')` → **PASSED**
- `it('canonical publication evaluator supplies publication timestamp candidate and passes Gate 8')` → **PASSED**
- `it('narrative word count is exactly 2,780 words')` → **PASSED**
- `it('platform reading time calculation at 220 wpm yields 13 minutes')` → **PASSED**
- `it('declared reading time matches calculated reading time with 0% discrepancy')` → **PASSED**
- `it('publication Gate 16 (reading_time_consistency) passes')` → **PASSED**
