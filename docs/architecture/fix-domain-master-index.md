# Master Index — Canonical Fix Domain Architectural Specification

**Baseline Release:** **Architecture Release AR-13A.1 (Production Readiness & Hardening)**  
**Version:** 27.2.0  
**Status:** Architecture Release AR-13A.1 (Phases 27A & 27B Complete / Gates 27A & 27B Cleared)  
**Date:** July 2026  
**Governing Documents:** *Editorial Constitution v1.1*, *AGENTS.md*, *docs/research/the-fix-hub-research.md*  

---

## 1. Executive Summary

This Master Index serves as the single entry point and architectural contract linking all baseline documents produced under **Architecture Release AR-13A.1** and tracking execution progress across Phase 13B through Phase 27B milestones.

---

## 2. Baseline Architecture Directory (Release AR-13A.1 Production Hardening Subsystems)

| Identifier / Domain | Architectural Specification Document | Stability Level | Key Engineering Scope |
| :--- | :--- | :--- | :--- |
| **Gate 27B Clearance** | 📄 [Gate 27B Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-27b-conformance-report.md) | **CLEARED** | Gate 27B clearance, Accessibility Subsystem live at `/accessibility`, 441/441 tests passing. |
| **Gate 27A Clearance** | 📄 [Gate 27A Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-27a-conformance-report.md) | **CLEARED** | Gate 27A clearance, Performance & Scalability Engine live at `/performance`, 424/424 tests passing. |
| **Gate 26B Clearance** | 📄 [Gate 26B Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-26b-conformance-report.md) | **CLEARED** | Gate 26B clearance, Evidence Evolution Engine live at `/evolution` & `/problems/[slug]/evolution`, 424/424 tests passing. |
| **Gate 26A Clearance** | 📄 [Gate 26A Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-26a-conformance-report.md) | **CLEARED** | Gate 26A clearance, Outcome Tracking Engine live at `/tracking` & `/problems/[slug]/tracking`, 408/408 tests passing. |
| **Gate 25B Clearance** | 📄 [Gate 25B Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-25b-conformance-report.md) | **CLEARED** | Gate 25B clearance, Global Precedents Engine live at `/precedents` & `/problems/[slug]/precedents`, 392/392 tests passing. |
| **Gate 25A Clearance** | 📄 [Gate 25A Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-25a-conformance-report.md) | **CLEARED** | Gate 25A clearance, Solution Comparison Engine live at `/problems/[slug]/compare`, 376/376 tests passing. |
| **Gate 24B Clearance** | 📄 [Gate 24B Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-24b-conformance-report.md) | **CLEARED** | Gate 24B clearance, Problem Intelligence Explorer live at `/problems`, 376/376 tests passing. |
| **Gate 24A Clearance** | 📄 [Gate 24A Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-24a-conformance-report.md) | **CLEARED** | Gate 24A clearance, Editorial Decision Intelligence live, 360/360 tests passing. |
| **Gate 23B Clearance** | 📄 [Gate 23B Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-23b-conformance-report.md) | **CLEARED** | Gate 23B clearance, Knowledge Intelligence & Reasoning live, 344/344 tests passing. |
| **Gate 23A Clearance** | 📄 [Gate 23A Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-23a-conformance-report.md) | **CLEARED** | Gate 23A clearance, Knowledge Lifecycle & Preservation live, 328/328 tests passing. |
| **Gate 22B Clearance** | 📄 [Gate 22B Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-22b-conformance-report.md) | **CLEARED** | Gate 22B clearance, Release Governance & Evolution Management live, 312/312 tests passing. |
| **Gate 22A Clearance** | 📄 [Gate 22A Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-22a-conformance-report.md) | **CLEARED** | Gate 22A clearance, Continuous Improvement & Engineering Excellence live, 296/296 tests passing. |
| **Gate 21B Clearance** | 📄 [Gate 21B Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-21b-conformance-report.md) | **CLEARED** | Gate 21B clearance, Resilience & Adaptive Operations live, 280/280 tests passing. |
| **Gate 21A Clearance** | 📄 [Gate 21A Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-21a-conformance-report.md) | **CLEARED** | Gate 21A clearance, Observability & Intelligence live, 264/264 tests passing. |
| **Gate 20B Clearance** | 📄 [Gate 20B Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-20b-conformance-report.md) | **CLEARED** | Gate 20B clearance, Governance, Audit & Compliance live, 248/248 tests passing. |
| **Gate 20A Clearance** | 📄 [Gate 20A Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-20a-conformance-report.md) | **CLEARED** | Gate 20A clearance, Platform Operations & Lifecycle live, 232/232 tests passing. |
| **Gate 19B Clearance** | 📄 [Gate 19B Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-19b-conformance-report.md) | **CLEARED** | Gate 19B clearance, External Interfaces & Extensibility live, 216/216 tests passing. |
| **Gate 19A Clearance** | 📄 [Gate 19A Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-19a-conformance-report.md) | **CLEARED** | Gate 19A clearance, Platform Integration & Readiness live, 200/200 tests passing. |
| **Gate 18D Clearance** | 📄 [Gate 18D Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-18d-conformance-report.md) | **CLEARED** | Gate 18D clearance, Performance & Scalability live, 184/184 tests passing. |
| **Gate 18C Clearance** | 📄 [Gate 18C Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-18c-conformance-report.md) | **CLEARED** | Gate 18C clearance, Production Infrastructure live, 167/167 tests passing. |
| **Gate 18B Clearance** | 📄 [Gate 18B Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-18b-conformance-report.md) | **CLEARED** | Gate 18B clearance, Security & RBAC subsystem live, 151/151 tests passing. |
| **Gate 18A Clearance** | 📄 [Gate 18A Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-18a-conformance-report.md) | **CLEARED** | Gate 18A clearance, Operations Control Plane live, 133/133 tests passing. |
| **Gate 17D Clearance** | 📄 [Gate 17D Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-17d-conformance-report.md) | **CLEARED** | Gate 17D clearance, Automation subsystem live, 117/117 tests passing. |
| **Gate 17C Clearance** | 📄 [Gate 17C Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-17c-conformance-report.md) | **CLEARED** | Gate 17C clearance, Telemetry subsystem live, 101/101 tests passing. |
| **Gate 17A Clearance** | 📄 [Gate 17A Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-17a-conformance-report.md) | **CLEARED** | Gate 17A clearance, Public Knowledge Platform live at `/topics`, 85/85 tests passing. |
| **Gate 16B Clearance** | 📄 [Gate 16B Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-16b-conformance-report.md) | **CLEARED** | Gate 16B clearance, Research Workspace live at `/workspace`, 81/81 tests passing. |
| **Gate 16A Clearance** | 📄 [Gate 16A Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-16a-conformance-report.md) | **CLEARED** | Gate 16A clearance, Knowledge Explorer surface live at `/explorer`, 77/77 tests passing. |
| **Gate 15C Clearance** | 📄 [Gate 15C Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-15c-conformance-report.md) | **CLEARED** | Gate 15C clearance, Chapter Production Factory live at `/founding-edition/[slug]`, 72/72 tests passing. |
| **Gate 15B Clearance** | 📄 [Gate 15B Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-15b-conformance-report.md) | **CLEARED** | Gate 15B clearance, Editorial Mission Control Dashboard live at `/editorial`, 67/67 tests passing. |
| **Gate 15A Clearance** | 📄 [Gate 15A Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-15a-conformance-report.md) | **CLEARED** | Gate 15A clearance, Chapter 1 Founding Edition v1.0 published, 62/62 tests passing, 7-Phase Gold Audit. |
| **Gate 14B Clearance** | 📄 [Gate 14B Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-14b-conformance-report.md) | **CLEARED** | Gate 14B clearance, 58/58 tests passing, pure derived intelligence, zero persistence. |
| **Phase 13C Final Release**| 📄 [Phase 13C Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/phase-13c-reader-experience-conformance-report.md) | **CLEARED** | Final publication release, 51/51 tests passing, UI as pure consumer of FixDomainService. |
| **Release Candidate** | 📄 [Release Candidate Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/release-candidate-conformance-report.md) | **CLEARED** | RC clearance, 51/51 unit tests passing (`TEST-DOM`..`INT`), service composition, weighted search. |
| **Gate D Clearance** | 📄 [Gate D Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-d-conformance-report.md) | **CLEARED** | Gate D clearance, 50/50 unit tests passing, Knowledge Graph taxonomy, Schema.org JSON-LD, RIS. |
| **Gate C Clearance** | 📄 [Gate C Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-c-conformance-report.md) | **CLEARED** | Gate C clearance, 11-state lifecycle state machine, transition guards, audit event logging. |
| **Gate B Clearance** | 📄 [Gate B Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-b-conformance-report.md) | **CLEARED** | Gate B clearance, 15 validators implemented (`VAL-ID`, `VAL-EVD`, `VAL-MCH`, `VAL-LC`). |
| **Gate A Clearance** | 📄 [Gate A Conformance Report](file:///c:/newsjack-content/thebreakdown-os/docs/architecture/gate-a-conformance-report.md) | **CLEARED** | Gate A clearance, core domain model & invariants (`INV-FIX-001..008`), zero RFCs needed. |
