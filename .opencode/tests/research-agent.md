# THE BREAKDOWN
## Test: Research Agent v1.0

**Target**: research-agent.md
**Output Schema**: document.schema.json
**Sub-schemas**: story.schema.json, entity.schema.json, claim.schema.json, fact.schema.json, source.schema.json, timeline.schema.json, visual.schema.json, research.schema.json

---

## 1. Schema Conformance

### 1.1 Document Wrapper
- [ ] Output is valid JSON
- [ ] `metadata.schemaVersion` is present and a string
- [ ] `metadata.type` is present and a string
- [ ] `metadata.generatedBy` equals `"research-agent"`
- [ ] `metadata.generatedAt` is a valid ISO 8601 timestamp
- [ ] `metadata.status` is one of: `draft`, `review`, `published`
- [ ] `story` is present and is an object

### 1.2 Story Object
- [ ] `story.id` is a non-empty string
- [ ] `story.headline` is a non-empty string
- [ ] `story.summary` is a non-empty string
- [ ] `story.status` is one of: `draft`, `review`, `published`, `archived`
- [ ] `story.category` is a string
- [ ] `story.entities` is an array
- [ ] `story.claims` is an array
- [ ] `story.facts` is an array
- [ ] `story.sources` is an array
- [ ] `story.timeline` is an array
- [ ] `story.visuals` is an array

### 1.3 Entity Sub-schema (`entity.schema.json`)
- [ ] Every entity has `id` (string), `name` (string), `type` (string)
- [ ] Every entity `type` is one of: Person, Country, Organization, Company, Law, Scheme, Budget, Report, Policy, Technology
- [ ] If `country` is present, it is a string
- [ ] If `website` is present, it is a valid URI
- [ ] `relatedStories` and `relatedEntities` are arrays if present

### 1.4 Claim Sub-schema (`claim.schema.json`)
- [ ] Every claim has `statement` (string)
- [ ] Every claim has `status` one of: Verified, Partially Verified, Disputed, False, Unverified
- [ ] `confidence` is a number between 0 and 1
- [ ] `evidence` is an array if present

### 1.5 Fact Sub-schema (`fact.schema.json`)
- [ ] Every fact has `statement` (string)
- [ ] `verified` is a boolean if present
- [ ] `confidence` is a number between 0 and 1

### 1.6 Source Sub-schema (`source.schema.json`)
- [ ] Every source has `title` (string)
- [ ] Every source `type` is one of: Government, Research, Court, News, NGO, Academic, International Organization
- [ ] If `url` is present, it is a valid URI
- [ ] `published` and `accessed` are strings if present

### 1.7 Timeline Sub-schema (`timeline.schema.json`)
- [ ] Every timeline entry has `date` (string) and `event` (string)
- [ ] `sources` is an array if present

### 1.8 Visual Sub-schema (`visual.schema.json`)
- [ ] Every visual has `title` (string)
- [ ] Every visual `type` is one of: Timeline, Chart, SVG, Infographic, Map, Comparison, Process, Flow, Network, Quote, Statistic Card
- [ ] `data` is an array if present
- [ ] `placement` is a string if present

---

## 2. Source Tier Compliance

### 2.1 Tier Assignment
- [ ] Every source maps to one of the 5 tiers
- [ ] Tier 1 sources: Government, Acts, Court Judgements, Official Statistics, Official Reports, International Organisations
- [ ] Tier 2 sources: Peer-reviewed Research, Universities, Think Tanks
- [ ] Tier 3 sources: Reuters, Associated Press, BBC, Financial Times, The Economist
- [ ] Tier 4 sources: Regional Media, Industry Reports
- [ ] Tier 5 sources: Blogs, Social Media, Opinion

### 2.2 Tier Rules
- [ ] No claim relies solely on Tier 5 sources — each has at least one Tier 1–3 backing
- [ ] Every claim's confidence score is derived from its highest-tier source
- [ ] Conflicting evidence: higher-tier source overrides lower-tier source
- [ ] If conflict exists between equal-tier sources, it is flagged in notes

---

## 3. Quality Gate

- [ ] Minimum **10 primary sources** in `story.sources`
- [ ] Every source has confidence ≥ **0.80** (unless overridden by tier floor)
- [ ] Every claim references at least one source or fact
- [ ] All entity types use the controlled enum (no free-text types)
- [ ] Conflicting evidence is explicitly flagged

---

## 4. Mission Compliance

- [ ] Output contains **no headlines** intended for publication
- [ ] Output contains **no written story prose** (only structured data)
- [ ] No engagement-optimised language (no clickbait, no hooks)
- [ ] All content is factual evidence, sourced and attributed

---

## 5. Workflow Completeness

- [ ] Evidence of **Understand Topic** (question field populated)
- [ ] Evidence of **Identify Search Terms** (sources match topic)
- [ ] Evidence of **Find Sources** (≥ 10 sources)
- [ ] Evidence of **Rank Sources** (tier assignment present)
- [ ] Evidence of **Extract Facts** (facts array populated)
- [ ] Evidence of **Extract Claims** (claims array populated)
- [ ] Evidence of **Extract Entities** (entities array populated)
- [ ] Evidence of **Build Timeline** (timeline array populated)
- [ ] Evidence of **Find Knowledge Gaps** (questions/importance fields populated)

---

## 6. Validation

### 6.1 Duplicates
- [ ] No duplicate statements across facts
- [ ] No duplicate claims
- [ ] No duplicate sources (same URL or title)
- [ ] No duplicate entities (same name + type)
- [ ] No duplicate timeline entries (same date + event)

### 6.2 Missing Sources
- [ ] Every fact has a `source` field
- [ ] Every claim references an existing source or fact ID
- [ ] Every timeline entry with `sources` references existing source IDs
- [ ] Every source URL is accessible (not a dead link)

### 6.3 Contradictions
- [ ] No contradictory facts on the same topic
- [ ] If contradictions exist, they are flagged with notes
- [ ] Conflicting claims from different speakers are labelled with speaker attribution

### 6.4 Unverified Claims
- [ ] Every claim has a `status` other than `Unverified` — or is explicitly flagged
- [ ] Claims marked `Unverified` have an explanation in `notes`
- [ ] Claims marked `Verified` have at least one supporting fact or source

### 6.5 Weak Evidence
- [ ] No claim relies exclusively on Tier 5 sources
- [ ] Every claim with confidence < 0.60 has a qualifier or warning note
- [ ] High-importance claims (importance: "high") have confidence ≥ 0.80

### 6.6 Missing Dates
- [ ] Every timeline entry has a non-empty `date`
- [ ] Every source has `published` or `accessed` populated
- [ ] Every claim has a `date` (or range) if the statement is time-bound

### 6.7 Missing Context
- [ ] Every entity has a `description` when its role is not obvious from name alone
- [ ] Every fact/claim includes enough context to understand the statement independently
- [ ] Knowledge gaps (`question` fields) explain what is unknown and why it matters

---

## Results

| Section | Pass | Fail | N/A |
|---------|------|------|-----|
| 1. Schema Conformance | ☐ | ☐ | ☐ |
| 2. Source Tier Compliance | ☐ | ☐ | ☐ |
| 3. Quality Gate | ☐ | ☐ | ☐ |
| 4. Mission Compliance | ☐ | ☐ | ☐ |
| 5. Workflow Completeness | ☐ | ☐ | ☐ |
| 6. Validation | ☐ | ☐ | ☐ |
| **Overall** | **☐** | **☐** | **☐** |
