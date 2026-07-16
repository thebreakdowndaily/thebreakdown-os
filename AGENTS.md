# AGENTS.md

# THE BREAKDOWN OS — Platform Beta

Version: 1.0

Status: Living Document — Editorial Operating Doctrine — Platform Beta

Last Updated: 16 Jul 2026

**All architectural documents are frozen.** No further architectural work unless a bug forces it. Every future commit must answer: "Can a reader notice this?"

**Platform Beta**: The infrastructure phase is complete. All future engineering must produce improvements a first-time reader can notice within five minutes. No new generic infrastructure.

---

# Handover: CTO → Editor-in-Chief

The engineering roadmap has concluded. This document is now the **operating doctrine** of an editorial institution, not a software specification.

The CTO role that built the platform has formally ended. Day-to-day ownership now rests with the **Editor-in-Chief**, supported by the four bureaus defined below (Research, Editorial, Verification, Knowledge Operations). Engineering work continues only as the 10% effort permitted by the governance hierarchy — and only when it directly improves editorial quality, discoverability, or maintainability.

The limiting factor is no longer technology. It is the institution's ability to consistently produce work that lives up to the standards in the Editorial Constitution. The next several years belong to subject-matter expertise — historians, foreign policy scholars, archivists, and fact-checkers — not additional code.

---

# Mission

The Breakdown is **not** a news website.

It is a Knowledge Operating System.

Mission:

Transform information into understanding.

Every engineering decision must improve:

- Trust
- Understanding
- Verification
- Context
- Accessibility
- Long-term maintainability

Never optimize purely for engagement, clicks, or short-term growth.

---

# Product Vision

The Breakdown combines the strengths of:

- Wikipedia
- Bloomberg Terminal
- Our World in Data
- Notion
- Perplexity
- OpenAlex
- GitHub

while remaining a coherent, evidence-first platform.

---

# Engineering Principles

Always optimize for:

1. Readability
2. Maintainability
3. Performance
4. Accessibility
5. Type Safety
6. Testability

Never optimize only for fewer lines of code.

Code should be obvious rather than clever.

### Everything is a Knowledge Object

Stories, investigations, chapters, documents, datasets, timelines, maps, thinkers, FAQs, evidence, decisions, and counterfactuals must all be represented as structured knowledge objects rendered by the same registry-driven engine. UI components never compute knowledge — they only render canonical models. If a piece of information cannot be expressed as a Knowledge Object, the architecture is missing a type, not the UI missing a feature.

### Knowledge First

The Breakdown never creates pages. It creates Knowledge Objects.

Pages are temporary projections of knowledge. Every piece of information must exist once in canonical form and may be rendered many ways. A claim lives in the Claim Registry — it may appear in a chapter, a story, a timeline, and a thinkpiece, but it is authored and verified in one place. A source lives in the Source Registry — every citation across every collection points to the same canonical record.

If code asks "where should this data live?", the answer is always: in the knowledge model, not in a page. Pages are views. Knowledge is the source of truth.

---

# Tech Stack

Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

Backend

- Supabase
- PostgreSQL

Infrastructure

- Vercel
- Cloudflare

Repository

- GitLab

Architecture

- Service Layer
- Repository Pattern
- Canonical Types
- Knowledge Graph
- Event Bus
- REST API
- AI Layer

---

# Repository Structure

app/
components/
services/
lib/
types/
tests/
docs/
adr/
rfc/
prompts/

Never create new top-level folders without approval.

---

# Canonical Source of Truth

The following files define architecture.

They must not be duplicated.

types/canonical.ts

services/

lib/events/

lib/graph/

Do not create alternative implementations.

---

# Architecture Rules

Do NOT

❌ Rewrite architecture

❌ Replace Service Layer

❌ Replace Repository Pattern

❌ Change database schema

❌ Rename public APIs

❌ Break routes

❌ Introduce duplicate types

❌ Create parallel systems

Always extend existing architecture.

---

# Component Rules

Maximum component size

250 lines

Warning

300 lines

Mandatory refactor

500 lines

Epic required

1000 lines

Use composition.

Avoid monolithic components.

---

# Accessibility Rules

Every feature must support:

Keyboard navigation

Screen readers

Focus management

ARIA

Semantic HTML

Color contrast

WCAG AA minimum

AAA whenever practical

Never regress accessibility.

---

# Performance Rules

Prefer:

Server Components

Streaming

Suspense

Code Splitting

Dynamic Imports

Image Optimization

Memoization only when measured.

Avoid premature optimization.

