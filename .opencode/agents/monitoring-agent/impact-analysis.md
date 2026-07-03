# Impact Analysis Engine

## Purpose
Link a detected change to all existing stories it affects, so the editor knows exactly what needs updating.

## Input
- `change` — single change object from any watcher (source, entity_id, entity_name, type, summary)
- `memory_engine` — query interface to Memory Engine
- `knowledge_graph` — query interface to Knowledge Graph

## Process

### Step 1: Entity Resolution
Extract key entities from the change:

```
change.entity_name → extract entities:
  - "Digital Personal Data Protection (Amendment) Bill, 2026"
  - entities: ["Digital Personal Data Protection", "DPDP", "Data Protection Bill"]
  
change.summary → extract entities:
  - "Cabinet approved production-linked incentive for semiconductor fabs"
  - entities: ["Cabinet", "production-linked incentive", "PLI", "semiconductor", "fab"]
  
change.source → derive entities:
  - "supreme-court" → "Supreme Court of India"
  - "rbi" → "Reserve Bank of India", "RBI"
```

Use the Knowledge Graph entity resolution service for fuzzy matching (threshold ≥0.85).

### Step 2: Memory Engine Query
Query the Memory Engine for all stories that match any resolved entity:

```
memory.search({
  query: "Data Protection Bill | DPDP | semiconductor PLI | fab",
  categories: ["story", "policy", "legislation"],
  timeframe: { since: "-90d" },
  max_results: 50
})
```

Priority scoring:
| Criterion | Weight |
|---|---|
| Entity match count | 3x |
| Entity match exactness (0.85-1.0) | 2x |
| Recency (days since publish) | 1.5x (higher for newer) |
| Story topic tag overlap | 1x |
| Source authority match | 1.5x |

Score = sum(weight × factor) for each criterion, normalized 0-100

### Step 3: Knowledge Graph Traversal
For each matched story, traverse the Knowledge Graph (depth 2) to find connected stories:

```
story A (about DPDP Bill) 
  → relates_to → entity "Data Protection"
  → relates_to → story B (about Digital Economy)
  → relates_to → story C (about Big Tech regulation)
```

Add any connected stories to the affected set with deduplication.

### Step 4: Severity Per Story
For each affected story, compute story-level severity:

| Story Severity | Condition |
|---|---|
| **critical** | Change directly invalidates or reverses a story's core claim |
| **major** | Change adds significant new facts or context to a story |
| **minor** | Change provides marginal additional context |
| **none** | Story mentions the entity but the change does not affect its narrative |

### Step 5: Output
```json
{
  "change_id": "chg-2026-7890",
  "total_affected": 3,
  "affected_stories": [
    {
      "story_id": "story-dpdp-bill-2026",
      "title": "India's Digital Personal Data Protection Bill: What Changes",
      "current_version": 1,
      "matched_entities": ["Digital Personal Data Protection"],
      "score": 92,
      "severity": "critical",
      "reason": "Bill status changed from referred_to_committee to passed_in_lok_sabha — core story event",
      "suggested_action": "update_and_republish"
    },
    {
      "story_id": "story-india-tech-regulation-2026",
      "title": "India's Tech Regulatory Landscape in 2026",
      "current_version": 2,
      "matched_entities": ["Data Protection"],
      "score": 65,
      "severity": "major",
      "reason": "DPDP Bill passage is a major addition to the regulatory landscape",
      "suggested_action": "update_and_republish"
    }
  ]
}
```

## Edge Cases
- **No affected stories**: Log change to monitoring history, do not trigger update
- **Change affects 10+ stories**: Flag as "broad impact" — editor may choose to batch update
- **Story has pending update**: Queue change; do not trigger concurrent updates on same story
- **Story was published >90 days ago**: Reduce priority; still include in results but flag as "archived"
- **Multiple changes to same entity within 24h**: Group into single notification with change list
