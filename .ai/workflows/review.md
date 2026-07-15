# Workflow: Review

Narrative review pipeline. Used when a chapter draft exists and requires structured editorial review before advancement. This workflow does not begin at research — it begins with a completed draft and runs through quality verification.

Status machine: `status-machine.md`

Runtime: each stage maps to a job or external process. The Conductor checks `runtime/sessions/<slug>/story.yaml` before each stage — completed stages are skipped, interrupted stages are resumed.

## Artifacts

| Stage | Artifact |
|-------|----------|
| 1. Narrative Self-Review | Self-review checklist (inline, no permanent artifact) |
| 2. Editorial Conductor Gate | Gate clearance record (appended to story.yaml history) |
| 3. Peer Review | `artifacts/peer-review.md` (2+ reviewer reports) |
| 4. Editorial Review | `artifacts/review.md` (written EiC decision) |
| 5. Revision Loop | `artifacts/draft.md` (updated) + revision memo appended |
| 6. Approval | `artifacts/approval.md` (written approval record) |

---

## Execution Order

```
Narrative Editor (self-review)
    ↓
Editorial Conductor (gate check)
    ↓
Peer Review
    ↓
Editorial Review (Editor-in-Chief)
    ↓
Revision Loop (if needed)
    ↓
Approval
```

---

## Stage 1 — Narrative Self-Review

**Input:** Full chapter draft (from Narrative Editor).

**Output:** Completed Narrative Quality Review checklist containing pass/fail for each item.

**Quality gate:** All 12 checklist items are pass. Zero tolerance on any fail.

**Stop condition:** Any item fails. Draft does not advance — Narrative Editor revises and resubmits.

**Status flow:**
- `PASSED` → advance to Stage 2 (Editorial Conductor Gate Check) → RUNNING
- `FAILED` → return to Narrative Editor → PENDING (specific checklist items that failed attached)

---

## Stage 2 — Editorial Conductor Gate Check

**Input:** Draft + completed self-review checklist (from Stage 1).

**Output:** Gate clearance or escalation:
- If checklist is all pass: advance to peer review
- If gaps found: return to Narrative Editor with specificity

**Quality gate:** Conductor verifies each checklist item independently. Does not trust self-review — independently samples at least three claims for evidence traceability, three paragraphs for prohibited language, and one section transition for smoothness.

**Stop condition:** Conductor discovers checklist items that were marked pass but are actually fail. Narrative Editor's self-review credibility is questioned. Escalate to Editor-in-Chief.

**Status flow:**
- `PASSED` → advance to Stage 3 (Peer Review) → RUNNING
- `FAILED` → return to Narrative Editor → PENDING (specific items that failed independent verification)

---

## Stage 3 — Peer Review

**Input:** Draft (from Stage 2).

**Output:** Peer review report containing:
- Factual accuracy assessment (each major claim spot-checked)
- Structural coherence assessment (does the blueprint hold?)
- Clarity assessment (are any sections confusing?)
- Completeness assessment (are any questions unanswered?)
- Bias assessment (nationalist, imperial, presentism, hindsight, selection, confirmation)
- Specific recommendations for improvement

**Quality gate:** Minimum two peer reviewers. Reviewers represent different disciplinary or interpretive perspectives. Each reviewer produces a written report.

**Stop condition:** Both reviewers independently identify the same critical issue. Draft is returned to Narrative Editor with both reports attached.

**Status flow:**
- `PASSED` → advance to Stage 4 (Editorial Review) → RUNNING
- `FAILED` → return to Narrative Editor → PENDING (peer review findings attached; both reviewers identified same critical issue)

---

## Stage 4 — Editorial Review

**Input:** Draft + peer review reports (from Stage 3).

**Output:** Editorial decision:
- Approved
- Approved with conditions
- Returned to narrative with specific requirements
- Rejected

**Quality gate:** Editor-in-Chief issues a written decision. Conditions or return reasons are specific enough for the Narrative Editor to act on without clarification.

**Status flow:**
- `PASSED` (approved) → advance to Stage 5 (Revision Loop if conditions exist, or directly to Approval) → RUNNING
- `FAILED` (returned) → set Stage 1 (Narrative Self-Review) → REVISION_REQUIRED, add revision brief
- `FAILED` (rejected) → terminal. Document in Book of Record.

---

## Stage 5 — Revision Loop

**Input:** Editorial decision with conditions (from Stage 4).

**Output:** Revised draft with revision memo documenting:
- What changed
- Why it changed
- What was considered but not changed (and why)

**Quality gate:** Every condition from the editorial decision is addressed in the revision memo. Changes are not cosmetic — they respond to the specific findings.

**Stop condition:** Narrative Editor determines the conditions cannot be met without altering verified evidence. Escalate to Editor-in-Chief.

**Status flow:**
- `PASSED` → advance to Stage 6 (Approval) → RUNNING
- `FAILED` → return to Narrative Editor → PENDING (conditions not fully addressed or changes superficial)
- `BLOCKED` — conditions require evidence changes → set earlier stage as REVISION_REQUIRED, escalate to Editor-in-Chief

---

## Stage 6 — Approval

**Input:** Revised draft + revision memo (from Stage 5).

**Output:** Written approval from Editor-in-Chief.

**Quality gate:** Approval is in writing. Conditions (if any) are all addressed in the revision memo.

**Status flow:**
- `PASSED` → DONE. Approved chapter draft ready for `publish.md` workflow.
- `FAILED` → return to Stage 5 (Revision Loop) → PENDING (with specific items still unresolved)

**Final deliverable:** Approved chapter draft ready for the `publish.md` workflow.
