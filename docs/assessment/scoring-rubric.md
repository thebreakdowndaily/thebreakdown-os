# Scoring Rubric

> Phase 1 — Institutional Assessment
> Defines scoring methodology used in `implementation-gap-matrix.md`

---

## Scale

| Score | Label | Definition |
|-------|-------|------------|
| 0 | Missing | Feature/capability does not exist in the implementation. Not visible to the reader. |
| 1 | Prototype | Exists in a basic form. Functional but incomplete. Missing key elements from the governing specification. |
| 2 | Partial | Works but inconsistently. Some required aspects are present, others are missing or broken. |
| 3 | Implemented | Meets the specification. All required elements are present and functional. |
| 4 | Integrated | Works naturally with the rest of the platform. Reader cannot tell where one system ends and another begins. |
| 5 | Institutional | Feels invisible. The reader simply understands without thinking about the interface. Matches the intended institution completely. |

---

## Dimensions

Each surface is scored across these dimensions:

### Mission & Identity (weight: 10)
Does the page immediately communicate what The Breakdown is, what it produces, and why a reader should care?

| Score | Criteria |
|-------|----------|
| 0 | No identity — reader cannot tell what institution they are on |
| 1 | Name visible but purpose unclear |
| 2 | Name + tagline present + basic description |
| 3 | Name + tagline + purpose + genre (knowledge institution, not news) communicated within 10 seconds |
| 4 | Above + trust precedes content + institutional signals integrated |
| 5 | Reader immediately understands institution, trust, and where to begin without reading any documentation |

### Reader Experience (weight: 15)
Does the page serve the three reader types (Explorer, Scholar, Researcher)?

| Score | Criteria |
|-------|----------|
| 0 | Single view, no depth options |
| 1 | Reading mode concept exists but not functional |
| 2 | Reading modes available but no visible distinction between them |
| 3 | All three modes implemented with visible differences in content density |
| 4 | Modes coexist on same surface, reading position preserved across switches, content adapts appropriately |
| 5 | Modes feel natural — reader doesn't think about them, just gets the right depth automatically |

### Navigation & Orientation (weight: 10)
Can the reader always answer "Where am I?" and "Where can I go?"

| Score | Criteria |
|-------|----------|
| 0 | No orientation — reader cannot tell where they are in the platform |
| 1 | Back button works but no breadcrumb or progress indicator |
| 2 | Breadcrumb present but not on all pages |
| 3 | Breadcrumb + TOC + progress indicator on narrative pages |
| 4 | Above + deep links (#sections) + keyboard shortcuts + position persists across sessions |
| 5 | Reader always knows position and can move freely without conscious navigation effort |

### Visual Experience (weight: 10)
Does every visual teach something? Can the reader understand the story from visuals alone?

| Score | Criteria |
|-------|----------|
| 0 | No visuals, or visuals are purely decorative |
| 1 | Visuals present but sourced/provenanced minimally |
| 2 | Visuals have captions + sources + alt text, but no interactive features |
| 3 | Visual spine concept implemented — major sections each have an explanatory visual |
| 4 | Visuals are explorable (lightbox, zoom, layer toggle), linked to claims, and accessible |
| 5 | Reader can understand the full narrative from visuals alone. Every visual teaches something text cannot. |

### Knowledge Investigation (weight: 10)
Can the reader verify any claim in ≤1 interaction? Is evidence reachable from any claim?

| Score | Criteria |
|-------|----------|
| 0 | Claims have no visible evidence — reader cannot verify |
| 1 | Sources listed at end of page but no link from claims to sources |
| 2 | Some claims have inline evidence; most do not |
| 3 | Every claim has inline evidence with confidence score, one action from the claim |
| 4 | Evidence + counterargument + source provenance all reachable from any claim without leaving narrative flow |
| 5 | Investigation feels like a natural extension of reading — reader verifies without breaking flow |

### Trust & Transparency (weight: 15)
Does the reader encounter evidence of rigour before content? Are version, freshness, and corrections visible?

| Score | Criteria |
|-------|----------|
| 0 | No trust signals visible anywhere on the page |
| 1 | Trust signals exist but are buried in footer or hard to find |
| 2 | Version or last-verified visible but not consistently across pages |
| 3 | Version badge + last verified + confidence scores visible on all narrative content |
| 4 | State of the Evidence block + Trust Score + corrections access + methodology links integrated into reading flow |
| 5 | Trust feels inherent — reader never has to search for credibility signals |

### Learning Experience (weight: 10)
Can the reader identify what they should learn, test their understanding, and continue learning?

| Score | Criteria |
|-------|----------|
| 0 | No learning support — content is passive |
| 1 | Learning objectives present but minimal |
| 2 | Learning objectives + glossary present |
| 3 | Learning objectives + glossary + key takeaways + review questions |
| 4 | Above + inline glossary links + misconceptions addressed + learning path to next content |
| 5 | Reader knows what they should learn, confirms understanding, and naturally continues to the next learning object |

### Accessibility (weight: 10)
Can every reader, regardless of ability, access and understand all content?

| Score | Criteria |
|-------|----------|
| 0 | WCAG failures present — colour-only signals, missing alt text, keyboard traps |
| 1 | Some alt text, basic keyboard navigation works |
| 2 | WCAG AA for most content — some gaps remain |
| 3 | WCAG AA across all public surfaces |
| 4 | WCAG AA + AAA for navigation, focus management, screen reader announcements |
| 5 | Accessibility feels integrated, not bolted on — all interactions work with keyboard, screen reader, voice control |

### Performance (weight: 5)
Does the page load quickly and respond smoothly?

| Score | Criteria |
|-------|----------|
| 0 | Page fails to load, excessive CLS, or long TTI |
| 1 | LCP > 4s, CLS > 0.25 |
| 2 | LCP < 3s, CLS < 0.1 |
| 3 | LCP < 2.5s, CLS < 0.1, no hydration warnings |
| 4 | Above + INP < 200ms, all interactions smooth |
| 5 | Performance is invisible — reader never waits or experiences jank |

### Editorial Quality (weight: 15)
Does the page correctly represent the Editorial Constitution's standards?

| Score | Criteria |
|-------|----------|
| 0 | Content is opinion without evidence, or evidence is hidden |
| 1 | Content has sources but claims and evidence are not distinguished |
| 2 | Claims have evidence; interpretation is distinguished from fact inconsistently |
| 3 | Three-layer structure clear: fact vs interpretation vs editorial judgment. Language follows Language Constitution. |
| 4 | Evidence Spine present: claim → evidence → source → counterargument → editorial judgment → reader takeaway |
| 5 | Editorial Constitution is lived, not referenced — reader experiences the evidence standard in every paragraph |

---

## Composite Score

The composite score for each surface is the weighted average of its dimension scores:

```
composite = Σ(dimension_score × dimension_weight) / Σ(dimension_weights)
```

Rounded to one decimal place.

### Composite Levels

| Range | Meaning |
|-------|---------|
| 4.0–5.0 | Institutional — matches the designed institution |
| 3.0–3.9 | Implemented — functional but not fully integrated |
| 2.0–2.9 | Partial — visible gaps remain |
| 1.0–1.9 | Prototype — major work needed |
| 0.0–0.9 | Missing — does not exist |
