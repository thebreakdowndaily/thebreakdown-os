---
title: Repository Boundaries and Change Map
status: proposed
owner: engineering
last_updated: 2026-10-15
---

# Repository Boundaries and Change Map

## Purpose

Use this map to locate likely ownership before editing. The descriptions follow current paths and repository docs; they are **ownership hypotheses**, not a claim that all imports already follow these boundaries. Validate dependency edges in source before moving code or adding enforcement.

See the [audit snapshot](./repository-audit-2026-10-15.md) for evidence and limits, and [Developer Workflow](../engineering/developer-workflow.md) for commands.

## Current directory map

| Path | Intended responsibility / entry point | Change guidance |
|---|---|---|
| `app/` | Next.js App Router pages, layouts, route handlers, and framework entry points | Preserve public URLs, server/client boundaries, caching/revalidation, metadata, and route contracts. |
| `components/` | Reusable UI and feature presentation | Do not reimplement publication, editorial, authorization, or persistence rules in components. |
| `design-system/`, `styles/` | Visual tokens and presentation primitives | Check representative pages and accessibility when changing shared tokens. |
| `features/` | Feature-oriented behavior and view models | Keep feature-specific orchestration cohesive; promote code only when shared ownership is established. |
| `services/` | Application/domain services and orchestration | Search callers and tests before interface changes; check service/repository conventions and canonical types. |
| `lib/` | Shared lower-level logic, adapters, graph/events, infrastructure helpers | Avoid an unowned utility dump; do not import route entry points into shared logic. |
| `packages/` | Package-like modules with their own public APIs/tests | Preserve package boundaries and run their specific test commands. |
| `plugins/` | Extension-oriented modules | Depend on stable extension contracts, not another module's implementation details. |
| `types/`, `schemas/` | Shared types and data contracts | Locate canonical definitions first; avoid parallel types/schemas. |
| `stories/`, `data/`, `registry/` | Story/content data and registries | Decide whether the change belongs in canonical data, a registry, service logic, or presentation before editing. |
| `supabase/` and `supabase/migrations/` | Supabase client and Postgres migration chain | Current migration validator and standard CI target this chain. Preserve its order and applied migration history. |
| Root `migrations/` | Four D1/SQLite-oriented SQL migrations | A separate D1-oriented chain with a manual `scripts/seed-d1.ts` helper; current operational status is unverified. Do not merge with Supabase migrations or delete without checking any external D1 environment. |
| `tests/` | Cross-module, integration, security, and end-to-end tests | Preserve critical invariants and failure-path coverage. |
| `scripts/` | Maintained developer/CI verification and operational utilities | Treat scripts as infrastructure until references/history prove otherwise. |
| `audit/` | Audit framework code, scripts, data, and related assets | Keep executable tooling distinct from static evidence and transient outputs. |
| `docs/`, `adr/`, `rfc/`, `specs/` | Guides, decision records, proposals, specifications | Use the existing index; both `adr/` and `docs/adr/` exist, so do not create another ADR home. |
| `.agents/`, `.ai/`, `.opencode/` | Coding-agent adapters, skills, and specialist guidance | Keep tool-specific files concise and consistent with root `AGENTS.md`. |

## Proposed dependency direction

This is a hypothesis for import analysis, not a rule to enforce before inspecting source:

```text
Next.js entry points (app/)
      |
      +--> feature orchestration (features/)
      |          +--> service/domain contracts (services/)
      |          +--> shared infrastructure (lib/)
      |          +--> canonical types / schemas
      |
      +--> presentation (components/) --> design-system / styles

packages/ and plugins/ --> stable public interfaces
tests/ -----------------> public behavior and critical invariants
```

Respect actual Next.js server/client behavior and legitimate domain dependencies. Do not force every subsystem into these layers; `packages/` and `plugins/` may be independently bounded modules.

### Boundary rules to test

1. Route files compose requests/responses; reusable domain rules should have an explicit owner.
2. Sensitive invariants—publication eligibility, editorial approval, authorization, canonical identity, and data validation—have one authoritative implementation and tests for success and rejection.
3. Presentation consumes explicit models/contracts and cannot bypass workflow or authorization gates.
4. Shared infrastructure stays dependency-light; feature-specific behavior stays near its feature until reuse is demonstrated.
5. Cross-module imports use stable exports. Add aliases/barrels only when they improve clarity without masking cycles.
6. Architectural checks must enforce confirmed patterns and produce actionable messages, not huge exception lists.

## Ownership questions to resolve before structural moves

### Migrations
See [Repository Ownership Audit](./repository-ownership-audit-2026-10-15.md). The evidence shows distinct purposes: root `migrations/` is D1/SQLite-oriented; `supabase/migrations/` is the Postgres chain checked by `scripts/verify-migrations.ts` and CI. The D1 chain's present operational status is unverified. Preserve both until D1 usage is confirmed; do not treat them as duplicate migrations.

### ADRs
See [Repository Ownership Audit](./repository-ownership-audit-2026-10-15.md). The two file-backed ADR collections cover partly distinct topics but reuse IDs; the root README/architecture docs point to `adr/`, while `docs/adr/README.md` demands new structural ADRs there. The narrative `docs/architecture/adr-index.md` further overlaps. Preserve accepted files and numbers; reconcile creation policy before adding a new ADR.

### Wrangler local state

The repository tracks 9 files (14 tree entries including directories) under `.wrangler/state/v3/` despite `.gitignore` lacking an ignore rule. This state includes Miniflare SQLite/cache files and WAL/SHM companions. The next safe action is to ignore future state (done in this branch), then determine whether any local D1 database data requires export before untracking these generated files. Do not commit new local state.

### Root evidence/output files
Classify each root artifact as source/config, maintained tool, durable evidence, fixture, reproducible output, transient log, or obsolete item. Search references and history before a move/deletion. Retain durable records in an established report/archive location; keep ephemeral logs local or as CI artifacts where compatible with project needs.

### Agent instructions
Root `AGENTS.md` is the concise current engineering entry point. `.agents/`, `.ai/`, and `.opencode/` remain in place for host-specific capabilities. The archived 2026-07-30 doctrine is historical context only.

## Migration strategy

1. Trace imports/references and critical request, publication, and data flows.
2. Assign one owner to each shared business rule and public interface; add focused tests.
3. Resolve migration/ADR ownership with explicit inventories and an approved decision.
4. Move only verified historical/generated artifacts in small reversible batches.
5. Add fitness checks only for confirmed recurring defects.
6. Measure focused-test latency and change propagation. Directory count, LOC, and files moved are not success metrics.

## Completion criteria

- No accidental change to public routes/data contracts.
- Editorial, publication, security, DB, and SEO invariants remain covered.
- Imports, docs, scripts, workflow references, and test configuration remain valid.
- Focused and applicable full checks pass; pre-existing failures are separated from new failures.
- Every material move has an evidence-backed reason and is reviewable.
