# ADRs — Architecture Decision Records

This directory captures significant architectural decisions made for The Breakdown OS.

## Purpose

An ADR documents a single architectural decision: the context that forced the decision, the options considered, and the outcome chosen. ADRs are **immutable once accepted** — if a decision is reversed, a new ADR supersedes the old one rather than editing it.

---

## Process

1. **Trigger** — A decision is made (during an RFC, a PR review, or a design session).
2. **Record** — Author creates a new ADR from the template.
3. **Review** — Team reviews and approves.
4. **Status** — Set to `accepted`. Link from the relevant code/doc.

---

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-0001](./0001-next-app-router.md) | Use Next.js 15 App Router | accepted | 2024-01-01 |
| [ADR-0002](./0002-cloudflare-static-deployment.md) | Deploy as static site on Cloudflare Pages | accepted | 2024-01-01 |
| [ADR-0003](./0003-memory-service-pattern.md) | Memory* service pattern for data layer | accepted | 2024-01-01 |

---

## File Naming

```
adr/
  0001-short-title.md
  0002-another-decision.md
```

## Template

```markdown
---
adr: 0001
title: Short Title of Decision
status: proposed | accepted | deprecated | superseded
date: YYYY-MM-DD
supersedes: (ADR number, if applicable)
superseded_by: (ADR number, if applicable)
---

# ADR 0001 — Short Title of Decision

## Status
Accepted

## Context
What is the issue that is motivating this decision?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or harder because of this decision?
```
