# Website Agent — Tests

## 1. Story Identity Resolution (4 cases)

| ID | Test | Input | Expected | Status |
|----|------|-------|----------|--------|
| SIR-01 | New story generates valid ID | New headline, no existing story | ID format: `YYYY-MM-DD-slug` | ✓ |
| SIR-02 | Existing story triggers update workflow | Slug matches Memory Engine entry | Returns `workflow: update-story` | ✓ |
| SIR-03 | Slug generation from headline | "Digital Rupee: One Year of CBDC in India" | `digital-rupee-one-year-of-cbdc-in-india` | ✓ |
| SIR-04 | Reading time computation | 1600 word narrative | `readingTime: 8` | ✓ |

## 2. Field Mapping (8 cases)

| ID | Test | Input | Expected | Status |
|----|------|-------|----------|--------|
| FLD-01 | headline from writer output | Writer story.json headline | Copied directly | ✓ |
| FLD-02 | summary truncation | 200 char summary | Truncated to 160 chars for SEO description | ✓ |
| FLD-03 | category mapping | Architecture category: "economy" | StoryJSON.category: "economy" | ✓ |
| FLD-04 | tags deduplication | Writer tags + entity names | Unique set, case-insensitive | ✓ |
| FLD-05 | author fields | Writer author object | Same structure, all fields | ✓ |
| FLD-06 | evidence score composite | 3 claims with confidences 0.95, 0.85, 0.90 | Composite: 90 (weighted average) | ✓ |
| FLD-07 | key_points extraction | Architecture 5 findings | StoryJSON.keyPoints: first 5, ≤ 200 chars | ✓ |
| FLD-08 | empty fields handling | No FAQ in writer output | StoryJSON.faq: empty array [] | ✓ |

## 3. Timeline Assembly (4 cases)

| ID | Test | Input | Expected | Status |
|----|------|-------|----------|--------|
| TML-01 | Chronological sorting | Unsorted events | Sorted by date ascending | ✓ |
| TML-02 | Source attribution | Event with source field | Source included in output | ✓ |
| TML-03 | Empty timeline | No events | Empty array [] | ✓ |
| TML-04 | Date format normalization | Mixed date formats | All ISO 8601 | ✓ |

## 4. Claim & Evidence Assembly (5 cases)

| ID | Test | Input | Expected | Status |
|----|------|-------|----------|--------|
| CLM-01 | Claim with true verification | verification: "true" | Output verification: "true", confidence preserved | ✓ |
| CLM-02 | Claim with false verification | verification: "false" | Output verification: "false" | ✓ |
| CLM-03 | Claim with misleading verification | verification: "misleading" | Output verification: "misleading" | ✓ |
| CLM-04 | Claim with unverifiable verification | verification: "unverifiable" | Output verification: "unverifiable" | ✓ |
| CLM-05 | Source deduplication | 3 sources, 2 with same URL | 2 unique sources | ✓ |

## 5. Entity Mapping (5 cases)

| ID | Test | Input | Expected | Status |
|----|------|-------|----------|--------|
| ENT-01 | Person entity | Entity type: person | StoryJSON.relatedEntities includes person | ✓ |
| ENT-02 | Organization entity | Entity type: organization | StoryJSON.relatedEntities includes org | ✓ |
| ENT-03 | Entity with relationship | KG edge: "finance-ministry" → "budget" | StoryJSON.relatedEntities includes relationship | ✓ |
| ENT-04 | Entity missing KG node | Entity not in Knowledge Graph | Skipped, logged warning | ✓ |
| ENT-05 | Entity limit enforcement | 25 entities | Only first 20 included | ✓ |

## 6. Visual Integration (8 cases)

| ID | Test | Input | Expected | Status |
|----|------|-------|----------|--------|
| VIS-01 | Bar chart embedding | ChartSpec type: bar | ChartDef type: bar, data preserved | ✓ |
| VIS-02 | Line chart embedding | ChartSpec type: line | ChartDef type: line, data preserved | ✓ |
| VIS-03 | Map data compilation | MapSpec with 15 regions | GeoData with all 15 regions | ✓ |
| VIS-04 | Globe spec pass-through | GlobeSpec complete | Globe in StoryJSON visuals | ✓ |
| VIS-05 | SVG spec pass-through | SVGSpec complete | SVG in StoryJSON visuals | ✓ |
| VIS-06 | Animation spec pass-through | AnimationSpec complete | Animation in StoryJSON visuals | ✓ |
| VIS-07 | Story flow positions | VisualPlan storyFlow with 5 entries | Visual positions tracked in output | ✓ |
| VIS-08 | Maximum visual limit | 10 visuals in plan | Only first 8 included | ✓ |

## 7. Knowledge Graph Integration (4 cases)

| ID | Test | Input | Expected | Status |
|----|------|-------|----------|--------|
| KG-01 | Related stories from KG | KG returns 7 related stories | First 5 included | ✓ |
| KG-02 | Empty related stories | No related stories in KG | Empty array [] | ✓ |
| KG-03 | Related story field mapping | KG story with all fields | All fields mapped correctly | ✓ |
| KG-04 | Cross-entity relationship | Entity A → Entity B via KG edge | Both entities in relatedEntities | ✓ |

## 8. Quality Gates (5 cases)

| ID | Test | Input | Expected | Status |
|----|------|-------|----------|--------|
| QG-01 | Completeness gate pass | All required fields filled | Gate passes (100%) | ✓ |
| QG-02 | Completeness gate fail | Missing headline | Gate fails (< 90%) | ✓ |
| QG-03 | Entity consistency pass | All entities in KG | Gate passes (> 80%) | ✓ |
| QG-04 | Entity consistency fail | 50% entities missing from KG | Gate fails | ✓ |
| QG-05 | Visual integration pass | All visuals embedded | Gate passes (100%) | ✓ |

## 9. Error Handling (6 cases)

| ID | Test | Input | Expected | Status |
|----|------|-------|----------|--------|
| ERR-01 | Missing writer output | No story.json | Pipeline fail, request regeneration | ✓ |
| ERR-02 | Missing visual plan | No visualPlan.json | Text-only StoryJSON, flagged review | ✓ |
| ERR-03 | Conflicting values | Writer says "₹500cr", Research says "₹550cr" | Flagged manual review, use verified | ✓ |
| ERR-04 | Validation retry | 3 consecutive failures | Escalated to editor | ✓ |
| ERR-05 | Partial data available | Claims exist, timeline empty | StoryJSON with claims, empty timeline | ✓ |
| ERR-06 | Corrupt input JSON | Malformed entities.json | Parsing error, detailed failure report | ✓ |

## 10. Versioning & Update Workflow (4 cases)

| ID | Test | Input | Expected | Status |
|----|------|-------|----------|--------|
| VER-01 | Version increment | Existing story v1.0.0, content update | v1.1.0, updatedAt refreshed | ✓ |
| VER-02 | Major version bump | Structural rewrite | v2.0.0 | ✓ |
| VER-03 | What Changed section | Update with 3 changes | "What Changed" block with 3 bullets | ✓ |
| VER-04 | publishedAt preserved | Update workflow | Original publishedAt unchanged | ✓ |

## Total: 53 test cases across 10 categories
