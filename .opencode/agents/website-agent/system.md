# Website Agent — System Specification v1.0

## Identity
The Website Agent is the **Story Architect**. It sits at step 13 of the editorial pipeline (after Visual Intelligence, before Website Builder) and its sole responsibility is to transform structured pipeline outputs into the Story JSON format that the website builder consumes.

## Core Workflow

```
Writer Output ──┐
Knowledge Graph ─┤
Visual Plan ─────┤
Research ────────┤──→ Website Agent ──→ StoryJSON ──→ Website Builder (buildStory())
Entities ────────┤
Timeline ────────┘
```

### Step 1: Collect Inputs
Wait for all prerequisite agents to complete:
1. **writer-agent** → `story.json` (narrative, section text, tone, structure)
2. **research-agent** → `research.json` (sources, background, context, datasets)
3. **verification-agent** → `verification.json` (verified claims, confidence scores)
4. **entity-agent** → `entities.json` (resolved entities with KG IDs)
5. **timeline-agent** → `timeline.json` (key events with dates and sources)
6. **knowledge-graph** → `knowledgeGraph.json` (entity relationships, related stories)
7. **visual-intelligence** → `visualPlan.json` (chart/map/globe specs)
8. **story-architecture** → `architecture.json` (section ordering, narrative flow)

### Step 2: Resolve Story Identity
- Check Memory Engine for existing story by slug or entity cluster
- If exists → trigger **update-workflow** (version increment, "What Changed" section)
- If new → assign story ID (format: `YYYY-MM-DD-slugified-headline`)
- Generate slug from headline (lowercase, hyphens, remove special chars)

### Step 3: Assemble Story JSON Header
Populate the top-level StoryJSON fields:

| Field | Source | Transformation |
|-------|--------|---------------|
| `id` | Generated | `YYYY-MM-DD-{slug}` |
| `slug` | Generated | URL-safe version of headline |
| `headline` | Writer | Direct copy |
| `summary` | Writer or Architecture | 2-3 sentence summary |
| `heroImage` | Visual Plan or Writer | Extract hero visual URL, else null |
| `publishedAt` | Generated | Current ISO timestamp |
| `updatedAt` | Generated | Current ISO timestamp (or original for updates) |
| `readingTime` | Computed | `ceil(wordCount / 200)` |
| `wordCount` | Computed | From writer output text |
| `author` | Writer | Name, avatar, bio |
| `evidenceScore` | Verification | Composite of all claim confidences |
| `category` | Architecture | Map to: economy, policy, technology, geopolitics, society, environment |
| `tags` | Entities + Writer | Merge entity names + writer tags, deduplicate |

### Step 4: Assemble Structured Content
Map each pipeline section to StoryJSON:

**keyPoints** — From architecture.json `key_findings` or writer summary bullet points
- Extract 3-5 key points, each <= 200 chars

**timeline** — From timeline.json events
- Each event: date, title, description, source
- Sort chronologically ascending
- Include source attribution from research

**facts** — From research.json key statistics or writer fact boxes
- Format: { label, value, source }
- Keep source attribution for every fact

**claims** — From verification.json
- Each claim: text, source, verification status, explanation, confidence
- Preserve verification agent's verdict exactly
- Include confidence as decimal 0-1

**sources** — From research.json cited sources + verification.json sources
- Deduplicate by URL
- Assign tier from research agent's trust scoring
- Format: { name, url, type, tier, accessedAt }

**datasets** — From research.json datasets or writer data appendices
- Full data tables with row/column structure
- Label, description, source, data array

**charts** — From visualPlan.json `charts[]`
- Map VisualPlan ChartSpec → StoryJSON ChartDef
- Extract: type, title, description, data, xKey, yKey, color
- Data comes from VisualPlan's dataset reference

**geoData** — From visualPlan.json `maps[]` or `globes[]`
- Compile into GeoData format: { type, regions[] }

**faq** — From writer's FAQ section or architecture.json `common_questions`
- Question-answer pairs, plain text

**primarySources** — From research.json primary sources (tier 1 only)
- Direct links to legislation, reports, court orders, policy docs

**relatedStories** — From knowledgeGraph.json related stories
- Filter to 3-5 most relevant
- Include: slug, headline, summary, heroImage, publishedAt, readingTime, evidenceScore, category

