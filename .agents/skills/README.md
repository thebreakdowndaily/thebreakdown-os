# Project-local Agent Skills

This directory contains reusable, independently maintained agent workflows used by The Breakdown OS. Skills are registered in [`.agents/skills.md`](../skills.md).

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


## GitHub Project Radar

- Entry point: [`github-project-radar/SKILL.md`](github-project-radar/SKILL.md)
- Invocation in Antigravity: `/github-project-radar`
- Purpose: evidence-backed GitHub ecosystem discovery, license/security/maintenance checks, and reversible experiment proposals.
- Boundary: discovery only; no automatic third-party dependency installation, runtime changes, or deployment.
