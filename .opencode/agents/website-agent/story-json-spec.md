# Story JSON Specification — Field Reference

Story JSON is the verified intermediate format that flows from the pipeline into the Website Builder. Every field is sourced from a pipeline agent output. The Website Builder's `buildStory()` function transforms this into a `PageSpec` that the React components render.

## TypeScript Interface

Reference: `website/utils/types.ts` → `StoryJSON` interface

## Field Map

### Identity Fields

| Field | Type | Required | Source | Notes |
|-------|------|----------|--------|-------|
| `id` | `string` | Yes | Generated | Format: `{YYYY-MM-DD}-{slug}` |
| `slug` | `string` | Yes | Generated | URL-safe, lowercase, hyphens |
| `headline` | `string` | Yes | Writer | Main narrative title |
| `summary` | `string` | Yes | Writer/Architecture | 2-3 sentences, ≤ 160 chars for SEO |
| `heroImage` | `string?` | No | Visual/Writer | Path to hero image |
| `publishedAt` | `string` | Yes | Generated | ISO 8601 timestamp |
| `updatedAt` | `string` | Yes | Generated | ISO 8601 timestamp |
| `readingTime` | `number` | Yes | Computed | `ceil(wordCount / 200)` |
| `wordCount` | `number?` | No | Computed | Total word count of narrative |

### Author

| Field | Type | Required | Source | Notes |
|-------|------|----------|--------|-------|
| `author.name` | `string` | Yes | Writer | Full name |
| `author.avatar` | `string?` | No | Writer | Avatar image path |
| `author.bio` | `string?` | No | Writer | Short bio line |
| `author.url` | `string?` | No | Writer | Author page URL |

### Classification

| Field | Type | Required | Source | Notes |
|-------|------|----------|--------|-------|
| `evidenceScore` | `number` | Yes | Verification | 0-100, composite confidence |
| `verificationScore` | `number` | Yes | Verification | 0-100, overall verification |
| `category` | `string` | Yes | Architecture | One of: economy, policy, technology, geopolitics, society, environment |
| `tags` | `string[]` | Yes | Entities+Writer | Deduplicated merge |

### Narrative Content

| Field | Type | Required | Source | Notes |
|-------|------|----------|--------|-------|
| `keyPoints` | `string[]` | Yes | Architecture | 3-5 bullet points, ≤ 200 chars each |
| `body` | `string?` | No | Writer | Full narrative text (fallback) |
| `timeline` | `TimelineEvent[]` | Yes | Timeline Agent | Chronological, date-sorted |
| `facts` | `Fact[]` | Yes | Research | Key statistics with source |
| `claims` | `Claim[]` | Yes | Verification | Verified claims with confidence |
| `faq` | `FAQItem[]` | Yes | Writer/Architecture | Q&A pairs |

### Sources

| Field | Type | Required | Source | Notes |
|-------|------|----------|--------|-------|
| `sources` | `Source[]` | Yes | Research | All cited sources, deduped by URL |
| `primarySources` | `PrimarySource[]` | Yes | Research | Tier 1 sources only |

### Data & Visuals

| Field | Type | Required | Source | Notes |
|-------|------|----------|--------|-------|
| `datasets` | `Dataset[]` | Yes | Research | Raw data tables |
| `charts` | `ChartDef[]` | Yes | Visual Plan | Charts from visual specs |
| `geoData` | `GeoData?` | No | Visual Plan | Map regions data |
| `visuals` | `object?` | No | Visual Plan | Non-chart visuals (globe, SVG, animation, infographic) |

### Related Content

| Field | Type | Required | Source | Notes |
|-------|------|----------|--------|-------|
| `relatedStories` | `RelatedStory[]` | Yes | Knowledge Graph | 3-5 most relevant |
| `relatedEntities` | `RelatedEntity[]` | Yes | Entities+KG | All resolved entities |
| `debate` | `Debate?` | No | Writer/Architecture | Competing viewpoints |

---

## Data Flow Diagram

```
Writer Agent         →  story.json (narrative)
       │
Research Agent       →  research.json (sources, datasets)
       │
Verification Agent   →  verification.json (claims, confidence)
       │
Entity Agent         →  entities.json (resolved entities)
       │
Timeline Agent       →  timeline.json (key events)
       │
Knowledge Graph      →  knowledgeGraph.json (relationships)
       │
Visual Intelligence  →  visualPlan.json (chart/map/globe specs)
       │
Architecture Agent   →  architecture.json (structure, flow)
       │
       ▼
┌─────────────────────────────────────────────┐
│         Website Agent                       │
│  Merge, Transform, Validate, Assemble      │
│  ───────────────────────────────────────    │
│  • Resolve story identity                   │
│  • Map entities to KG nodes                 │
│  • Embed visual specs                       │
│  • Validate completeness (90% threshold)    │
│  • Store version in Memory Engine           │
└─────────────────────────────────────────────┘
       │
       ▼
   StoryJSON  ──→  Website Builder (buildStory())
                    │
                    ▼
                 PageSpec  ──→  SectionRenderer
                                   │
                                   ▼
                              15 Section Components
                                   │
                                   ▼
                          8 Visual Renderers
                          (ChartRenderer, MapRenderer,
                           GlobeRenderer, SVGRenderer,
                           TimelineRenderer, InfographicRenderer,
                           AnimationRenderer, StatisticsGrid)
```

## Validation Rules

1. **No null required fields**: Every required field must be a non-null, non-empty value
2. **URL format**: All URL fields must start with `http://`, `https://`, or `/`
3. **Date format**: All date strings must be ISO 8601 with timezone
4. **Slug format**: Must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`
5. **Evidence score range**: Must be 0-100
6. **Claim verification values**: Must be one of: `true`, `false`, `misleading`, `unverifiable`
7. **Source tier values**: Must be 1-5
8. **Category values**: Must be one of: economy, policy, technology, geopolitics, society, environment
9. **Related stories limit**: Maximum 10, recommend 3-5
10. **Related entities limit**: Maximum 20, recommend 5-10

## Example Minimal StoryJSON

```json
{
  "id": "2026-07-02-digital-rupee-impact",
  "slug": "digital-rupee-impact",
  "headline": "Digital Rupee: One Year of CBDC in India",
  "summary": "Analyzing the impact of India's Central Bank Digital Currency one year after public rollout.",
  "publishedAt": "2026-07-02T06:00:00Z",
  "updatedAt": "2026-07-02T06:00:00Z",
  "readingTime": 8,
  "wordCount": 1600,
  "author": { "name": "Anjali Sharma", "bio": "Senior Investigative Journalist" },
  "evidenceScore": 91,
  "verificationScore": 94,
  "category": "technology",
  "tags": ["CBDC", "digital rupee", "RBI", "digital currency"],
  "keyPoints": ["CBDC transactions crossed ₹500 crore in first year", "22 banks integrated with e-Rupee app"],
  "timeline": [],
  "facts": [{ "label": "CBDC Users", "value": "4.2 million", "source": "RBI Annual Report" }],
  "claims": [],
  "sources": [{ "name": "RBI", "url": "https://rbi.org.in", "type": "government", "tier": 1, "accessedAt": "2026-07-01" }],
  "datasets": [],
  "charts": [],
  "faq": [],
  "primarySources": [],
  "relatedStories": [],
  "relatedEntities": []
}
```
