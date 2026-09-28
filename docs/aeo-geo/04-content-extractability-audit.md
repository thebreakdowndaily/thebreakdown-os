# Content Extractability Audit — AEO/GEO Baseline

## Definition

Content extractability measures how reliably a machine (crawler, answer engine, AI system) can extract the meaningful content of an article — independently of CSS, JavaScript, or visual styling.

---

## 1. Story Page Extractability

### Architecture

`/story/[slug]` → `StoryPage` → `StoryShell` → blocks rendered by the story engine

The story content is rendered through a block-based engine (`StoryBlock[]`). Each block has `type` and `data` fields. This is a strong architecture for extractability IF the HTML output uses semantic tags.

### What we know (static analysis):

**Server-rendered:** The story page uses `export const revalidate = 60` (ISR) and `export default async function StoryPage(...)` — it is a Server Component. This means:
- Content is in the initial HTML response ✅
- No client-side-only rendering barrier ✅
- Crawlers receive full content without JavaScript ✅

**What we cannot verify without a browser/build:**
- Whether `<article>`, `<h1>`, `<section>`, `<time>`, `<blockquote>` are used correctly
- Whether the answer summary (when implemented) appears before the narrative
- Whether the reading mode selector (`?mode=quick`) would prevent bots from getting full content (it shouldn't — the default is `standard`)

### Assessment: ✅ LIKELY PASS (architecture is correct)

**Risk:** If `StoryShell` renders critical content inside client-only components (e.g., via `useEffect`), that content won't be in the initial HTML. This needs browser verification.

---

## 2. AEO Content Structure

### Question-Answer Extractability

**Current situation:**
- Stories have `faq: FAQItem[]` (question + answer pairs) ✅
- When FAQ blocks exist, they are emitted as `FAQPage` JSON-LD ✅
- However, there is no `answerSummary` or `executiveAnswer` field on the `Story` type
- No structured "What happened?" / "Why it matters?" machine-readable layer

**Required for AEO:**
```
Article opens with answer (not buried in paragraph 6)
  ↓
Structured key facts (label → value → source)
  ↓
Evidence section (claim → source → tier)
  ↓
FAQ (questions readers actually ask)
  ↓
What we know / don't know
```

**Current story structure (inferred from block types):**
- No guaranteed "answer first" block
- Content determined entirely by editorial block order
- No machine-identifiable "executive summary" block distinct from `summary`

### Gap: No AEO Content Layer (P1)

The `Story.summary` field is 155-character truncated for meta description. It is not optimised as an answer-engine answer. An `answerSummary` field should be:
- 40–100 words
- Direct answer to "what happened / what changed"
- Factual, no hype
- Updated when material facts change

---

## 3. Chapter Extractability (Knowledge System)

`TBSStory` (used for series chapters) has significantly better AEO structure:
- `keyFacts[]` with `claim`, `source`, `confidence` ✅
- `evidence[]` with `claim`, `source`, `confidence`, `verifiedAt` ✅
- `faq[]` ✅
- `timeline[]` ✅
- `whyItMatters` field ✅
- `takeaways[]` ✅
- `futureOutlook` with uncertainty flag ✅

**These chapters are already AEO-capable at the data level.** The gap is whether they are:
1. Emitted as structured data (not fully — no `about`, `mentions` in JSON-LD)
2. Rendered in semantic HTML with identifiable sections

---

## 4. Source/Claim Extractability

### Current

Sources are stored as `Source[]` on each story:
```typescript
interface Source {
  id?: string;
  title: string;
  url: string;
  accessedAt: string;
  tier: ConfidenceTier;  // 1–5
  publisher?: string;
}
```

These are visible to machine extractors via the `citation` field in `WebPage` JSON-LD (emitted in `jsonld-story.ts:53`).

### Gap

- No `sourceType` field (government/court/academic/etc.)
- No `publishedAt` on sources (only `accessedAt`)
- Claim → Source linkage is in the type system (`Claim.sourceUrl`) but not in JSON-LD
- `story.claims` array is not emitted in any structured data

**The claim-source relationship exists in the data but is invisible to machines.**

---

## 5. What the Machine Can Extract Today (Story Page)

| Extractable | Method | Notes |
|-------------|--------|-------|
| Headline | HTML `<title>` + `<h1>` (assumed) + JSON-LD | ✅ |
| Description/summary | `<meta name="description">` + JSON-LD | ✅ |
| Author name | JSON-LD (wrong type) | ⚠️ as Organization |
| Publisher | JSON-LD | ✅ |
| Publication date | JSON-LD + OG meta | ✅ |
| Modified date | JSON-LD + OG meta | ✅ |
| Category/section | JSON-LD `articleSection` | ✅ |
| Tags/keywords | JSON-LD `keywords` + meta | ✅ |
| Images | JSON-LD `ImageObject` | ✅ |
| FAQ pairs | JSON-LD `FAQPage` | ✅ conditional |
| Sources | JSON-LD `WebPage.citation` | ⚠️ partial |
| Narrative text | HTML body (Server Component) | ✅ assumed |
| Claims | — | ❌ |
| Entities mentioned | — | ❌ |
| Corrections | — | ❌ |
| Timeline events | — | ❌ |
| Key facts | — | ❌ |
| Answer summary | — | ❌ |
| "What we don't know" | — | ❌ |

---

## 6. Section Identifiability

For answer engines to reliably extract structured answers, sections need to be identifiable. The current block system uses typed blocks, but it's unclear whether these map to semantic HTML sections with identifiable headings.

**Ideal structure:**
```html
<article>
  <header>
    <h1>Headline</h1>
    <div class="answer-summary">Direct answer...</div>
  </header>
  <section id="what-happened">
    <h2>What happened</h2>
    ...
  </section>
  <section id="why-it-matters">
    <h2>Why it matters</h2>
    ...
  </section>
  <section id="evidence">
    <h2>Evidence</h2>
    ...
  </section>
  <section id="sources">
    <h2>Sources</h2>
    ...
  </section>
</article>
```

**Action required (P1):** Browser test to verify HTML semantic structure.
