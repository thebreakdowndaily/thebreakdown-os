# Workflow: Update Story

Substantive update to a published chapter. Used when new evidence, corrected claims, or evolving scholarship requires changes beyond a simple correction. This workflow does not rewrite the chapter — it surgically updates affected sections while preserving everything that remains accurate.

Status machine: `status-machine.md`

Runtime: each stage maps to a job in `.ai/jobs/`. The Conductor checks `runtime/sessions/<slug>/story.yaml` before each stage — completed stages are skipped, interrupted stages are resumed.

## Artifacts

| Stage | Job | Artifact |
|-------|-----|----------|
| 1. Change Assessment | `jobs/research.md` | `artifacts/change-scope.md` |
| 2. Canonical Layer Update | `jobs/knowledge.md` | `artifacts/claims.yaml`, `artifacts/timeline.yaml` (updated) |
| 3. Narrative Revision | `jobs/narrative.md` | `artifacts/draft.md` (updated) |
| 4. Review | `jobs/editorial.md` | `artifacts/review.md` (update decision) |
| 5. Version Bump | — (Conductor) | Version appendix in story.yaml |
| 6. Human Approval | — (Human) | Signed authorisation in story.yaml history |
| 7. Publication | — (Conductor) | Publish record appended to story.yaml |

---

## Execution Order

```
Change Assessment
    ↓
Canonical Layer Update
    ↓
Narrative Revision
    ↓
Review
    ↓
Version Bump
    ↓
Human Approval (mandatory, no automation)
    ↓
Publication
```

---

## Stage 1 — Change Assessment

**Input:** Change request containing:
- What changed (new evidence, corrected claim, updated scholarship)
- Source of the change (new archival finding, retracted source, scholarly consensus shift)
- Impact assessment (which claims, sections, and entities are affected)

**Output:** Change scope document containing:
- List of affected claims with registry IDs
- List of affected narrative sections
- List of affected evidence items
- List of affected entities or thinker profiles
- Severity rating (minor: corrections to existing claims; moderate: new evidence changes interpretation; major: central claim is invalidated)
- Recommendation (patch update, minor version, or major revision)

**Quality gate:** Every affected claim, section, and evidence item is identified. Severity rating is supported by evidence. Recommendation is justified.

**Stop condition:** Change request lacks source verification for the new information. Cannot assess impact without verified inputs.

**Status flow:**
- `PASSED` → advance to Stage 2 (Canonical Layer Update) → RUNNING
- `FAILED` → return to Change Assessment → PENDING (missing claim/section/evidence identification, unjustified severity)
- `BLOCKED` → change request has unverified sources. Hold until Source Verification completes.

---

## Stage 2 — Canonical Layer Update

**Input:** Change scope document (from Stage 1).

**Output:** Updated canonical knowledge objects:
- Corrected or added claims with updated confidence scores and evidence links
- Updated evidence items with new provenance
- Updated entity or thinker profiles if affected
- Deprecated claims marked with replacement reference

**Quality gate:** Every changed claim has updated confidence score and evidence links. Deprecated claims are marked but not deleted (preserve version history). New claims follow the same registration standards as the original.

**Stop condition:** New evidence fails Source Verification. Cannot update canonical layer with unverified inputs.

**Status flow:**
- `PASSED` → advance to Stage 3 (Narrative Revision) → RUNNING
- `FAILED` → return to Canonical Layer Update → PENDING (claims missing updates, evidence links broken)
- `BLOCKED` → evidence not verified. Hold. Escalate.

---

## Stage 3 — Narrative Revision

**Input:** Updated canonical knowledge objects (from Stage 2) + original chapter draft.

**Output:** Revised chapter containing:
- Affected sections rewritten to reflect updated evidence
- Unaffected sections preserved exactly
- Transition updates where affected sections connect to unaffected sections
- Updated evidence placement where claims changed
- Updated counterargument framing where scholarly consensus shifted
- Revision notes embedded in affected paragraphs

**Quality gate:** Only sections identified in the change scope document are modified. Unaffected sections are byte-identical to the original. Transitions into and out of affected sections are smooth.

**Stop condition:** Change scope document underestimated the impact — changes cascade beyond identified sections. Escalate to Editor-in-Chief for scope re-assessment.

**Status flow:**
- `PASSED` → advance to Stage 4 (Review) → RUNNING
- `FAILED` → return to Narrative Revision → PENDING (changes exceed scope, transitions reveal surgical edit)
- `BLOCKED` → cascading changes beyond identified scope. Hold. Escalate to Editor-in-Chief.

---

## Stage 4 — Review

**Input:** Revised chapter (from Stage 3) + original chapter.

**Output:** Review decision:
- Approved
- Approved with conditions
- Returned for revision

**Quality gate:** Review focuses on the changed sections and their transitions. Original sections are not re-reviewed unless the edit introduced errors.

**Status flow:**
- `PASSED` (approved) → advance to Stage 5 (Version Bump) → RUNNING
- `PASSED` (approved with conditions) → advance to Stage 5 with conditions attached as post-stage remediation
- `FAILED` → return to Narrative Revision → PENDING (specific revision requirements)
- `BLOCKED` → review discovers errors in original sections unrelated to the update. Log as separate maintenance issue. Do not block this update.

---

## Stage 5 — Version Bump

**Input:** Approved revision (from Stage 4) + original version number.

**Output:** Updated version number following semantic versioning:
- **Patch:** Correction to a claim that does not change interpretation
- **Minor:** New evidence that modifies but does not invalidate conclusions
- **Major:** Central claim invalidated, interpretation fundamentally revised

**Quality gate:** Version number is consistent with severity rating from Stage 1. Change log entry is written.

**Stop condition:** Severity rating from Stage 1 and actual changes from Stage 3 disagree on version number.

**Status flow:**
- `PASSED` → advance to Stage 6 (Publication) → RUNNING
- `FAILED` → return to Version Bump → PENDING (version number conflicts with severity)
- `BLOCKED` → severity and actual changes disagree. Escalate to Editor-in-Chief.

---

## Stage 6 — Human Approval

**Input:** Updated chapter + version number + change log entry (from Stages 3–5) + review approval (from Stage 4).

**Output:** Signed release authorisation from a human editor (not an agent, not the Conductor).

**Rule:** The Conductor must not auto-approve this stage. A named human editor must explicitly authorise every update before publication.

**Status flow:**
- `PASSED` (human authorises) → advance to Stage 7 (Publication) → RUNNING
- `FAILED` (human withholds) → return to Version Bump → REVISION_REQUIRED. Human must document reason.
- `BLOCKED` → human unavailable. Hold indefinitely. Escalate to Editor-in-Chief if pending beyond expected timeframe.

---

## Stage 7 — Publication

**Input:** Updated chapter + version number + change log entry (from Stages 3–5) + signed authorisation (from Stage 6).

**Output:** Published update:
- Revised chapter replaces original at same canonical URL
- Version number displayed on chapter
- Change log entry published
- Revision banner displayed for [30] days
- Knowledge Graph edges updated
- Related chapters notified

**Quality gate:** New version loads at canonical URL. Change log is accessible. Revision banner displays. Knowledge Graph is consistent.

**Status flow:**
- `PASSED` → DONE. Updated chapter with complete version history.
- `FAILED` → return to Publication → PENDING (load failure, missing change log, broken Knowledge Graph)
- `BLOCKED` → related chapter notifications pending. Hold until cross-references are updated.

**Final deliverable:** Updated chapter with complete version history, visible change log, and notification to related knowledge objects.
