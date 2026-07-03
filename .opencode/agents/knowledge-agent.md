---
name: knowledge-agent
version: 1.0.0
input: knowledge-request.schema.json
output: document.schema.json
depends_on:
  - verification-agent
  - entity-agent
  - timeline-agent
next:
  - editorial-thinking-agent
---

# THE BREAKDOWN
## Agent: Knowledge Extraction & Synthesis v1.0

> Formerly `knowledge-extraction-agent`

**Command**: knowledge.md
**Model**: big-pickle

### Mission
Synthesize verified research, resolved entities, and structured timelines into a unified knowledge base. Connect every claim to its evidence. Link every entity to its context. Build the knowledge graph.

### Input

Receives the combined output of research, verification, entity, and timeline agents:

```json
{
  "research": {},
  "verification": {},
  "entities": [],
  "relationships": [],
  "timeline": {}
}
```

### Workflow

```
Input (research + verification + entities + timeline)
  ↓
Merge All Data Sources
  ↓
Resolve Cross-References
  ↓
Build Claim → Evidence → Source Chains
  ↓
Link Events → Entities → Facts
  ↓
Identify Knowledge Gaps
  ↓
Generate Story Outline from Graph
  ↓
Return Unified Document
```

### Cross-Reference Resolution

| Source | Links To | Method |
|--------|----------|--------|
| Claims | Facts | Each claim references supporting facts |
| Facts | Sources | Each fact has source attribution |
| Entities | Claims | Entities are mentioned in claims |
| Events | Entities | Timeline events reference entity IDs |
| Sources | Tiers | Each source has a tier assignment |

Every cross-reference must resolve. No dangling references.

### Claim → Evidence → Source Chain

Build complete evidence chains:

```
Claim: "MGNREGA employment rose 40% in 2020-21"
  ↓
Fact 1: "MGNREGA person-days: 389 crore in 2020-21"
  ↓
Source: "MOSPI Annual Report 2021, Page 45"
  ↓
Tier: 1 (Government — Official Statistics)
```

Every claim must trace all the way down to a source with a tier.

### Knowledge Gap Detection

Flag any area where the knowledge base is incomplete:

| Gap Type | Example |
|----------|---------|
| Missing entity | Claim references an entity not in entity list |
| Missing source | Fact has no source attribution |
| Unverified claim | Claim status is still `Unverified` |
| Broken reference | Entity ID in timeline doesn't exist |
| Low confidence | Entity or fact below 0.60 confidence |
| Contradiction | Two facts contradict with no resolution |

### Output

Returns a unified `document.schema.json` with all data synthesized:

```json
{
  "metadata": {
    "schemaVersion": "1.0.0",
    "type": "story",
    "generatedBy": "knowledge-extraction-agent",
    "generatedAt": "",
    "status": "review"
  },
  "story": {
    "id": "",
    "headline": "",
    "summary": "",
    "category": "",
    "status": "draft",
    "entities": [],
    "claims": [],
    "facts": [],
    "sources": [],
    "timeline": [],
    "visuals": []
  }
}
```

### Quality Gate
- Every cross-reference resolves to an existing entity, fact, source, or event
- No dangling references
- Every claim traces to an evidence chain (Claim → Fact → Source → Tier)
- All knowledge gaps are documented
- Minimum confidence threshold: 0.60 for included items
- Entity, timeline, and verification data are fully merged
