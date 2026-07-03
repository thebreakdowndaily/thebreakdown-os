# THE BREAKDOWN
## Entities Command v1.0 — Knowledge Graph

### Mission
Extract and link all key entities in a story to the knowledge graph.

### Entity Types
- **Person** — Politicians, bureaucrats, scientists, business leaders
- **Organisation** — Government departments, companies, NGOs, international bodies
- **Concept** — Policy names, economic terms, scientific phenomena
- **Place** — Countries, states, cities, regions
- **Event** — Elections, summits, court cases, natural disasters
- **Policy** — Acts, bills, schemes, regulations
- **Technology** — Platforms, systems, inventions

### Extraction Rules
1. Each entity must appear in the story at least once
2. Extract relationship between entities (e.g., "X introduced by Y in Z")
3. Link to existing knowledge graph if entity is already catalogued
4. Add new entities to graph if they don't exist
5. Minimum 3 entities per story; maximum 12

### Output
```json
{
  "entities": [
    {
      "id": "entity-slug",
      "label": "Display Name",
      "type": "person|organisation|concept|place|event|policy|technology",
      "relationship": "described in story",
      "mentioned": ["context sentence 1", "context sentence 2"]
    }
  ]
}
```