---

# Design System

Use existing primitives.

Do not create duplicate:

Buttons

Cards

Containers

Badges

Typography

Spacing

Colors

Use design tokens.

---

# TypeScript Rules

Strict mode.

Never use:

any

unknown as escape hatch

@ts-ignore

unless explicitly approved.

Prefer:

interfaces

discriminated unions

canonical types

---

# State Management

Prefer:

Server State

↓

Services

↓

View Models

↓

Local Component State

Avoid unnecessary global state.

---

# Services

Business logic belongs inside services.

React components should primarily render UI.

---

# Analytics

Use PluginAnalyticsService.

Never call analytics providers directly.

All tracking must go through plugins.

---

# AI Layer

AI should assist.

AI should never become the source of truth.

Generated content must remain reviewable.

Evidence always overrides AI output.

---

# Security

Never expose:

API keys

Secrets

Tokens

Database credentials

Never commit secrets.

---

# SEO

Every page requires:

Title

Description

Canonical URL

Open Graph

Twitter Card

Structured Data where appropriate

---

# Testing

Every change must pass:

npm run lint

npm run typecheck

npm run build

Tests when applicable.

Never merge failing builds.

---

# Definition of Done

A feature is complete only if:

✓ Build passes
✓ Lint passes
✓ TypeScript passes
✓ Product Quality Standard gates pass (docs/product-quality.md)
✓ Accessibility preserved
✓ Performance unchanged or improved
✓ Documentation updated
✓ ADR updated if architecture changed
✓ Public APIs unchanged
✓ Tests added or updated

---

# Sprint Completion Principle

Every sprint must be independently demonstrable.

If you finish a sprint, you must be able to show someone the website and say:

"This is what changed."

If the change requires explaining internal architecture, registries, or refactoring, then it isn't a completed sprint from the reader's perspective.

---

# Pull Request Rules

Small PRs.

Prefer:

<500 changed lines

Logical commits.

One concern per PR.

---

# Git Workflow

Issue

↓

Branch

↓

Implementation

↓

Review

↓

CI

↓

Merge Request

↓

Review

↓

Merge

Never commit directly to main.

---

# Documentation

If architecture changes:

Update:

Architecture.md

README.md

ADR

RFC

Never leave documentation behind.

---

# AI Instructions

Before modifying code:

1. Read README.md

2. Read AGENTS.md

3. Read Editorial Constitution (docs/editorial/editorial-constitution.md)

4. Read Editorial Review Checklist (docs/editorial/editorial-review-checklist.md)

5. Read docs/

6. Read ADRs

7. Read RFCs

8. Understand the task

Do not start coding immediately.

Produce a plan first.

When generating content, every paragraph must satisfy the Evidence Standard:

- "How do we know this?"
- Follow the Evidence Spine: Research Question → Evidence → Claim → Explanation → Counterargument → Editorial Judgment → Reader Takeaway
- Distinguish four layers: What Happened / What the Evidence Shows / Where Historians Disagree / Why It Matters
- Never use prohibited language ("clearly," "obviously," "undoubtedly")

---

# Refactoring Rules

Prefer:

Incremental

Measurable

Reversible

Do not perform repository-wide rewrites.

One module at a time.

---

# Review Philosophy

Every change must answer:

Why is this better?

How is it measured?

Can it be rolled back?

What future work becomes easier?

---

# Implementation Traceability

No implementation may be merged unless it references the governing document that justifies it.

Every component, route, service, and feature must include a comment or metadata tag identifying the specific governing document (Editorial Constitution, RXS, or Engineering Architecture) that defines its requirements.

Examples:
- `StoryShell` → `docs/rxs/screens/story.md`
- `Knowledge Library` → `docs/rxs/screens/knowledge-library.md`
- `Claim Card` → `docs/rxs/component-philosophy.md`
- `Evidence Panel` → `Editorial Constitution v1.1`

This creates traceability from vision to specification to code. As the project grows and more contributors join, this discipline ensures every implementation decision can be traced to its governing rationale.

If code cannot reference a governing document, either the governing documents are incomplete or the implementation is out of scope.

---

# Platform Beta Rules (v1.0)

## Infrastructure Ban

No new generic infrastructure:

❌ No new registries
❌ No new abstractions
❌ No new service layers
❌ No new rendering engines
❌ No new repository implementations

Every sprint must improve something a reader can actually experience. Speculative infrastructure is permanently out of scope.

The platform is mature enough that additional engineering produces diminishing returns. The bottleneck is now editorial, not technical.

