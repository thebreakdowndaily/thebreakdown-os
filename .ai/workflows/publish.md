# Workflow: Publish

Publication pipeline. Used when a chapter has passed editorial review and is ready for public release. This workflow does not revisit content — it prepares, verifies, and releases.

Status machine: `status-machine.md`

Runtime: each stage maps to a check or action the Conductor performs. The Conductor checks `runtime/sessions/<slug>/story.yaml` before each stage — completed stages are skipped, interrupted stages are resumed.

## Artifacts

| Stage | Artifact |
|-------|----------|
| 1. Publication Package Assembly | `artifacts/publish.md` (first draft, updated through subsequent stages) |
| 2. Visual Asset Verification | Asset verification appendix in publish.md |
| 3. Metadata & SEO | Metadata appendix in publish.md |
| 4. Knowledge Graph Update | Graph update instructions in publish.md |
| 5. Cross-Reference Audit | Audit record appended to publish.md |
| 6. Preflight Check | Preflight sign-off appended to publish.md |
| 7. Human Approval | Signed authorisation record (appended to story.yaml history) |
| 8. Release | Release record appended to publish.md |
| 9. Post-Publication Verification | Verification report appended to publish.md |

---

## Execution Order

```
Publication Package Assembly
    ↓
Visual Asset Verification
    ↓
Metadata & SEO
    ↓
Knowledge Graph Update
    ↓
Cross-Reference Audit
    ↓
Preflight Check
    ↓
Human Approval (mandatory, no automation)
    ↓
Release
    ↓
Post-Publication Verification
```

---

## Stage 1 — Publication Package Assembly

**Input:** Approved chapter draft + learning section.

**Output:** Publication package containing:
- Final version number (major.minor.patch)
- Change log entry (for first publication: "Initial publication")
- Trust Score calculation data (evidence coverage, primary source ratio, review completion)
- Chapter file in publication format
- All supplementary materials (visuals, maps, documents)

**Quality gate:** Version number follows semantic versioning. Change log entry exists. Trust Score inputs are populated.

**Status flow:**
- `PASSED` → advance to Stage 2 (Visual Asset Verification) → RUNNING
- `FAILED` → return to Assembly → PENDING (missing fields or version conflict)

---

## Stage 2 — Visual Asset Verification

**Input:** All visual assets referenced in the chapter (hero image, maps, document facsimiles, thinker portraits, charts).

**Output:** Visual asset registry entries with:
- Provenance documented (archive, shelfmark, license, credit)
- License status confirmed (public domain, CC, fair use, licensed)
- Accessibility metadata (alt text, captions)
- Pedagogical purpose stated (what does this image teach?)
- Resolution verified for publication

**Quality gate:** Every visual asset has complete provenance. No asset without a confirmed license status. AI-generated images are labelled as such. Maps follow the Land and Maritime Boundaries Policy (disputed boundaries use dashed lines).

**Status flow:**
- `PASSED` → advance to Stage 3 (Metadata & SEO) → RUNNING
- `FAILED` → return to Visual Asset Verification → PENDING (assets returned with specific gaps: missing provenance, unclear license, absent pedagogical purpose)

---

## Stage 3 — Metadata & SEO

**Input:** Publication package (from Stage 1).

**Output:** Complete metadata block:
- Title (max 60 characters for SEO)
- Description (max 155 characters for SEO)
- Canonical URL
- Open Graph (title, description, image, type)
- Twitter Card (summary_large_image)
- Structured data (NewsArticle or Article schema)
- Publication date
- Last verified date
- Version label
- Reading time by mode (explorer, scholar, researcher)
- Difficulty rating
- Primary topic and subtopics

**Quality gate:** Every metadata field is populated. Canonical URL resolves. Open Graph image exists and meets dimension requirements. Structured data validates against schema.org.

**Status flow:**
- `PASSED` → advance to Stage 4 (Knowledge Graph Update) → RUNNING
- `FAILED` → return to Metadata → PENDING (missing or invalid fields)

---

## Stage 4 — Knowledge Graph Update

**Input:** Chapter metadata + entity/claim/concept references.

