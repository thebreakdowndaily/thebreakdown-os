---
title: Repository Ownership Audit — Migrations, ADRs, Runtime Artifacts and CI
status: focused-audit
owner: engineering
last_updated: 2026-10-15
---

# Repository Ownership Audit — 2026-10-15

## Scope and confidence

This is a focused, evidence-backed audit of repository files, scripts, package commands, and workflows. It does **not** claim a complete source import graph or production database inventory. No migration was executed, no production service was modified, and no repository data artifact was deleted in this audit.

## 1. Migration trees are not duplicates — their intended database engines differ

### Supabase / PostgreSQL migration chain

**Observed evidence**

- `supabase/migrations/` contains the numbered chain `001_create_tables.sql` through `032_hero_image_accessibility.sql`, plus two SQL files under `supabase/migrations/archive/`.
- The migration validator at `scripts/verify-migrations.ts` defaults to `supabase/migrations/`. It enumerates only immediate `.sql` children, requires a contiguous three-digit sequence starting at 001, and checks selected destructive DDL patterns. It does not recursively verify files in the archive directory.
- `npm run test:migration` runs that validator plus `tests/security/database-enforcement.test.ts`. The security script also invokes the migration validator.
- `scripts/db-migration-replay.js` targets the Supabase migration directory but explicitly replays only migration files 001–013. Its passing result is not, by itself, proof of the full 001–032 chain.
- `scripts/supabase-migrate.js` reads and submits only `supabase/migrations/001_create_tables.sql`; it is a one-off helper, not a full-chain orchestrator.
- The current GitHub CI and production-validation workflows run migration safety checks.

**Assessment:** This is the current, tool-enforced migration chain in the checked-in validation workflow. Its checker and replay helper cover different scopes; document that distinction and avoid describing either one as full end-to-end migration verification without additional evidence.

### Root `migrations/` — Cloudflare D1 / SQLite-oriented SQL

**Observed evidence**

- The root chain contains four numbered files: `0001_auth.sql`, `0002_reader.sql`, `003_datasets.sql`, and `004_cms.sql`.
- `migrations/0001_auth.sql` identifies itself as a Cloudflare D1 schema for Better Auth.
- `scripts/seed-d1.ts` generates SQL for D1 and prints a manual `wrangler d1 execute thebreakdown-auth --remote --file=...` command.
- The root `package.json` has no dedicated `seed-d1` or root-migration validation script, and the inspected GitHub Actions workflows do not run this D1 migration chain.
- No root-level `wrangler.toml` or `wrangler.jsonc` is present in the recursive tree. The one checked-in Wrangler configuration is `workers/scheduled-publish/wrangler.toml`, whose declared runtime variables include Supabase settings rather than a D1 binding.

**Assessment:** This is a separate D1-oriented chain, not a duplicate of the Postgres SQL. Its current operational status is **unverified / apparently not wired into the normal CI workflow**. It may still support a manual or external Cloudflare environment. Do not delete it or call it dead until a repository/reference/history review and an explicit D1-environment check confirms its disposition.

### Migration disposition

| Path / tool | Current observed role | Safe next action |
|---|---|---|
| `supabase/migrations/` | Main chain verified by repository scripts and CI | Preserve order and applied migration immutability |
| `supabase/migrations/archive/` | Historical SQL excluded from the current top-level contiguous-chain validator | Confirm retention semantics; do not restore into the numbered chain blindly |
| Root `migrations/` | D1-oriented SQL with a manual seeding helper | Determine whether the D1 service is retired, externally configured, or still required |
| `scripts/verify-migrations.ts` | Validates the top-level Supabase chain only | Keep its scope documented; if desired, add a separate explicit D1 validator after D1 ownership is established |
| `scripts/db-migration-replay.js` | Disposable local replay of Supabase 001–013 | Rename/document scope or extend coverage in a separate, tested change |

## 2. ADR governance has overlapping registers and contradictory creation guidance

### Evidence

