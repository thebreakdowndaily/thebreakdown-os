# Citation + Evidence Architecture Audit — AEO/GEO Baseline

## 1. Citation Architecture Assessment

### Type System: ✅ WELL-MODELLED

The data model has a complete citation pipeline:

```
Claim.id → Evidence.claimId → Evidence.sourceId → Source.id
```

Evidence additionally carries:
- `hierarchyTier` (8-tier constitutional evidence hierarchy)
- `confidenceScore`
- `verifiedAt`
- `archiveHash` (for source preservation)
- `excerpt` (key passage from the source)

This is a publisher-grade citation model — significantly better than most newsrooms.

---

## 2. What Machines See Today

Despite the strong data model, **machines (crawlers, AI systems) cannot currently read the citation architecture**:

| Citation Element | In Data Model | In JSON-LD | In HTML | Notes |
|-----------------|--------------|------------|---------|-------|
| Source title | ✅ | ✅ (WebPage citation) | Unknown | Via `story.sources` |
| Source URL | ✅ | ✅ (WebPage citation) | Unknown | Not validated for safe schemes |
| Source type | ❌ | ❌ | ❌ | `sourceType` field missing |
| Source published date | ❌ | ❌ | ❌ | Only `accessedAt` exists |
| Claim text | ✅ | ❌ | Unknown | In `story.claims[]` |
| Claim → Source link | ✅ | ❌ | ❌ | Claim has `sourceUrl` but not in schema |
| Evidence tier | ✅ | ❌ | ❌ | 8-tier hierarchy not exposed |
| Evidence confidence | ✅ | ❌ | ❌ | Score not exposed |
| Verification status | ✅ | ❌ | ❌ | Not in schema |

**The key machine-readable gap:** A machine reading the structured data of a story sees a list of source URLs (via `WebPage.citation`) but cannot tell:
- Which claim each source supports
- Whether the source is primary (government document) or secondary (news report)
- How recently the source was verified
- What confidence level was assigned

---

## 3. Source Type Gap

The current `Source` type:
```typescript
interface Source {
  id?: string;
  title: string;
  url: string;
  accessedAt: string;
  tier: ConfidenceTier;  // 1 | 2 | 3 | 4 | 5
  archiveHash?: string;
  publisher?: string;
}
```

**Missing:** `sourceType` to distinguish:
```typescript
type SourceType =
  | 'government'        // Ministry/department publication
  | 'court'             // Court order, judgment
  | 'official'          // Official press release / statement
  | 'academic'          // Peer-reviewed paper
  | 'company'           // Corporate filing, annual report
  | 'dataset'           // Government/research dataset
  | 'interview'         // Original interview
  | 'document'          // Official document (PDF)
  | 'news'              // Secondary source (news report)
  | 'rti'               // RTI response
  | 'parliament'        // Lok Sabha/Rajya Sabha records
  | 'field_report'      // The Breakdown's original field reporting
  | 'other';
```

**Why this matters for GEO:** When an AI system retrieves The Breakdown's reporting and needs to evaluate credibility, it benefits from knowing that a claim is backed by a government dataset rather than an anonymous source. Source type is also what distinguishes original reporting from aggregated news.

---

## 4. Citation Granularity

**Current model:** Each story has a flat `sources[]` array — one list for the entire story.

**Ideal model for AEO/GEO:** 

Claim-level citation:
```
"The PM-FASAL Bima Yojana paid ₹1.45 lakh crore in claims between 2016–2024"
  ↓ supported by
Source: Ministry of Agriculture Dataset, 2024 Annual Report, Table 3.2
  ↓ classified as
type: government, tier: tier_2_government_record, confidence: 0.95
```

The data model supports this (`Claim.sourceUrl`, `Evidence.sourceId`), but it is:
1. Not consistently populated editorially
2. Not emitted in structured data
3. Not rendered in a machine-identifiable way in HTML

---

## 5. Original Reporting Attribution

**No explicit machine-readable signal distinguishes:**
- The Breakdown's original reporting
- A fact sourced from another publication
- An official statement being reported

**What the prompt requires:**
```typescript
type OriginalReportingType =
  | 'original_reporting'
  | 'exclusive'
  | 'field_reporting'
  | 'data_analysis'
  | 'document_analysis'
  | 'interview'
  | 'investigation'
  | 'aggregated';
```

This could be added as an optional field to both `Story` and `Source`.

When The Breakdown publishes original data analysis, this should be signal in the structured data so AI systems can identify and credit original work.

---

## 6. Corrections Machine Visibility

The corrections service exists and is called from the story page:
```typescript
const publishedCorrections = await listPublishedCorrections(slug);
```

Corrections are passed to `StoryShell` for display, but:
- Not emitted in JSON-LD
- Not in metadata
- No `CorrectionComment` schema (Google doesn't have a standard schema for corrections, but it can be expressed via `comment` on `Article`)

**Recommended approach:** Add a `corrections` array to the `NewsArticle` JSON-LD:
```json
{
  "correction": [
    {
      "@type": "CorrectionComment",
      "dateCreated": "2026-03-15T10:00:00+05:30",
      "text": "An earlier version misstated the figure as ₹1.2 lakh crore. The correct figure is ₹1.45 lakh crore."
    }
  ]
}
```
Note: `CorrectionComment` is not a Google Rich Result type but is valid schema.org markup.

---

## 7. Evidence Spine vs. Flat Source List

The Editorial Constitution defines an "Evidence Spine":
```
Research Question → Evidence → Claim → Explanation → Counterargument → Editorial Judgment → Reader Takeaway
```

The data model (`Evidence`, `Claim`, `KnowledgeObservation`) supports this spine. The gap is that this spine is not rendered in a machine-identifiable structure in HTML or JSON-LD.

**Recommendation:** In the AEO layer, implement an optional `evidenceSpine` block type that renders as:
```html
<section class="evidence-spine" aria-label="Evidence summary">
  <div class="claim">...</div>
  <div class="evidence">...</div>
  <div class="source">...</div>
</section>
```
This allows machines (and screen readers) to traverse the evidence chain independently of narrative prose.

---

## 8. Source URL Security

`lib/seo/jsonld-story.ts:53`:
```typescript
citation: story.sources?.map((s: any) => ({
  '@type': 'CreativeWork',
  name: s.title,
  url: s.url,
})) || []
```

Source URLs are emitted directly without sanitization. A malicious URL could be:
- `javascript:alert(1)` — not executable in JSON-LD but incorrect
- `data:text/html,...` — data URI
- An internal localhost URL leaking infrastructure
- A private IP address (SSRF via crawlers is not a real risk, but schema correctness matters)

**Action required (P1):** Before emitting source URLs in JSON-LD, validate they are `https://` or `http://` scheme with a public hostname.

```typescript
function isSafeSourceUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return ['https:', 'http:'].includes(u.protocol) && 
           !isPrivateHostname(u.hostname);
  } catch {
    return false;
  }
}
```
