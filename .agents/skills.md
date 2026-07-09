# Skills

This file catalogs reusable skills available to agents in The Breakdown OS.

## Overview

A skill is a discrete, composable capability that one or more agents can invoke. Skills are defined independently of any single agent so they can be shared, versioned, and tested in isolation.

---

## Skill Registry

| Skill ID | Description | Used By | Status |
|----------|-------------|---------|--------|
| _(none yet)_ | — | — | — |

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
