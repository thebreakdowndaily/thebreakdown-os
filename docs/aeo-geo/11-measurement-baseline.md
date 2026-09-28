# Measurement Baseline — AEO/GEO Audit

## 1. Current State

No AEO/GEO-specific measurement system exists. The following measurement infrastructure currently exists:

| System | Status |
|--------|--------|
| Google Analytics (GA4) | ✅ Configured via `NEXT_PUBLIC_GA_MEASUREMENT_ID` |
| Sentry (error tracking) | ✅ Configured |
| Landing/Interaction trackers | ✅ `LandingTracker`, `InteractionTracker` components |
| Content page tracker | ✅ `ContentPageTracker` component |
| Lighthouse audit | ❌ Placeholder script only |
| Schema validation | ❌ Placeholder script only |
| Link health check | ❌ Not implemented |
| AI visibility observation | ❌ Not implemented |

---

## 2. Metrics Framework (Target State)

### Technical Metrics (Automated)

| Metric | Method | Target |
|--------|--------|--------|
| Indexed URL count | Google Search Console API | Track weekly |
| Valid canonical % | Build-time validation | 100% |
| Sitemap validity | `npm run validate:sitemap` | 100% |
| Schema validity % | `npm run validate:schema` | 100% |
| 404 rate | GSC / server logs | <1% |
| Core Web Vitals (LCP) | Lighthouse / GSC | <2.5s |
| Core Web Vitals (INP) | Lighthouse / GSC | <200ms |
| Core Web Vitals (CLS) | Lighthouse / GSC | <0.1 |
| TTFB | Server monitoring | <600ms |

### Content Metrics (Manual + Automated)

| Metric | Method | Target |
|--------|--------|--------|
| Stories with `answerSummary` | Build-time count | 100% of new stories |
| Stories with ≥1 typed source | Data audit | 100% of published |
| Stories with ≥1 claim linked to source | Data audit | 80%+ |
| Entity coverage per story | Automated count | 3+ entities per story |
| Internal link coverage | Build-time scan | 3+ per story |
| Freshness: stories reviewed within 30 days | Freshness registry | 90%+ |

### AEO Metrics (Manual)

| Metric | Method |
|--------|--------|
| Question answerability | Manual spot-check: can FAQs be answered from page? |
| Answer extraction success | Manual test: extract answer without reading full page |
| Answer completeness | Rubric: 0–4 scale |
| Answer accuracy | Rubric: 0–4 scale |

### GEO Metrics (Manual Observation)

> These cannot be automated without violating AI provider terms of service.

| Metric | Method | Recording |
|--------|--------|-----------|
| AI mention rate | Manual spot-check queries | `ai_visibility_observation` record |
| AI citation rate | Manual spot-check queries | `ai_visibility_observation` record |
| Correct citation rate | Verify cited URL is correct | `citation_correct: boolean` |
| Citation attribution rate | Check if The Breakdown named | `mentioned: boolean` |
| Story retrieval rate | Check if specific story surfaced | `story_id: string` |
| Entity recognition rate | Check if entities correctly named | Manual rubric |

---

## 3. GEO Observation Schema (Target)

```sql
-- Supabase table: ai_visibility_observations
CREATE TABLE ai_visibility_observations (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  engine      TEXT NOT NULL,          -- 'chatgpt' | 'gemini' | 'perplexity' | 'copilot' | 'google_ai_overview'
  query       TEXT NOT NULL,          -- The exact query submitted
  query_id    TEXT,                   -- Internal query set ID (e.g., 'Q001')
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  story_id    TEXT,                   -- Breakdown story slug if relevant
  mentioned   BOOLEAN NOT NULL,       -- Was The Breakdown mentioned?
  cited       BOOLEAN NOT NULL,       -- Was a URL cited?
  citation_url TEXT,                  -- The URL that was cited (if any)
  citation_correct BOOLEAN,           -- Does the cited URL match the expected story?
  answer_accuracy SMALLINT,           -- 0=incorrect 1=incomplete 2=mostly 3=correct 4=correct+sourced
  notes       TEXT,                   -- Verbatim response excerpt or notes
  observer    TEXT                    -- Editor who ran the check
);
```

---

## 4. Query Set (Target — 30 Seed Queries)

A query set is a controlled set of questions submitted to AI systems periodically to observe citation/mention behaviour. Questions should be:
- Factual (not opinion-based)
- About topics The Breakdown has genuinely reported on
- Phrased as natural reader questions, not search engine queries

**Example seed queries for India and the World, Vol I:**

| ID | Query | Expected story |
|----|-------|----------------|
| Q001 | What happened between India and China in 1962? | `indias-inheritance` or future chapter |
| Q002 | What was India's Non-Alignment Movement position? | Vol I chapter |
| Q003 | What did Nehru believe about India's foreign policy? | Vol I chapter |
| Q004 | What was the Panchsheel agreement? | Vol I chapter |
| Q005 | What is India's repo rate? | `rbi-repo-rate` |
| Q006 | What is MGNREGA? | `mgnrega-reform` |
| Q007 | How does UPI work in India? | Tracker / story |

Queries should be reviewed and extended as new stories are published.

---

## 5. Accuracy Rubric

| Score | Definition |
|-------|-----------|
| 0 | AI response is factually incorrect about the topic |
| 1 | AI response is materially incomplete — omits key facts The Breakdown reported |
| 2 | AI response is mostly correct but misses nuance or context from The Breakdown |
| 3 | AI response is correct and matches what The Breakdown reported |
| 4 | AI response is correct, matches The Breakdown, and cites The Breakdown |

**Important:** Only a score of 4 counts as a successful GEO outcome. Score 3 means the information is accessible but The Breakdown gets no attribution credit.

---

## 6. Measurement Cadence

| Frequency | Activity |
|-----------|----------|
| Every build | Schema validation, canonical check, sitemap validation |
| Weekly | Manual GEO spot-check (5–10 queries across 2–3 AI engines) |
| Monthly | Full GEO query set run, content health audit, freshness review |
| Quarterly | Competitor citation comparison, content gap analysis |

---

## 7. What Not to Measure

> Do not create a composite "AEO score" or "GEO score" that combines all metrics into a single number. This produces vanity metrics that obscure what actually needs attention.

**Explicitly avoid:**
- "The Breakdown's AI visibility score: 78/100"
- "GEO ranking: #3 for Indian policy"
- "AI citation rate has improved by 40%" (without controlling variables)

**Instead, report dimensions separately:**
- "7 of 10 test queries returned a The Breakdown citation this week"
- "Citation URL was correct in 6 of 7 cases"
- "Answer accuracy averaged 3.1/4 across 10 test queries"

---

## 8. Baseline Measurement (Pre-Implementation)

Before any code changes are made, the following should be recorded as the pre-implementation baseline:

| Metric | Baseline Value | Date |
|--------|---------------|------|
| Schema validation pass rate | Not measured | 2026-09-28 |
| GEO manual spot checks | None conducted | 2026-09-28 |
| Indexed URLs | Not measured | 2026-09-28 |
| Core Web Vitals | Not measured | 2026-09-28 |
| Stories with `answerSummary` | 0 | 2026-09-28 |
| Stories with typed sources | 0 | 2026-09-28 |
| Stories with correct author entity | 0 | 2026-09-28 |
| News sitemap | Does not exist | 2026-09-28 |
| `llms.txt` | Does not exist | 2026-09-28 |

Record post-implementation values once Phase 3 (structured data) is complete.
