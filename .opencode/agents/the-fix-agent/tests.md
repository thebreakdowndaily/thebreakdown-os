# The Fix Agent — Test Cases

## Identity & Configuration

| # | Test | Expected |
|---|------|----------|
| 1 | Agent has id `the-fix-agent` | Present in manifest.yaml |
| 2 | Agent has version string | Semantic version |
| 3 | Agent has codename | "solutions-architect" |
| 4 | Classification tier is editorial | tier: editorial |
| 5 | Autonomy level is defined | autonomy: high |
| 6 | Has at least 4 inputs | story, research, verification, entities |
| 7 | Has knowledgeGraph as optional input | knowledgeGraph listed |
| 8 | Output format is FixJSON | format: FixJSON |
| 9 | Output schema references fix.schema.json | schema: fix.schema.json |
| 10 | Trigger step is `solutions-assembly` | step: solutions-assembly |
| 11 | Trigger condition references story type | condition contains "the-fix" |
| 12 | Has memory configuration | store: true |
| 13 | Has failure routing | At least 4 failure modes |
| 14 | Has quality gates | At least 4 quality gates |
| 15 | All dependencies exist as agents | writer, verification, knowledge-graph, research |

## Output Framework Completeness

| # | Test | Expected |
|---|------|----------|
| 16 | FixJSON has `id` field | string, non-empty |
| 17 | FixJSON has `slug` field | string, non-empty |
| 18 | FixJSON has `storySlug` field | references valid story |
| 19 | FixJSON has `headline` field | string, non-empty |
| 20 | FixJSON has `summary` field | string, non-empty |
| 21 | FixJSON has `publishedAt` field | ISO 8601 |
| 22 | FixJSON has `updatedAt` field | ISO 8601 |
| 23 | FixJSON has `readingTime` field | integer |
| 24 | FixJSON has `author` field | object with name |
| 25 | FixJSON has `evidenceScore` field | 0-100 |
| 26 | FixJSON has `tags` field | string array, 3-5 items |

## Framework Sections

| # | Test | Expected |
|---|------|----------|
| 27 | `problem` section exists | FixSection with title + content |
| 28 | `whoIsAffected` section exists | FixSection with quantified impact |
| 29 | `rootCauses` section exists | FixSection with 2-4 causes |
| 30 | `evidence` section exists | FixSection with quantitative data |
| 31 | `stakeholders` is non-empty array | Array of Stakeholder objects |
| 32 | `existingSolutions` is array | Array of ExistingSolution objects |
| 33 | `globalExamples` is array | Array of GlobalExample objects |
| 34 | `recommendedActions` is array | 4-6 FixAction objects |
| 35 | `citizenActions` is array | 2-3 FixAction objects |
| 36 | `governmentActions` is array | 2-3 FixAction objects |
| 37 | `metricsToTrack` is array | 5 Metric objects |

## Section Validation

| # | Test | Expected |
|---|------|----------|
| 38 | Each FixSection has string title | typeof title === 'string' |
| 39 | Each FixSection has string content | typeof content === 'string' |
| 40 | Each FixSection supportingData has label + value | each item has both |
| 41 | Each Stakeholder has valid type | one of 5 enum values |
| 42 | Each Stakeholder has role | string, non-empty |
| 43 | Each Stakeholder has interest | string, non-empty |
| 44 | Stakeholder stance is valid if present | one of 4 enum values |
| 45 | Each ExistingSolution has valid status | one of 4 enum values |
| 46 | Each ExistingSolution has effectiveness if present | one of 4 enum values |
| 47 | Each GlobalExample has country | string, non-empty |
| 48 | Each GlobalExample has policy | string, non-empty |
| 49 | Each GlobalExample has outcome | string with quantitative data |
| 50 | Each GlobalExample has source | string, non-empty |
| 51 | Each FixAction has valid priority | one of 4 enum values |
| 52 | Each FixAction has valid timeframe | one of 4 enum values |
| 53 | Each FixAction has at least one actor | actors is non-empty array |
| 54 | Each Metric has currentValue | string, or "Unknown" |
| 55 | Each Metric has targetValue | string, non-empty |
| 56 | Each Metric has dataSource | string, non-empty |
| 57 | Each Metric has updateFrequency | string |
| 58 | Each Metric has name | string, non-empty |

## Quality Gates

| # | Test | Expected |
|---|------|----------|
| 59 | Every recommendation links to verified evidence | ≥95% coverage |
| 60 | Global example source is verifiable | named institution or publication |
| 61 | Every metric has all 5 fields | name, current, target, source, frequency |
| 62 | Every action has actors array | non-empty with named entities |
| 63 | Every action has timeframe | one of 4 valid values |
| 64 | Headline is action-oriented | starts with verb or "How to" |

## Evidence Grounding

| # | Test | Expected |
|---|------|----------|
| 65 | Problem statement cites at least one verified fact | data point in content |
| 66 | Root causes link to story claims | cross-referenced |
| 67 | Existing solution effectiveness has supporting source | source field filled |
| 68 | Global example outcome is quantitative | contains number or percentage |
| 69 | Recommended action targets named actor | real ministry or institution |

## Failure Routing

| # | Test | Expected |
|---|------|----------|
| 70 | Missing evidence routes to editorial review | goto: escalate_to_editorial_review |
| 71 | Unverifiable global example routes to exclusion | remove_example_and_note |
| 72 | Incomplete metrics route to research | flag_for_research |
| 73 | Unrealistic action routes to priority downgrade | downgrade_priority |

## Edge Cases

| # | Test | Expected |
|---|------|----------|
| 74 | Zero affected population documented | whoIsAffected states "Unknown" |
| 75 | No existing solutions exist | existingSolutions is empty array |
| 76 | Only 1 global example found | single-item array, not fabricated |
| 77 | No citizen action possible | citizenActions states constraint |
| 78 | Metric has no baseline | currentValue is "Unknown" |
| 79 | Root cause is single factor | document as 1-item array |
| 80 | Multiple stakeholder stances unknown | all neutral by default |

## Integration

| # | Test | Expected |
|---|------|----------|
| 81 | FixJSON can be consumed by website-builder | buildFix() accepts FixJSON |
| 82 | Fix page displays all 11 framework sections | rendered in order |
| 83 | API returns paginated fixes list | GET /api/fixes |
| 84 | API returns single fix by slug | GET /api/fixes/:slug |
| 85 | API returns 404 for unknown slug | error response |
| 86 | Fix links to parent story | storySlug resolves |
| 87 | Global examples render as comparison cards | UI component exists |
| 88 | Metrics render as trackable table | progress indicators |
| 89 | Actions sortable by priority | critical first |
| 90 | Stakeholder stances colour-coded | green/red/grey badges |