## Experience Rule

Every sprint must produce at least **one improvement that a first-time reader can notice within five minutes** of using the product.

This is a forcing function against invisible infrastructure. If the improvement cannot be seen, felt, or interacted with, it is not the highest-priority thing to build next.

## One New Capability Per Sprint

Each sprint delivers exactly one new reader-facing capability. If a sprint accumulates unrelated improvements, split it.

This prevents "while I'm here..." scope creep that erodes architecture focus. A sticky TOC sprint adds a sticky TOC — it does not also refactor the footer, add keyboard shortcuts, or touch unrelated components.

## Understanding Metrics

Technical events measure clicks. Understanding metrics measure learning journeys.

Track the canonical reader journey:

```
Reader starts → Opens Evidence → Returns to Narrative → Completes Story → Clicks Continue Learning
```

Each step in this sequence is a stronger signal than a page view. A reader who completes this journey understood something. A reader who bounced did not.

These metrics should appear alongside technical events in analytics dashboards. They define product success, not engagement.

---

# Final Principle

Optimize for the codebase that will still be understandable in 2045.

The Breakdown is intended to become one of the world's most trusted knowledge platforms.

Every engineering decision should move the repository toward that goal.

---

# Governance Hierarchy

The Breakdown Knowledge Platform is governed by a five-level hierarchy. No lower-level document may contradict a higher-level one.

## Level 1 — Constitution

**`docs/editorial/editorial-constitution.md`**

The Editorial Constitution is the supreme governing document for The Breakdown Knowledge Platform. It defines:

- Core principles (Article I)
- Editorial ethics (Article II)
- Evidence hierarchy (Article III)
- Claims requirements (Article IV)
- Neutrality standards (Article V)
- Historiography standards (Article VI)
- Language rules (Article VII)
- Visual standards (Article VIII)
- Knowledge Object governance (Article IX)
- Editorial workflow (Article X)
- Gold Standard Review (Article XI)
- Knowledge lifecycle (Article XII)
- Transparency requirements (Article XIII)
- Quality gates (Article XIV)
- Institutional memory (Article XV)
- Long-term vision (Article XVI)

All editorial, research, verification, and publication decisions must conform to it.

If any other document conflicts with the Editorial Constitution on editorial matters, the Editorial Constitution takes precedence.

## Level 2 — Operating Doctrine

**`AGENTS.md` (this file)**

Defines engineering workflows, execution rules, CTO directives, repository standards, architecture, and implementation practices.

If AGENTS.md conflicts with the Editorial Constitution, the Editorial Constitution takes precedence for editorial matters.

## Level 3 — Experience Systems

Three peer experience systems define how readers encounter, understand, and learn from knowledge:

**RXS (Reader Experience System)** — `docs/rxs/`

Defines the reader's journey through narrative surfaces: screen layouts, information architecture, navigation patterns, reading modes, and the overall sensory experience of knowledge.

**VXS (Visual Experience System)** — `docs/vxs/`

Defines how visuals teach: the Visual Spine, visual taxonomy, placement rules, interaction patterns, production standards, and reusable visual patterns per story type.

**LXS (Learning Experience System)** — *future*

Defines structured learning paths, knowledge scaffolding, and progressive understanding across collections. Not yet defined.

These three systems are peers. They define how readers experience knowledge, not what is true or how the institution is governed. Each operates autonomously within its domain. None overrides another — they are complementary.

## Level 4 — Project Documents

PRDs, blueprints, roadmaps, sprint plans, and implementation plans. Project documents operate within the constraints defined by Levels 1–3.

## Level 5 — Implementation

Code — canonical models, services, UI components, and the rendering engine. Implementation must conform to all higher levels.

## Supporting Standard — Product Quality Standard

**`docs/product-quality.md`**

Defines measurable quality gates every feature must satisfy before shipping: navigation, trust, performance, accessibility, mobile, learning, SEO, and analytics requirements.

The Product Quality Standard is not a governance level — it is a verification layer that applies horizontally across all levels. It distils governance requirements into measurable criteria.

Every PR must pass applicable gates from the Product Quality Standard before merging. It may not contradict any higher-level document.

---

# Editorial Governance

## Compliance Requirement

Every Story, Investigation, Chapter, Collection, and Knowledge Object must comply with the Editorial Constitution.

Engineering exists to support editorial quality, not replace editorial judgment.

Editorial standards take precedence over implementation convenience.

## Mandatory Reading

Every future contributor must read the Editorial Constitution before:

