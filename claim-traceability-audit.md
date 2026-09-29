# THE BREAKDOWN — NEWSROOM OPERATING SYSTEM
## Deliverable 2: Claim Traceability & Evidence Architecture Forensic Audit

**Document ID:** NOS-AUDIT-002  
**Status:** Complete Audit Report  
**Date:** 2026-09-28  
**Scope:** Forensic analysis of claim-to-source lineages, schema fragmentation, and evidence integrity across representative published stories.

---

### 1. Evidence Architecture & The Traceability Spine

In the canonical operating model defined in `AGENTS.md` and the `Editorial Constitution`, all public knowledge must follow an unbroken, auditable chain:

```
[ Primary Source / Document ]
           │
           ▼
  [ Evidence Excerpt ] ── (Locators: docId, page, paragraph, timestamp)
           │
           ▼
   [ Canonical Claim ] ── (Confidence, status, counterarguments)
           │
           ▼
 [ Entity / Topic Node ] ── (Knowledge Graph integration)
           │
           ▼
    [ Story / Chapter ] ── (Narrative Spine projection)
           │
           ▼
  [ Reader Experience ] ── (Inline citation, evidence rail, audit trail)
```

---

### 2. Representative Story Forensic Audit

A rigorous cross-sectional audit of 5 representative content archetypes was conducted:

| Story / Knowledge Object | Type / Archetype | Total Claims | Verified Claims | Primary Source Ratio | Source Tier Dist. (T1/T2/T3/T4/T5) | Resolved Source IDs | Unresolved Source IDs (F-04) | Traceability Status |
|---|---|---|---|---|---|---|---|---|
| **India's Inheritance: Partition** (`kl-ch-1`) | Historical Monograph / Founding Chapter | 24 | 24 (100%) | 75% | 8 / 6 / 10 / 0 / 0 | 24 / 24 | 0 | **Fully Traceable (Canonical)** |
| **India-China Border (LAC)** (`india-china-border-lac`) | Security Investigation | 12 | 10 (83.3%) | 58% | 4 / 3 / 5 / 0 / 0 | 7 / 12 | 5 (Missing in SourceRegistry) | **Partially Traceable (Schema Drift)** |
| **Semiconductor PLI Tracker** (`semiconductor-pli`) | Policy / Industrial Tracker | 4 | 4 (100%) | 50% | 1 / 1 / 2 / 0 / 0 | 0 / 4 | 4 (`src-semiconductor-pli-*`) | **Unresolved Registry Debt** |
| **RBI Monetary Policy** (`rbi-monetary-policy`) | Economic Reference Analysis | 6 | 6 (100%) | 83% | 5 / 1 / 0 / 0 / 0 | 6 / 6 | 0 | **Fully Traceable (Local)** |
| **UP403 Constituency Dossier** (`up403`) | Electoral / Demographic Dataset | 403 (implicit) | 403 (dataset-backed) | 100% | 403 / 0 / 0 / 0 / 0 (ECI) | N/A (Isolated JSON) | N/A (Isolated JSON) | **Architectural Island** |

---

### 3. Detailed Forensic Findings by Archetype

#### Archetype 1: Historical Monograph — `indias-inheritance-partition`
* **File Locations:** `lib/editorial/chapter-1-data.ts`, `stories/indias-inheritance-partition/knowledge/claims.yaml`
* **Lineage Check:** Claims like `claim.partition.security-consciousness` link to sources `s1` (*India After Gandhi* by Ramachandra Guha) and `s3` (*The Sole Spokesman* by Ayesha Jalal), and document `doc-nehru-tryst`.
* **Integrity Status:** Passes all canonical tests. Every cited source exists in `lib/knowledge/source-registry.ts`.
* **Defect:** A parallel `claims.yaml` file exists in `stories/indias-inheritance-partition/knowledge/claims.yaml` using IDs `partition-001`, `partition-002`, referencing string IDs like `transfer-of-power-vol-1`. The chapter in production renders from `chapter-1-data.ts` and `lib/knowledge/claim-registry.ts`, leaving `claims.yaml` as an orphaned artifact.

