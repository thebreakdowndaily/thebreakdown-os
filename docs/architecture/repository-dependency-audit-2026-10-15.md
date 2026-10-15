---
title: Repository Source Dependency Audit
status: focused-audit
owner: engineering
last_updated: 2026-10-15
---

# Repository Source Dependency Audit — 2026-10-15

## Scope and confidence

Audited against main commit `2735f0ce05dc17cec9a6c9ec877e7e297c8d9d03`, the merge commit for repository-foundation PR #46. The Git tree contains 5,318 entries and 1,781 TypeScript/JavaScript-like source files under the main application, UI, feature, service, library, package, plugin, worker, and type roots.

This was a **targeted source audit of critical paths**, not a complete import graph for all 1,781 files. It traced the story page, scheduled publishing route, publication eligibility, repository implementations, service composition, and the relevant tests. No conclusion is made that the whole repository is free of circular dependencies.

## Finding D-01 — Large content/store module is used to import a slug-only policy constant

**Severity: medium-high; safe remediation applied in this branch.**

Evidence at the audited main commit:

- `utils/data-layer/store.ts` is 541,928 bytes and 5,393 lines. It combines content/story data with store/query/publication-filter logic.
- `services/repositories/memory/story.ts` imported only `LEGACY_PUBLIC_SLUGS` from that store module for a membership check in its legacy-public fallback.
- `LEGACY_PUBLIC_SLUGS` is a literal 44-entry set and has no required dependence on the story objects, query functions, or store initialization.
- `lib/bootstrap.ts` also imported `LEGACY_PUBLIC_SLUGS`, but a scan of that file found no use beyond the import.
- `utils/data-layer/store.ts` uses the set for its own legacy visibility predicate and diagnostic reason string.

Why this matters: the repository adapter's dependency graph should not have to reach into the large fixture/query module just to obtain a literal visibility manifest. This makes file ownership less clear and can increase module initialization and refactor blast radius, depending on bundler/runtime.

### Remediation

- Moved the exact existing 44-member set into `utils/data-layer/legacy-public-slugs.ts`.
- The store imports that binding locally and re-exports it as `LEGACY_PUBLIC_SLUGS`, preserving the existing public import path for other callers.
- `services/repositories/memory/story.ts` now imports the focused manifest directly.
- Removed the unused `LEGACY_PUBLIC_SLUGS` import from `lib/bootstrap.ts`.
- Added `tests/legacy-public-slugs.test.ts` and connected it to the standard `npm run test` chain. The test asserts the 44-entry count, representative existing slugs, and rejection of an unknown slug.
- Did **not** add or remove any allowlist members; behavior and data membership are intended to remain unchanged.

### Publication comment reconciliation

The previous comment above the allowlist said that `ration-digitization`, `anganwadi-icds`, `supply-chain-shift`, and `ethanol-backlash` were draft/future-dated and intentionally absent from the set. At the audited commit, all four slugs were actually present in the set and their source records had `publicationStatus: 'published'` with July 2026 `publishedAt` values. The statement was stale; it has been replaced with guidance that correctly describes the allowlist as a sensitive compatibility-policy input. The entries were intentionally preserved to avoid silently changing publication eligibility.

## Finding D-02 — Publication orchestration crosses from `lib/` into feature policy and service implementation

**Severity: medium; review before moving code.**

`lib/editorial/canonical-publication.ts` has runtime imports from `features/auth/policy` and `services/intelligence/evidence-vault.service`, in addition to the pure editorial state machine, publication gate, event bus, and token functions. `lib/editorial/publication-gate.ts` also refers to the evidence-vault service type. This shows that the file is not merely a low-level utility; it orchestrates authorization, evidence retrieval, state transitions, gate evaluation, and token issuance.

This is not automatically a defect: publication is a cross-cutting domain capability, and centralizing its behavior helps protect editorial invariants. However, the current `lib/` placement makes the dependency direction less obvious.

**Recommendation:** in a separate, explicitly tested design change, evaluate whether the orchestration entry point belongs under `services/editorial/` while keeping pure policy/state-machine/gate helpers in a lower-level module. Before moving it, trace all callers and tests; preserve the canonical API and token behavior. No relocation was made in this branch.

## Finding D-03 — Story repository implementations share important publication guards

Both `services/repositories/memory/story.ts` and `services/repositories/supabase/story.ts` import the same `isPubliclyPublished` / `storyPublicationContext`, evidence-completeness guard, publication errors, and token-consumption logic. This is a positive sign: these rules are not visibly duplicated in the two repository implementations.

The memory implementation retains an additional legacy-slug fallback; the database implementation shown in this trace uses the canonical shared publication predicate for public listing. Future consolidation must not erase this difference without tests that define the intended legacy behavior for both backends.

## Finding D-04 — Route handler is a thin boundary, while composition is centralized

- `app/api/editorial/publish-due/route.ts` delegates to `services/editorial/schedule.ts` through `validateAndPublishDueStories`, rather than reimplementing scheduled-publishing logic in the route.
- `services/factory/repository.ts` explicitly composes Memory and Supabase repositories behind service interfaces; its wide imports appear consistent with a composition root rather than being arbitrary fan-out. Keep it as an explicit composition point unless profiling or call-graph evidence justifies further modularization.
- `tests/publication-integrity-p0.test.ts` exercises the canonical publication contract alongside several API routes and the CMS action, providing a valuable cross-surface regression anchor.

## Current change map after remediation

```text
MemoryStoryService
  ├── lib/story/publication            shared status semantics
  ├── lib/story/evidence-guard         evidence validation
  ├── lib/editorial/publication-token  guarded-write token
  └── utils/data-layer/legacy-public-slugs  focused compatibility policy

utils/data-layer/store
  ├── story/content records
  ├── store query/filter functions
  └── imports and re-exports legacy-public-slugs for compatibility

Public story route
  ├── resolver and presentation model
  ├── canonical public eligibility
  └── bootstrap/service composition
```

## Verification and limits

- The tree inventory and each source cited above were fetched from the same base commit.
- The new 44-entry manifest regression test has been added to the standard test chain; it must pass in GitHub CI before merge.
- The focused allowlist membership was extracted programmatically and checked to contain exactly 44 entries before generating the new file. The source list membership was preserved.
- Broad type-check/test/build results should be read from the new pull request's checks; this connector-only pass does not claim an independently run local `npm ci` or build.
- The full import graph, cycle detection, transitive fan-out, test-to-module coverage, and measured feature-change timings remain future work.
