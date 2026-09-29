# Author / Entity / Citation Graph Forensic Audit

**Audit Date:** 2026-09-29  
**Target:** Knowledge Graph Topography & Citation Traceability  
**Scope:** 41 Public Stories · 41 Entities · 5 Chapters · 191 Sourced Citations

---

## 1. Graph Macro Topography

| Dimension | Count | Health State |
|---|---|---|
| **Public Stories** | 41 | Verified in store |
| **Entities in Registry** | 41 | Registered |
| **Chapters (Knowledge Library)** | 5 | Structured knowledge objects |
| **Authors in Registry** | 1 | Canonical byline profiles |
| **Total Source Citations** | 191 | Attached across stories |
| **Orphan Entities** (0 linked stories) | 0 | ✅ 0 orphans |
| **Stories without Entities** | 0 | ✅ 100% entity-linked |
| **Stories without Sources** | 0 | ✅ 100% sourced |
| **Unsafe Source URLs** | 7 | ❌ Malformed URLs found |

---

## 2. Author Distribution

Every byline must either map to an official newsroom entity or a registered journalist profile with verified URL.

```json
{
  "The Breakdown Editorial": 39,
  "The Breakdown Investigations": 1,
  "The Breakdown Investigative Bureau": 1
}
```

---

## 3. Entity Coverage & Prominence

Top covered entities by story frequency:

| Entity Slug | Story Count |
|---|---|
| `india` | 41 |
| `rbi` | 5 |
| `un` | 5 |
| `ministry-of-finance` | 3 |
| `brics` | 3 |
| `ministry-of-rural-development` | 2 |
| `ministry-of-agriculture` | 2 |
| `cag` | 2 |
| `imf` | 2 |
| `g20` | 2 |
| `quad` | 2 |
| `sco` | 2 |
| `who` | 2 |
| `jawaharlal-nehru` | 2 |
| `npci` | 1 |

---

## 4. Citation & Source Type Classification

Breakdown of primary vs secondary source evidence:

```json
{
  "unclassified": 191
}
```

---

## 5. Graph Discrepancies & Findings

### A. Stories without attached entities (0)
_None. All public stories are linked to entities._

### B. Unresolved entity references (0)
_None. Every referenced entity ID/slug resolves in the index or store._

### C. Orphan entities (0)
_None. Every entity has active story coverage._

### D. Unsafe / Malformed Source URLs (7)
- Story `pm-fasal-bima-claims`: ``
- Story `india-china-border-lac`: ``
- Story `kashmir-the-first-test`: ``
- Story `kashmir-the-first-test`: ``
- Story `kashmir-the-first-test`: ``
- Story `kashmir-the-first-test`: ``
- Story `kashmir-the-first-test`: ``
