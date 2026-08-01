# Editorial Workflow Specification — Fix Domain

**Version:** 1.0.0  
**Status:** Architectural Specification (Locked)  
**Date:** July 2026  
**Governance Alignment:** *Editorial Constitution Art X & XIV*, *AGENTS.md*  

---

## 1. Executive Summary

This specification governs the lifecycle state machine, review gates, bureau responsibilities, and audit trails for authoring, verifying, publishing, and maintaining Fix Knowledge Objects.

Per *Article X of the Editorial Constitution*, engineering exists to enforce editorial quality. The state machine prevents unverified policy claims from reaching publication.

---

## 2. The 11-State Editorial Lifecycle

```
 [1. Draft] ──► [2. Research] ──► [3. Editorial Review] ──► [4. Fact Check] ──► [5. Expert Review]
                                                                                       │
 [11. Superseded] ◄── [10. Archived] ◄── [9. Updated] ◄── [8. Published] ◄── [7. Scheduled] ◄── [6. Approved]
```

### 2.1 State Definitions & Ownership

| State ID | State Name | Responsible Bureau | Scope & Purpose |
| :--- | :--- | :--- | :--- |
| `ST-01` | `Draft` | Editorial Bureau | Initial drafting of problem, root causes, and proposed mechanics. |
| `ST-02` | `Research` | Research Bureau | Evidentiary extraction, Level 1 statutory sourcing, global precedent collection. |
| `ST-03` | `Editorial Review` | Senior Editor | Structural synthesis, language neutrality check, trade-off completeness review. |
| `ST-04` | `Fact Check` | Verification Bureau | Independent verification of all factual assertions against cited sources. |
| `ST-05` | `Expert Review` | Verification Bureau | Peer audit by at least 2 external domain specialists (e.g., economists, legal scholars). |
| `ST-06` | `Approved` | Editor-in-Chief | Final clearance; Gold Standard Audit signed off. |
| `ST-07` | `Scheduled` | Platform Engine | Queued for release at a specified publication timestamp. |
| `ST-08` | `Published` | Platform Engine | Publicly accessible on `/fix/[slug]` and reader surfaces. |
| `ST-09` | `Updated` | Editorial Bureau | Re-versioned following new outcome metrics or statutory amendments. |
| `ST-10` | `Archived` | Verification Bureau | Policy retired, declared unconstitutional, or obsolete. |
| `ST-11` | `Superseded` | Editorial Bureau | Replaced by a superior canonical Fix (`supersededByFixId` assigned). |

---

## 3. Transition Matrix & Gate Criteria

```
┌──────────────┬──────────────────┬────────────────────────────────────────────────────────┐
│ From State   │ To State         │ Gate Requirements & Evidentiary Criteria               │
├──────────────┼──────────────────┼────────────────────────────────────────────────────────┤
│ Draft        │ Research         │ Basic problem statement and primary category assigned.  │
│ Research     │ Editorial Review │ Minimum 1 Level 1-3 Source cited; claims linked.       │
│ Editorial    │ Fact Check       │ Distributional impact, trade-offs, costs populated.    │
│ Fact Check   │ Expert Review    │ Fact-checker sign-off; zero unverified claim flags.    │
│ Expert Review│ Approved         │ Min 2 expert reviews logged; Gold Standard Audit pass. │
│ Approved     │ Published        │ Editor-in-Chief signature; zero ERROR linter failures. │
│ Published    │ Updated          │ SemVer incremented; change log entry recorded.         │
│ Published    │ Archived         │ Deactivation rationale logged; public banner rendered. │
│ Published    │ Superseded       │ Valid `supersededByFixId` set; replacement is live.    │
└──────────────┴──────────────────┴────────────────────────────────────────────────────────┘
```

---

## 4. The Gold Standard Fix Audit

Before transitioning from `Expert Review` (`ST-05`) to `Approved` (`ST-06`), a Fix must pass the 7-Phase Gold Standard Audit:

1. **Evidentiary Check**: Primary statutory or peer-reviewed citations verified by Research Bureau.
2. **Actor Feasibility Check**: Responsible Entity has legal authority under local administrative law.
3. **Trade-Off Completeness Audit**: Losers and costs explicitly identified; no "free lunch" policy claims.
4. **Uncertainty Audit**: Missing baseline data and contested scholarly evidence explicitly called out.
5. **Language & Neutrality Audit**: Linter scan confirms zero prohibited certainty terms.
6. **Accessibility & Visual Audit**: Table alternatives and screen reader ARIA roles validated.
7. **Defensibility Audit**: Editor-in-Chief verifies: *"Could we defend this policy analysis in court or in front of a parliamentary commission?"*

---

## 5. Audit Trail & Provenance Metadata

Every state transition generates an immutable record in the `KnowledgeAuditLog`:

```typescript
export interface FixStateTransitionEvent {
  eventId: string;
  fixId: string;
  previousState: EditorialStatus;
  newState: EditorialStatus;
  actorId: string;
  actorRole: UserRole;
  timestamp: string; // ISO-8601
  rationale?: string;
  validatorResults: {
    passed: boolean;
    errorCount: number;
    warningCount: number;
  };
  signature?: string; // Cryptographic sign-off for publication
}
```
