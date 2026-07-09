# Specs

Functional and technical specifications for The Breakdown OS features.

## Overview

A spec defines the expected behaviour of a feature at a level of detail sufficient to implement and test it. Specs sit between a blueprint (product intent) and an ADR (architecture decision) — they describe *what the system must do* in concrete, testable terms.

---

## Index

| Spec | Feature | Status | Owner |
|------|---------|--------|-------|
| _(none yet)_ | — | — | — |

---

## File Naming

```
specs/
  story-block-system.md
  evidence-engine.md
  unified-search.md
  knowledge-graph.md
```

## Template

```markdown
---
title: Spec Title
feature: feature-name
status: draft | review | approved | implemented | deprecated
owner: engineering | product | editorial
last_updated: YYYY-MM-DD
---

# [Spec Title]

## Overview
Brief description of what this spec covers.

## Goals
- Goal 1
- Goal 2

## Non-Goals
- What this does NOT cover

## Functional Requirements

### FR-1: Requirement Name
Description of the requirement.

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

## Technical Requirements

### TR-1: Requirement Name
Description.

## Data Model
Any new or changed types, schemas, or interfaces.

## API Contract
Endpoints or function signatures this feature exposes or consumes.

## Edge Cases & Error Handling
Known edge cases and how they should be handled.

## Open Questions
- [ ] Question 1
```
