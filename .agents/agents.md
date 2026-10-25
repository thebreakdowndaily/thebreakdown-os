# Agents

This file registers agent definitions used across The Breakdown OS.

## Overview

Agents are autonomous or semi-autonomous routines that operate on content, data, or infrastructure within the platform. Define each agent's purpose, trigger conditions, inputs, outputs, and failure modes here.

---

## Agent Registry

| Agent ID | Role | Trigger | Status | Location |
|----------|------|---------|--------|----------|
| `codebase-researcher` | Read-only codebase researcher: maps source paths, call graphs, project conventions, and relevant history. | manual / subagent invocation | active | `.agents/agents/codebase-researcher/agent.md` |
| `security-reviewer` | Read-only security and adversarial reviewer: independently inspects changes, validates authorization boundaries, RLS, secret hygiene, and failure modes. | manual / subagent invocation | active | `.agents/agents/security-reviewer/agent.md` |
| `verification-specialist` | Test and verification specialist: designs and evaluates regression tests, executes test suites, and verifies test evidence. | manual / subagent invocation | active | `.agents/agents/verification-specialist/agent.md` |

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