- Contributing content to any knowledge object
- Modifying editorial workflows
- Building features that affect editorial presentation
- Reviewing or fact-checking content

## Gold Standard Review — Mandatory Workflow Stage

No chapter may transition from Editorial Review to Published until it passes the Gold Standard Review.

### Research → Writing → Internal Review → Knowledge Completeness Check →

```
Gold Standard Review
├── Phase 1 — Expert Review
│   Subject-matter experts review for accuracy, fairness, completeness.
│   Minimum 2 experts from different disciplinary/interpretive perspectives.
├── Phase 2 — Reader Review
│   Four reader profiles (UPSC aspirant, MA History student, journalist, layperson).
│   Report confusion points using: "Where did you become confused?"
├── Phase 3 — Evidence Audit
│   Every claim independently verified against cited sources.
│   Counter-evidence checked. Not by the writer.
├── Phase 4 — Bias Audit
│   Systematic review for: nationalist bias, imperial bias, presentism,
│   hindsight bias, selection bias, confirmation bias.
├── Phase 5 — Visual Audit
│   Every visual reviewed for provenance, legality, pedagogical purpose,
│   and accessibility. Does it teach something or just decorate?
├── Phase 6 — Knowledge Density Audit
│   Automated and manual check against density targets:
│   claims (50+), evidence (120+), sources (100+), documents (15+),
│   images (20+), maps (10+), thinkers (10+), historiography (6+),
│   learning objectives (10+).
└── Phase 7 — Defensibility Audit
    "Could we defend this?" For every major interpretive claim:
    claim → evidence → primary source → scholarly disagreement → reasoning.
```

### → Publication → Knowledge Lifecycle

## Review Checklist

The practical review tool is at `docs/editorial/editorial-review-checklist.md`. It provides concrete yes/no criteria and scoring for each Gold Standard Review phase, ensuring consistent application across editors.

---

# CTO Directive v2.0 — Knowledge Completeness

## Platform Status

| Area | Status |
|------|--------|
| Architecture | ✅ Complete |
| Rendering Engine | ✅ Complete |
| Registry System | ✅ Complete |
| Knowledge Engine | ✅ Complete |
| Knowledge Graph | ✅ Complete |
| Canonical Knowledge Layer | ✅ Complete |
| Reader Modes | ✅ Complete |
| Service Layer | ✅ Complete |
| Platform Foundation | ✅ Production Ready |

**Engineering Completion: ~90%**

The remaining engineering must only support editorial capabilities — not invent new abstractions.

## Strategic Pivot

**From:** Build features
**To:** Build the world's best knowledge collection.

## 90/10 Rule

- **90% effort** → research, writing, verification, sourcing, editorial workflow, completing Volume I to publication quality
- **10% effort** → engineering that directly improves editorial quality, discoverability, or maintainability

Competitive advantage comes from authoritative, transparent, evidence-backed knowledge — not more components.

## Knowledge Completeness Principle

A chapter cannot be marked Published until it satisfies a defined editorial checklist:

| Requirement | Status |
|-------------|--------|
| Historical context | ✅ |
| Primary sources | ✅ |
| Multiple perspectives | ✅ |
| Timeline | ✅ |
| Maps | ✅ |
| Claims linked | ✅ |
| Evidence verified | ✅ |
| Counterarguments | ✅ |
| Thinkers | ✅ |
| Learning section | ✅ |
| Glossary | ✅ |
| Further reading | ✅ |

Only then: **Status: Published**

## Six Questions Framework

Every chapter must answer:

1. What happened?
2. Why did it happen?
3. What alternatives existed?
4. Why did India choose this path?
5. What were the consequences?
6. Why does it matter today?

## Long-Term Vision — Flagship Collections

All powered by the same canonical knowledge architecture:

```
The Breakdown Knowledge Platform
├── India and the World
│   ├── Vol I (1947–1962)
│   ├── Vol II (1962–1971)
│   ├── Vol III (1971–1991)
│   ├── Vol IV (1991–2014)
│   └── Vol V (2014–Present)
├── The Indian Constitution
├── Indian Economy
├── Indian Elections
├── India's Wars
├── Judiciary
├── Climate Change
├── Artificial Intelligence
├── Global Trade
└── Public Policy
```

**Hard rule:** Do NOT start Volume II until Volume I is finished. One perfect volume > five unfinished ones.

## Priorities (Next 3 Months)

### Priority 1 — Publish Volume I
12–20 complete chapters for Foundations (1947–1962). Each exercises claims, evidence, documents, timelines, thinkers, relationship cards, learning blocks, glossary, and primary sources.

