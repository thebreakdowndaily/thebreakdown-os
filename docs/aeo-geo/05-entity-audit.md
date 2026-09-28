# Entity Audit — AEO/GEO Baseline

## 1. Entity Architecture Assessment

### Type System: ✅ STRONG

The canonical type system defines a rich entity model:

```
EntityKind: person | organization | policy | scheme | budget | report | dataset | source | country

EntityBase:
  - id, slug, type, name, description, aliases[]
  - relationships: EntityRelationship[] (targetId, role, confidence)
  - evidenceScore, statistics[], timeline[], faq[], claims[]
  - usageGraph: { stories[], topics[], collections[] }
  - freshness: FreshnessMetadata

KnowledgeEntity = PersonEntity | OrganizationEntity | PolicyEntity | SchemeEntity | BudgetEntity | ReportEntity | DatasetEntity | SourceEntity | CountryEntity
```

This is significantly more capable than a basic entity model. The `EntityRelationship` type (targetId, role, confidence) supports a full knowledge graph at the data level.

---

## 2. Entity Page Assessment

### Route: `/entity/[slug]`

**What works:**
- Dedicated entity pages exist ✅
- Entity-specific metadata (`generateMetadata`) ✅
- JSON-LD emits correct `@type` (Person/Organization/Thing) ✅
- BreadcrumbList ✅

**What is missing:**

| Gap | Schema Equivalent | Priority |
|-----|-------------------|----------|
| `sameAs` array for canonical external authority links | `sameAs: ["https://www.wikidata.org/wiki/Q..."]` | P1 |
| `alternateName` for known aliases | `alternateName: ["RBI", "Reserve Bank"]` | P1 |
| `foundingDate` for organizations | `Organization.foundingDate` | P2 |
| `knowsAbout` for expertise | `Person.knowsAbout` | P2 |
| `memberOf` for person ↔ org links | `Person.memberOf` | P2 |
| `subjectOf` links to stories | `subjectOf: [{ "@type": "Article", "url": "..." }]` | P2 |
| `mainEntityOfPage` on entity pages | `mainEntityOfPage: { "@id": url }` | P1 |
| Entity `url` field missing from current type | `url` on EntityBase | P1 |

---

## 3. Entity Types — Coverage Gap

The canonical `EntityKind` covers:
```
person | organization | policy | scheme | budget | report | dataset | source | country
```

**Missing entity kinds for Indian journalism context:**
- `court` — Supreme Court, High Courts
- `government_department` — Ministry of Finance, etc.
- `political_party` — BJP, INC, etc.
- `institution` — RBI, SEBI, etc. (these currently map to `organization`)
- `law` / `legislation` — Specific Acts
- `place` / `location` — States, districts, constituencies
- `event` — Named historical events

**Assessment:** The current `organization` type serves as a catch-all for courts, ministries, parties, and institutions. This is acceptable for now — adding subtypes is a P2 task when entity coverage grows.

---

## 4. Entity Disambiguation

**No explicit disambiguation mechanism exists.**

For example, an entity named `"Rewa"` (could be a district, a city, a river, a person's name) has no `disambiguatingDescription` field.

The `aliases[]` field provides alternate names but not disambiguation context.

**Action required (P2):** Add `disambiguatingDescription?: string` to `EntityBase`.

---

## 5. Entity → Story Relationship (Machine Readable)

**What exists:**
- `Entity.relatedStoryIds: string[]` (deprecated in EntityBase, replaced by `usageGraph.stories[]`)
- `Story.relatedEntityIds: string[]`
- `Story.relatedEntities?: { id, slug, name }[]` (appears in story page code)

**What is emitted in structured data:**
- Nothing — entity→story relationships are not in any JSON-LD output

**What answer engines need:**
```json
{
  "@type": "Organization",
  "name": "Reserve Bank of India",
  "subjectOf": [
    { "@type": "NewsArticle", "url": "https://thebreakdown.in/story/rbi-repo-rate" },
    { "@type": "NewsArticle", "url": "https://thebreakdown.in/story/rbi-monetary-policy" }
  ]
}
```

**Action required (P2):** Add `subjectOf` array to entity JSON-LD when related story slugs are available.

---

## 6. Author Entity

Authors currently exist only as strings (`story.author: string`). There are no:
- Author profile pages (`/author/[slug]`)
- Author entity records in the entity registry
- Author JSON-LD (`Person` schema with `url`, `sameAs`)

**This is the single most impactful entity gap for GEO.** Answer engines use author entity recognition to attribute reporting. When The Breakdown's journalism is cited, correct author attribution requires a `Person` schema with a stable `url`.

**Action required (P0):**
1. Create a minimal `Author` type (or extend `PersonEntity`)
2. Create author metadata in the data layer (even if small — start with editorial team)
3. Emit `Person` schema on story pages where a named author is known
4. Optionally create `/author/[slug]` pages (P1)

---

## 7. Knowledge Graph Assessment

`lib/graph/` directory exists. The `Graph`, `GraphNode`, `GraphEdge` types are defined in `canonical.ts`.

**What the graph models:**
- Nodes: entity, story, topic, timeline, fix, dataset, claim, citation
- Edges: RelationType (mentions, belongs_to, implemented_by, announced_by, funded_by, affects, related_to, part_of, located_in, published_by, criticized_by, supports, opposes, covers, analyzes, references)

**Assessment:** The knowledge graph exists at the data model and service level. It is not exposed via:
- Structured data
- API (no `/api/graph` public endpoint)
- Machine-readable document layer

The graph is currently internal-only. For GEO purposes, the relationships that *should* be machine-visible are:
- `story → mentions → entity` (via `NewsArticle.mentions`)
- `story → cites → source` (via `NewsArticle.citation`)
- `entity → part_of → entity` (via `Organization.parentOrganization`)

---

## 8. Canonical Entity URL

The `EntityBase` type has `slug` but no `url` field. The canonical URL pattern `https://thebreakdown.in/entity/${slug}` is constructed at render time but not stored canonically on the entity.

**Minor issue:** Entity URLs should be `https://thebreakdown.in/entity/${slug}` consistently. The entity JSON-LD in `app/entity/[slug]/page.tsx:21` correctly constructs this.

No type-level `canonicalUrl` field — this is fine as it can be derived from slug, but schema generation should always use the full `https://` URL.

---

## 9. `sameAs` Policy

`sameAs` links should point to **verified external authority sources only**:
- Wikipedia/Wikidata
- Official government websites
- Official company/organization websites
- Official social media profiles

**Never fabricate `sameAs` links.**
**Never link to unofficial sources.**
**Never link to private information.**

This policy should be documented and enforced at data entry.
