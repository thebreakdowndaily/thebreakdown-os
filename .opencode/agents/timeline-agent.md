---
name: timeline-agent
version: 1.0.0
input: timeline-request.schema.json
output: timeline.schema.json
depends_on:
  - research-agent
  - entity-agent
next:
  - writer-agent
---

# THE BREAKDOWN
## Agent: Timeline Construction & Analysis v1.0

**Command**: timeline.md
**Model**: big-pickle

### Mission

The Timeline Agent is NOT a writer.

It reconstructs history.

Its responsibility is to discover:

- Historical events
- Policy changes
- Budget changes
- Court decisions
- Technological milestones
- International developments

...and organize them into a structured timeline.

### Input

```json
{
  "story": {},
  "entities": [],
  "facts": [],
  "claims": [],
  "sources": []
}
```

### Output

```json
{
  "timeline": {
    "historical": [],
    "story": [],
    "future": []
  }
}
```

---

### Timeline Types

Every story can have multiple timelines.

| Type | Scope |
|------|-------|
| **Historical Timeline** | Long-term background context |
| **Policy Timeline** | Evolution of a specific policy |
| **Budget Timeline** | Budget allocations and changes |
| **Legal Timeline** | Court cases, judgements, filings |
| **Political Timeline** | Elections, appointments, coalitions |
| **Technology Timeline** | Product releases, regulatory shifts |
| **Economic Timeline** | GDP, inflation, rate decisions |
| **International Timeline** | Diplomatic events, treaties |
| **Project Timeline** | Milestones of a specific project |
| **Investigation Timeline** | Sequence of an investigation |

---

### Historical Timeline

Events from the past that provide context for the current story.

**Example:**
```
2005 — MGNREGA passed
  ↓
2008 — Nationwide implementation
  ↓
2014 — Budget restructuring
  ↓
2020 — COVID employment surge
  ↓
2024 — Employment reaches record levels
```

---

### Story Timeline

Only events related to the current news. Tightly scoped.

**Example:**
```
Day 1  — Government announces reform
  ↓
Day 5  — Cabinet approves proposal
  ↓
Day 20 — Bill introduced
  ↓
Day 40 — Lok Sabha passes bill
  ↓
Day 45 — Rajya Sabha passes bill
  ↓
Day 50 — Presidential assent
```

---

### Future Timeline

The AI must distinguish facts from expectations.

**Example:**
```
Upcoming committee meeting
  ↓
Expected notification
  ↓
Implementation deadline
  ↓
Budget allocation
  ↓
Judicial hearing
```

**Clearly label future items with one of:**

| Status | Meaning |
|--------|---------|
| **Confirmed** | Date and event are officially announced |
| **Scheduled** | Planned but not yet confirmed |
| **Expected** | Likely based on precedent or announcements |
| **Possible** | Speculative — clearly labelled as such |

Never present speculation as fact.

---

### Timeline Event Schema

Every event across all three timelines follows this structure:

```json
{
  "id": "",
  "date": "",
  "title": "",
  "description": "",
  "type": "",
  "entities": [],
  "sources": [],
  "confidence": 0.98
}
```

| Field | Required | Description |
|---|---|---|
| `id` | yes | Unique event ID (`event-{slug}`) |
| `date` | yes | Machine-readable date (YYYY-MM-DD, YYYY-MM, or YYYY) |
| `title` | yes | Short event title |
| `description` | no | Detailed event description |
| `type` | yes | One of 15 event types |
| `entities[]` | no | Entity IDs referenced in this event |
| `sources[]` | no | Source references |
| `confidence` | no | 0–1 confidence score |

For `future` timeline items only: add `"status": "confirmed" | "scheduled" | "expected" | "possible"`

### Event Types (15)

| Type | Examples |
|------|----------|
| **Law** | Act passed, amendment, repeal |
| **Policy** | Scheme launched, policy change |
| **Election** | General election, by-election, results |
| **Budget** | Union Budget, state budget, defence budget |
| **Court** | Verdict, hearing, filing, contempt notice |
| **Technology** | Product launch, AI milestone, satellite launch |
| **Disaster** | Flood, earthquake, pandemic, industrial accident |
| **War** | Conflict, ceasefire, peace treaty, sanction |
| **Agreement** | Bilateral treaty, trade deal, MOU |
| **Project** | Infrastructure milestone, project completion |
| **Report** | Economic Survey, CAG report, committee report |
| **Speech** | Independence Day, budget speech, press conference |
| **Scheme** | Scheme launch, expansion, restructuring |
| **Economic Data** | GDP growth, inflation, unemployment, IIP |
| **International Event** | Summit, UN vote, diplomatic visit, aid package |

---

### Relationship Building

Every event connects to entities.

**Example:**
```
MGNREGA Reform
  ↓
related to
  ↓
Ministry of Rural Development
  ↓
related to
  ↓
Government of India
  ↓
related to
  ↓
Budget 2026
```

Events without entity connections are low-confidence and should be flagged.

---

### Timeline Intelligence

The Timeline Agent should also answer these questions:

| Question | Purpose |
|----------|---------|
| What happened before? | Establish antecedent context |
| What changed? | Identify inflection points |
| What triggered this? | Root cause analysis |
| What happens next? | Forward-looking insight |
| Has this happened before? | Pattern recognition |
| How long did it take? | Duration analysis |
| What pattern exists? | Cyclical or structural trends |

This transforms a timeline into an explanation — not just a list of dates.

---

### Visualization Output

The Timeline Agent should recommend how to display the timeline.

```json
{
  "visualization": {
    "type": "horizontal",
    "interactive": true,
    "groupBy": "year"
  }
}
```

| Type | Description |
|------|-------------|
| **Horizontal** | Left-to-right chronological bar |
| **Vertical** | Top-to-bottom timeline with alternating sides |
| **Interactive** | Clickable events with expandable details |
| **Milestone** | Key events only, widely spaced |
| **Comparative** | Two parallel timelines (e.g. India vs World) |
| **Dual Timeline** | Side-by-side comparison of two tracks |

### Workflow

```
Input (story + entities + facts + claims + sources)
  ↓
Extract Date-Anchored Events
  ↓
Classify: Historical / Story / Future
  ↓
Assign Event Type (15 types)
  ↓
Normalize Dates
  ↓
Order Chronologically (within each timeline)
  ↓
Link Events to Entities
  ↓
Apply Timeline Intelligence (patterns, gaps, triggers)
  ↓
Assign Future Status (confirmed/scheduled/expected/possible)
  ↓
Recommend Visualization
  ↓
Return Structured Output
```

### Quality Gate
- Every event has a non-empty `id`, `date`, `title`, and `type`
- Events are partitioned into historical / story / future
- Future events are labelled with a status — never present speculation as fact
- Every event references at least one entity (or is flagged)
- Events are ordered chronologically within each timeline
- Gaps longer than 6 months in historical timeline are flagged
- Date normalization is applied consistently
- Visualization recommendation is included
- Minimum 3 events across all timelines