Suggested chapters:
- The Partition and Its Legacies
- India's Strategic Inheritance
- Nehru's Worldview
- Integration of Princely States
- Kashmir 1947–48
- United Nations and India
- Panchsheel
- Bandung Conference
- Birth of Non-Alignment
- Tibet
- Sino-Indian Relations
- The 1962 War
- Lessons Learned
- Foundations of Strategic Autonomy

### Priority 2 — Editorial Mission Control
Editors should see: Collection → Volume → Chapter → Claim → Evidence → Sources → Freshness → Verification → Coverage → Missing Elements

### Priority 3 — Knowledge Quality Dashboard
Every chapter receives: Knowledge Score, Evidence Coverage, Neutrality, Primary Sources, Academic Sources, Visual Assets, Learning Value, Freshness, Accessibility. For editors, not readers.

### Priority 4 — Canonical Claim Pipeline
Every paragraph references: Claim → Evidence → Sources → Documents → Timeline → Concepts. Zero duplicated facts.

### Priority 5 — Research Workflow
Research → Evidence Collection → Claim Registry → Writing → Fact Check → Peer Review → Verification → Publication → Refresh Queue

### Priority 6 — Source Intelligence
Every source receives: Authority, Trust, Freshness, Coverage, Referenced By, Documents, Claims, Collections.

### Priority 7 — Living Knowledge
Every chapter has: Version, Updates, Change Log, Freshness, Last Verified, Verification History. Readers trust transparent evolution.

### Priority 8 — Volume Completion
One volume to publication quality before starting the next.

### Priority 9 — Knowledge Explorer
Search returns knowledge objects: "Show me everything about Kashmir 1948 UN Nehru Resolution 47" → not pages, but knowledge.

### Priority 10 — Reader Workspace
Highlights, Notes, Collections, Export, Citation, Flashcards, Reading Paths.

---

## Phase 14 — Founding Publication

### Context

The platform is architecture-complete (~95%). The governance framework is mature (Editorial Constitution v1.1 — Locked). Chapter 1 is at Internal Gold Candidate standard (~15,000 words, all Gold Standard sections drafted). The biggest risk is no longer missing features. It is delaying publication in pursuit of perfection.

### Objective

Publish Volume I as the founding publication of The Breakdown Knowledge Platform. Everything from this point forward exists for one purpose: a single chapter that survives external scrutiny and becomes the reference standard for everything that follows.

### Founding Directive

No new platform features until Chapter 1 is published, externally reviewed, and accepted as the reference standard. The chapter is no longer content — it is the founding document of the institution. If it succeeds, every future chapter benefits. If it falls short, no amount of additional engineering will compensate.

---

## Organisation

The Breakdown operates as four permanent bureaus:

### 1. Research Bureau

**Mission:** Discover.
**Produces:** Evidence, claims, sources, documents, datasets.

The Research Bureau is responsible for the evidentiary foundation of every knowledge object. It identifies, collects, verifies, and registers sources. It extracts claims from sources, registers them with confidence scores, and documents counterarguments. No knowledge object begins without Research Bureau input.

### 2. Editorial Bureau

**Mission:** Explain.
**Produces:** Chapters, stories, investigations, collections.

The Editorial Bureau transforms evidence into knowledge objects. It drafts chapters following the Evidence Spine and Four-Layer Structure. It links every factual assertion to the Claim Registry. It works under the Language Constitution, ensuring clarity without false certainty. It is responsible for the reader's experience.

### 3. Verification Bureau

**Mission:** Challenge.
**Produces:** Fact-check reports, bias audits, source validation, confidence scores, evidence debt reduction.

The Verification Bureau is independent of the Editorial Bureau. It reviews every knowledge object before publication. It has the authority to stop publication. It conducts Gold Standard Review phases 3–5 (Evidence Audit, Bias Audit, Visual Audit). No Verification Bureau sign-off means no publication.

### 4. Knowledge Operations

**Mission:** Maintain.
**Produces:** Refresh engine, version history, corrections, editorial calendar, Trust Score, institutional memory.

Knowledge Operations manages the knowledge lifecycle after publication. It schedules and conducts verification reviews, issues corrections, maintains version histories, updates the Book of Record, tracks Trust Scores, and ensures that all knowledge objects are current, fresh, and accurately versioned.

---

## Version 1.0 — The Breakdown Knowledge Library: Founding Edition

The first public release shall be defined as:

