# TBIOS — Master Implementation Prompt

Version: **1.0**

Status: **Ratified — governing doctrine for the `/intel` intelligence workspace**

Last updated: 03 Aug 2026

Source: Persisted verbatim from the institutional master prompt. This document is the **canonical** version — doctrine lives here, not in conversation history. The capability roadmap (`docs/intelligence/roadmap.md`) implements it sprint by sprint. If a roadmap description conflicts with this document on architecture, intelligence principles, or module requirements, this document takes precedence.

---

## Architecture

### Core Technology Stack

- Next.js 15
- React 19
- TypeScript
- Supabase (PostgreSQL)

### Core Architecture Pattern

- **Service Layer** with dependency injection
- **Repository Pattern**
- **Canonical Types** in a single `types/` folder
- **Knowledge Graph** as the connective tissue
- **Event Bus** for cross-service decoupling
- **REST API** for integration
- **AI Layer** for natural-language interfaces and assistance (never as source of truth)

### Infrastructure

- Vercel (web + edge)
- Cloudflare (CDN/security)
- GitLab (repo/CI)
- Postgres (database)

### Module Design Rules

- **No duplicate business logic.** Every module consumes the same service layer. If a module needs logic that exists elsewhere, it consumes the service — it does not re-implement it.
- **No module owns data.** Every module reads/writes through services. No direct database access from modules.
- **One canonical dataset.** Every module uses the same frozen master dataset (`data/master-dataset-v1/v1.1.0/up403-master-dataset-v1.json`). No shadow copies.

---

## Intelligence Principles

### The Intelligence Workspace Is Private

All intelligence is internal and auth-gated. Never expose predictions, confidence intervals, or intelligence scores on public pages.

### Public vs Private Separation

- **Public** pages show only verified facts, with SEO, sitemaps, structured data.
- **Private** `/intel` pages show predictions, scenarios, research, toolkit, media intelligence, and verification state.

### Explanation Is Mandatory

Every derived number (score, prediction, scenario, priority index) must carry:

- **Drivers** — the named factors that move it.
- **Assumptions** — what we take as given and why.
- **Evidence** — which dataset fields support it.
- **Data gaps** — what is missing and what we did not model.

### No Hallucinated Data

AI may summarize, organize, explain, and recommend — but it must never invent numbers, events, or facts. Evidence overrides AI output. Every number traces to the frozen dataset or a derived computation over it.

---

## Intelligence Modules

### Mission Control

An **executive surface**, not a dashboard. One screen that answers, in order:

1. What deserves our attention today?
2. What will move in the next 24 hours?
3. What does the desk need to act on?

Not a metrics display. A decision surface.

### Predictions

Probabilistic winner predictions per constituency with confidence intervals, drivers, sensitivity, and honest data gaps.

### Scenario Simulator

What-if swing engine. Pure, composable swings (uniform / regional / stress), coalition arithmetic, flip detection.

### Media Intelligence

Monitoring across UP403 subjects and constituencies.

**Architecture requirement:** Media intelligence must be a full ingestion pipeline, not a search box:

- Ingestion
- Normalization
- Deduplication
- Entity extraction
- Constituency mapping
- Topic classification
- Credibility scoring
- Evidence linking
- Version history
- Retention policy
- Scheduling
- Provenance

It must extend the **Evidence Graph**, never a standalone silo.

### Candidate Intelligence

Candidate-level intelligence: affidavits, assets, liabilities, criminal cases, education, and attendance records.

**Dependency:** Requires candidate-level records (affidavits/assets/liabilities/criminal/attendance) **not present** in the frozen dataset. Do not scaffold on empty data. Design the dependency before implementation.

### Editorial Intelligence

**Answer:** Which constituencies demand investigation, and why?

Feeding the editorial desk. Surfaces investigation-ready seats from scoring + evidence debt, ranked into a traceable pipeline. Every ranked seat must say *why* it ranks where it does (drivers named, sources named, gaps named).

### Research KB

Per-constituency evidence graph: what evidence exists, where the evidence debt is, and how every prediction driver links to underlying evidence nodes.

### Journalist Toolkit

Field pack: interview plans, source contacts, reporting checklists, story angles, verification workspace, export. A presentation layer over the shipped engines — no duplicated scoring/prediction/evidence logic.

---

## Sprint Rules

- **One capability per sprint.** A sprint delivers exactly one new reader-facing (or analyst-facing) capability. If a sprint accumulates unrelated improvements, split it.
- **One review / verification / merge per sprint.** The sprint is not done until its single capability is reviewed, verified, and merged.
- **If a capability depends on unavailable data, design the dependency first.** Do not build fake infrastructure on empty data.
- **Quality gates:** ESLint + TypeScript + build + existing tests + new tests. No regressions, no API/route breaks, accessibility and performance preserved.

---

## Editorial & Analysis Rules

- **Evidence overrides AI output.**
- **AI may summarize, organize, explain, and recommend — never invent.**
- Every intelligence surface carries its limitations alongside its outputs. Confidence is disclosed, not hidden.
