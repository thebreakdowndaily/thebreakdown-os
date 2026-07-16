# Trust Gap Matrix

This document provides a systematic audit of trust signals across all public surfaces on The Breakdown Knowledge Platform. It identifies critical gaps where trust is obscured or missing, quantifies the reader impact, and details reusable components for mitigation.

---

## Gap Matrix

| Surface | Existing Trust Signals | Missing Trust Signals | Reader Impact | Reusable Component | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Homepage** | Static TrustBar linking to Methodology, Editorial Constitution, and Trust Dashboard; static trust labels. | Dynamic counts for Chapters Published, Claims Registered, and Primary Sources (properties exist but are unused). | Medium; readers see generic trust slogans rather than evidence of platform scale and activity. | `TrustBar` ([TrustBar.tsx](file:///c:/newsjack-content/thebreakdown-os/components/home/trust/TrustBar.tsx)) | **P0** |
| **Chapter / Story Page** | Hero status badge, version string, inline source citations, confidence-level badges on claims, Key Questions review section, `FeedbackSection` (report correction, methodology). | Explicit "Fact vs Analysis" markers; "State of the Evidence" consensus summary; document facsimile provenance attestation. | High; readers must read the entire text to evaluate the consensus level instead of seeing it upfront. | `FeedbackSection` ([LearningFooter.tsx](file:///c:/newsjack-content/thebreakdown-os/components/rxs/LearningFooter.tsx)) | **P1** |
| **Entity Terminal** | Freshness date badge, Bloomberg-style health panel (Confidence, Evidence, Sources, Relationships, Media, Claims). | Corrections link; link to Methodology; explanation of how the Confidence Score is calculated. | High; readers see a raw confidence percentage but cannot verify the calculation model or submit correction tickets. | `FeedbackSection` | **P0** |
| **Topic Page** | Coverage Score (%), Average Confidence (%), Total Entities Tracked, Freshness date badge. | Corrections link; link to Methodology / Editorial Constitution; source distribution breakdown (primary vs secondary). | High; topic pages act as key discovery hubs but lack structural transparency routes. | `FeedbackSection` | **P0** |
| **Fix detail Page** | Evidence Score (x/100), Author attribution, link to original story, reading time. | Corrections link; link to Methodology; last-reviewed freshness badge; source citation mapping on individual recommendations. | Medium; citizens and governments see recommendations without clear primary source attestation or correction tools. | `FeedbackSection` | **P0** |
| **Dataset Page** | Basic metadata details, dataset description, download options. | Last-reviewed date badge; methodology / data capture limits; data freshness status. | Medium; readers cannot determine if data is stale or check standard capture limitations. | Dynamic freshness badge | **P1** |
| **Knowledge Graph** | Relationship labels, node colors indicating type, exploration links for canonical nodes. | Confidence levels on edges/relationships; Fact vs Analysis classification on node cards. | High; graph relationships look absolute, hiding debated or low-confidence connections from view. | None | **P2** |
| **Search Page** | Structured search outputs; distinct matching categories (Spotlights, Collections, Chapters). | Verification status badges on matching chapters; trust metrics visible on matches. | Low; search is a functional entry, but highlighting verified status increases confidence. | Status badge | **P2** |

---

## Top 10 Trust Gaps

1. **Unused Homepage Statistics**: The homepage `TrustBar` takes chapter, claim, and source counts in its interface but discards them, rendering only static, generic labels.
2. **Missing Entity Correction Route**: The Entity Terminal offers no pathway for readers to submit corrections or report disputed records, breaking the bidirectional corrections policy.
3. **No Methodology Links on Entities**: The Entity Terminal lacks links to `/methodology` or `/trust`, presenting computed numbers (Confidence, Evidence) as absolute facts.
4. **Missing Topic Corrections & Methodology**: Topic pages show average confidence scores but exclude links to the corrections pipeline or governing methodology.
5. **No Corrections Portal on Fix Pages**: Policy fix pages recommend complex actions but fail to offer a corrections link for readers to contest or submit alternative options.
6. **Undocumented Confidence Calculations**: The Bloomberg-style health panel shows a raw percentage (e.g., `Confidence: 90%`) but never explains the computing logic.
7. **No "Fact vs Analysis" Markers on Chapters**: Readers cannot instantly distinguish a fact-driven narrative chapter from an analytical synthesis.
8. **Missing Source Attestation on Recommended Actions**: Individual citizen and government recommendations in Fixes lack citation lines linking to supporting primary documents.
9. **Absence of Freshness Badge on Fixes**: Fixes display a `publishedAt` date but lack a `lastVerified` badge, obscuring if a policy action is still relevant.
10. **Document Facsimile Provenance Gaps**: Primary document images are rendered in chapter pages without explicit metadata details detailing provenance and licensing.

---

## P0 Fixes (Mitigation Roadmap)

### 1. Bind Dynamic Statistics to Homepage `TrustBar`
- **Action**: Pass the dynamic counts retrieved from the database service (`chaptersCount`, `claimsCount`, `sourcesCount`) into the `TrustBar` component and render them in the UI.
- **Impact**: Provides instant proof of platform scale, verifying the density of claims and primary sources.

### 2. Embed `FeedbackSection` across Entities, Topics, and Fixes
- **Action**: Render the existing `FeedbackSection` component (which encapsulates "Report a correction" and "View methodology" triggers) at the bottom of the left column on the Entity Terminal, below Topic pages, and at the bottom of Fix details.
- **Impact**: Enforces institutional corrections policy universally across the platform.

### 3. Add Freshness Badges on Fixes and Datasets
- **Action**: Pull `lastVerified` data points from the repository layer and render the existing green status badge pattern (`Verified {date}`) on all Fixes and Datasets.
- **Impact**: Informs the reader of continuous oversight.

---

## Existing Components to Reuse

- **`FeedbackSection`** ([LearningFooter.tsx](file:///c:/newsjack-content/thebreakdown-os/components/rxs/LearningFooter.tsx)): Fully styled amber card containing methodology and correction buttons.
- **`TrustBar`** ([TrustBar.tsx](file:///c:/newsjack-content/thebreakdown-os/components/home/trust/TrustBar.tsx)): Header/Footer bar styled for trust metadata.
- **Freshness Badge inline markup** (e.g. from `StoryHero` or `TerminalHeader`): Styled emerald pulse dot and border indicating verified dates.