```
The Breakdown Knowledge Library — Founding Edition
├── Volume I: Foundations (1947–1962)
│   └── Chapter 1: India's Inheritance — The Partition and Its Legacies
├── Editorial Constitution v1.1
├── Methodology (public-facing)
├── Trust Dashboard (public-facing)
├── Corrections Policy
├── Sources Policy
└── Transparency Statement
```

This tells readers exactly what kind of institution The Breakdown is — one that publishes its governing framework alongside its content.

---

## Priority 1 (Active) — Publish Chapter 1

See **Operational Cycle 1 — Founding Publication** below. The roadmap of discrete phases has been retired in favour of recurring Operational Cycles (see below).

## Priority 2 — Begin Chapter 2

Not before Chapter 1 passes Gold Standard Review and is published as part of the Founding Edition.

---

## External Peer Review

Before Chapter 1 can be called Gold Standard, it shall undergo external peer review with the following composition:

- One historian of modern South Asia
- One international relations scholar
- One journalist covering South Asia
- One policy practitioner (former diplomat or foreign service officer)
- One postgraduate student in history or international relations

The review shall be conducted in writing. Each reviewer receives the chapter, a summary of the Editorial Constitution, and the Gold Standard Review criteria. They are asked:

1. Are the factual claims accurate to the best of your knowledge?
2. Are the interpretive choices fair and well-supported?
3. Are there significant omissions or counterarguments that should be addressed?
4. Is the distinction between established fact, scholarly interpretation, and editorial judgment clear?

The review outcomes — including a summary of what changed as a result — shall be published alongside the chapter.

---

## Publication Requirement: /methodology

A public-facing methodology page explaining to readers:

- How research is conducted
- How claims are verified against sources
- How confidence scores are assigned
- Why scholarly disagreements are included and surfaced
- How corrections are handled
- How AI is used (and not used)
- How chapters evolve through versions
- How visual assets are selected and verified

This page removes all guesswork about editorial process.

---

## Publication Requirement: /trust

A public-facing transparency dashboard displaying:

- Editorial Constitution version number
- Number of published chapters
- Total claims registered
- Primary sources cited
- Open scholarly disagreements documented
- Corrections issued (with links)
- Average Trust Score across all chapters
- Evidence debt (aggregate)
- Gold Standard Review completion status
- Last platform-wide verification date

This level of openness is unusual. It is also memorable. It signals that The Breakdown treats transparency as a feature, not an afterthought.

---

## Corrections Policy

Every correction shall be:

1. Published publicly in the corrected knowledge object.
2. Summarised with: what changed, why it changed, evidence supporting the change, and the new version number.
3. Logged in the Book of Record as an editorial decision.
4. Trigger a review of all related knowledge objects for similar errors.

Corrections are a strength, not a weakness. A history of transparent corrections builds more trust than a claim of never making mistakes.

---

## Motto

The Breakdown has a motto. It is not marketing — it is identity. It appears in Mission Control, in editorial documents, and on the methodology page.

> **Evidence before conclusions. Context before certainty.**

Alternatives considered and recorded in the Book of Record:
- "Knowledge deserves evidence. Evidence deserves transparency."
- "Understand deeply. Verify relentlessly."

The adopted motto was chosen because it directly encodes the two disciplines the institution must protect: evidence as the precondition for judgment, and context as the guard against overconfidence.

---

## Operational Cycles

The CTO roadmap of sequential phases (Phase 1 through Phase 14) is retired. The Breakdown now operates on **recurring Operational Cycles**. Cycles are not a linear roadmap — they are the standing rhythm of an editorial institution. Success is measured by Trust, not completion.

### Operational Cycle 1 — Founding Publication

**Deliverables:**
- Chapter 1
- Gold Standard Review
- External Review
- Corrections
- Publish v1.0

**Success metric:** Trust, not completion.

### Operational Cycle 2 — Editorial Calibration

**Question:** Can another editor write Chapter 2 using only:
- Editorial Constitution
- Review Checklist
- Book of Record
- AGENTS.md

**If yes:** your institution works.
**If not:** improve the process — not the software.

### Operational Cycle 3 — Volume Completion

Build Volume I (Foundations 1947–1962). Nothing else.

### Operational Cycle 4 — Public Validation

**Measure:**
- Academic citations
- Journalist references
- University recommendations
- Policy usage
- Corrections received (quality, not quantity)
- Reader trust

Not page views.

### Operational Cycle 5 — Institutional Evolution

Only now consider:
- New collections
- AI tools
- Explorer upgrades
- Workspace

---

