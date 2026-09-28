# AI Discoverability Audit — AEO/GEO Baseline

## 1. AI Retrieval Readiness Assessment

### Overall: ⚠️ PARTIAL — Strong Foundation, Missing AEO Layer

The Breakdown has better foundational infrastructure than most news publishers at this stage. The canonical type system, evidence model, and server-rendered architecture all support AI retrieval. The primary gaps are in the machine-readable *presentation* of that information.

---

## 2. What AI Systems Can Currently Extract

When a major AI system (ChatGPT, Gemini, Perplexity, etc.) crawls The Breakdown:

**Can extract:**
- Page title and description ✅
- Publication date and modification date ✅
- Author name (but incorrectly typed as Organization) ⚠️
- Article category and tags ✅
- Source URLs (list, no type hierarchy) ⚠️
- FAQ questions and answers (when present in blocks) ✅
- Narrative text (server-rendered) ✅ (assumed)

**Cannot extract:**
- Which source supports which claim ❌
- Whether content is original reporting or aggregated ❌
- Evidence tier / confidence level ❌
- Named entities mentioned in the article (beyond tags) ❌
- Correction history ❌
- "What we know" vs "What we don't know" ❌
- Timeline of events (not in JSON-LD) ❌
- Key facts as structured data ❌
- Answer to "What happened?" as a distinct machine-readable field ❌

---

## 3. llms.txt Assessment

### Status: ❌ ABSENT

No `/public/llms.txt` and no `app/llms.txt/route.ts` exists.

### What llms.txt is (and isn't)

`llms.txt` (proposed by Jeremy Howard, 2024) is an informal convention — not a W3C or IETF standard. It proposes a plain-text document at `/llms.txt` that provides a site summary and links to key resources optimized for LLM consumption.

**Evidence base for adoption:** Limited. Major AI providers (OpenAI, Anthropic, Google) have not publicly confirmed that they read or act on `llms.txt`. It has gained adoption among developer tools and documentation sites.

**Decision for The Breakdown:** Implement with documented limitations as a P3 experiment.

**If implemented, `/llms.txt` should contain:**
```text
# The Breakdown

> Independent, evidence-backed journalism on Indian policy, politics, and society.

The Breakdown is a knowledge platform that produces deeply reported, structured journalism 
on Indian affairs. All content follows the Editorial Constitution (https://thebreakdown.in/editorial-constitution).

## Editorial Standards
- https://thebreakdown.in/methodology
- https://thebreakdown.in/trust
- https://thebreakdown.in/editorial-constitution

## Key Collections
- India and the World: https://thebreakdown.in/series/india-and-the-world
- [other series as they are published]

## What The Breakdown publishes
Original reporting, evidence-based analysis, and structured knowledge objects on:
- Indian foreign policy and strategic affairs
- Economic policy and data
- Governance and public policy

## Licensing and citation
Content may be cited with attribution. For permissions: [contact]

## Corrections
https://thebreakdown.in/corrections [when this page exists]
```

**What llms.txt should NOT contain:**
- Claims about AI rankings ("The Breakdown is cited by ChatGPT")
- Fabricated authority signals
- Keyword-stuffed descriptions

---

## 4. AI Crawler Policy

### Current robots.txt

No AI-specific user-agent blocks. The default `*` allow policy applies to all crawlers including:
- GPTBot (OpenAI)
- Google-Extended
- PerplexityBot
- ClaudeBot (Anthropic)
- CCBot (Common Crawl)

**Assessment: ✅ CORRECT** — Blocking these crawlers would counteract GEO goals. The current policy is appropriate for a publication that wants to be cited by AI systems.

**Documentation required:** Maintain a documented crawler policy that explains why each class of crawler is allowed/blocked.

### What AI crawlers can and cannot do

| Crawler | Access | Behaviour | Policy |
|---------|--------|-----------|--------|
| Googlebot | Allowed | Standard web crawl | Allow — needed for search |
| Google-Extended | Allowed (by default) | Training data | Allow — content is public journalism |
| GPTBot | Allowed (by default) | Training data | Allow — content is public journalism |
| PerplexityBot | Allowed (by default) | Real-time retrieval | Allow — GEO goal |
| ClaudeBot | Allowed (by default) | Training data | Allow |
| CCBot | Allowed (by default) | Common Crawl | Allow |
| Ahrefs/SEMrush | Allowed (by default) | SEO research | Acceptable |

