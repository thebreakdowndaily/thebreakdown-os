# RFCs — Request for Comments

This directory holds RFC documents for significant changes to The Breakdown OS.

## Purpose

An RFC is required when a proposed change is:
- Cross-cutting (affects multiple components or teams)
- Irreversible or difficult to roll back
- A major new feature or capability
- A breaking change to an API or data contract

Small, self-contained changes do not need an RFC — use a PR description instead.

---

## Process

1. **Draft** — Copy the template, fill in the sections, open a PR.
2. **Comment Period** — Minimum 3 business days for team feedback.
3. **Decision** — Author summarises feedback and records a decision (accepted / rejected / postponed).
4. **Implementation** — Accepted RFCs are tracked in [`/adr`](../adr/) once implemented.

---

## Index

| RFC | Title | Status | Author | Date |
|-----|-------|--------|--------|------|
| _(none yet)_ | — | — | — | — |

---

## File Naming

```
rfc/
  0001-short-description.md
  0002-another-change.md
```

## Template

```markdown
---
rfc: 0001
title: Short Description of Change
status: draft | open | accepted | rejected | postponed | superseded
author: Your Name
date: YYYY-MM-DD
supersedes: (RFC number, if applicable)
---

# RFC 0001 — Short Description of Change

## Summary
One paragraph overview of the change.

## Motivation
Why is this change needed? What problem does it solve?

## Detailed Design
Technical details of the proposed solution.

## Drawbacks
Reasons this might be a bad idea.

## Alternatives
Other approaches considered and why they were rejected.

## Unresolved Questions
What needs to be figured out before this can be accepted?

## Implementation Plan
High-level steps to implement once accepted.
```
