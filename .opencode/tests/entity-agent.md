# THE BREAKDOWN
## Test: Entity Agent v1.0

**Target**: entity-agent.md
**Output Schema**: entity.schema.json
**Sub-schemas**: relationship.schema.json

---

## 1. Schema Conformance

### 1.1 Entity (`entity.schema.json`)
- [ ] Every entity has `id` (string), `type` (string), `name` (string)
- [ ] Every entity `type` is one of the 28 controlled enum values
- [ ] `aliases` is an array of strings if present
- [ ] `confidence` is a number between 0 and 1 if present
- [ ] `sources` is an array if present
- [ ] `website` is a valid URI if present

### 1.2 Relationship (`relationship.schema.json`)
- [ ] Every relationship has `source` (string), `target` (string), `type` (string)
- [ ] Every relationship `type` is one of the 13 controlled enum values
- [ ] `confidence` is a number between 0 and 1 if present
- [ ] `source` and `target` reference valid entity IDs

### 1.3 Knowledge Graph
- [ ] Output contains `{ nodes: [], edges: [] }`
- [ ] All node IDs in `edges[].source` and `edges[].target` exist in `nodes[]`
- [ ] No duplicate edges (same source + target + type)

---

## 2. Step Compliance

### 2.1 Step 1 — Input
- [ ] Input was received and parsed correctly
- [ ] Raw text or research JSON was processed

### 2.2 Step 2 — Identify Named Entities
- [ ] All named entities in the input text were captured
- [ ] No false positives (non-entities classified as entities)

### 2.3 Step 3 — Classify by Entity Type
- [ ] Every entity has a valid type from the 28-value enum
- [ ] No entity typed as `Unknown` or left untyped

### 2.4 Step 4 — Generate IDs
- [ ] Every ID follows the pattern `{type}-{canonical-name-slugified}`
- [ ] IDs are lowercase, hyphens for spaces, no special characters
- [ ] Same entity across stories → same ID (checked against memory)

### 2.5 Step 5 — Relationship Extraction
- [ ] Relationships exist between entities (not all nodes are isolated)
- [ ] Every relationship has a valid type from the 13-value enum
- [ ] Direction is logical (e.g. Person → heads → Organization, not reverse)

### 2.6 Step 6 — Alias Detection
- [ ] All known aliases are stored in `aliases[]`
- [ ] No duplicate entities created for alias variants
- [ ] Canonical name is the official full form (not an abbreviation)

### 2.7 Step 7 — Deduplication
- [ ] No duplicate entities (same name + type)
- [ ] No duplicate IDs
- [ ] Existing entities were updated, not recreated

### 2.8 Step 8 — Knowledge Graph
- [ ] `nodes[]` and `edges[]` are both populated
- [ ] Edge count is consistent with relationship count

### 2.9 Step 9 — Confidence
- [ ] Every entity has `confidence` ≥ 0.60 (or flagged for review)
- [ ] Confidence is consistent with source tier
- [ ] Relationships have confidence scores

### 2.10 Step 10 — Update Memory
- [ ] Memory files were updated (people.json, organizations.json, etc.)
- [ ] New entities were appended
- [ ] Existing entities were merged (not overwritten)
- [ ] No entities were deleted from memory

---

## 3. Normalization

- [ ] No honorifics, titles, or prefixes in entity names (no "Shri", "Dr.", "PM")
- [ ] Abbreviations are expanded to full names as canonical
- [ ] Common variants are in `aliases[]` (RBI, GOI, CAA, etc.)
- [ ] One entity. One name.

---

## 4. Quality Gate

- [ ] Every entity has non-empty `name` and valid `type` from enum
- [ ] No duplicate entities (same name + type)
- [ ] No duplicate IDs across memory
- [ ] Aliases are resolved to canonical names
- [ ] Relationships have valid types from controlled enum
- [ ] Every entity has confidence ≥ 0.60 (or flagged for review)
- [ ] Minimum 3 entities extracted per story
- [ ] Memory is updated after every run

---

## Results

| Section | Pass | Fail | N/A |
|---------|------|------|-----|
| 1. Schema Conformance | ☐ | ☐ | ☐ |
| 2. Step Compliance | ☐ | ☐ | ☐ |
| 3. Normalization | ☐ | ☐ | ☐ |
| 4. Quality Gate | ☐ | ☐ | ☐ |
| **Overall** | **☐** | **☐** | **☐** |
