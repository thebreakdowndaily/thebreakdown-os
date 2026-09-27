# LOOP PRODUCTION PARITY REPORT

**Audit Date:** 2026-09-27T19:42:00+05:30  
**Target Host:** `https://thebreakdown.in`  
**Production Vercel Deployment ID:** `dpl_9r9C8arNMrf3WPizQUERQQZ1xXDU`  
**Deployment Commit:** `0cafa331bc2c7662f93471ec83b180bbd1a1c222`  
**Status:** Live & Serving  

---

## Route Parity Matrix

| Route | Local Expected State | Production Observed State | Difference | Parity Status |
|:---|:---|:---|:---|:---:|
| `/` | Clean publication homepage, lead story, topic badges, zero internal metrics | HTTP 200 (133,936 bytes). Rendered title "The Breakdown — Evidence-First Explainers". Zero forbidden jargon terms. | 0 byte discrepancy in functional semantics. | **MATCH** |
| `/stories` | Catalog listing 41 published stories with editorial cards | HTTP 200 (533,792 bytes). All 41 stories rendered with summaries, reading times, and topic badges. | Complete parity. | **MATCH** |
| `/topics` | Taxonomy directory with 15 canonical topics | HTTP 200 (113,139 bytes). All 15 topics resolvable with descriptions. | Complete parity. | **MATCH** |
| `/topic/economy` | Topic feed prerendered with economy stories | HTTP 200 (172,780 bytes). Prerendered feed matching local static output. | Complete parity. | **MATCH** |
| `/story/mgnrega-reform` | Canonical StoryShell, Sources & Documentation, 0 internal jargon | HTTP 200 (121,462 bytes). `Sources & Documentation` present, 0 occurrences of `Research Appendix`. | Complete parity. | **MATCH** |
| `/story/semiconductor-pli` | Canonical StoryShell, Sources & Documentation, 0 internal jargon | HTTP 200 (125,494 bytes). `Sources & Documentation` present, 0 occurrences of `Research Appendix`. | Complete parity. | **MATCH** |
| `/story/electoral-bonds` | Canonical StoryShell, Sources & Documentation, 3 charts | HTTP 200 (163,274 bytes). All 3 charts, SVG/data blocks, and source citations render. | Complete parity. | **MATCH** |
| `/story/kashmir-the-first-test` | Canonical StoryShell, 5,300 words, map SVG, Sources & Documentation | HTTP 200 (143,655 bytes). Map SVG renders, 6 verified claims, zero jargon leaks. | Complete parity. | **MATCH** |
| `/story/groundwater-depletion` | Canonical StoryShell, dynamic assessment data, Sources & Documentation | HTTP 200 (115,639 bytes). Full narrative prose, CGWB chart, clean citations. | Complete parity. | **MATCH** |
| `/story/digital-payments-boom` | Canonical StoryShell, UPI decadal chart, Sources & Documentation | HTTP 200 (107,018 bytes). UPI chart, NPCI/RBI citations, clean layout. | Complete parity. | **MATCH** |
| `/story/accountability-in-india` | Flagship investigative explainer, 9 acts, 6 custom React blocks | HTTP 200 (234,701 bytes). All 9 narrative acts, CAG extracts, ledger chart, and case cards live. | Complete parity. | **MATCH** |

---

## Detailed Edge Assertions

### 1. Jargon Leakage Scan
Every production HTML payload was probed for legacy research/database terms:
- `Knowledge Library`: **0 occurrences**
- `Research Appendix`: **0 occurrences**
- `Claims Assessed`: **0 occurrences**
- `Claims Registered`: **0 occurrences**
- `Confidence Score`: **0 occurrences**
- `Tracked Entities`: **0 occurrences**
- `Verification Pipeline`: **0 occurrences**
- `Institutional Supporters`: **0 occurrences**
- `Chapters Reviewed`: **0 occurrences**

### 2. Table of Contents & DOM Anchor Integrity
- 100% of TOC elements on production correspond to real DOM elements with identical IDs (`orientation`, `chapter-0` through `chapter-N`, `timeline`, `research-appendix`).

### 3. Fail-Closed Route Security
- Draft and non-public chapters (e.g. `/story/ng-ch-01`) fail-closed to HTTP 404 on production for unauthenticated users, preventing embargoed content leakage.
