---
title: Feature-to-Module and Test Map
status: provisional
owner: engineering
last_updated: 2026-10-15
---

# Feature-to-Module and Test Map

## How to use this map

This index reduces navigation time. Path and test names do not prove direct imports or complete coverage. For a change, confirm ownership through repository search and read the test implementation. A missing entry is a documentation gap—not proof that the feature lacks tests.

See [Repository Boundaries and Change Map](../architecture/repository-boundaries-and-change-map.md) and [Developer Workflow](./developer-workflow.md).

## Initial navigation map

| Change intent | Likely implementation entry points | Candidate tests / validation |
|---|---|---|
| Public route, layout, route handler | `app/`, route components and server services | Route-specific tests; `tests/homepage.test.ts`, `tests/story-page.test.ts`, `tests/entity-page.test.ts`, `tests/search.test.ts`; build/metadata checks |
| Story blocks / story rendering | `components/story/`, `components/stories/`, `features/story/`, story registry and types | `tests/story/`, `tests/golden-story.test.ts`, `tests/story-page.test.ts`, `tests/story/resolver-parity.test.ts`, `tests/story/knowledge-library-blocks.test.ts` |
| Editorial CMS / review / publication | `app/cms/`, `features/cms/`, relevant `services/`, publication workers | `tests/editorial-operating-system.test.ts`, `tests/editorial-calendar-worker.test.ts`, `tests/editorial-pilot.test.ts`, `tests/evidence-vault/publication-guard-unification.test.ts`, `tests/reader-publication-recovery.test.ts` |
| Domain types / canonical objects / schemas | Canonical type/schema definition, service/repository implementation | `tests/canonical-domain.test.ts`, `tests/data-integrity.test.ts`, `tests/fix-domain.test.ts`, `tests/fix-repository.test.ts`, `npm run validate:schema` when relevant |
| Knowledge graph / relationships | `lib/graph/`, graph services, `packages/graph/` | `tests/graph/evidence-graph.test.ts`, `tests/fix-graph.test.ts`, `packages/graph/tests/graph.test.ts` |
| Topic, entity, search, distribution | Relevant `app/` route, `features/`, `services/`, registries and data | `tests/entity-page.test.ts`, `tests/search.test.ts`, `tests/content-scale/`, source/registry integrity checks |
| SEO, structured data, AEO/GEO, sitemap/RSS | Route metadata, SEO modules, public projections, verification scripts | `tests/seo.test.ts`, `tests/aeo-geo-adversarial.test.ts`, `tests/content-scale/programmatic-seo.test.ts`; `npm run verify:aeo-geo`, `npm run verify:production-sitemap` when relevant |
| Authentication, API security, RLS, migrations | Middleware/API auth, Supabase client/policies, correct migration owner | `tests/security/`, `tests/auth.test.ts`; `npm run test:security`, `npm run test:migration` |
| UI tokens, visual component, accessibility | `design-system/`, `components/`, `styles/`, relevant `app/` surface | `tests/accessibility.test.ts`, `tests/e2e/accessibility.spec.ts`, related visual/route tests |
| Package or plugin contract | Corresponding `packages/<name>/` or `plugins/<name>/` | Matching package/plugin script in `package.json`; compatibility tests for public contract changes |
| Scheduled worker / deployment control | `workers/`, relevant workflow and deployment configuration | Worker, deployment-health, and release-control tests; never use production operations as a local test shortcut |

## Test-runner conventions

The repository uses `tsx`-invoked test files, Vitest, Jest, and Playwright. Before adding a test:

1. Find the nearest test for the same behavior and follow its runner/fixtures.
2. Prefer assertions about public behavior and important negative paths.
3. Avoid duplicating the same assertion across runners without a reason.
4. Update a package script or CI job only if the new test would otherwise not be executed.
5. Verify that the intended command actually includes the test.

## Required future improvement

A code-level audit should replace this provisional map with verified ownership, import/call edges, critical invariants, and exact test commands. Until then, this document is a navigation aid, not a substitute for tracing the code.
