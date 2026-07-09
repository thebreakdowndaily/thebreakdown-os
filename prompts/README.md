# Prompts

This directory stores prompt templates used by agents, editorial AI, and reader AI in The Breakdown OS.

## Overview

Prompts are versioned, named templates. Each prompt file describes its intended model, expected input variables, and output contract so it can be reliably composed into agent skills and workflows.

---

## Index

| Prompt | Description | Domain | Model |
|--------|-------------|--------|-------|
| _(none yet)_ | — | — | — |

---

## File Naming

```
prompts/
  editorial/
    headline-suggestions.md
    entity-discovery.md
    source-gap-detection.md
  reader/
    simplify.md
    summarize.md
    compare-policies.md
  agents/
    claim-verifier.md
```

## Template

````markdown
---
id: prompt-slug
name: Human-Readable Prompt Name
domain: editorial | reader | agent | system
model: gemini-2.0-flash | claude-sonnet | gpt-4o | any
version: 1.0.0
status: draft | active | deprecated
---

# [Prompt Name]

## Purpose
What this prompt is designed to accomplish.

## Input Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `{{var}}` | string | yes | Description |

## Prompt

```
Your prompt text here.
Use {{variable}} for interpolation.
```

## Expected Output
Description of the expected model response format.

## Notes
Any additional context, failure modes, or usage examples.
````
