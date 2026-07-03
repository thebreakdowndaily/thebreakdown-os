---
name: entity-agent
version: 1.0.0
input: entity-request.schema.json
output: entity.schema.json
depends_on:
  - research-agent
next:
  - writer-agent
---

# THE BREAKDOWN
## Agent: Entity Extraction & Resolution v1.0

**Command**: entities.md
**Model**: big-pickle

### Mission
Extract, resolve, and enrich every named entity. No entity left unidentified. Every entity linked to its type, context, relationships, and confidence.

### Entity Types (Controlled Enum — 28 types)

| Type | Examples |
|------|----------|
| Person | Narendra Modi, Elon Musk, Kamala Harris |
| Organization | UN, NATO, European Union, RSS |
| Company | Reliance, Tesla, Apple, HDFC Bank |
| Country | India, United States, China |
| State | Maharashtra, California, Uttar Pradesh |
| City | Mumbai, New Delhi, London |
| District | Pune, Nagpur, Thane |
| Village | Hiware Bazar, Peth |
| Act | Citizenship Amendment Act, DPDP Act 2023 |
| Bill | Farm Laws Repeal Bill, Waqf Amendment Bill |
| Policy | National Education Policy 2020, Foreign Trade Policy |
| Scheme | PM-KISAN, Ayushman Bharat, PLI Scheme |
| Budget | Union Budget 2026, Defence Budget |
| Committee | Ashok Dalwai Committee, Finance Commission |
| Report | Economic Survey, WEF Global Risks Report |
| Court Case | Ayodhya Verdict, Article 370 Abrogation Case |
| Technology | 5G, AI, UPI, Blockchain |
| Product | iPhone, Ola Electric, Aadhaar |
| Currency | Rupee, Dollar, Euro, Yuan |
| Political Party | BJP, INC, AAP, DMK |
| Ministry | Ministry of Finance, Ministry of Defence |
| Department | DPIIT, CBDT, DIPAM |
| University | Oxford, MIT, Delhi University |
| NGO | Pratham, CRY, Oxfam |
| International Organization | UN, WHO, IMF, World Bank |
| Event | G20 Summit 2023, Lok Sabha Elections 2024 |
| Project | Mumbai Metro, Gaganyaan, Digital India |
| Statistic | GDP Growth Rate, Unemployment Rate, Inflation |

### Step 1 — Input

Receive processed research JSON. The input contains raw text, existing entities, or a full `research.schema.json` document.

### Step 2 — Identify Named Entities

Scan all text for named entities. Use NER pattern matching, context analysis, and keyword detection. Capture every person, organization, location, law, scheme, policy, and other entity type.

### Step 3 — Classify by Entity Type

Assign each entity to one of the 28 controlled types from the enum. If uncertain, flag for review — never guess.

### Step 4 — Generate IDs

Every entity gets a permanent, unique ID following the pattern: `{type}-{canonical-name-slugified}`

| Type | Name | ID |
|------|------|----|
| Person | Narendra Modi | `person-narendra-modi` |
| Country | India | `country-india` |
| Scheme | MGNREGA | `scheme-mgnrega` |
| Act | RTI Act | `law-rti-act` |
| Organization | World Bank | `organization-world-bank` |
| Company | Reliance Industries | `company-reliance-industries` |
| City | New Delhi | `city-new-delhi` |
| Technology | Unified Payments Interface | `technology-unified-payments-interface` |

**Rules:**
- Type prefix is lowercase singular (e.g. `person-`, `country-`, `scheme-`, `law-`)
- Canonical name is lowercased, spaces replaced with hyphens
- Special characters removed (commas, quotes, parentheses)
- Same entity across stories → same ID — never recreate
- ID is permanent and immutable once assigned

### Step 5 — Relationship Extraction

This is HUGE.

Instead of flat entities, build a graph. Every connection between entities is a typed relationship.

**Instead of:**
```
Narendra Modi     Government of India     MGNREGA
```

**Build:**
```
Narendra Modi
      ↓
    heads
      ↓
Government of India
      ↓
  implements
      ↓
  MGNREGA
```

**Relationship Types:**

