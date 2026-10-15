# Project-local Agent Skills

This directory contains reusable, independently maintained agent workflows used by The Breakdown OS. Skills are registered in [`.agents/skills.md`](../skills.md).

## Gravitas Core (pilot)

GRAVITAS adds a structured engineering workflow for coding agents: inspect before editing, scope changes, adapt planning depth to risk, verify with repository-declared checks, recover from failures, and report only evidence-backed outcomes.

- Entry point: [`gravitas/SKILL.md`](gravitas/SKILL.md)
- Integration and evaluation plan: [`docs/engineering/gravitas-core-pilot.md`](../../../docs/engineering/gravitas-core-pilot.md)
- Upstream source and license pin: [`gravitas/UPSTREAM.md`](gravitas/UPSTREAM.md)
- Pilot status: **not yet approved for broad rollout**. Core is behavioral guidance, not mechanical enforcement. The optional Native plugin and runtime are not installed by this change.

## Instagram editorial skills

Recommended chain:

`instagram-source-research → instagram-brand-voice → instagram-carousel or instagram-reels → instagram-caption → instagram-quality-auditor → human approval`.

Use `instagram-content-calendar` and `instagram-repurpose` for planning. Use `instagram-profile-audit` and `instagram-performance-audit` when the user supplies profile snapshots, post examples, or native Insights data.

## Operating rules

- Read canonical project instructions and the existing command/formatter before editing.
- Keep material factual claims connected to traceable source records.
- Do not log into Instagram, scrape at scale, publish, schedule, like, follow, comment, message, or alter account settings.
- A successful editorial audit means ready for human approval, never approved to publish.
