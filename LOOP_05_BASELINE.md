# THE BREAKDOWN — LOOPBACK ENGINEERING
## LOOP 05 BASELINE: ACTUAL READER JOURNEY AUDIT

**Domain:** `https://thebreakdown.in`  
**Current Production Deployment:** `dpl_5w5JG33jDqHLtjPU1q9pGCfN668J`  
**Baseline Git Commit SHA:** `f5d408d6c9f4872d2eeb8ef1fd177655dec37b95`  
**Git Branch:** `main`  
**Working Tree Status:** Clean  
**Date:** 2026-09-27  

---

### 1. System Scale Baseline

| Dimension | Count | Note |
| :--- | :--- | :--- |
| **Total Stories** | 56 | 41 public stories + 15 draft investigative chapters |
| **Public Stories** | 41 | Publicly discoverable and readable via `/story/[slug]` |
| **Topics** | 15 | Curated topic domains in `/topics` and `/topic/[slug]` |
| **Entities** | 41 | Verified institutional and actor profiles in `/entity/[slug]` |
| **Prerendered Routes** | 1,132 | 100% static generation via Next.js App Router |
| **Visual Assets** | 121 | 100% verified on disk, compliant with <500KB budget |
| **Active Trackers** | 4 | MGNREGA, PMFBY, UPI, Semiconductor |

---

### 2. Git Log Baseline (Recent 5 Commits)

```
f5d408d docs(loop-04): document visual parity report, multi-viewport screenshot index, release report, and probe scripts
9c3bceb feat(visuals): remediate corrupt entity avatars, normalize OG rasters, enforce image performance budgets, and add visual validation suite
a4585d5 docs(loop-03): close ISSUE-003 with verified production deployment dpl_ALjpFqw7yHWR6PDsKDgj32yctW9u
725e399 feat(visuals): deploy approved bespoke hero for accountability investigation and resolve ISSUE-003
50b0b54 docs(loop-02): close ISSUE-004 and ISSUE-005 with verified production deployment dpl_2i8DJHkHXRPqWsWjgpJoCTdmrwH2
```

---

### 3. Loop 05 Objectives & Scope

1. Define and audit the 6 Golden Reader Journeys (A through F).
2. Measure reader orientation, cognitive load, and progression across sections.
3. Test Table of Contents (TOC) integrity: anchor existence, sticky behavior, deep links, mobile drawer.
4. Verify evidence discovery: claim $\to$ evidence $\to$ primary source flow.
5. Evaluate related stories recommendation relevance (audit against keyword coincidences).
6. Perform multi-viewport forensics (375px mobile through 1440px desktop) for complete reading journeys.
7. Audit keyboard and screen-reader accessibility across an entire reading session.
8. Enforce zero regression in editorial truth and performance.
