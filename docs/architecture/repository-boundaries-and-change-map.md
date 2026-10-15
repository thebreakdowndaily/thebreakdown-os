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
| `supabase/`, `migrations/` | DB client/configuration and migration assets | **Two migration roots exist.** Map scripts/order/deployment consumers before adding or moving migrations. |
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
Inventory `migrations/`, `supabase/migrations/`, `scripts/verify-migrations.ts`, schema validators, CI, and deployment config. Establish which paths are historical, currently applied, generated, or consumed by tooling. Leave both intact until then.

### ADRs
Inventory `adr/`, `docs/adr/`, `docs/architecture/adr-index.md`, and links from architecture docs. Determine whether these directories have distinct domains or competing indexes. Do not merge or renumber records in this foundation pass.

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