- Root `adr/README.md` indexes platform/application decisions such as Next.js App Router, static Cloudflare deployment, and the Memory* service pattern. The root README links readers to `adr/`, and `docs/architecture/README.md` says decisions are tracked in `/adr`.
- `docs/adr/README.md` indexes Knowledge Operating System decisions such as the canonical domain model, projection boundaries, editorial state machine, research-session isolation, and versioning.
- `docs/adr/README.md` also says **all** structural modifications must be recorded in `docs/adr/` and approved before implementation. That instruction conflicts with the root architecture documentation that points to `adr/`.
- `docs/architecture/adr-index.md` is a third register presented as a prose “Architecture Decision Register.” Its numbered concepts overlap topics represented by the two file-backed ADR collections, and not every register entry is a direct link to a corresponding numbered file.
- The two file-backed collections reuse IDs, including ADR-0001, ADR-0002, and ADR-0003. Moving or renumbering accepted records would break historical references and should not be done as cosmetic cleanup.

### Assessment and recommendation

Treat the collections as **distinct existing scopes with unresolved governance**, not as one folder that can safely be moved today.

Proposed policy for review:
1. `adr/` owns application/runtime/hosting and platform implementation decisions.
2. `docs/adr/` owns canonical knowledge-model, editorial-state, research-provenance, and KOS-domain decisions.
3. `docs/architecture/adr-index.md` should either become an explicitly maintained cross-register with links and qualified IDs, or be labelled as a historical narrative register.
4. Preserve existing numbers and files. Before a new architectural decision is authored, reconcile the two contradictory “where to create an ADR” rules and link the chosen policy from both indexes.

This is a proposal, not an accepted governance change.

## 3. Tracked Wrangler local state is a repository-hygiene risk

The recursive tree contains **9 tracked files (14 tree entries including directories)** under `.wrangler/state/v3/`, including Miniflare cache/D1 SQLite databases and their `-wal` / `-shm` companions. The root `.gitignore` does not currently ignore this state directory.

These are generated local runtime-state artifacts rather than source/configuration files. Committing SQLite WAL/SHM files can produce machine-specific, inconsistent, or unnecessary repository history. However, a local D1 database file can contain developer data, so it must not be deleted merely based on the filename.

**Action in this branch:** Ignore future `.wrangler/state/` contents. Existing tracked files remain tracked by Git despite the ignore rule; before removing them from version control, determine whether the local database contains data that needs an explicit export/fixture. Do not commit replacement local state.

## 4. CI overlap is real; consolidation is not yet justified

At the current PR head `eb38c05772d589e1c83ad601fff5041665b75fda`, GitHub reports the relevant CI validation, production validation, audit-framework verification, and secret/dependency scans as successful. The production/staging deployment-verification jobs are skipped on this PR as expected under their branch conditions.

The `.github/workflows/ci.yml` and `.github/workflows/production-deploy.yml` validation jobs run overlapping TypeScript, lint, security, migration, and build gates, but the production workflow also runs additional domain/workflow/data-integrity/release checks. `.gitlab-ci.yml` defines another overlapping pipeline. The connector could not read branch protection/rulesets because GitHub returned an access-denied response; current required check names and whether GitLab is active remain unverified. No reliable elapsed-time measurements were collected.

**Recommendation:** Do not disable a workflow. First compare exact step sets, branch/environment conditions, required status checks, recent run durations, and whether GitLab remains an active provider. Then consolidate only where a single maintained check preserves the same guarantees.

## 5. What this audit does not claim

- The D1-oriented root migrations are not proven retired or unused.
- The 15 tracked Wrangler state files are not proven safe to discard without preserving any needed local data.
- An import-level circular-dependency scan has not yet been completed.
- Duplicate CI commands do not prove that a workflow or gate is redundant.
- No production data, database schema, migration history, or application source was changed here.

## Next evidence required

1. Confirm D1 runtime/ownership with the repository owner and any external Cloudflare configuration.
2. Reconcile ADR creation policy and identify the intended purpose of the prose ADR register.
3. Remove tracked Wrangler state only after an export/retention decision; keep generated state ignored.
4. Build and verify a source-level dependency/import graph for application, feature, service, package, and plugin code.
5. Capture elapsed times and required-check configuration before making CI changes.
