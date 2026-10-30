# Skills

This file catalogs reusable skills available to agents in The Breakdown OS.

## Overview

A skill is a discrete, composable capability that one or more agents can invoke. Skills are defined independently of any single agent so they can be shared, versioned, and tested in isolation.

---

## Skill Registry

| Skill ID | Description | Used By | Status |
|----------|-------------|---------|--------|
| evidence-first-completion | Mandatory completion gate: proves delivered behavior and exact commit were verified, and classifies checks as passed, failed, skipped, blocked, or not run. | All coding agents / completion gate | active |
| publication-safety | Publication machinery invariants: fail-closed visibility, server-authoritative authorization, atomic auditable transitions, draft and embargo containment, migration safety. | Publishing / data layer / migrations | active |
| release-readiness | Reconciles an exact Git SHA against CI, security, migration, accessibility and build gates, plus approvals and rollback prerequisites. | Release management / CI | active |
| gravitas | Reliability workflow for scoped reconnaissance, adaptive planning, verification, recovery, and evidence-backed completion. Optional per its controlled evaluation; not mandated. | Gemini / Google Antigravity / compatible Agent Skills hosts | pilot |
| instagram-brand-voice | Apply The Breakdown's evidence-led, accessible brand voice. | Instagram editorial workflow | draft |
| instagram-source-research | Build a claim-level source ledger and verified social angles. | Instagram editorial workflow | draft |
| instagram-caption | Write and check searchable, platform-native Instagram captions. | Instagram editorial workflow | draft |
| instagram-carousel | Turn a verified source brief into a mobile-first carousel storyboard. | Instagram editorial workflow | draft |
| instagram-reels | Create source-backed Reel scripts, beat sheets, and shot lists. | Instagram editorial workflow | draft |
| instagram-content-calendar | Plan a realistic seven-day Instagram draft calendar. | Instagram editorial workflow | draft |
| instagram-repurpose | Convert an approved long-form asset into distinct Instagram formats. | Instagram editorial workflow | draft |
| instagram-profile-audit | Audit supplied profile text/screenshots without logging in. | Instagram editorial workflow | draft |
| instagram-performance-audit | Analyze supplied post results and native Insights data. | Instagram editorial workflow | draft |
| instagram-quality-auditor | Review evidence, voice, accessibility, risk, and publication readiness. | Instagram editorial workflow | draft |
| ponytail | Lazy senior dev mode: smallest complete change, reuse existing patterns, no speculative code. | Coding agents / Antigravity | active |
| ponytail-review | Quality review of a diff: correctness, safety, load scaling, tests, speed, and lean diff. | Code review / Antigravity | active |
| ponytail-audit | Repository-wide quality audit: bugs, security risks, load scaling, missing tests, and bloat. | Codebase audit / Antigravity | active |
| ponytail-debt | Harvest and track `shortcut:` and `ponytail:` comments into a debt ledger. | Technical debt tracking / Antigravity | active |
| ponytail-gain | Display measured agentic benchmark impact scoreboard. | Antigravity / Benchmarks | active |
| ponytail-help | Reference card for Ponytail levels, skills, and command triggers. | Antigravity / Documentation | active |

---

## Template

```yaml
id: skill-slug
name: Human-Readable Name
description: >
  What this skill does in one or two sentences.
inputs:
  - name: param_name
    type: string | number | object | array
    required: true
    description: what this param is
outputs:
  - name: result_name
    type: string | object
    description: what is returned
implementation: path/to/implementation or inline description
agents:
  - agent-slug
status: draft | active | deprecated
```
