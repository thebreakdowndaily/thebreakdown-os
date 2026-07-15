# Workflow: Create Story

Full editorial pipeline from research intake to publication package. Used for new chapters in any collection.

Status machine: `status-machine.md`

Runtime: each stage maps to a job in `.ai/jobs/`. The Conductor checks `runtime/sessions/<slug>/story.yaml` before each stage — completed stages are skipped, interrupted stages are resumed.

## Artifacts

| Stage | Job | Artifact |
|-------|-----|----------|
| 1. Research Director | `jobs/research.md` | `artifacts/research.md` |
| 2. Source Verification | `jobs/verification.md` | `artifacts/verification.md` |
| 3. Knowledge Modeler | `jobs/knowledge.md` | `artifacts/claims.yaml`, `artifacts/timeline.yaml` |
| 4. Story Architect | `jobs/architecture.md` | `artifacts/story-blueprint.md` |
| 5. Narrative Editor | `jobs/narrative.md` | `artifacts/draft.md` |
| 6. Editorial Review | `jobs/editorial.md` | `artifacts/review.md` |
| 7. Learning Designer | `jobs/learning.md` | `artifacts/learning.md` |
| 8. Publication Package | `jobs/publication.md` | `artifacts/publish.md` |

---

## Execution Order

```
Research Director
    ↓
Source Verification
    ↓
Knowledge Modeler
    ↓
Story Architect
    ↓
Narrative Editor
    ↓
Editorial Review
    ↓
Learning Designer
    ↓
Publication Package
```

---

## Stage 1 — Research Director

**Input:** Editorial brief from Editor-in-Chief specifying the chapter topic, central question, and collection context.

**Output:** Research brief containing:
- Annotated source list with archive locations and access status
- Proposed claims mapped to sources
- Evidence gaps documented with priority
- Key entities, thinkers, and timeline events identified
- Six Questions stated with provisional answers

**Quality gate:** Research brief exists and covers all Six Questions. Source list is sufficient for minimum evidence targets (50+ claims, 120+ evidence items, 100+ sources). Evidence gaps are documented, not hidden.

**Stop condition:** Research brief cannot identify sufficient primary sources to meet evidence targets. Escalate to Editor-in-Chief.

**Status flow:**
- `PASSED` → advance to Stage 2 (Source Verification) → RUNNING
- `FAILED` → return to Research Director → PENDING (with specific gaps)
- `FAILED` (3x) → BLOCKED → escalate to Editor-in-Chief

---

## Stage 2 — Source Verification

**Input:** Research brief (from Stage 1).

**Output:** Verified source list containing:
- Every source has a verification record (provenance, accuracy, context)
- Confidence tiers assigned per source
- Failed sources quarantined with reason
- Verification summary attached to each source registry entry

**Quality gate:** Every source in the research brief has a verification record. Quarantined sources are excluded from downstream work. No source without a verification record enters the knowledge model.

**Stop condition:** A critical mass of sources fails verification such that the evidence targets cannot be met. Escalate to Editor-in-Chief for scope decision.

**Status flow:**
- `PASSED` → advance to Stage 3 (Knowledge Modeler) → RUNNING
- `FAILED` → set Stage 1 (Research Director) → REVISION_REQUIRED, add revision brief (3 sources failed verification, need replacements or re-acquisition)
- `FAILED` (3x) → BLOCKED → escalate to Editor-in-Chief

---

## Stage 3 — Knowledge Modeler

**Input:** Verified source list (from Stage 2).

**Output:** Canonical knowledge objects:
- Claims registered with confidence scores, evidence links, counterarguments
- Evidence items with provenance metadata and source links
- Entity profiles created or updated
- Thinker profiles created or updated
- Timeline events registered and linked to claims
- Entity relationships documented
- Maps identified or queued for creation

**Quality gate:** Every proposed claim has a registry entry. Every evidence item has provenance metadata. Entity and thinker profiles exist. Timeline events are linked to claims. Counterarguments have their own evidence basis.

**Stop condition:** Claims cannot be registered because evidence is insufficient to support a confidence score. Return to Stage 1 with specific evidence gaps.

**Status flow:**
- `PASSED` → advance to Stage 4 (Story Architect) → RUNNING
- `FAILED` → return to Knowledge Modeler → PENDING (with missing fields)
- `REVISION_REQUIRED` (from downstream) → return to Knowledge Modeler → PENDING (specific modelling gaps attached)
- `FAILED` — evidence insufficient → set Stage 1 → REVISION_REQUIRED, add revision brief (specific claims lack evidence basis)

---

## Stage 4 — Story Architect

**Input:** Canonical knowledge objects (from Stage 3).

**Output:** Story blueprint containing:
- Central question and central conflict
- Story pattern selected (Crisis, Decision, Institution, Biography, Policy Evolution, Conflict, Technology, Economics)
- Narrative arc with phases and turning points
- Evidence moments mapped to narrative phases
- Decision points with alternatives and evidence
- Competing interpretations positioned
- Opening scene and inciting question
- Learning exit statement

**Quality gate:** Blueprint fits on one page. Story pattern is declared and appropriate. Evidence moments are mapped. Competing interpretations are identified. Blueprint was reviewed by at least one peer.

**Stop condition:** Blueprint cannot resolve the central question because the evidence supports contradictory conclusions. Escalate to Editor-in-Chief for interpretive guidance.

