# FixJSON Specification v1.0

The FixJSON is the output schema of the-fix-agent. It transforms verified stories into structured, actionable fix frameworks.

## Top-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier (e.g., `fix-mgnrega-reform`) |
| `slug` | string | yes | URL-safe slug |
| `storySlug` | string | yes | Slug of the parent story this fix is based on |
| `headline` | string | yes | Action-oriented headline |
| `summary` | string | yes | One-paragraph summary of the fix |
| `heroImage` | string | no | Hero image URL |
| `publishedAt` | string | yes | ISO 8601 publish timestamp |
| `updatedAt` | string | yes | ISO 8601 update timestamp |
| `readingTime` | integer | yes | Estimated reading time in minutes |
| `author` | object | yes | `{ name, avatar?, bio? }` |
| `evidenceScore` | number | yes | 0-100 score based on evidence quality |
| `tags` | string[] | yes | 3-5 descriptive tags |

## Framework Sections

### `problem` — FixSection
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | yes | One-line problem statement |
| `content` | string | yes | 2-3 paragraph detailed problem description |
| `supportingData` | array | no | Key data points: `[{ label, value }]` |

### `whoIsAffected` — FixSection
Same structure as `problem`. Quantifies affected populations with demographic breakdowns.

### `rootCauses` — FixSection
Same structure as `problem`. Lists 2-4 structural root causes with evidence links.

### `evidence` — FixSection
Same structure as `problem`. Summarises strongest evidence from the parent story.

### `stakeholders` — Stakeholder[]
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Stakeholder name |
| `type` | string | yes | One of: government, citizen, private-sector, civil-society, international |
| `role` | string | yes | Their role in the problem/solution |
| `interest` | string | yes | Their interest in the outcome |
| `stance` | string | no | One of: supports, opposes, neutral, mixed |

### `existingSolutions` — ExistingSolution[]
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Solution name |
| `description` | string | yes | What it is and how it works |
| `status` | string | yes | active, proposed, expired, failed |
| `effectiveness` | string | no | high, medium, low, unknown |
| `source` | string | no | Source for effectiveness claim |

### `globalExamples` — GlobalExample[]
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `country` | string | yes | Country name |
| `policy` | string | yes | Policy or programme name |
| `description` | string | yes | How it works |
| `outcome` | string | yes | Quantitative outcome |
| `source` | string | no | Verifiable source |
| `applicableToIndia` | boolean | no | Whether model can transfer |

### `recommendedActions`, `citizenActions`, `governmentActions` — FixAction[]
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | yes | Action-oriented title |
| `description` | string | yes | 2-3 sentence description |
| `priority` | string | yes | critical, high, medium, low |
| `timeframe` | string | yes | immediate, short-term, medium-term, long-term |
| `actors` | string[] | yes | Named implementing actors |

### `metricsToTrack` — Metric[]
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Specific metric name |
| `currentValue` | string | yes | Current value or "Unknown" |
| `targetValue` | string | yes | SMART target |
| `dataSource` | string | yes | Source/MIS for data |
| `updateFrequency` | string | yes | How often updated |

## Related Entities

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `relatedStories` | RelatedStory[] | yes | Related stories |
| `relatedEntities` | RelatedEntity[] | yes | Related entities |
| `sources` | Source[] | yes | All sources used |

## Example

```json
{
  "id": "fix-mgnrega-reform",
  "slug": "fix-mgnrega-reform",
  "storySlug": "mgnrega-reform",
  "headline": "Fixing MGNREGA: 5 Reforms to Make Rural Employment Work",
  "problem": {
    "title": "MGNREGA wage rates have not kept pace with inflation",
    "content": "Despite 20 years of operation...",
    "supportingData": [
      { "label": "States where MGNREGA wage < market wage", "value": "12 of 28" }
    ]
  },
  "recommendedActions": [
    {
      "title": "Automatic wage indexation",
      "description": "Link MGNREGA wages to CPI-AL with automatic quarterly revision.",
      "priority": "critical",
      "timeframe": "immediate",
      "actors": ["MoRD", "Ministry of Finance"]
    }
  ],
  "metricsToTrack": [
    {
      "name": "Average wage payment delay",
      "currentValue": "45 days",
      "targetValue": "<15 days",
      "dataSource": "NREGA MIS",
      "updateFrequency": "Monthly"
    }
  ]
}
```
