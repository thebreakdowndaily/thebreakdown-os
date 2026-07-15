# Workflow: Living Update

Correction and minor update pipeline. Used for verified errors, reader-submitted corrections, source updates, and freshness maintenance. This workflow is the most common and must be efficient — it runs whenever a published chapter requires a change too small for the full `update-story.md` workflow.

Status machine: `status-machine.md`

Runtime: each stage maps to a check or action. The Conductor checks `runtime/sessions/<slug>/story.yaml` before each stage — completed stages are skipped, interrupted stages are resumed.

## Artifacts

| Stage | Artifact |
|-------|----------|
| 1. Correction Receipt | `artifacts/correction-ticket.md` |
| 2. Triage | Triage record appended to correction-ticket.md |
| 3. Verification | `artifacts/verification.md` (correction-specific) |
| 4. Scope Assessment | Scope appendix in correction-ticket.md |
| 5. Approval | `artifacts/approval.md` |
| 6. Update Package | `artifacts/update-package.md` |
| 7. Human Approval | Signed authorisation in story.yaml history |
| 8. Publication | Publish record appended to story.yaml |

---

## Execution Order

```
Correction Receipt
    ↓
Triage
    ↓
Verification
    ↓
Scope Assessment
    ↓
Approval
    ↓
Update Package
    ↓
Human Approval (mandatory, no automation)
    ↓
Publication
    ↓
Notification
```

---

## Stage 1 — Correction Receipt

**Input:** Correction submission containing:
- Location of the error (chapter, section, paragraph, claim ID)
- Description of the error
- Corrected information or source
- Submitter information (optional for anonymous, required for follow-up)

**Output:** Correction ticket with:
- Unique identifier
- Timestamp
- Source location documented
- Priority assigned (critical: factual error changes understanding; standard: factual error in supporting detail; cosmetic: typo, formatting, broken link)

**Quality gate:** Correction is recorded verbatim. Location is specific enough to identify the affected paragraph or claim.

**Status flow:**
- `PASSED` → advance to Stage 2 (Triage) → RUNNING
- `FAILED` → return to Correction Receipt → PENDING (missing location, unreadable submission)

---

## Stage 2 — Triage

**Input:** Correction ticket (from Stage 1).

**Output:** Triage decision:
- **Accept** — correction is plausible and within editorial scope
- **Reject** — correction is outside scope, not a factual error, or unsupported
- **Request more information** — cannot be assessed with available information

**Quality gate:** Triage decision is documented with rationale. Rejected corrections include an explanation for the submitter.

**Status flow:**
- `PASSED` (accepted) → advance to Stage 3 (Verification) → RUNNING
- `FAILED` (rejected) → DONE. Close ticket with explanation. Notify submitter.
- `PASSED` (more info requested) → PENDING. Wait for submitter response. Set timer.

---

## Stage 3 — Verification

**Input:** Accepted correction (from Stage 2).

**Output:** Verification result:
- Error confirmed — published claim is incorrect
- Error not confirmed — published claim is accurate
- Ambiguous — evidence inconclusive

**Quality gate:** Verification follows the `fact-check.md` workflow for the specific claim. Every correction is verified against sources before any change is made.

**Status flow:**
- `PASSED` (error confirmed) → advance to Stage 4 (Scope Assessment) → RUNNING
- `FAILED` (error not confirmed) → DONE. Close ticket. Notify submitter with evidence summary.
- `PASSED` (ambiguous) → DONE. Correction not applied. Notify submitter of ambiguity. Log for future re-evaluation if new evidence emerges.

---

## Stage 4 — Scope Assessment

**Input:** Verified correction (from Stage 3).

**Output:** Scope document containing:
- Affected claims (registry IDs)
- Affected narrative sections
- Affected evidence items
- Affected cross-references (other chapters that cite the same claim)
- Required change type:
  - **Surgical** — correct the specific claim and its evidence reference only
  - **Extended** — correction changes interpretation of surrounding paragraphs
  - **Cascading** — correction affects other chapters; trigger separate living updates

**Quality gate:** All affected locations are identified before any change is made. Surgical vs. extended distinction is justified.