**Important:** Allowing these crawlers does NOT guarantee:
- Citation in AI responses
- Correct attribution
- Any particular ranking

It only ensures the content is accessible to be indexed.

---

## 5. AEO Question Coverage

**Current question-answer support:**

The `faq: FAQItem[]` field on Story and Entity provides question-answer pairs. When FAQ blocks exist in story content, they become `FAQPage` JSON-LD.

**What's missing:**

| Question Class | AEO Field Needed | Status |
|---------------|------------------|--------|
| "What happened?" | `answerSummary` | ❌ Missing on Story |
| "Why does it matter?" | `whyItMatters` | ❌ Missing on Story (exists on TBSStory) |
| "Who is affected?" | `whoIsAffected` | ⚠️ Exists on Story as string |
| "What changed?" | `answerSummary` (delta-focused) | ❌ Missing |
| "What is uncertain?" | `whatIsUnknown` | ❌ Missing entirely |
| "What evidence exists?" | Machine-readable via `claims[]` + `evidence[]` | ❌ Not in JSON-LD |
| "What is the primary source?" | Source type classification | ❌ Missing |

**Note:** `story.whoIsAffected` exists as a string field but is not emitted in any structured data.

---

## 6. Topical Authority Assessment

AI systems build topical authority models from:
1. Consistent coverage of a topic over time
2. Unique/original content on the topic
3. Being cited by other authoritative sources
4. Internal link density around a topic

**What The Breakdown has:**
- Consistent topic coverage via `relatedTopicIds` ✅
- Topic pages (`/topic/[slug]`) ✅
- Internal links to topics from story pages (max 6 per story) ⚠️
- No machine-readable "original reporting" signal ❌

**What's needed for topical authority:**
- Clear "about" metadata on each page: `about: [{ "@type": "Thing", name: "India Foreign Policy" }]`
- `mentions` array for named entities in NewsArticle
- Consistent entity naming/canonicalization

**Current JSON-LD gap:** The `about` field in the current `WebPage` schema uses raw tags, not properly typed entities:
```typescript
about: story.tags?.map((t) => ({ '@type': 'Thing', name: t })) || []
```
This is better than nothing but uses unstructured tags rather than canonical entity identifiers.

---

## 7. GEO Measurement Infrastructure

### Status: ❌ NOT IMPLEMENTED

No system exists to measure:
- Whether The Breakdown is mentioned in AI responses
- Whether citations are correct
- Whether attributed claims match the source story
- AI mention rate, citation rate, accuracy rate

**Required components (Phase 10):**
1. Query database (`ai_visibility_observation` table)
2. Manual observation recording UI (for editors)
3. Query set for selected story topics
4. Evaluation rubric (0–4 accuracy scale)
5. Dashboard

**Important constraint:** Cannot automate AI system queries beyond their ToS. Human-led spot-check process is required.

---

## 8. Content Chunking for AI Retrieval

AI retrieval systems (especially RAG-based) retrieve content in chunks. The Breakdown's block-based content system is well-suited for chunking IF:
- Each block renders as a semantically complete section
- Section headings are clear and descriptive
- The answer to the main question appears early in the article

**Current risk:** Long contextual blocks before the actual answer may cause RAG systems to retrieve irrelevant chunks. The `answerSummary` field, when implemented, directly addresses this.

---

## 9. Brand Entity Consistency

**Brand names observed:**
- "The Breakdown" (primary)
- "The Breakdown Daily" (appears in some references)
- "The Breakdown News" (potential confusion)
- `thebreakdown.in` (domain)
- `thebreakdowndaily/thebreakdown-os` (repository corpus name)

**Recommendation:** Standardize on "The Breakdown" as the canonical name. The Organization schema should emit this consistently. Internal documents should align.

**Current Organization schema:**
```json
{ "name": "The Breakdown" }
```
This is correct. Ensure editorial materials and email signatures use the same name.

---

## 10. AI Search Test (Theoretical — Requires Manual Verification)

For the story `/story/rbi-repo-rate`, an AI query "What is the RBI repo rate?" should ideally:
1. Return The Breakdown's explanation ✅ (if content is strong)
2. Attribute it to The Breakdown ❓ (depends on AI provider)
3. Cite `https://thebreakdown.in/story/rbi-repo-rate` ❓ (not measurable without observation)
4. Credit the author ❌ (currently impossible — no author entity)

To verify, manual spot-checks using the query set defined in `docs/aeo-geo/measurement.md` should be conducted after implementation.