**Output:** Knowledge Graph node containing:
- Chapter node created with metadata
- Edges to: collection, volume, entities, thinkers, concepts, claims, related chapters
- Bidirectional links verified (entity page now references this chapter)
- Related chapters updated with "see also" references

**Quality gate:** All edges are bidirectional. No orphan nodes. Entity pages link back to the chapter. Related chapters include cross-references.

**Status flow:**
- `PASSED` → advance to Stage 5 (Cross-Reference Audit) → RUNNING
- `FAILED` → return to Graph Update → PENDING (missing edges or broken bidirectional links)

---

## Stage 5 — Cross-Reference Audit

**Input:** Knowledge Graph (from Stage 4) + all internal chapter links.

**Output:** Cross-reference verification:
- Every internal link resolves to an existing page or knowledge object
- Every entity mention links to the correct entity page
- Every thinker mention links to the correct thinker profile
- Every claim reference links to the correct registry entry
- Every source citation links to the correct source entry
- Every "continue learning" recommendation links to an existing object

**Quality gate:** Zero broken internal links. Zero incorrect entity/thinker/source references.

**Status flow:**
- `PASSED` → advance to Stage 6 (Preflight Check) → RUNNING
- `FAILED` → return to Cross-Reference Audit → PENDING (broken links with their target paths)

---

## Stage 6 — Preflight Check

**Input:** Complete publication package (all stages 1–5).

**Output:** Preflight sign-off:
- All quality gates passed
- No unresolved issues
- Publication date confirmed
- Announcement prepared (if applicable)

**Quality gate:** Every preceding stage must report pass. No deferred issues.

**Status flow:**
- `PASSED` → advance to Stage 7 (Human Approval) → RUNNING
- `FAILED` → return to the specific stage that failed → REVISION_REQUIRED. Preflight cannot be bypassed.

---

## Stage 7 — Human Approval

**Input:** Preflight sign-off (from Stage 6) + complete publication package.

**Output:** Signed release authorisation from a human editor (not the Conductor, not an agent).

**Rule:** The Conductor **must not** auto-approve this stage. No automation. No inference. A named human editor must explicitly authorise the release.

**Quality gate:** Authorisation is explicit, documented, and traceable to a named individual.

**Status flow:**
- `PASSED` (human authorises) → advance to Stage 8 (Release) → RUNNING
- `FAILED` (human withholds) → return to Preflight → REVISION_REQUIRED. Package is held. Human must document reason.
- `BLOCKED` → human unavailable or authorisation pending. Hold indefinitely. No automatic timeout.

**Stop condition:** No human approval received within expected timeframe → escalate to Editor-in-Chief. Conductor does not auto-advance after timeout.

---

## Stage 8 — Release

**Input:** Signed release authorisation (from Stage 7) + publication package (from Stage 6).

**Output:** Published chapter:
- Chapter is live at its canonical URL
- Listed in collection/volume index
- Discoverable through search
- RSS feed updated (if applicable)
- Sitemap updated or flagged for next regeneration
- Announcement sent (if applicable)

**Quality gate:** Chapter loads at canonical URL. Collection and volume indexes include the chapter. Search returns the chapter for relevant queries.

**Status flow:**
- `PASSED` → advance to Stage 9 (Post-Publication Verification) → RUNNING
- `FAILED` (404, broken layout, missing assets) → BLOCKED. Hold publication. Escalate.

---

## Stage 9 — Post-Publication Verification

**Input:** Published chapter (from Stage 8).

**Output:** Verification report:
- All pages render correctly in explorer, scholar, and researcher modes
- All evidence panels render
- All images load with correct captions and credits
- Reading mode toggle functions
- Table of contents navigates correctly
- Mobile rendering is functional
- Load time within acceptable range

**Quality gate:** All verification items pass. Any failure triggers immediate fix or, if critical, publication hold.

**Status flow:**
- `PASSED` → DONE. Chapter is published and verified.
- `FAILED` (critical: missing content, broken navigation, unreadable text) → BLOCKED. Unpublish. Return to Release stage with specific failures.
- `FAILED` (non-critical: styling issue, slow load) → PASSED with deferred remediation. Log remediation tasks. DONE.

**Final deliverable:** Published, verified chapter with complete metadata, discoverable through Knowledge Graph and search, linked from related collections and entities, with no broken internal references.