**Status flow:**
- `PASSED` (surgical) → advance to Stage 5 (Approval) → RUNNING
- `PASSED` (extended) → advance to Stage 5 → RUNNING. Attach extended scope.
- `PASSED` (cascading) → advance to Stage 5 → RUNNING. Attach cascading scope with cross-reference list.
- `FAILED` → return to Scope Assessment → PENDING (missing affected locations, unjustified change type)
- `BLOCKED` → correction exceeds living update scope. Escalate to `update-story.md` workflow.

---

## Stage 5 — Approval

**Input:** Scope document (from Stage 4).

**Output:** Approval to proceed:
- Editor-in-Chief approves the correction
- Approval includes: change type (surgical/extended), version increment (patch/minor), publication timeline

**Quality gate:** Approval is written. Change type is consistent with scope. Version increment follows semantic versioning.

**Status flow:**
- `PASSED` → advance to Stage 6 (Update Package) → RUNNING
- `FAILED` → return to Scope Assessment → PENDING (approval withheld, scope or change type disputed)
- `BLOCKED` → Editor-in-Chief determines correction requires Gold Standard Review. Escalate to `update-story.md` workflow.

---

## Stage 6 — Update Package

**Input:** Approved scope (from Stage 5) + verified correction (from Stage 3).

**Output:** Update package containing:
- Corrected claim in the Claim Registry with revision history
- Updated evidence item if correction involved source verification
- Revised narrative text for affected paragraphs
- Updated cross-references if other chapters affected
- Change log entry: what changed (before/after), why, evidence, previous version, new version, correction ticket reference
- Revision badge text: "This passage was revised on [date]. [View change log]"

**Quality gate:** Only the specific claims and paragraphs identified in the scope document are changed. Everything else is byte-identical. Change log entry is complete. Revision badge is accurate.

**Status flow:**
- `PASSED` → advance to Stage 7 (Publication) → RUNNING
- `FAILED` → return to Update Package → PENDING (changes exceed approved scope, incomplete change log, missing revision badge)
- `FAILED` (scope violation) → return to Update Package with scope violation documented. Return to Stage 5 if scope dispute.

---

## Stage 7 — Human Approval

**Input:** Update package (from Stage 6) + approval (from Stage 5).

**Output:** Signed release authorisation from a human editor (not an agent, not the Conductor).

**Rule:** The Conductor must not auto-approve this stage. A named human editor must explicitly authorise every correction before publication.

**Status flow:**
- `PASSED` (human authorises) → advance to Stage 8 (Publication) → RUNNING
- `FAILED` (human withholds) → return to Update Package → REVISION_REQUIRED. Human must document reason.
- `BLOCKED` → human unavailable. Hold indefinitely. Escalate to Editor-in-Chief if pending beyond expected timeframe.

---

## Stage 8 — Publication

**Input:** Update package (from Stage 6) + signed authorisation (from Stage 7).

**Output:** Published correction:
- Corrected chapter replaces original at same canonical URL
- Version number updated
- Revision badge displayed on affected paragraphs for [30] days
- Change log appended to chapter's version history
- Affected claims in the Claim Registry updated with revision history
- Knowledge Graph updated if entity or relationship references changed

**Quality gate:** Correction is live at canonical URL. Revision badge is visible. Change log is accessible. Version number is correct.

**Status flow:**
- `PASSED` → advance to Stage 9 (Notification) → RUNNING
- `FAILED` (introduces new errors) → BLOCKED. Unpublish. Return to Stage 6 with error documentation.
- `FAILED` (cosmetic: badge missing, wrong version) → return to Update Package → PENDING. Fix and republish.

---

## Stage 9 — Notification

**Input:** Published correction (from Stage 8).

**Output:** Notifications sent:
- Submitter notified: "Your correction has been reviewed and published. [View change]"
- Cross-referenced chapters notified of the update
- Correction recorded in the Book of Record with: date, ticket ID, what changed, why, who submitted, new version number

**Quality gate:** Submitter is notified within [7] days of submission. Cross-referenced chapters notified within [1] day of publication. Book of Record entry is complete.

**Status flow:**
- `PASSED` → DONE. Corrected chapter with documented revision history.
- `FAILED` → return to Notification → PENDING (submitter not notified, cross-references missed, Book of Record incomplete)

**Final deliverable:** Corrected chapter with visible revision history, documented change log, submitter notification, and cross-reference update triggers.
