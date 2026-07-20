# Adversarial Tests for Research Methodology v1.0

This document defines a structured suite of adversarial scenarios used to stress‑test the research methodology and ensure robust handling of edge‑cases, contradictory evidence, and bias.

## 1. Identifier Edge Cases

| Test ID | Description | Expected Outcome |
|---------|-------------|------------------|
| ID‑001 | Constituency ID `UP-AC-000` (zero) | Validation fails – `isValidConstituencyId` returns false |
| ID‑002 | Constituency ID `UP-AC-404` (out of range) | Validation fails |
| ID‑003 | Claim ID missing constituency `UP-AC-CLAIM-000001` | Validation fails |
| ID‑004 | Claim ID with non‑numeric suffix `UP-AC-001-CLAIM-ABCDEF` | Validation fails |

## 2. Vocabulary Mis‑use

| Test ID | Scenario | Expected Handling |
|---------|----------|-------------------|
| VOC‑001 | Claim marked `FACT` but `confidenceLevel` set to `E` (lowest) | System should allow but flag low confidence for editorial review |
| VOC‑002 | Source tier `FIELD_REPORTING` but no `sourceUrl` provided | Validation error – source must include a persistent URL |
| VOC‑003 | Evidence relationship `SUPERSEDES` without a later version existing | Should be rejected during verification |

## 3. Lifecycle Violations

| Test ID | Description | Expected Outcome |
|---------|-------------|------------------|
| LIF‑001 | Claim moves from `APPROVED` back to `PROPOSED` | Disallowed – lifecycle regression should be blocked |
| LIF‑002 | Financial stage jumps from `ANNOUNCEMENT` to `PAYMENT` without intermediate stages | Validation error – missing required stages |

## 4. Provenance Gaps

| Test ID | Missing Field | Expected Reaction |
|---------|--------------|-------------------|
| PROV‑001 | No `accessDate` for a web source | System must require an access date for online resources |
| PROV‑002 | No `archiveUrl` for a volatile source | Flag as `UNVERIFIED` and require archival copy |

## 5. Contradiction Handling

| Test ID | Contradictory Claims | Expected Flow |
|---------|----------------------|---------------|
| CONTR‑001 | Two claims with `SUPPORTS` relationship but opposite `confidenceLevel` (A vs D) | System should retain both, surface contradiction for editorial resolution |
| CONTR‑002 | Claim marked `CONTRADICTS` but linked evidence marked `SUPPORTS` | Conflict detection and escalation to Gold Standard Review |

## 6. Geographic Attribution

| Test ID | Multiconstituency Attribution | Expected Behaviour |
|---------|------------------------------|--------------------|
| GEO‑001 | Single financial amount listed separately for each of 5 constituencies | System should consolidate to a single amount with a multi‑constituency attribution list |
| GEO‑002 | Overlapping geographic scopes (e.g., district and block) without hierarchy | Validation should enforce a clear parent‑child relationship |

---

*These tests are run automatically as part of the CI pipeline. Any failure blocks the merge until the methodology is updated or the issue is resolved.*
