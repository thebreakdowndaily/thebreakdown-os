# Five-Layer Architecture — Editorial Production Pipeline

**Author:** Editor-in-Chief  
**Date:** 14 July 2026  
**Status:** Draft — awaiting ratification  
**Source:** Editorial strategy session  

---

## Overview

If The Breakdown is to become the world's best digital knowledge institution, the architecture must be organised in five layers. Each layer builds on the one below it. No layer reaches into the one above.

```
Layer 5 ┌─────────────────────────────────────────┐
        │         Reader Experience               │
        │  Explorer · Scholar · Researcher modes  │
        ├─────────────────────────────────────────┤
Layer 4 │         Editorial Workspace             │
        │  Claims · Evidence · Sources · Review   │
        ├─────────────────────────────────────────┤
Layer 3 │         Chapter Blueprint               │
        │  Standardised section template          │
        ├─────────────────────────────────────────┤
Layer 2 │    Editorial Production Pipeline        │
        │  Research → Evidence → Claims → Publish │
        ├─────────────────────────────────────────┤
Layer 1 │         Canonical Knowledge             │
        │  Source · Claim · Evidence · Timeline   │
        │  Thinker · Relationship · Document      │
        │  Chapter · Collection                   │
        └─────────────────────────────────────────┘
```

---

## Layer 1 — Canonical Knowledge (~95% Complete)

**Freeze this layer. Do not add types.**

Already exists:

- Source
- Claim
- Evidence
- Timeline
- Thinker
- Relationship (entity, relationship-card)
- Document
- Chapter
- Collection

These are sufficient for every knowledge object The Breakdown will ever publish. New types are not needed — new *content* is.

**Rule:** If a piece of information cannot be expressed with these types, the solution is to represent it differently, not to add a new type.

---

## Layer 2 — Editorial Production Pipeline

This is the workflow that produces every Knowledge Monograph. **No writing happens before evidence.**

```
Research Question
        │
        ▼
Primary Sources
        │
        ▼
Secondary Scholarship
        │
        ▼
Evidence Extraction
        │
        ▼
Claims (with evidence references)
        │
        ▼
Counterarguments
        │
        ▼
Editorial Judgment
        │
        ▼
Knowledge Blocks
        │
        ▼
Visual Assets
        │
        ▼
Peer Review
        │
        ▼
Publish
```

Each stage produces a concrete, reviewable artefact before the next stage begins. The Evidence stage must produce evidence entries before the Writing stage composes prose.

---

## Layer 3 — Chapter Blueprint

Every Knowledge Monograph follows the same template. This is not a constraint — it is what makes the collection coherent.

```
╔════════════════════════════════════════╗
║         CHAPTER BLUEPRINT             ║
╠════════════════════════════════════════╣
║ Hero                                   ║
║ Executive Summary                      ║
║ Six Questions (persistent navigator)   ║
║                                        ║
║ What happened?                         ║
║   Historical Context                   ║
║   Narrative (with embedded claims)     ║
║                                        ║
║ Why did it happen?                     ║
║   Explanations (multiple schools)      ║
║   Evidence blocks                      ║
║                                        ║
║ Who were the key thinkers?             ║
║   Thinker profiles                     ║
║   Scholarly debates                    ║
║                                        ║
║ What alternatives existed?             ║
║   Decision matrices                    ║
║   Counterfactuals                      ║
║                                        ║
║ What evidence exists?                  ║
║   Timeline                            ║
║   Documents (with annotations)         ║
║   Maps                                ║
║   Charts                              ║
║   Relationships (entity network)       ║
║   Historiography                       ║
║                                        ║
║ What is still unknown?                 ║
║   Open Questions                       ║
║                                        ║
║ Why does this matter today?            ║
║   Legacy Today                         ║
║   Strategic bridge to next volume      ║
║                                        ║
║ How can I learn more?                  ║
║   Learning objectives                  ║
║   Glossary                             ║
║   Further reading                      ║
║   Primary sources list                 ║
╚════════════════════════════════════════╝
```

---

## Layer 4 — Editorial Workspace (Not Built)

This is the biggest missing piece. Not a public feature — an internal editorial CMS.

Instead of editing a 2,700-line TypeScript file, editors work in a structured workspace:

```
Knowledge Workspace
  └── India's Inheritance
        ├── Claims (18)
        │     ├── Claim: "Partition's violence..."
        │     │     ├── Confidence: Established
        │     │     ├── Evidence (3 sources)
        │     │     ├── Counterarguments (1)
        │     │     ├── Sources: [s11, s1, s27]
        │     │     ├── Linked Images: [sup-01, sup-02]
        │     │     ├── Timeline Events: [aug-1947, sep-1947]
        │     │     └── Editorial Note: "..."
        │     └── ...
        ├── Evidence (65 entries)
        ├── Documents (5)
        ├── Maps (10)
        ├── Photos (25)
        ├── Thinkers (10)
        ├── Timeline (22 events)
        └── Review Status: 92% — Blocked
```