#### Archetype 2: Investigation — `india-china-border-lac`
* **File Locations:** `stories/india-china-border-lac/knowledge/claims.yaml`, `data/store.json`
* **Lineage Check:** Contains 12 claims stored as a Markdown table within YAML (`C01` to `C12`).
* **Source Resolution:** Cites Simla Convention (1914), Indian White Papers, Henderson-Brooks Report. However, these are referenced as freeform strings rather than registry IDs (`s-simla-1914`).
* **Integrity Status:** When evaluated against `lib/knowledge/source-validator.ts`, it triggers 5 `SOURCE_NOT_FOUND` warnings because sources are not registered in the central `source-registry.ts`.

#### Archetype 3: Policy / Tracker — `semiconductor-pli`
* **File Locations:** `data-layer/store.ts`, `scripts/check-source-integrity.ts`
* **Lineage Check:** Claims `clm-semiconductor-pli-001` through `004` reference source IDs `src-semiconductor-pli-1` through `4`.
* **Defect (F-04 / F-12):** When running `npx tsx scripts/check-source-integrity.ts --fail-on-error`, these exact claims cause immediate build failure:
  ```
  • [SOURCE_NOT_FOUND] [story:semiconductor-pli] clm-semiconductor-pli-001 -> missing source "src-semiconductor-pli-1"
  ```
  The source definitions exist only as informal text strings in the story JSON, never registered in `lib/knowledge/source-registry.ts`.

#### Archetype 4: Economic Analysis — `rbi-monetary-policy`
* **File Locations:** `stories/reference/rbi-monetary-policy.json`
* **Lineage Check:** High primary source ratio (83%). Direct citations to RBI Monetary Policy Committee (MPC) resolution statements, governor press conferences, and the Reserve Bank of India Act 1934.
* **Integrity Status:** Self-contained and factual, but lacks canonical graph edges to the `rbi` entity in `utils/data-layer/entity-index.ts`.

#### Archetype 5: Electoral Intelligence — `up403`
* **File Locations:** `data/master-dataset-v1/v1.1.0/up403-master-dataset-v1.json`, `lib/up403/`
* **Lineage Check:** Derived directly from the Election Commission of India (ECI) 2012, 2017, 2022 Assembly and 2024 Lok Sabha statistical reports.
* **Architectural Island Defect:** UP403 has its own isolated `Story` model (`lib/up403/stories.ts`) that matches constituency records based on algorithms (e.g. `landslide-margin`, `split-mandate`). These stories are **not registered** in `RepositoryFactory.getStoryRepository()` and cannot be cross-referenced by the Newsroom Intelligence engine or Knowledge Library.

---

### 4. Schema Fragmentation Forensic Summary

The audit proved that **The Breakdown currently uses 4 mutually incompatible claim representations**:

| Schema Layer | File / Location | Claim ID Format | Source Binding | Verification State Model |
|---|---|---|---|---|
| **1. Canonical Registry** | `lib/knowledge/claim-registry.ts` | `claim.<domain>.<slug>` | Array of `sourceIds` (`s1`, `s3`) | `'established' \| 'debated' \| 'provisional'` |
| **2. Story Markdown/YAML** | `stories/[slug]/knowledge/claims.yaml` | `partition-001` or `C01` | String citations or `source_id` | `'registered' \| 'disputed'` or `'High' \| 'Medium'` |
| **3. Database / API Model** | Supabase `claims`, `types/canonical.ts` | `clm-<uuid>` or `clm-<slug>-<num>` | `sources[]` object | `'verified' \| 'moderate' \| 'unverified'` |
| **4. Newsroom Intelligence** | `types/newsroom-intelligence.ts` | `sig-<id>` (`keyClaims: string[]`) | `cluster.primarySources[]` | `lifecycleState` on parent signal |

**Forensic Conclusion:**  
Because there is no canonical translation layer between Schema 4 (Newsroom Intelligence) and Schema 1 (Canonical Registry), an observation ingested from PIB cannot update a claim in Chapter 1 without a human manually writing code in TypeScript.
