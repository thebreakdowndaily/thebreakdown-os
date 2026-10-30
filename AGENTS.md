# The Breakdown OS — Engineering Agent Contract

**Last reviewed:** 2026-10-15  
**Scope:** Repository engineering, implementation, testing, documentation, and developer workflow.  
**Editorial authority:** `docs/editorial/editorial-constitution.md` and applicable editorial standards take precedence for editorial, evidence, verification, and publication decisions.

This is the current, concise entry point for coding agents. Use the checked-out repository as the source of truth. The former root doctrine is preserved [as a historical archive](docs/architecture/archive/AGENTS-operating-doctrine-legacy-2026-07-30.md); it is context, not an instruction set to execute without revalidation.

## 1. Start with the real repository state

Before modifying files:

1. Determine the root, branch, recent commits, and working-tree state: `git rev-parse --show-toplevel`, `git status --short`, `git branch --show-current`, `git log -5 --oneline`.
2. Preserve existing user changes. Never discard, overwrite, or silently absorb unrelated work.
3. Read [README](README.md), [the repository audit snapshot](docs/architecture/repository-audit-2026-10-15.md), and [the change map](docs/architecture/repository-boundaries-and-change-map.md). Then read only the relevant feature documentation, ADRs, schemas, and tests.
4. For editorial/publication changes, read the Editorial Constitution, editorial review checklist, and relevant workflow contract before coding.
5. For broad or risky changes, write a short plan with scope, affected modules, invariants, tests, and recovery approach before implementation.

Do not assume a local path, branch, deployment target, framework version, folder owner, or historical health metric is still current. Verify it.

## 2. Authority and source of truth

- **Editorial decisions:** Editorial Constitution and applicable editorial standards.
- **Runtime behavior:** implementation, schemas, configuration, and tests on the checked-out commit.
- **Engineering workflow:** this file plus the relevant current architecture contracts and accepted ADRs.
- **Historical reports/archived instructions:** context only; verify against the present code before treating them as current.

Tool-specific directories (`.agents/`, `.ai/`, `.opencode/`) may contain adapters, skills, and specialist guidance. Keep them consistent with this contract. Do not duplicate the full doctrine in every agent file.

## 3. Repository navigation map

These paths are observed locations, not permission to create competing implementations:

- `app/` — Next.js App Router routes and framework entry points.
- `components/`, `design-system/`, `styles/` — UI, tokens, and presentation.
- `features/` — feature-oriented logic and view models.
- `services/` — application/domain services and orchestration.
- `lib/` — shared infrastructure and utilities; not an unowned dumping ground.
- `packages/`, `plugins/` — package-like modules and extensions; preserve their contracts.
- `types/`, `schemas/`, `stories/`, `data/`, `registry/` — types, schemas, story/content data, and registries; identify the canonical writer before editing a model.
- `supabase/` and `migrations/` — both contain migration-related assets. Do not assume either tree is obsolete or move migrations until ownership/history are proven.
- `tests/`, `scripts/`, `audit/` — tests, developer/CI tooling, and audit tooling; distinguish executable code from static evidence.
- `docs/`, `adr/`, `rfc/`, `specs/` — guides and decision records. Both `adr/` and `docs/adr/` exist; check their indexes and preserve ownership rather than creating another home.
- `AGENTS.md`, `.agents/`, `.ai/`, `.opencode/` — engineering guidance and coding-agent assets.

See the [repository boundary and change map](docs/architecture/repository-boundaries-and-change-map.md) before proposing structural moves.

## 4. Safe change rules

- Make the smallest coherent change that fixes a verified problem.
- Trace callers, imports, data flow, route usage, configuration, and tests before moving or deleting files.
- Preserve public routes/API contracts, Next.js server/client boundaries, caching/revalidation, metadata, and accessibility.
- Preserve editorial review, fact-checking, publication eligibility, and test-artifact exclusion; test rejected paths as well as successful ones.
- Preserve authentication, authorization, RLS, schema constraints, and migration history. Do not rewrite applied migrations. Add a new migration only for a real schema change.
- Do not expose secrets, commit environment values, alter production data, deploy, force-push, or merge without explicit authorization.
- Do not add abstractions, dependencies, top-level directories, or architectural tooling without evidence they reduce maintenance cost.
- Avoid repository-wide rewrites and simultaneous move-plus-rewrite changes. Work in small, reversible batches.
- Update docs when they clarify a current contract or make code/tests easier to locate.

## 5. Commands and verification

Check `package.json`, `.nvmrc`, and workflow files if commands/runtime assumptions may have changed. At this baseline:

