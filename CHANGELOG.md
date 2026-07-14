# Changelog

This changelog records every significant change to frozen artifacts of The Breakdown Knowledge Platform. No silent evolution. Every change includes date, author, and justification.

## Frozen Artifacts (v1.0)

| Artifact | Version | Status |
|----------|---------|--------|
| Editorial Constitution | v1.1 | Locked |
| AGENTS.md | v1.0 | Active |
| Knowledge Platform | v1.0 | Production Ready |
| Founding Publication | v1.0 | In progress (Chapter 1) |

---

## Entries

### 2026-07-12 — Platform Baseline

- **Author:** Editorial Engineering
- **Change:** Knowledge Platform reaches architecture-complete status (~95%). 248 pages build. Chapter 1 drafted to Internal Gold Candidate standard (~15,000 words, 22 sources).
- **Justification:** Baseline for the editorial phase. Engineering frozen pending Gold Standard Review.

### 2026-07-13 — Editorial Constitution Ratified

- **Author:** Editor-in-Chief
- **Change:** `docs/editorial/editorial-constitution.md` ratified at v1.0. 16 Articles + Preamble. Established as the supreme governing document (Level 1 in governance hierarchy).
- **Justification:** The platform required an authoritative governance framework before publishing content. Previously, engineering documentation (AGENTS.md) was the de facto governing document, which conflated software practice with editorial standards.

### 2026-07-13 — Governance Hierarchy Established

- **Author:** Editor-in-Chief
- **Change:** AGENTS.md updated with four-level governance hierarchy. Editorial Constitution (Level 1) now supersedes AGENTS.md (Level 2) on editorial matters. Gold Standard Review formalised as a mandatory workflow stage.
- **Justification:** Clarifies precedence. Prevents engineering convenience from overriding editorial standards.

### 2026-07-13 — Editorial Review Checklist Created

- **Author:** Editorial Bureau
- **Change:** `docs/editorial/editorial-review-checklist.md` created at v1.0. Concrete yes/no criteria and scoring for all seven Gold Standard Review phases (70 criteria total).
- **Justification:** Companion to the Constitution. Ensures consistent application of review standards across editors.

### 2026-07-14 — Evidence Standard Added (Constitution v1.1)

- **Author:** Editor-in-Chief
- **Change:** Editorial Constitution upgraded to v1.1. Added: Evidence Spine, Four-Layer Structure, State of the Evidence, Open Questions, Evidence Challenges, Review Board Roles, pre-publication versioning, and Trust Score.
- **Justification:** The Constitution v1.0 covered governance but not the specific evidence discipline required per paragraph. Phase 13.5 ("The Evidence Standard") mandated these additions to ensure every paragraph answers "How do we know this?"

### 2026-07-14 — Institutional Memory Artifacts Created

- **Author:** Knowledge Operations
- **Change:** Three artifacts created:
  - `docs/editorial/book-of-record.md` — 15 editorial decisions logged
  - `docs/editorial/known-disagreements.md` — 8 scholarly disagreements surfaced
  - `docs/editorial/confidence-register.md` — 18 claims tracked with confidence scores
- **Justification:** Institutional memory must outlive individual editors. These artifacts record decisions, disagreements, and confidence — not rules. They complement (rather than amend) the locked Constitution.

### 2026-07-14 — Editorial Calendar Created

- **Author:** Knowledge Operations
- **Change:** `docs/editorial/editorial-calendar.md` created at v1.0. Verification schedule rotating across collections annually; flagship chapters reviewed every six months.
- **Justification:** Maintenance must be scheduled, not reactive. A calendar ensures no knowledge object falls below freshness standards.

### 2026-07-14 — Founding Publication Phase (Phase 14)

- **Author:** Editor-in-Chief
- **Change:** Phase 13 (Institutional Credibility) renamed to Phase 14 (Founding Publication). Defined four bureaus (Research, Editorial, Verification, Knowledge Operations), Version 1.0 — "The Breakdown Knowledge Library: Founding Edition", /methodology and /trust pages, external peer review process, and corrections policy. Directive: no new platform features until Chapter 1 is published and externally reviewed.
- **Justification:** The platform had reached feature completeness. The remaining risk was delaying publication in pursuit of perfection, not missing features.

### 2026-07-14 — Public-Facing Pages Published

- **Author:** Editorial Bureau
- **Change:** `app/methodology/page.tsx` and `app/trust/page.tsx` created. Methodology explains research, verification, confidence, disagreements, corrections, AI usage, and versioning to readers. Trust dashboard displays live transparency metrics.
- **Justification:** Readers must never have to guess the editorial process. Transparency is a feature, not an afterthought.

### 2026-07-14 — Operational Cycles Replaces Phase Roadmap

- **Author:** Editor-in-Chief
- **Change:** Retired the sequential phase roadmap (Phase 1–14). Introduced recurring Operational Cycles 1–5. Added Institutional Trust Index as the primary Mission Control metric (with 8-component weighting). Adopted motto: "Evidence before conclusions. Context before certainty." Froze Founding Publication artifacts at v1.0.
- **Justification:** The institution had outgrown a linear roadmap. Operational Cycles reflect the standing rhythm of an editorial institution. Success is measured by Trust, not completion.

