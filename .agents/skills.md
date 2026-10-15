# Skills

This file catalogs reusable skills available to agents in The Breakdown OS.

## Overview

A skill is a discrete, composable capability that one or more agents can invoke. Skills are defined independently of any single agent so they can be shared, versioned, and tested in isolation.

---

## Skill Registry

| Skill ID | Description | Used By | Status |
|----------|-------------|---------|--------|
| gravitas | Reliability workflow for scoped reconnaissance, adaptive planning, verification, recovery, and evidence-backed completion. | Gemini / Google Antigravity / compatible Agent Skills hosts | pilot |
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
