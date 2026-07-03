# THE BREAKDOWN
## Test: Timeline Agent v1.0

**Target**: timeline-agent.md
**Output Schema**: timeline.schema.json
**Event Schema**: timelineEvent / futureEvent ($defs)

---

## 1. Schema Conformance

### 1.1 Top-Level Structure
- [ ] Output contains `timeline` object
- [ ] `timeline` has `historical`, `story`, and `future` arrays
- [ ] Output contains `visualization` object (or is present)

### 1.2 Timeline Event (`timelineEvent`)
- [ ] Every event has `id` (string), `date` (string), `title` (string), `type` (string)
- [ ] Every event `type` is one of the 15 enum values
- [ ] `confidence` is a number between 0 and 1 if present
- [ ] `entities` is an array of strings if present
- [ ] `sources` is an array if present

### 1.3 Future Event (`futureEvent`)
- [ ] Every future event has `status` field
- [ ] `status` is one of: confirmed, scheduled, expected, possible
- [ ] Same field requirements as timelineEvent

### 1.4 Visualization
- [ ] `visualization.type` is one of: horizontal, vertical, interactive, milestone, comparative, dual
- [ ] `visualization.interactive` is a boolean if present
- [ ] `visualization.groupBy` is a string if present

---

## 2. Timeline Partitioning

### 2.1 Historical Timeline
- [ ] Contains past events that provide context
- [ ] Events are ordered chronologically (earliest first)
- [ ] Gaps longer than 6 months are flagged
- [ ] Minimum 2 events

### 2.2 Story Timeline
- [ ] Contains events directly related to the current news
- [ ] Events are tightly scoped (not historical background)
- [ ] Events are ordered chronologically
- [ ] Minimum 2 events

### 2.3 Future Timeline
- [ ] Contains expected, scheduled, or possible future events
- [ ] Every event has a `status` label
- [ ] No speculation is presented as fact
- [ ] Minimum 1 event (or explicit note that none exist)

---

## 3. Event Type Classification

- [ ] Every event has a valid `type` from the 15-value enum
- [ ] Law, Policy, Election, Budget, Court, Technology, Disaster, War, Agreement, Project, Report, Speech, Scheme, Economic Data, International Event
- [ ] No event typed as `Unknown` or left untyped

---

## 4. Entity Linking

- [ ] Every event references at least one entity ID
- [ ] Entity IDs in events match entities from entity-agent output
- [ ] No broken entity references
- [ ] Relation chains are documented (event → entity → entity)

---

## 5. Date Normalization

- [ ] All dates are in machine-readable format (YYYY-MM-DD, YYYY-MM, or YYYY)
- [ ] Relative dates ("last year", "Q2 2026") are resolved to absolute
- [ ] Partial dates are allowed where full date is unknown
- [ ] `note` field captures original ambiguous text if applicable

---

## 6. Timeline Intelligence

- [ ] What happened before? — antecedent context is present
- [ ] What changed? — inflection points are identified
- [ ] What triggered this? — root cause is traceable
- [ ] What happens next? — future timeline covers this
- [ ] Has this happened before? — pattern recognition applied
- [ ] How long did it take? — duration between key events is clear
- [ ] What pattern exists? — cyclical or structural trends noted

---

## 7. Future Status Labels

- [ ] `confirmed` — officially announced, date and event locked
- [ ] `scheduled` — planned, not yet locked
- [ ] `expected` — likely based on evidence
- [ ] `possible` — speculative, clearly labelled

No future event lacks a status label.

---

## 8. Visualization Recommendation

- [ ] Visualization type is appropriate for the data
- [ ] `interactive` is true for timelines with >10 events
- [ ] `groupBy` is set to year, month, or category

---

## 9. Quality Gate

- [ ] Every event has non-empty `id`, `date`, `title`, and `type`
- [ ] Events are partitioned into historical / story / future
- [ ] Future events have status — no speculation as fact
- [ ] Every event references at least one entity (or flagged)
- [ ] Events are ordered chronologically within each timeline
- [ ] Gaps > 6 months in historical timeline flagged
- [ ] Date normalization applied consistently
- [ ] Visualization recommendation included
- [ ] Minimum 3 events across all timelines

---

## Results

| Section | Pass | Fail | N/A |
|---------|------|------|-----|
| 1. Schema Conformance | ☐ | ☐ | ☐ |
| 2. Timeline Partitioning | ☐ | ☐ | ☐ |
| 3. Event Type Classification | ☐ | ☐ | ☐ |
| 4. Entity Linking | ☐ | ☐ | ☐ |
| 5. Date Normalization | ☐ | ☐ | ☐ |
| 6. Timeline Intelligence | ☐ | ☐ | ☐ |
| 7. Future Status Labels | ☐ | ☐ | ☐ |
| 8. Visualization Recommendation | ☐ | ☐ | ☐ |
| 9. Quality Gate | ☐ | ☐ | ☐ |
| **Overall** | **☐** | **☐** | **☐** |