---

## Upcoming

- Chapter 1 external peer review (Operational Cycle 1)
- Gold Standard Review completion
- Publication of Founding Edition v1.0
- Operational Cycle 2 — Editorial Calibration test

---

### 2026-07-14 — CTO → Editor-in-Chief Handover

- **Author:** Founding Editor
- **Change:** CTO roadmap formally concluded. AGENTS.md reframed as the operating doctrine of an editorial institution. Handover note added: day-to-day ownership now rests with the Editor-in-Chief, supported by the four bureaus. Added Founding Publication definition (Version 1.0 = Founding Edition only), three pre-launch milestones (internal Gold Standard, external peer review, founding publication), post-publication observation period, and annual Founders' Review practice.
- **Justification:** The limiting factor is no longer technology. Engineering is mature enough (~95%) that additional code produces diminishing returns. The institution's future depends on whether it can consistently produce work that lives up to the Editorial Constitution. The next several years belong to subject-matter expertise, not engineering.
- **Status:** Founding Publication v1.0 remains in progress (Chapter 1 awaiting Gold Standard Review and external peer review).

---

### 2026-07-14 — Founding Architecture Program Closed

- **Author:** Founding Editor
- **Change:** Formally closed the Founding Architecture Program. The v1.0 architecture is accepted as sufficiently complete for publication. Future engineering is reactive to demonstrated editorial needs, not speculative feature development. Replaced the software-phase roadmap with the **Editorial Program** (Alpha — Founding Volume, Beta — Editorial Excellence, Gamma — Public Trust). Established the **Advisory Board** (governs knowledge, not company) with eight complementary domains. Confirmed public exposure of standards (Constitution, Methodology, Corrections Policy, Transparency Statement, Sources Policy, Trust Dashboard). Explicitly rejected vanity metrics (page views, shares, clicks) in favour of institutional outcomes (citations, university use, journalist references, corrections accepted). Defined the Founding Edition publication sequence (Methodology → Constitution → Trust Dashboard → Chapter 1 → announcement).
- **Justification:** Stages 1 (platform) and 2 (institution) are complete. Stage 3 (credibility) cannot be accelerated by engineering. Closing the program protects the institution from endless platform expansion and reorients all effort toward editorial quality. The mode of work has fundamentally changed — from building features to earning trust.
- **Status:** Editorial Program Alpha active. Founding Publication v1.0 in progress.

---

### 2026-07-15 — Chapter 1 Internal Gold Standard Review (Milestone 1, Part 1)

- **Author:** Verification Bureau
- **Change:** Executed the internally executable Gold Standard Review phases for Chapter 1 (`kl-ch-1`). Fixed a citation-integrity defect: 4 source IDs (`s26`, `s27`, `s29`, `s31`) were referenced by 8 paragraphs but absent from the chapter's local `sources` array, breaking positional citation resolution. Extended the local `sources` array to s1–s31 to match the canonical Source Registry. Added the Constitution v1.1 required blocks "State of the Evidence" and "Evidence Challenges", and renamed "Unresolved Questions" → "Open Questions" for verbatim constitutional alignment. Recorded apparatus-section citation exemption in Book of Record #0016. Created `docs/editorial/chapter-1-gold-standard-review.md` tracking phase status.
- **Justification:** The Evidence Audit (Phase 3) is a mandatory gate. Citation integrity is a correctness defect, not a stylistic one — broken citations would undermine the entire evidence discipline. The two new blocks are required by the locked Constitution v1.1. Human-dependent phases (Expert Review, Reader Review, Visual Audit) and external peer review remain outstanding and block publication.
- **Status:** Chapter 1 CONDITIONAL PASS on internal phases. Awaiting Phases 1, 2, 5 and external peer review (Milestone 2).

---

### 2026-07-15 — Visual Assets Drafted (Deferred Render)

- **Author:** Editorial Bureau (with Verification Bureau)
- **Change:** Drafted 33 planned visuals for Chapter 1 as structured `image`/`map`/`chart` blocks in a deferred-render registry at the end of `chapter1Blocks`. Each carries provenance (creator/source/reference/date), license, credit, caption, status (`planned`), and linked claim IDs. Explanatory diagrams flagged `aiGenerated: true`. The paragraph-based Visual Asset Acquisition List is retained as the human-readable plan.
- **Justification:** The block renderer registry supports only 13 block types; there are no map/chart/image/table renderers (`KnowledgeRenderer.tsx:15` returns null for unregistered types). Building renderers is new platform feature work, forbidden by the Founding Publication freeze until Chapter 1 is published and externally reviewed. Drafting the data now makes the chapter render-ready and lets the Knowledge Density Audit count planned assets. Real archival assets must still be acquired and provenance-cleared in Phase 5 (Visual Audit).
- **Status:** Visual data drafted and deferred. Phase 5 (Visual Audit) outstanding; renderers outstanding (post-publication). Recorded in Book of Record #0017.
