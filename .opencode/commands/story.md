# THE BREAKDOWN
## Story Command v1.0 — Narrative Architecture

### Mission
Structure the research, verified facts, timeline, and entities into a coherent narrative.

### Required Sections (in order)
1. **The Opening** — Cold start. One paragraph that tells the reader what happened, why now, and why it matters.
2. **The Evidence** — Every claim with source attribution, evidence type, and confidence score. Structured as h3 sub-sections.
3. **The Data** — Key numbers presented as tables, stats cards, or charts. At least 3 data points.
4. **The Debate** — Competing positions presented fairly. Each position with evidence assessment.
5. **The Bigger Picture** — Historical context, systemic connections, global comparisons.
6. **What's Next** — Scenarios (Best Case / Most Likely / Worst Case) with confidence percentages.
7. **Primary Sources** — Numbered table with source, type, and reliability.

### Architecture Rules
- Every h2 section maps to a section type in the schema
- Every h3 sub-section within Evidence must be a discrete claim
- Confidence scores on every evidence block
- At least one inline chart or data table in The Data section
- Scenarios in What's Next must total 100%

### Tone
- Declarative. No "could", "might", "possibly" without explicit uncertainty label.
- Evidence-first: "X happened (Source, Confidence)" not "It is believed that X happened."
- Avoid passive voice. Attribute agency: "The Supreme Court froze allocations" not "Allocations were frozen."