| Type | Example |
|------|---------|
| `implemented_by` | MGNREGA → Ministry of Rural Development |
| `regulated_by` | Telecom sector → TRAI |
| `funded_by` | Ayushman Bharat → Government of India |
| `reported_by` | GDP data → MOSPI |
| `located_in` | Mumbai → Maharashtra |
| `member_of` | India → UN |
| `created_by` | UIDAI → Government of India |
| `approved_by` | Budget → Parliament |
| `audited_by` | CAG → Government departments |
| `criticised_by` | Policy → Opposition party |
| `supported_by` | Bill → Coalition partner |
| `replaced_by` | NREGA → MGNREGA (rename) |
| `related_to` | Inflation → RBI policy |

Each relationship is stored as `relationship.schema.json`.

### Step 6 — Alias Detection

All variants of an entity resolve to the same canonical form.

**Example:**
```
GOI
Government of India
Union Government
Central Government
→ One entity: Government of India
```

Store all known aliases in the `aliases[]` array on the entity. Use alias list for matching inbound text. When a new alias is found, add it to the existing entity — never create a duplicate.

### Step 7 — Deduplication

Never create duplicates.

```
Before creating  person-narendra-modi
  ↓
Search memory.
  ↓
If exists → Update. Don't recreate.
  ↓
If new → Create with permanent ID.
```

**Rules:**
- Same `name` + same `type` → merge into existing entity
- Same entity across stories → share `id`, update `relatedStories[]`
- New aliases found → add to existing entity's `aliases[]`
- Confidence threshold for auto-merge: ≥ 0.90

### Step 8 — Knowledge Graph

Return both nodes and edges.

```json
{
  "nodes": [],
  "edges": []
}
```

**Example:**
```
India
  ↓
implements
  ↓
MGNREGA
  ↓
funded_by
  ↓
Ministry of Rural Development
```

- `nodes[]` → array of entity IDs present in this story
- `edges[]` → array of `{ source, target, type }` relationships between them

### Step 9 — Confidence

Every entity gets a confidence score:

```json
{
  "confidence": 0.98
}
```

Relationships get confidence too. Score reflects certainty of identification, classification, and relationship extraction based on source tier and evidence strength.

| Confidence Range | Meaning |
|-----------------|---------|
| 0.95 – 1.00 | Certain — official source, unambiguous |
| 0.80 – 0.94 | High — strong evidence, minor ambiguity |
| 0.60 – 0.79 | Medium — inferred from context |
| 0.00 – 0.59 | Low — weak signal, flag for review |

### Step 10 — Update Memory

Persist every entity to the memory store. Automatically update on each run.

**Memory files:**
```
memory/
  people.json
  organizations.json
  countries.json
  laws.json
  schemes.json
```

**Rules:**
- New entity → append to the appropriate type file
- Existing entity → merge (update aliases, relationships, confidence)
- Never delete from memory — only add or update
- Memory is the source of truth for all entity IDs

### Normalization (Reference)

Every entity must use a single canonical name. All variants are resolved to the same canonical form.

| Bad | Good |
|-----|------|
| Narendra Modi / PM Modi / Prime Minister Modi / Shri Narendra Modi | **Narendra Modi** |
| RBI / Reserve Bank of India / Reserve Bank | **Reserve Bank of India** |
| USA / US / United States of America / America | **United States** |
| CAA / Citizenship Amendment Act 2019 / CAB | **Citizenship Amendment Act** |
| GDP / Gross Domestic Product / economic growth rate | **GDP** |

One entity. One name.

### Output

Returns an entity extraction package with three parts:

**1. Entities** — array of resolved entities conforming to `entity.schema.json`:

| Field | Required | Description |
|---|---|---|
| `id` | yes | Permanent unique ID |
| `type` | yes | One of 28 controlled types |
| `name` | yes | Canonical name |
| `aliases` | no | Alternative names and abbreviations |
| `description` | no | Context and role |
| `country` | no | Associated country |
| `website` | no | Official URL |
| `relatedEntities` | no | Related entity IDs |
| `relatedStories` | no | Story IDs referencing this entity |
| `sources` | no | Source references |
| `confidence` | no | 0–1 confidence score |

**2. Relationships** — array of typed edges conforming to `relationship.schema.json`

**3. Knowledge Graph** — `{ nodes: [], edges: [] }` for graph visualization

### Quality Gate
- Every entity has a non-empty `name` and valid `type` from enum
- No duplicate entities (same name + type)
- No duplicate IDs across memory
- Aliases are resolved to canonical names
- Relationships have valid types from the controlled enum
- Every entity has confidence ≥ 0.60 (or flagged for review)
- Relationships are bidirectional where applicable
- Minimum 3 entities extracted per story
- Memory is updated after every run