**Status flow:**
- `PASSED` → advance to Stage 5 (Narrative Editor) → RUNNING
- `FAILED` → return to Story Architect → PENDING (structural gaps, missing evidence moments, unaddressed interpretations)
- `FAILED` — contradictory evidence → BLOCKED → escalate to Editor-in-Chief

---

## Stage 5 — Narrative Editor

**Input:** Story blueprint (from Stage 4) and canonical knowledge objects (from Stage 3).

**Output:** Full chapter draft containing:
- Hero image selection with provenance
- Hook establishing stakes or tension
- Executive summary answering Six Questions
- Narrative sections following story pattern
- Evidence placed at point of reader need
- Counterarguments at point of disagreement
- Section transitions creating curiosity
- Competing interpretations attributed
- Reflection and continue learning

**Quality gate:** Narrative Diagnostic is complete. Story Blueprint was followed (deviations documented). Narrative Quality Review checklist is all pass. All Six Questions are answered. Three layers are distinguishable. Prohibited language is absent.

**Status flow:**
- `PASSED` → advance to Stage 6 (Editorial Review) → RUNNING
- `FAILED` → return to Narrative Editor → PENDING (specific Narrative Quality Review failures attached)
- `REVISION_REQUIRED` (from Editorial Review) → return to Narrative Editor → PENDING (specific revision conditions attached)
- `BLOCKED` — evidence placement reveals gaps → set Stage 3 → REVISION_REQUIRED, add revision brief (specific modelling requests)

---

## Stage 6 — Editorial Review

**Input:** Full chapter draft (from Stage 5).

**Output:** Editorial decision:
- Approved for publication
- Approved with conditions (specific revisions required)
- Returned to specific stage with reasons
- Rejected with documentation

**Quality gate:** Editor-in-Chief has issued a written decision. Conditions are documented. If returned, the specific stage and reasons are identified.

**Status flow:**
- `PASSED` (approved) → advance to Stage 7 (Learning Designer) → RUNNING
- `PASSED` (approved with conditions) → advance to Stage 7 → RUNNING, attach conditions as post-stage remediation tasks
- `FAILED` (returned) → set Stage 5 (Narrative Editor) → REVISION_REQUIRED, add revision brief
- `FAILED` (rejected) → terminal. Chapter does not advance. Record in Book of Record.

---

## Stage 7 — Learning Designer

**Input:** Approved chapter draft (from Stage 6).

**Output:** Learning section containing:
- Learning objectives (specific, verifiable)
- Key questions restated with answers
- Glossary of terms introduced
- Further reading (curated, not exhaustive)
- Reflection prompts testing understanding
- Continue learning recommendations

**Quality gate:** Learning objectives are specific and verifiable. Glossary terms are defined in reader-accessible language. Further reading is curated. Reflection prompts test understanding, not recall. Continue recommendations link to existing knowledge objects.

**Status flow:**
- `PASSED` → advance to Stage 8 (Publication Package) → RUNNING
- `FAILED` → return to Learning Designer → PENDING (vague objectives, missing glossary, broken continue-learning links)
- `REVISION_REQUIRED` → return to Learning Designer → PENDING
- `BLOCKED` — objectives cannot be derived from narrative → set Stage 5 (Narrative Editor) → REVISION_REQUIRED

---

## Stage 8 — Publication Package

**Input:** Approved chapter draft (from Stage 6) and learning section (from Stage 7).

**Output:** Publication-ready package containing:
- Final version number (major.minor.patch)
- Change log entry
- Trust Score update
- Visual assets verified and licensed
- Internal links resolved
- SEO metadata (title, description, canonical URL, Open Graph)
- Knowledge Graph node created or updated
- Cross-references from related chapters and entities
- Corrections policy link
- Methodology link

**Quality gate:** All internal links resolve. Visual assets have documented provenance and license. SEO metadata is complete. Knowledge Graph references are bidirectional.

**Stop condition:** External dependencies (archival permissions, image licenses) are pending. Package is held until dependencies clear.

**Status flow:**
- `PASSED` → DONE. Final deliverable ready for `/story publish` workflow.
- `FAILED` → return to Publication Package lead → PENDING (specific quality failures attached)
- `BLOCKED` → pending dependencies. Re-check on dependency resolution. No further workflow action until dependencies clear.
- `SKIPPED` (fast-track) → post-publication remediation tasks set. DONE.

---

## Publication Handoff

The Publication Package is the terminal deliverable of the create workflow. It is handed to the **Human Approval** gate in the `publish.md` workflow before any chapter goes live. The Conductor does not skip this gate — human authorisation is required for every publication, including fast-tracked chapters.

---

## Handoff Protocol

Every stage advance includes a written handoff summary from the Editorial Conductor containing:
- What was completed
- What is still open or deferred
- What the next stage needs to know
- Any deviations from standard process

The receiving role acknowledges receipt before beginning work.

---

## Exception Handling

**Fast-track:** Editor-in-Chief may authorise reduced gates for time-sensitive publications. Skipped gates become post-publication remediation tasks.

**Correction:** For verified errors in published chapters, use `living-update.md` workflow.

**Retraction:** Only the Editor-in-Chief may initiate a retraction. Full pipeline is followed in reverse: remove from publication, update Knowledge Graph, issue public notice.
