# Agents

This file registers agent definitions used across The Breakdown OS.

## Overview

Agents are autonomous or semi-autonomous routines that operate on content, data, or infrastructure within the platform. Define each agent's purpose, trigger conditions, inputs, outputs, and failure modes here.

---

## Agent Registry

| Agent ID | Role | Trigger | Status |
|----------|------|---------|--------|
| _(none yet)_ | — | — | — |

---

## Template

```yaml
id: agent-slug
name: Human-Readable Name
role: >
  One-paragraph description of what this agent does.
trigger:
  - manual | cron | event | webhook
inputs:
  - description of expected input
outputs:
  - description of expected output
failure_mode: what happens on error
owner: team or person responsible
status: draft | active | deprecated
```
