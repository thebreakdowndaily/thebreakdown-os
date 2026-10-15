---
title: Repository Architecture Audit — Baseline Snapshot
status: baseline
owner: engineering
last_updated: 2026-10-15
---

# Repository Architecture Audit — 2026-10-15

## Status and scope

**Structural inventory complete; code-level architecture audit remains pending.**

This baseline is based on Git's recursive repository tree and the root README, `package.json`, and CI workflow definitions at commit `9f4ae81e5b9014614f4397a2022e7025243861ec` on `main`. On 2026-10-15, GitHub Actions reported successful `CI Pipeline`, `Security Scans`, `Audit Framework Verification`, and `POP-1.0 Production Infrastructure Pipeline` runs for that commit.

This is **not** an import graph, dead-code determination, local working-tree inspection, or proof that a fresh local build succeeds. No source files were moved and no tests/build were run as part of this structural inventory. Findings requiring runtime, references, or environment access are follow-up work.

## Executive finding

The repository has recognizable architecture—Next.js route entry points, feature and service layers, domain types, packages/plugins, migration checks, and extensive tests—but its code modules, historical evidence, agent instructions, and validation interfaces have grown in parallel. The best first steps are better navigation, a concise current agent contract, explicit ownership maps, and a measured review of duplicate validation workflows. Large-scale file movement is not yet justified.

## Baseline inventory

| Measurement | Observed value | Method / caveat |
|---|---:|---|
| Tracked file blobs | 4,262 | Recursive Git tree; includes source, fixtures, reports, and configuration |
| Tree/directory entries | 1,048 | Recursive Git tree |
| Root entries | 194 | 142 files and 52 directories |
| Root Markdown files | 61 | Root-level extension count |
| Root CSV files | 19 | Root-level extension count |
| Root JSON files | 12 | Root-level extension count |
| Root JavaScript files | 16 | Root-level extension count |
| Root text files | 10 | Root-level extension count |
| Former root `AGENTS.md` | 43,497 bytes | 128 Markdown heading markers found |
| Agent-tooling trees | about 446 entries | `.agents/`, `.ai/`, `.opencode/` combined; includes files and directories |
| Migration locations | 2 | `migrations/` and `supabase/migrations/` both exist |
| ADR locations | 2+ | `adr/`, `docs/adr/`, and an architecture ADR index |

Subtree counts indicate scale rather than directly-owned file counts. The largest observed subtrees include `audit/` (about 780 entries), `components/` (702), `app/` (548), `lib/` (499), `docs/` (455), `services/` (315), `.opencode/` (303), `tests/` (243), `scripts/` (198), `packages/` (110), `features/` (95), and `plugins/` (64).

## Evidence-backed findings

### F-01 — Agent context is expensive and has machine-specific assumptions
**Priority: high.** The former root `AGENTS.md` was 43,497 bytes and told agents to read all of `docs/`, ADRs, and RFCs. It also referenced a Windows checkout path (`C:/newsjack-content/thebreakdown-os`). `.agents/rules/thebreakdown.md` repeated the path and discouraged worktrees even when isolation can reduce risk.

**Action in this change:** Replace the root entry point with a concise engineering contract, preserve the former text verbatim as a historical archive, and make the Antigravity adapter discover the current checkout dynamically.

### F-02 — Root mixes product code, operational outputs, and accumulated evidence
**Priority: high.** The root includes numerous phase/release/audit reports, CSV inventories, logs/output files (`analyze_log.txt`, `dev-server.log`, `jest.out`, `typecheck_output.txt`), `fix-*.js` scripts, deployment-storage reports, a source-integrity inventory, and an audit ZIP. The Git tree proves these files are tracked; it does **not** prove any is unused.

**Action:** Preserve files until each is classified as maintained tooling, source fixture, durable evidence, generated output, transient log, or obsolete artifact. Search references and history before moving or deleting. Keep raw run output outside the root when safe and compatible with existing workflows.

### F-03 — Several top-level code areas may have overlapping ownership
**Priority: high.** `app/`, `components/`, `features/`, `services/`, `lib/`, `packages/`, `plugins/`, `stories/`, `data/`, and `registry/` coexist. Some are intentional boundaries; a tree alone cannot prove whether imports honor them or business rules are duplicated.

**Action:** Build an import/reference graph, inspect actual callers and exports, and assign explicit ownership before code moves or boundary enforcement.

### F-04 — Migration and decision-record ownership needs an explicit map
**Priority: high.** Both `migrations/` and `supabase/migrations/` contain migration assets. Likewise, `adr/` and `docs/adr/` exist, and architecture documentation has an ADR index. These may have distinct scopes, but the canonical home for new migrations and decisions is not obvious from paths alone.

**Action:** Inventory contents, scripts, migration ordering, CI references, and document links. Do not merge directories, renumber, remove, or rewrite historical migrations in this phase.

### F-05 — CI definitions repeat several validation gates
**Priority: medium-high.** `.github/workflows/ci.yml` and `.github/workflows/production-deploy.yml` both validate PRs targeting `main`; both install dependencies and run type-checking, lint, security regression, migration safety, and a build. They also have different additional checks: the production workflow includes domain/projection, workflow, data-integrity, release-control, and deployment-specific gates. `.gitlab-ci.yml` declares another overlapping path, though its presence does not prove the pipeline is active.

**Action:** Compare required branch-protection checks, workflow activity, extra coverage, elapsed times, deployment conditions, and environment/secrets before proposing consolidation. Do not remove a gate based only on duplicate command names.

### F-06 — Script aliases and test entry points are difficult to reason about
**Priority: medium.** `package.json` exposes pairs such as `lint`/`check:lint`, `typecheck`/`check:type`, and `build`/`check:build`, alongside a manually chained `test` script, `test:all`, Vitest, Jest, Playwright, security, migration, and subsystem-specific scripts. Some overlap may be intentional for CI or contributor compatibility.

**Action:** Document each command's actual coverage, map consumers in workflows and instructions, and simplify only after those references and tests are checked.

### F-07 — Repository-facing setup/deployment documentation conflicts with config
**Priority: medium.** The root README says Node.js `>=20`, while `package.json` requires `>=22`, and both `.nvmrc` and GitHub Actions use Node 22. The root README describes Vercel plus Cloudflare Edge; the architecture README labels deployment Cloudflare Pages static.

**Action in this change:** Align the README runtime/install guidance and architecture deployment summary with the package and current workflow configuration.

## Prioritized next steps

1. **Foundation in this branch:** compact agent entry point with verbatim legacy archive; repository snapshot and boundary/change map; developer workflow and feature-to-test index; consistent documentation indexes and runtime guidance.
2. **Code-level audit:** enumerate import/reference edges among `app/`, `components/`, `features/`, `services/`, `lib/`, `packages/`, and `plugins/`; locate duplicated rules/cycles; establish migration and ADR ownership.
3. **Measured velocity pass:** confirm consumers of scripts/workflows; record focused and full-test timings; remove only proven redundancies; classify and relocate root reports/generated outputs only after reference/history review.

## Explicit non-findings

This snapshot does not claim that any root artifact is dead, that either migration tree is obsolete, that a circular dependency exists, or that duplicate CI gates can be removed safely. Those conclusions require source-level references, active GitHub configuration, test results, and timing data.
