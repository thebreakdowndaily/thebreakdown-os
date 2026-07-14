# RXS Changelog

## v1.0 — 14 July 2026

### Documents Included

| Document | Content |
|----------|---------|
| `README.md` | What RXS is, Reader Success, Design Philosophy, Reader Types, Principles Summary, Product Scope, Non-Goals, Deliverables, Constraints, Sprint Roadmap, Success Metrics |
| `principles.md` | 10 immutable UX principles with Why, Rule, Examples, Anti-patterns, Enforcement |
| `information-architecture.md` | Canonical knowledge hierarchy, reader navigation model, URL philosophy, 10 design rules |
| `story-experience.md` | Reader journey, emotional arc, reading modes, story anatomy, trust moments, failure modes, rules |
| `component-philosophy.md` | 7 component categories, hierarchy, lifecycle, trust components, knowledge components, constraints |
| `screens/story.md` | Canonical Story screen: goal, reader intent, lifecycle, screen regions, information priority, knowledge flow, reader decisions, completion, metrics, anti-patterns |
| `screens/knowledge-library.md` | Knowledge Library browsing: reader intent, lifecycle, knowledge organisation, discovery paths, progress model, continue learning, trust signals, failure modes, metrics |
| `screens/investigation.md` | Investigation case-file: reader intent, lifecycle, anatomy (17 sections), evidence philosophy (5 types), reader decisions, living investigation states, trust signals, failure modes, metrics, rules |
| `screens/homepage.md` | Front door learning-launch: reader intent, first 30 seconds, lifecycle, canonical sections, reader decisions, trust signals, personalisation philosophy, failure modes, metrics, rules |
| `screens/search.md` | Knowledge Explorer discovery system: reader intent, discovery philosophy, 12 discovery modes, lifecycle, result philosophy, filters, reader decisions, trust signals, failure modes, metrics, rules |
| `screens/workspace.md` | Reader workspace: reader intent, lifecycle, 12 sections, reader decisions, trust signals, failure modes, metrics, rules |

### Freeze Date

14 July 2026.

### Guiding Principles

1. **Evidence before decoration.** Every design decision is justified by how it helps a reader move from curiosity to understanding.

2. **Progressive disclosure.** Surface the minimum needed for the current stage. Depth is available on demand, never forced.

3. **Reader agency.** The reader chooses their depth — Explorer, Scholar, Researcher. The platform adapts, never assumes.

4. **Trust precedes engagement.** Trust signals appear before content. The reader evaluates credibility before committing attention.

5. **Knowledge objects, not pages.** Every surface renders canonical knowledge objects. No duplicated facts, no inconsistent presentations.

6. **Discovery over search.** Readers discover knowledge through twelve dimensions. Keyword search is a fallback, not the default.

7. **The reader owns their workspace.** All highlights, notes, collections, and bookmarks are exportable. The reader's data belongs to the reader.

8. **Living knowledge.** Investigations evolve, chapters update, corrections are permanent. Every surface reflects the current state of knowledge.

9. **Every surface has a job.** No section exists without an explicit purpose. If a section cannot justify its existence in thirty words, it is removed.

10. **Failure modes define success.** Every screen document names its failure modes. Success is measured by the absence of known failure patterns.

### Future Changes Policy

1. All changes to frozen RXS documents follow the same governance as the Editorial Constitution: proposal, review, approval, version increment.

2. A change is any modification to a frozen document's content, structure, or scope. Corrections of typographical errors do not require a version increment but must be logged.

3. Proposals must name: the document, the proposed change, the rationale, and the expected impact on downstream implementation.

4. Review requires at least one editor and one engineer who have read the affected document.

5. Approval requires the Product Design Director (or equivalent) and one additional reviewer from Editorial or Engineering.

6. Version increment: minor (x.y) for clarifying or extending existing sections without contradicting them; major (y.0) for changes that alter design direction or contradict existing guidance.

7. The changelog is updated with every version increment: date, author, summary of changes, affected documents, and version number.

8. No silent evolution. Every change is recorded. The changelog is the permanent record of the RXS's evolution.

### Related Documents

- Editorial Constitution v1.1 (Locked) — governs content and evidence
- Engineering Architecture — governs implementation
- AGENTS.md v1.0 — governing doctrine
