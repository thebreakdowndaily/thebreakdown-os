---
title: Developer Workflow
status: active
owner: engineering
last_updated: 2026-10-15
---

# Developer Workflow

## 1. Find the owner before editing

1. Read root [`AGENTS.md`](../../AGENTS.md).
2. Use the [repository audit](../architecture/repository-audit-2026-10-15.md) and [boundary/change map](../architecture/repository-boundaries-and-change-map.md).
3. Search relevant routes, exports, service logic, canonical types/schemas, callers, and tests. Directory names alone do not prove ownership.
4. For cross-cutting changes, read the relevant ADR/RFC and product/editorial contract.
5. Write a bounded plan with risks, invariants, and tests before implementation.

## 2. Runtime and install

At the audited baseline, `package.json` requires Node.js `>=22.0.0`; `.nvmrc` and GitHub Actions use Node 22. Install from the committed lockfile:

```bash
node --version
npm --version
npm ci
```

Recheck package and workflow configuration if these assumptions change.

## 3. Common commands

| Goal | Command | Notes |
|---|---|---|
| Development server | `npm run dev` | Next.js |
| Type-check | `npm run check:type` | Same command as `npm run typecheck` at this baseline |
| Lint | `npm run check:lint` | Same command as `npm run lint` at this baseline |
| Standard test chain | `npm run test` | A manually chained subset of test files, not all tests |
| Wider composite command | `npm run test:all` | Inspect `package.json` to see the exact membership |
| Vitest | `npm run test:vitest` | Runs `vitest run` |
| Security regressions | `npm run test:security` | Includes migration verification and security tests |
| Migration/database safety | `npm run test:migration` | Includes migration verification and database-enforcement tests |
| Accessibility | `npm run test:a11y` | Project accessibility script |
| Production build | `npm run build` | Next.js production build |
| Composite local verification | `npm run ci:verify` | Preparation, lint/type checks, standard test chain, build, accessibility, performance, and security; not a substitute for the complete GitHub workflows |

For a focused `tsx` test, use its supported `npx tsx path/to/test-file.test.ts` command. For Vitest use `npx vitest run path/to/test-file.test.ts`. This repository uses multiple runners, so inspect neighboring tests and package scripts before selecting the runner.

## 4. CI and PR checks

At this baseline:

- `.github/workflows/ci.yml` runs type-checking, lint, security regression, migration safety, the standard test chain, accessibility, the production build, and browser accessibility.
- `.github/workflows/production-deploy.yml` has a PR validation job that repeats several gates and adds core-domain, projection, workflow, data-integrity, and release-control tests. Its staging/production verification jobs have branch/environment conditions.
- `.github/workflows/security-scans.yml` and `audit-framework.yml` provide additional checks.
- `.gitlab-ci.yml` declares another CI path; confirm whether it remains active before changing policy.

Do not disable/combine workflows until required branch-protection checks, current workflow usage, extra coverage, execution times, secrets, and deployment conditions are compared.

## 5. Focused verification starting points

| Change area | Candidate implementation/tests/checks | Critical caution |
|---|---|---|
| Story rendering / reader story behavior | `components/story/`, `components/stories/`, `features/story/`, `tests/story/`, `tests/story-page.test.ts`, `tests/golden-story.test.ts` | Validate rendering and publication eligibility, not only snapshots. |
| Editorial workflow / scheduled publishing | `app/cms/`, `features/cms/`, relevant `services/`, `workers/`; `tests/editorial-operating-system.test.ts`, `tests/editorial-calendar-worker.test.ts`, `tests/evidence-vault/publication-guard-unification.test.ts` | Include rejected transitions and test-artifact exclusion. |
| Knowledge graph | `lib/graph/`, `packages/graph/`, `tests/graph/`, `tests/fix-graph.test.ts` | Preserve canonical identity and edge consistency. |
| SEO / content distribution | `tests/seo.test.ts`, `tests/content-scale/`, `tests/aeo-geo-adversarial.test.ts`; `npm run verify:aeo-geo` | Do not confuse declared metadata/sitemaps with live indexing evidence. |
| Auth / database / access | `tests/security/`, `tests/auth.test.ts`; `npm run test:security`, `npm run test:migration` | Keep authorization and database enforcement coverage. |
| Accessibility / interaction | `tests/accessibility.test.ts`, `tests/e2e/accessibility.spec.ts`, `npm run test:a11y` | Browser-level claims need browser-level checks. |

These are candidate starting points inferred from filenames and scripts, **not** a verified transitive dependency map. Confirm imports and test logic for cross-module changes.

## 6. PR checklist

- [ ] Scope and ownership are clear; existing user work is preserved.
- [ ] Focused tests passed; broader relevant suites ran or are clearly marked unrun.
- [ ] Type-check, lint, build, and relevant security/database checks ran.
- [ ] Public routes, API contracts, metadata, server/client boundaries, and cache behavior remain correct.
- [ ] Publication/editorial gates, RLS, and test-artifact exclusion remain intact where relevant.
- [ ] Docs and ADRs reflect changes to supported contracts.
- [ ] Diff is free of unrelated formatting/generated noise.
- [ ] Report includes real command outcomes, pre-existing failures, blockers, and unrun checks.
- [ ] No unapproved merge, force-push, production data operation, or deployment occurred.
