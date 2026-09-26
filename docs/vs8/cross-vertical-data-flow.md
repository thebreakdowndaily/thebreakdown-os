# The Breakdown OS — Cross-Vertical Data Flow Analysis (VS8)

**Phase:** VS8 — Certified Platform Integration, Capability Discovery & Architecture Reconciliation  
**Date:** 2026-09-26  
**Status:** Certified Cross-Vertical Flow Analysis  
**Governing Documents:** AGENTS.md, Editorial Constitution v1.1

---

## 1. End-to-End Conceptual vs Real Code Data Flow

The platform's end-to-end knowledge lifecycle traces from external primary sources through intelligence, research, editorial, publication, reader engagement, correction, and operational observation.

```
[SOURCE] ──(DIRECT)──> [OBSERVATION] ──(DIRECT)──> [SIGNAL] ──(SERVICE)──> [INTELLIGENCE]
                                                                                   │
                                                                           (SERVICE-BASED)
                                                                                   ▼
[EDITORIAL] <──(SERVICE-BASED)── [RESEARCH] <──(DATABASE-BASED)── [TRIAGE] <───────┘
     │
 (DIRECT)
     ▼
[VERIFICATION] ──(DIRECT)──> [PUBLICATION] ──(EDGE/HTTP)──> [READER]
                                                                │
                                                             (HTTP)
                                                                ▼
[EDITORIAL REVIEW] <──(DATABASE/SERVICE)── [CORRECTION] <───────┘
        │
    (MANUAL)
        ▼
  [VERIFICATION] ──(SERVICE-BASED)──> [ERRATA / REVISION]
                                              │
                                           (DIRECT)
                                              ▼
                                        [PUBLICATION]
                                              │
                                           (ABSENT)
                                              ▼
                                 [OPERATIONS OBSERVATION]
```

---

## 2. Detailed Link-by-Link Classification & Provenance Audit

| Data Flow Transition | Concrete Code Path | Classification | Provenance Preserved? | Analysis & Findings |
| :--- | :--- | :--- | :--- | :--- |
| **1. Source → Observation** | `NewsroomPIBAdapter.ingestPIBFeed()` | **DIRECT** | **YES** | Preserves raw payload, external release ID, and publication timestamp. |
| **2. Observation → Signal** | `NewsroomIntelligenceCore.ingestObservation()` | **DIRECT** | **YES** | Deterministic SHA-256 hash generated to deduplicate raw observations. |
| **3. Signal → Intelligence** | `NewsroomIntelligenceCore.clusterSignals()` | **SERVICE-BASED** | **YES** | Clusters signals by entity and novelty score; stores in `newsroom.clusters`. |
| **4. Intelligence → Triage** | `/intel` triage actions | **SERVICE-BASED** | **YES** | Staff reviews clustered signals and assigns triage priority. |
| **5. Triage → Research** | `NewsroomResearchBridge.promoteSignalToInvestigationCase()` | **DATABASE-BASED**| **YES** | Inserts into `public.workspace_cases` and `workspace_evidence`, linking original signal ID. |
| **6. Research → Editorial** | `services/intelligence/research/` → chapter factory | **SERVICE-BASED** | **YES** | Research dossiers supply primary sources and evidence items to chapter drafts. |
| **7. Editorial → Verification** | `lib/knowledge/source-validator.ts` | **DIRECT** | **YES** | Validates source URLs, primary publisher domains, and claim confidence levels. |
| **8. Verification → Publication**| `lib/editorial/publication-gate.ts` (Gate 11) | **DIRECT** | **YES** | Evaluates 7-phase Gold Standard Review pass and density minimums before publication. |
| **9. Publication → Reader** | Next.js App Router (`/story/[slug]`, `/series/*`) | **EDGE / HTTP** | **YES** | Serves immutable prerendered SSG/SSR pages on edge CDN with JSON-LD metadata. |
| **10. Reader → Correction** | `CorrectionSubmissionDrawer` → `POST /api/corrections/submit` | **HTTP (API)** | **YES** | Anonymous reader submits excerpt + suggestion; records into `public.reader_corrections`. |
| **11. Correction → Review** | `services/editorial/corrections-service.ts` | **DATABASE / SERVICE**| **YES** | Submissions enter status `received`; staff triages to `in_review` or `rejected`. |
| **12. Review → Verification** | Manual staff inspection against primary sources | **MANUAL** | **PARTIAL** | Verification bureau verifies claim validity; lacks automated queue dispatch. |
| **13. Verification → Errata** | `triageReaderCorrection()` on status `resolved` | **SERVICE-BASED** | **YES** | Commits immutable errata notice into `public.corrections` with explanation and diff. |
| **14. Errata → Publication** | Story banner & `/transparency/corrections` | **PARTIAL** | **YES** | Errata rendered at `/transparency/corrections`; in-context banner on `/story/[slug]` is not yet wired. |
| **15. Errata → Operations** | `NewsroomPipelineHealthAggregator` | **ABSENT** | **NO** | VS6 does not observe correction intake volume or backlog; reports static values. |

---

## 3. Data Flow Gap Summary

Two concrete gaps exist in the active cross-vertical flow:
1. **Flow Gap 1 (Errata → In-Context Story):** `CorrectionNoticeBanner` is built, but `/story/[slug]` does not query `listPublishedCorrections(slug)` to render it directly on the affected story page.
2. **Flow Gap 2 (Errata → Operations Observation):** `NewsroomPipelineHealthAggregator` does not monitor the reader correction queue depth, triage backlog, or published errata volume.