## Institutional Trust Index

Mission Control shall display **one number first**: the Institutional Trust Index. Not just chapter trust — institution trust.

This is the single most important metric. If it drops, publishing stops.

### Composition

| Component | Weight |
|-----------|--------|
| Evidence Quality | 25% |
| Primary Source Ratio | 15% |
| Review Completion | 15% |
| Freshness | 10% |
| Correction Quality | 10% |
| Transparency | 10% |
| Reader Trust | 10% |
| Expert Review | 5% |
| **Total** | **100%** |

### Rules

1. The Institutional Trust Index is computed automatically from the canonical data layer.
2. A drop below the publication threshold (currently 80/100) halts all new publications until recovery.
3. The index is displayed prominently in Mission Control and on the /trust dashboard.
4. It is updated on every verification cycle, correction, or publication event.

---

## Version Freeze (v1.0)

All constituent documents are now tagged and frozen:

| Artifact | Version |
|----------|---------|
| Editorial Constitution | v1.1 (Locked) |
| AGENTS.md | v1.0 |
| Knowledge Platform | v1.0 |
| Founding Publication | v1.0 |

A changelog is maintained at `CHANGELOG.md` at the repository root. No silent evolution. Every change to a frozen artifact is recorded with date, author, and justification.

---

## Founding Publication — Definition

Version 1.0 is defined as exactly one thing:

> **The Breakdown Knowledge Library — Founding Edition**

Nothing more. Nothing less. Do not dilute it with additional collections or features before the founding publication earns trust.

### Three Milestones Before Public Launch

**Milestone 1 — Gold Standard Review (Internal)**
Pass every checklist. Resolve every blocker. No compromises.

**Milestone 2 — External Peer Review**
Invite reviewers who are likely to disagree with parts of the work. Constructive criticism is more valuable than praise. Document:
- what they challenged
- what you changed
- what you chose not to change, and why

Publish a summary of this process alongside the chapter.

**Milestone 3 — Founding Publication**
Release:
- Chapter 1
- Methodology
- Constitution
- Trust Dashboard
- Corrections Policy
- Transparency Statement

This package tells readers how to judge your work, not just what you have written.

### After Publication — Observation Period

Do not rush to Chapter 2 the next day. Spend time observing:
- Which sections readers revisit
- Which claims generate questions
- Which evidence is challenged
- Which explanations remain confusing
- Which primary documents readers engage with

That feedback should shape the editorial process before you scale.

---

## Founders' Review (Annual)

Once a year:
- Reread the Editorial Constitution
- Review the Book of Record
- Analyze correction history
- Examine Trust Index trends
- Identify where standards slipped
- Update the institution deliberately

This prevents gradual erosion of editorial discipline. Editorial standards that are not periodically reviewed erode under pressure to publish faster. The Founders' Review is the standing defence against that erosion.

---

## Resolution: Founding Architecture Program Closed

The Breakdown Knowledge Platform v1.0 architecture is accepted as **sufficiently complete for publication**.

Future engineering shall be **reactive to demonstrated editorial needs**, not speculative feature development.

This is a formal organizational decision. It protects the institution from endless platform expansion. The platform is mature enough that additional engineering produces diminishing returns. The bottleneck is now editorial, not technical.

---

## Editorial Program (replaces software roadmap)

The institution no longer runs software phases. It runs an Editorial Program with three standing programs.

### Program Alpha — Founding Volume

**Objective:** Publish *India and the World: Volume I (1947–1962)*.

**Workstreams:**
- Chapter research
- Evidence verification
- Visual acquisition
- External review
- Corrections
- Publication

### Program Beta — Editorial Excellence

**Objective:** Improve institutional quality continuously.

**Deliverables:**
- Review turnaround time
- Evidence debt reduction
- Trust Index improvements
- Reviewer network growth
- Source acquisition

### Program Gamma — Public Trust

**Objective:** Become a reference institution.

**Metrics:**
- Academic citations
- University course adoption
- Journalist references
- Policy references
- Corrections accepted (quality, not quantity)
- Reader trust

---

## Advisory Board

An Advisory Board governs the **knowledge**, not the company.

**Composition (complementary expertise):**
- Historian (modern South Asia)
- International Relations scholar
- Economist
- Constitutional expert
- Data journalist
- Archivist
- Librarian
- Legal scholar

**Role:**
- Help shape editorial standards.
- Periodically audit the institution.
- Do not need to review every chapter — but must be able to challenge standards and process.

---

## Public Standards