- Node.js: `>=22.0.0` according to `package.json`; GitHub Actions uses Node 22.
- Install locked dependencies: `npm ci`.
- Type-check: `npm run check:type` (also `npm run typecheck`).
- Lint: `npm run check:lint` (also `npm run lint`).
- Standard scripted test chain: `npm run test`.
- Security checks: `npm run test:security`.
- Migration safety: `npm run test:migration`.
- Accessibility: `npm run test:a11y`.
- Broader composite suite: `npm run test:all`; inspect the script before treating it as exhaustive.
- Vitest: `npm run test:vitest`.
- Production build: `npm run build`.

The root `test` script is a manually chained selection, not proof every repository test ran. Choose focused tests for the changed subsystem, then run relevant integration checks. GitHub workflows include additional checks beyond any single package script.

## 6. Definition of done

- Scope, module ownership, and affected invariants are clear.
- Focused tests and applicable static checks were actually run.
- Relevant security, publication, database, SEO, or rendering contracts were checked.
- The final diff contains no unrelated or generated noise.
- Docs/ADRs are updated when the supported contract changes.
- Reports distinguish passed, failed, skipped, unrun, and pre-existing failures.
- Git/PR/deployment status is reported truthfully.

**Operating principle:** Optimize for low change propagation, clear module ownership, fast relevant verification, and correctness—not for files moved or abstractions introduced.

## 7. Lean engineering & Ponytail integration

Ponytail skills and lean-engineering heuristics (`ponytail`, `ponytail-review`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help` located in [`.agents/skills/`](.agents/skills/)) provide subordinate engineering guidance to keep changes minimal, verified, and maintainable:

- **Smallest complete change:** Prefer the smallest complete change that satisfies the actual requirement.
- **Pattern reuse:** Reuse existing project patterns, services, and dependencies before introducing new ones.
- **Impact tracing:** Trace affected callers, data flow, interfaces, configuration, and tests before editing or deleting code.
- **No speculative code:** Avoid speculative abstractions, unnecessary wrappers, unused options, and dependencies added for trivial functionality.
- **Preserve safeguards:** Preserve validation, error handling, security, accessibility, and correct edge-case behavior.
- **Proportional testing:** Test non-trivial changes in proportion to their risk.
- **Evidence-backed review:** Require concrete, reproducible evidence for code-review and audit findings.
- **Honest reporting:** Report skipped checks and remaining risks honestly at the conclusion of tasks.

### Instruction precedence & boundaries

- **Editorial authority:** The Editorial Constitution (`docs/editorial/editorial-constitution.md`) and applicable editorial standards strictly supersede all lean-code heuristics. No lean rule justifies bypassing source verification, editorial review, fact-checking, publication eligibility, audit records, or test-artifact exclusion.
- **Security & release integrity:** Authentication, authorization, RLS, database migration safety, atomic publication controls (the current publish RPC is `fn_publish_story_with_audit` in `supabase/migrations/030_publisher_worker_rpc.sql`; verify whether an atomic fence is actually present before citing one), secret handling, and release gates cannot be bypassed or weakened. "Simpler" or "lazy" is never permission to remove an essential safeguard.

## 8. Engineering skill boundaries

Three registered skills cover engineering delivery: `evidence-first-completion`, `publication-safety`, and `release-readiness` in [`.agents/skills/`](.agents/skills/). Apply them as follows:

- **Completion gate:** Before reporting a non-trivial task complete, apply [`evidence-first-completion`](.agents/skills/evidence-first-completion/SKILL.md). It requires evidence bound to the exact delivered SHA and forbids reporting skipped, blocked, or unrun checks as passes. If the file is unavailable, apply the same checks inline and say so.
- **Publication changes:** Any change touching story resolution, public routes, feeds, sitemap, search, scheduled workers, publication RPCs, or schema must satisfy [`publication-safety`](.agents/skills/publication-safety/SKILL.md).
- **Release assessment:** Candidate promotion, release PRs, and acceptance reporting must follow [`release-readiness`](.agents/skills/release-readiness/SKILL.md) and classify every gate as PASS, FAIL, SKIPPED, BLOCKED, or NOT RUN.

Boundaries that these skills do not move:

- Editorial authority remains with the Editorial Constitution and the `.ai/agents/*` editorial roles and workflows. Those determine whether a claim is verified and whether content may be published.
- Human authorization in `.ai/workflows/publish.md` is the only release decision. No engineering skill, green CI run, or "READY FOR HUMAN APPROVAL" audit result substitutes for it.
- `issue-to-completion` and `adversarial-verification` are intentionally unregistered because they restate `gravitas`. See [`docs/engineering/agent-skills-audit-2026-10-30.md`](docs/engineering/agent-skills-audit-2026-10-30.md) for where those copies live.