**Capabilities:**
- CRUD on every knowledge type (claim, evidence, source, document, etc.)
- Linking between types (which evidence supports which claim? which images link to which claim?)
- Visual asset gallery with provenance tracking
- Review status per item
- Task assignments per section
- No code required — editors never touch TypeScript

**Analogy:** Notion + Airtable + Obsidian, purpose-built for knowledge production.

---

## Layer 5 — Reader Experience

Three reading modes projecting the same canonical knowledge:

```
Explorer Mode
  Summary
  Timeline
  Maps
  Key Facts
  Glossary

Scholar Mode
  Everything above plus:
  Evidence blocks
  Thinker profiles
  Document annotations
  Historiography

Researcher Mode
  Everything above plus:
  Raw claims with evidence references
  Counterarguments and contradictions
  Source list with URLs
  Editorial notes
  Version history
```

No data duplication. Each mode is a projection of the same canonical Layer 1 objects.

---

## Feature: Mission Control (Editorial Dashboard)

Not engineering metrics — editorial metrics:

```
╔═══════════════════════════════════════════════╗
║           THE BREAKDOWN · MISSION CONTROL     ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  Institutional Trust          ████████░░ 92   ║
║  Open Claims                  17              ║
║  Evidence Debt                24              ║
║  Visual Assets Missing        13              ║
║  Peer Reviews Pending         2               ║
║  Sources Updated              4               ║
║  Freshness Alerts             6               ║
║                                               ║
║  Latest: Chapter 2 — Draft    (65%)           ║
║  Next review: 21 July 2026                    ║
╚═══════════════════════════════════════════════╝
```

---

## Feature: Review Workflow (GitHub PRs for Editorial)

Every Knowledge Monograph passes through stages with sign-offs:

```
Research    → [Researcher signs off]
    ↓
Writer      → [Writer signs off]
    ↓
Verifier    → [Verifier signs off]
    ↓
Historian   → [External historian signs off]
    ↓
IR Scholar  → [External IR scholar signs off]
    ↓
Visual Editor → [Visual editor signs off]
    ↓
Managing Editor → [Managing editor signs off]
    ↓
Editor-in-Chief → [EIC signs off]
    ↓
Publish
```

Like GitHub PRs — each stage can request changes, approve, or block.

---

## Implementation Priority

Given the 10% engineering effort rule:

| Priority | What | Effort | Depends On |
|----------|------|--------|------------|
| P0 | Complete Monograph 1 blockers (counterarguments, primary-source audit, visual provenance, external review) | 4–6 weeks | Nothing |
| P1 | Knowledge Workspace (CRUD for canonical types) | 4–6 weeks | Layer 1 frozen |
| P1 | Mission Control (editorial dashboard) | 2–3 weeks | Knowledge Workspace |
| P2 | Review Workflow (PR-style sign-offs) | 3–4 weeks | Knowledge Workspace |
| P2 | Chapter Blueprint template (standardised section layout) | 1–2 weeks | Nothing |
| P3 | Reader Experience three-mode projection | 4–6 weeks | Layer 1 frozen |
| P3 | Editorial Production Pipeline tooling | 2–3 weeks | Knowledge Workspace |
| P4 | Explorer / Scholar / Researcher mode refinements | Ongoing | Reader Experience |

---

## Relationship to Existing Architecture

This document does not change the existing architecture. It organises it into layers and identifies gaps:

- **Layer 1** (Canonical Knowledge) is already implemented in `types/canonical.ts`, `utils/data-layer/knowledge-library-data.ts`, and the knowledge core services. Freeze.
- **Layer 2** (Production Pipeline) is implicit in the manual workflow. The Editorial Workspace would make it explicit.
- **Layer 3** (Chapter Blueprint) is partially represented by the block ordering in `chapter1Blocks`. Formalise as a reusable type.
- **Layer 4** (Editorial Workspace) does not exist. This is the single biggest missing piece.
- **Layer 5** (Reader Experience) is partially implemented via the `depth` field on blocks and the `ReadingModeToggle` component.

---

*This document captures editorial strategy feedback received 14 July 2026. It is a Level 3 Project Document. It does not supersede the Editorial Constitution (Level 1) or AGENTS.md (Level 2). It is intended to guide the 10% engineering effort toward the highest-value editorial capabilities.*