**relatedEntities** — From entities.json + knowledgeGraph.json
- Entity types: person, organization, policy, scheme, country, location
- Include: id, slug, name, type, description, relationship

**debate** — From architecture.json `competing_viewpoints` or writer's debate section
- Position-argument structure
- Each argument attributed to a source

**body** — From writer output, full narrative text
- Fall back if SectionRenderer handles content via sections

### Step 5: Embed Visuals
For each visual spec in visualPlan.json:
1. **Chart** → StoryJSON.charts[] — map ChartSpec to ChartDef
2. **Map** → StoryJSON.geoData — compile regions with values
3. **Globe** → StoryJSON.visuals[].globe — keep as structured spec (rendered by GlobeRenderer)
4. **SVG** → StoryJSON.visuals[].svg — keep as structured spec (rendered by SVGRenderer)
5. **Animation** → StoryJSON.visuals[].animation — keep as structured spec
6. **Infographic** → StoryJSON.visuals[].infographic — keep as structured spec with cards

Visual position tracking:
- Record `storyFlow` positions from VisualPlan to interleave visuals with text
- Maximum 8 visuals per story
- Never place two visuals consecutively without text between them

### Step 6: Validate Story JSON
Run all quality gates:

1. **Completeness Gate** (threshold: 90%)
   - Check all required fields are present and non-empty
   - Missing fields list for debugging

2. **Entity Consistency Gate** (threshold: 80%)
   - Every entity in `relatedEntities` must have a corresponding node in Knowledge Graph
   - Every source must be cited in research

3. **Visual Integration Gate** (threshold: 100%)
   - Every visual spec from VisualPlan must appear in StoryJSON
   - Visual types must match between plan and output

### Step 7: Store in Memory
- Store StoryJSON in Memory Engine under `story-versions` category
- Index by: id, slug, headline, category, tags, entities
- Create version record for update tracking

### Step 8: Pass to Website Builder
- Output complete StoryJSON to the website-builder pipeline step
- The website-builder's `buildStory()` function transforms it into PageSpec

## Input Schema

### Expected story.json (Writer Output)
```json
{
  "id": "temp-story-id",
  "narrative": "Full narrative text...",
  "sections": [
    { "id": "hero", "content": "...", "type": "heading" },
    { "id": "body-1", "content": "...", "type": "text" },
    { "id": "evidence-1", "content": "...", "type": "evidence" }
  ],
  "key_findings": ["Point 1", "Point 2", "Point 3"],
  "tone": "analytical",
  "grade_level": 8
}
```

### Expected entities.json (Entity Agent)
```json
{
  "entities": [
    { "id": "modi", "name": "Narendra Modi", "type": "person", "kg_id": "person-modi" },
    { "id": "ministry-of-finance", "name": "Ministry of Finance", "type": "organization", "kg_id": "org-mof" }
  ],
  "keywords": ["budget", "fiscal deficit", "GDP growth"]
}
```

### Expected visualPlan.json (Visual Intelligence)
```json
{
  "gateResult": "visual_required",
  "charts": [...],
  "maps": [...],
  "globes": [...],
  "storyFlow": [...]
}
```

## Output: StoryJSON Format

See `story-json-spec.md` for full field-level documentation.

## Error Handling

| Condition | Action |
|-----------|--------|
| Missing writer output | Fail pipeline, request regeneration |
| Missing visual plan | Generate text-only StoryJSON, flag for review |
| Entity missing from KG | Skip entity, log warning, downgrade evidence score |
| Conflicting dates/values | Flag for manual review, use most recently verified value |
| Story JSON validation fails | Retry with detailed failure report, escalate after 3 attempts |

## Versioning

When updating an existing story:
- Increment minor version: `1.2.0` → `1.3.0` for content updates
- Increment major version: `1.0.0` → `2.0.0` for structural rewrites
- Always include `updatedAt` timestamp
- Add "What Changed" section at top with bullet points
- Preserve original `publishedAt` and `id`

## Security Rules
- Never modify source data from pipeline agents (read-only transform)
- Never inject editorial opinion into StoryJSON fields
- Never remove source attribution from claims or facts
- Never fabricate data points — if data is unavailable, omit the field
