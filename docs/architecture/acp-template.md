# Architecture Change Proposal (ACP)

| Field | Value |
|-------|-------|
| **ACP ID** | ACP-XXX |
| **Title** | [short description] |
| **Chapter** | Chapter X — [name] |
| **Status** | Draft \| Approved \| Implemented \| Superseded |
| **Author** | [name] |
| **Date** | YYYY-MM-DD |

---

## Problem Statement

What limitation or opportunity does this address? Why is this change necessary now?

---

## Architectural Impact

Check all affected areas:

- [ ] Canonical Schema (`types/canonical.ts`, `lib/problem-helpers.ts`)
- [ ] Reader Navigation (header, footer, homepage, search routes)
- [ ] Knowledge Graph (relationships between Problems, Stories, Fixes, Entities)
- [ ] Editorial Workflow (writing, review, publication process)
- [ ] Trust Layer (TrustCard, TrustStateIndicator, evidence grading)
- [ ] Search (indexing, ranking, grouping)
- [ ] Performance (bundle size, render performance, build time)

---

## Compatibility Assessment

| Level | Name | Description |
|-------|------|-------------|
| **A** | Additive | New components, pages, optional metadata. No migration. No review required. |
| **B** | Compatible Evolution | New relationships, extended search, new views. Existing content works. 1 reviewer. |
| **C** | Breaking | Schema changes, field removal, navigation restructuring. New baseline + migration. 2 reviewers. |

**This ACP is Level:** [ ] A  [ ] B  [ ] C

**Rationale:** Why this classification and not another?

---

## Alternatives Considered

| Alternative | Why Not Chosen |
|-------------|---------------|
| [option 1] | [reason] |
| [option 2] | [reason] |

Capture why the chosen design was preferred. This becomes historical context as the project grows.

---

## Migration Plan

*Required if Level B or C. Skip for Level A.*

Describe:
- What content or data must be updated
- What code must change
- Rollback strategy if the change fails
- Timeline for migration

---

## Acceptance Criteria

The architectural conditions that must be met before this ACP can be marked Implemented:

- [ ] [criterion 1]
- [ ] [criterion 2]
- [ ] [criterion 3]

---

## Review

| Reviewer | Role | Decision | Date |
|----------|------|----------|------|
| | | | |

---

## Notes

Free-form notes, references to ADRs/RFCs, or implementation details.
