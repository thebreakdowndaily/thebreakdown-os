# Architecture Execution Agent

**Purpose:** Operational doctrine for implementing changes against the frozen baseline.
**Baseline:** v1.0.0-chapter1
**Status:** Active

---

## Mission

Implement only the requested capability while preserving the frozen architectural baseline. The architecture is governed. Treat all governance documents as executable constraints, not documentation.

---

## Architecture Hierarchy

| Priority | Document | Role |
|----------|----------|------|
| 1 | `docs/architecture/baseline-v1.0.0-chapter1.md` | Frozen contracts, compatibility levels, version semantics |
| 2 | `AGENTS.md` | Engineering workflows, editorial doctrine, chapter roadmap |
| 3 | `docs/architecture/adr-index.md` | Architectural decisions and rationale |
| 4 | `docs/architecture/acp-template.md` | Change proposal process |
| 5 | `docs/architecture/fitness-functions.md` | Architectural conformance checks |
| 6 | `types/canonical.ts` | Canonical type definitions |
| 7 | Existing implementation | Current codebase |

Never violate a higher-level document to satisfy a lower-level one.

---

## Pre-Implementation Checklist

Before coding any change, determine:

1. **What capability is requested?** — One sentence.
2. **Which canonical objects are affected?** — List types, services, or fixtures.
3. **Compatibility level?** — A (additive), B (compatible), C (breaking).
4. **Which ADRs apply?** — Reference relevant decisions.
5. **Which fitness functions are affected?** — Reference conformance checks.

---

## Compatibility Classification

| Level | Name | Rule |
|-------|------|------|
| **A** | Additive | Ship freely. No migration. No review required. |
| **B** | Compatible Evolution | ACP required. 1 reviewer. Existing content works. |
| **C** | Breaking | STOP. Explain why. Require new baseline. 2 reviewers + migration plan. |

Never implement Level C without explicit approval.

---

## Stop Conditions

Immediately stop if you discover:

- Duplicate canonical models
- Second source of truth
- Breaking schema change
- Reader journey regression
- Orphaned graph objects
- Unresolved compatibility issue

Do not attempt architectural redesign unless explicitly requested.

---

## Fitness Function Verification

After implementation, confirm:

- ✓ Canonical Integrity — no duplicates, no parallel schemas
- ✓ Knowledge Graph Integrity — no orphaned entities, all relationships resolve
- ✓ Reader Journey Integrity — core paths work, no dead ends
- ✓ Trust Integrity — valid states, graceful degradation
- ✓ Compatibility Integrity — change classified correctly, ACP if needed

If any fitness function fails: STOP. Explain why. Do not continue.

---

## Completion Report

Every implementation returns:

### Summary
What changed.

### Compatibility
Level A/B/C.

### Files Added / Modified / Removed
List with purpose.

### Tests
New tests created. Existing tests updated. All passing.

### Fitness Functions
Status for each of the five areas.

### Architectural Assessment
Confirm whether the implementation preserves v1.0.0-chapter1. If not, STOP and explain why.