The Breakdown exposes its methodology publicly. Openness is part of the reputation.

**Public-facing documents:**
- Editorial Constitution
- Methodology (`/methodology`)
- Corrections Policy
- Transparency Statement
- Sources Policy
- Trust Dashboard (`/trust`)

---

## Success Metrics

**Explicitly rejected — vanity metrics:**
- Page views
- Time on page
- Shares
- Clicks
- Follower counts

**Optimized for — institutional outcomes:**
- "This chapter was cited in a university syllabus."
- "A journalist used it as background."
- "A reader corrected an error and we transparently updated it."
- "A historian said our representation of a debate was fair."

Those are the signals that the institution is becoming trusted.

---

## Founding Edition Publication Sequence

Release in this order to establish trust before asking readers to trust the content:

1. **Methodology** — so readers know how to evaluate the work.
2. **Editorial Constitution** — so readers understand the standards.
3. **Trust Dashboard** — so readers see the commitment to transparency.
4. **Chapter 1** — the flagship work.
5. **Founding Edition announcement** — project vision and invitation for informed critique.

This sequence establishes the institution's credibility before presenting its conclusions.

---

## Platform Architecture Status

| Area | Status |
|------|--------|
| Architecture | ✅ Complete |
| Rendering Engine | ✅ Complete |
| Registry System | ✅ Complete |
| Knowledge Engine | ✅ Complete |
| Knowledge Graph | ✅ Complete |
| Canonical Knowledge Layer | ✅ Complete |
| Reader Modes | ✅ Complete |
| Service Layer | ✅ Complete |
| Editorial Constitution | ✅ Ratified v1.1 (Locked) |
| Gold Standard Review | ⬜ In progress (Chapter 1) |
| Institutional Memory | ✅ Active (4 artifacts) |
| Founding Architecture Program | ✅ Closed (reactive engineering only) |
| Platform Foundation | ✅ Production Ready |

**Engineering Completion: ~95%**

Founding Architecture Program closed. Future engineering is reactive to demonstrated editorial needs, not speculative feature development. No new platform features until Chapter 1 is published, externally reviewed, and accepted as the reference standard.

---

## Build Status

- `npx tsc --noEmit` — clean
- `npm run build` — passes (253 pages)
- No failing tests (pre-existing test fixture issues quarantined)

---

---

## Asset Management Rules

Each visual asset (photo, map, chart, document facsimile) has:

1. **A block entry** in the chapter's `knowledge-library-data.ts` visual registry with `provenance`, `license`, `credit`, `status`, and `archivalProvenance` fields.
2. **An entry** in `docs/assets/<chapter-id>.md` — the canonical asset register with full archive hierarchy, shelfmark, IIIF URL, evidence level, and acquisition status.
3. **A physical file** in `public/images/library/<chapter-id>/` once acquired.

### Status Values

| Status | Meaning |
|--------|---------|
| `archived` | Original or high-resolution surrogate acquired and stored locally |
| `requested` | Identified, acquisition source known, not yet obtained |
| `draft` | Content not yet created (e.g., original cartography, AI-generated diagrams) |
| `recreated` | GIS vector maps or charts produced from archival baseline data |

### Evidence Levels

| Level | Meaning |
|-------|---------|
| A | Original object personally verified from the holding archive |
| B | Verified by multiple authoritative sources but object not directly inspected |
| C | Verified via reputable secondary sources only |
| D | Probable but incomplete |
| E | Unverified |

### Cartographic Policy

- All maps must be **recreated** via GIS vector workflows (QGIS/Illustrator) from archival baseline data, not scanned from colonial-era prints.
- Disputed boundaries require **dashed lines** with labelled notes (Book of Record #0003).
- Maps must not present disputed borders as settled fact.

### Asset Acquisition Workflow

1. Research identifies asset and records provenance in asset register (`docs/assets/`).
2. Editor confirms selection and acquisition strategy.
3. Asset is acquired and placed in `public/images/library/<chapter-id>/` using the exact filename from the asset register.
4. Block in `knowledge-library-data.ts` is updated: `status` set to `archived`, `url` populated.
5. Visual Audit (Gold Standard Phase 5) verifies provenance, license, and accessibility before publication.

---

## Engineering Backlog (10% effort, deferred)

These are deferred until after Chapter 1 is published:

- Citation Engine 2.0
- Knowledge Workspace (highlights, notes, collections, export, flashcards)
- Knowledge Explorer (cross-registry search)
- Source Intelligence
- Living Knowledge (versioning, changelogs)
- Research Workflow UI
