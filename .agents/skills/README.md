# Project-local Agent Skills

This directory contains reusable, independently maintained agent workflows used by The Breakdown OS. Skills are registered in [`.agents/skills.md`](../skills.md).

## Engineering completion and release skills

Three skills cover engineering delivery. They are complementary to the editorial and Instagram skills below, and none of them grants editorial or release authority.

| Skill | Use |
|---|---|
| [`evidence-first-completion`](evidence-first-completion/SKILL.md) | Mandatory gate before declaring a non-trivial task complete. Binds evidence to the exact commit and refuses to report skipped, blocked, or unrun checks as passes. |
| [`publication-safety`](publication-safety/SKILL.md) | Invariants for the publication machinery: fail-closed visibility, server-authoritative authorization, atomic auditable transitions, draft and embargo containment, migration safety. |
| [`release-readiness`](release-readiness/SKILL.md) | Reconciles a candidate SHA against the gate matrix and records a PASS / FAIL / SKIPPED / BLOCKED / NOT RUN assessment. |

`evidence-first-completion` defers to [`gravitas/references/verification.md`](gravitas/references/verification.md) for the evidence hierarchy rather than restating it.

Precedence between the two, per the pilot's own conclusion:

- **`evidence-first-completion` is mandatory.** It is the completion gate referenced by `AGENTS.md` §6 and §8.
- **`gravitas` is optional.** The controlled evaluation recorded no measurable quality advantage over baseline instructions — both conditions reached ceiling scores, with GRAVITAS slower by +7.46% total and +8.82% median latency — and recommends keeping Core optional rather than mandating it. Use it for ambiguous, multi-subsystem, or high-uncertainty work.
- **Where they diverge, `evidence-first-completion` governs completion claims; `gravitas` governs optional planning depth and decision-record detail.** Neither overrides the editorial boundary below.

### Precedence and boundaries

- The Editorial Constitution (`docs/editorial/editorial-constitution.md`) and applicable editorial standards govern whether content may be published. No engineering skill overrides them.
- Whether a claim is verified is decided by the editorial workflow (`.ai/agents/source-verifier.md`, `.ai/workflows/fact-check.md`, `.ai/workflows/review.md`).
- Whether a story is released is decided by human authorization in `.ai/workflows/publish.md`, not by `publication-safety`, `release-readiness`, or `instagram-quality-auditor`.
- Green CI, a passing build, or a "READY FOR HUMAN APPROVAL" audit result is never merge, deploy, migration, or publication authorization.

`issue-to-completion` and `adversarial-verification` are **not** registered. They restate `gravitas` and were deliberately left out to avoid two competing sources of engineering procedure. They remain available on the unmerged branches recorded in [`docs/engineering/agent-skills-audit-2026-10-30.md`](../../docs/engineering/agent-skills-audit-2026-10-30.md).

## Gravitas Core (pilot)

GRAVITAS adds a structured engineering workflow for coding agents: inspect before editing, scope changes, adapt planning depth to risk, verify with repository-declared checks, recover from failures, and report only evidence-backed outcomes.

- Entry point: [`gravitas/SKILL.md`](gravitas/SKILL.md)
- Integration and evaluation plan: [`docs/engineering/gravitas-core-pilot.md`](../../docs/engineering/gravitas-core-pilot.md)
- Upstream source and license pin: [`gravitas/UPSTREAM.md`](gravitas/UPSTREAM.md)
- Pilot status: **not yet approved for broad rollout**. Core is behavioral guidance, not mechanical enforcement. The optional Native plugin and runtime are not installed by this change.

## Instagram editorial skills

Recommended chain:

`instagram-source-research → instagram-brand-voice → instagram-carousel or instagram-reels → instagram-caption → instagram-quality-auditor → human approval`.

Use `instagram-content-calendar` and `instagram-repurpose` for planning. Use `instagram-profile-audit` and `instagram-performance-audit` when the user supplies profile snapshots, post examples, or native Insights data.

## Ponytail (lean engineering skills)

Ponytail provides lean coding, review, audit, and technical debt tracking capabilities. Upstream repository: `https://github.com/DietrichGebert/ponytail` (MIT License).

- Core skill: [`ponytail/SKILL.md`](ponytail/SKILL.md) — lean implementation guidance (smallest complete change, pattern reuse, no bloat).
- Review skill: [`ponytail-review/SKILL.md`](ponytail-review/SKILL.md) — correctness, safety, load, tests, speed, and lean diff review.
- Audit skill: [`ponytail-audit/SKILL.md`](ponytail-audit/SKILL.md) — repo-wide audit for bugs, risk, load, missing tests, and bloat.
- Debt skill: [`ponytail-debt/SKILL.md`](ponytail-debt/SKILL.md) — scans `shortcut:` and `ponytail:` comments into a tracked ledger.
- Gain skill: [`ponytail-gain/SKILL.md`](ponytail-gain/SKILL.md) — benchmark savings scoreboard.
- Help skill: [`ponytail-help/SKILL.md`](ponytail-help/SKILL.md) — quick reference card.
- Upstream source, commit pin, and attribution: [`ponytail/UPSTREAM.md`](ponytail/UPSTREAM.md).

### Precedence & boundaries
Ponytail is subordinate to the root `AGENTS.md` and `docs/editorial/editorial-constitution.md`. Lean heuristics never override editorial verification, RLS, migration safety, atomic publication controls, or release gates.

## Operating rules

- Read canonical project instructions and the existing command/formatter before editing.
- Keep material factual claims connected to traceable source records.
- Do not log into Instagram, scrape at scale, publish, schedule, like, follow, comment, message, or alter account settings.
- A successful editorial audit means ready for human approval, never approved to publish.
