# Workflows

This directory contains workflow definitions for The Breakdown OS.

## Overview

A workflow is an ordered sequence of steps — involving humans, agents, or systems — that accomplishes a defined editorial, operational, or technical goal.

---

## Index

| Workflow | Description | Owner | Status |
|----------|-------------|-------|--------|
| _(none yet)_ | — | — | — |

---

## File Naming Convention

```
workflows/
  <domain>-<action>.md        # e.g. story-publishing.md
  <domain>-<action>.yaml      # machine-readable variant
```

## Template

```yaml
id: workflow-slug
name: Human-Readable Workflow Name
domain: editorial | engineering | operations
description: >
  What this workflow accomplishes.
trigger: manual | scheduled | event
steps:
  - id: step-1
    actor: human | agent:<agent-id> | system
    action: description of the action
    inputs:
      - from: trigger | step-N
    outputs:
      - name: artifact or result name
    on_failure: retry | escalate | abort
owner: team or person
status: draft | active | deprecated
```
