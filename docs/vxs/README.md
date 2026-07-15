# Visual Experience System (VXS)

> **Version 1.1 (Frozen)** — July 2026
>
> The six founding documents of VXS are frozen as of this date. Changes follow the same governance as the Editorial Constitution: proposal, review, approval, version increment. No silent evolution.
>
> **v1.1 update:** Taxonomy collapsed from 10 visual types to 7 canonical categories: Orientation, Evidence, Explanation, Context, Comparison, Timeline, Network. Every visual belongs to exactly one category. No decorative visuals.

### Cross-References

| Document | Relationship to VXS |
|----------|-------------------|
| Editorial Constitution Article VIII | Defines what every visual must contain (source, license, caption, purpose, alt text, claims, accessibility). VXS operates within Article VIII's requirements and does not override them. |
| AGENTS.md — Operating Doctrine | Defines asset acquisition workflow, evidence levels (A–E), cartographic policy, and asset register requirements. VXS references these conventions and does not replace the asset register or provenance audit. |
| RXS (Reader Experience System) | Peer experience system. RXS governs how readers learn through narrative surfaces; VXS governs how visuals teach through knowledge objects. Both operate at the same governance level and neither overrides the other. |
| Product Quality Standard | Defines measurable quality gates. VXS principles provide the criteria that visual-specific quality gates should reference. |
| Editorial OS | Defines the editorial workflow. VXS defines the visual production standards that workflow must enforce. |

| Founding Document | Status |
|------------------|--------|
| `README.md` | What VXS is — governance, scope, categories |
| `principles.md` | How visuals should behave — 10 immutable design principles |
| `visual-taxonomy.md` | The 7 visual categories and their pedagogical roles |
| `placement-rules.md` | Where visuals appear in relation to narrative flow |
| `interaction-patterns.md` | How readers engage with visuals |
| `asset-standards.md` | Production quality bar and technical requirements |
| `visual-spine.md` | The canonical visual sequence that carries the story |
| `visual-patterns.md` | Reusable visual storytelling templates per story type |

---

## 1. Mission

Transform every visual element from decoration into a knowledge object. A reader should never think "nice picture." They should think "now I understand."

The Editorial Constitution (Article VIII) guarantees what every visual must contain (source, license, caption, purpose, alt text, linked claims). VXS guarantees what every visual must do — the pedagogical role it serves, the cognitive load it reduces, and the understanding it enables.

Every visual in The Breakdown is a Knowledge Object. Like claims, sources, and timelines, visuals have canonical IDs, version histories, responsible editors, and stable URLs. A map is no less authored than a chapter. A chart is no less verified than a claim.

## 2. Reader Success

The Visual Experience System succeeds when a reader can:

- Immediately understand why a visual is present and what it teaches.
- Extract information from a visual faster than from the equivalent text.
- Trust that every visual is verified, sourced, and purposeful.
- Interact with visuals to explore depth without leaving the narrative flow.
- Encounter visuals that respect their attention, device, and accessibility needs.

## 3. Vision

A reader opens a chapter on the Radcliffe Line and the first visual — a map showing the boundary superimposed on a district-level religious demography layer — answers their core question in fifteen seconds. They do not read the caption first. They do not zoom in. The map is designed to be legible at its default size. The boundary is the visual subject; the demography is the context. The reader understands the line before they read a word of the chapter. The text then deepens what the visual established; it does not duplicate it.

## 4. Design Philosophy

**Pedagogy over decoration.** Every visual answers: "What does this teach that text alone cannot?" If the answer is nothing, the visual does not belong.

**Evidence before aesthetics.** A visual's first job is to communicate information accurately. Beauty is a secondary property that must never compromise truthfulness.

**Interaction is optional; understanding is not.** A visual must be fully legible at its default state. Zooming, toggling layers, or expanding annotations must reveal additional depth, not compensate for poor default design.

**Format follows function.** The visual category determines its production standards, placement rules, and interaction patterns. An Orientation map and a Context photograph have nothing in common except that both are visual objects.

**One visual, one job.** A visual that tries to show everything shows nothing. If a map requires eight legend items to understand, it should be split into two maps.

**Accessibility is not a layer.** Alt text is not added after the visual is designed. The visual must be conceived from the start so its full information content can be conveyed to a non-visual reader.

## 5. Governance

VXS sits within the Experience Systems layer of The Breakdown governance hierarchy:

| Level | Layer | Documents |
|-------|-------|-----------|
| 1 | **Constitution** | Editorial Constitution — defines what can be published, evidence standards, editorial ethics |
| 2 | **Operating Doctrine** | AGENTS.md — defines engineering workflows, execution rules, repository standards |
| 3 | **Experience Systems** | RXS (Reader Experience) — how readers learn through narrative |
| | | VXS (Visual Experience) — how visuals teach through knowledge objects |
| | | LXS (Learning Experience) — future system for structured learning paths |
| 4 | **Project Documents** | PRDs, PDRs, blueprints, implementation plans |
| 5 | **Implementation** | Code — canonical models, services, UI components |
| 6 | **Quality Standard** | Product Quality Standard — measurable quality gates |

VXS and RXS are peer experience systems. They define how readers experience knowledge, not what is true or how the institution is governed. Neither overrides the other — they operate in parallel.

VXS must comply with the Editorial Constitution (Article VIII) and must not contradict AGENTS.md operating doctrine. Within those constraints, VXS governs visual design and production standards autonomously.

## 6. Scope

The Visual Experience System governs:

- All visual assets rendered in chapters, stories, investigations, and collections across all 7 categories
- Interactive visual elements (zoomable maps, toggleable layers, annotated images)

It does not govern:

- UI chrome, icons, buttons, and navigation elements (Product Design)
- Layout, spacing, and page structure (RXS)
- Editorial standards for visual content (Editorial Constitution Article VIII)
- Asset acquisition and provenance tracking (Asset Register / Asset Management Rules)

## 7. Visual Categories

| # | Category | Core question | Pedagogical role | Production method |
|---|----------|---------------|-----------------|-------------------|
| 1 | **Orientation** | Where? | Show location, boundaries, distributions, flows | GIS vector recreation |
| 2 | **Evidence** | Proof? | Provide unmediated primary source access | Digitisation from holding archive |
| 3 | **Explanation** | How? | Show processes, sequences, decision trees | Original illustration |
| 4 | **Context** | What was it like? | Show human and material reality of a historical moment | Acquisition from holding archive |
| 5 | **Comparison** | How do they relate? | Show quantities, trends, comparisons | Original chart from data |
| 6 | **Timeline** | When? | Show chronological relationships | Rendered from knowledge model |
| 7 | **Network** | Who connects to whom? | Show relationships between entities | Original illustration |

## 8. Success Metrics

- Visual engagement rate (percentage of readers who pause on a visual, measured by scroll behaviour or interaction)
- Visual-to-text comprehension (survey: "Did the visual help you understand the concept?")
- Average time-on-visual (minimum threshold per visual type)
- Alt text adequacy (audit score against WCAG standards)
- Default-state legibility (percentage of readers who understand the visual without zooming or interaction)
- Evidence interaction (clicks from visual to linked claims or sources)
- Trust signal (survey: "Did this visual feel sourced and verified?")

## 9. Non-Goals

The Visual Experience System does not:

- Define editorial policy for visuals (Editorial Constitution Article VIII)
- Replace the asset register or provenance audit
- Specify chart colour palettes or brand typography (Design System)
- Define animation or motion design standards (future VXS v2)
- Dictate specific UI implementation (Product Design)

## 10. Founding Documents

| # | Document | Purpose |
|---|----------|---------|
| 1 | `README.md` | Governance, scope, visual categories |
| 2 | `principles.md` | 10 immutable design principles for all visuals |
| 3 | `visual-taxonomy.md` | 7 canonical categories with production standards |
| 4 | `placement-rules.md` | Visual-narrative spatial and sequential rules |
| 5 | `interaction-patterns.md` | Reader engagement patterns per category |
| 6 | `asset-standards.md` | Production quality bar and technical requirements |
| 7 | `visual-spine.md` | The canonical visual sequence that carries the story |
| 8 | `visual-patterns.md` | Reusable spine templates per story type |

VXS v1.0 is frozen. The eight founding documents above are the complete system. No additional VXS documents shall be created without a governance review and version increment.

## 11. Long-Term Vision

The Visual Experience System succeeds when a reader can understand any chapter by scrolling only its visuals. The text deepens, nuances, and proves — but the visual arc carries the story.

This is the standard the Visual Spine exists to achieve. It is not a future goal; it is a design target for every chapter from this point forward.
