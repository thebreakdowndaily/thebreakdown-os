# The Breakdown OS — Architecture Options Analysis (VS7)

**Phase:** VS7 Architecture Reconnaissance & Reconciliation  
**Date:** 2026-09-26  
**Status:** Certified Options Analysis  
**Governing Documents:** AGENTS.md, Platform Beta Doctrine

---

## 1. Executive Summary

Three architectural options were formulated and evaluated for VS7. Each was tested against:
1. The **Editorial Constitution** (Articles XI, XIII)
2. The **Platform Beta Doctrine** (No new generic infrastructure, 5-minute reader rule, 90/10 rule)
3. **Database Migration Safety** (Zero migration requirement, HEAD at 016)
4. **Blast Radius & Operational Stability** (Zero regression to VS5/VS6)

---

## 2. Detailed Options Evaluation

### Option A: Extend Existing Architecture (RECOMMENDED)
- **Description:**
  - Leverage existing migration 013 (`public.corrections`, `public.reader_corrections`) without any new database migrations.
  - Wire reader error reporting UI directly onto `StoryShell` and story claim cards.
  - Expose `POST /api/corrections/submit` protected by migration 016 distributed rate limiting and Zod schema validation.
  - Connect the existing `lib/editorial/gold-standard-review.ts` engine into `lib/editorial/publication-gate.ts` as an automated quality gate.
  - Complete the canonical knowledge object graph for Volume I, Chapter 1 ("The Partition and Its Legacies") in compliance with Article XI density targets.
- **Pros:**
  - Zero new database migrations (`MIGRATIONS = 0`).
  - Zero new generic infrastructure or parallel services.
  - 100% compliant with the 5-minute reader rule (readers immediately see "Report an Error" and public errata log).
  - 90/10 rule respected: minimal code addition, massive editorial quality & transparency yield.
  - Reversible and isolated blast radius.
- **Cons:**
  - Requires coordinating across UI, API, and editorial CMS surfaces.
- **Risk Level:** **LOW**.

---

### Option B: Isolated Compliance & Errata Micro-Service
- **Description:**
  - Build a standalone compliance engine service (`services/compliance/`) with separate data models, third-party webhook dispatchers, and automated external reviewer dashboards.
  - Create new database migration 017 to add audit trails, reviewer feedback tracking, and editorial penalty scores.
- **Pros:**
  - High degree of decoupling from standard story rendering.
- **Cons:**
  - Blatantly violates Platform Beta rule: "❌ No new generic infrastructure, ❌ No new service layers, ❌ No new repository implementations".
  - Requires migration 017, breaking the immutable migration head rule.
  - High complexity, excessive speculative code that first-time readers cannot experience.
- **Risk Level:** **HIGH / PROHIBITED**.

---

### Option C: Defer Quality & Corrections (Ship Chapter 1 Only)
- **Description:**
  - Do not build reader corrections UI or API.
  - Do not wire automated Gold Standard Review into publication gates.
  - Solely author and polish the markdown/content for Volume I, Chapter 1.
- **Pros:**
  - Simplest engineering footprint.
- **Cons:**
  - Violates Editorial Constitution Article XIII (Mandatory transparent corrections and errata policy).
  - Leaves Chapter 1 without automated defensibility and density verification.
  - Leaves migration 013 as dead, unutilized schema in production database.
- **Risk Level:** **MEDIUM / EDITORIAL NON-COMPLIANCE**.

---

## 3. Comparison Matrix

| Evaluation Criterion | Option A (Extend Existing) | Option B (Isolated Subsystem) | Option C (Defer Quality/Errata) |
| :--- | :--- | :--- | :--- |
| **New Database Migrations** | **0 (Preserves Head 016)** | 1+ (Creates Mig 017) | 0 |
| **New Infrastructure Added**| **None (Wires existing)** | Heavy (New service layer) | None |
| **5-Minute Reader Rule** | **PASS (Reader sees UI & Errata)**| FAIL (Invisible backend) | PARTIAL (Only content) |
| **Constitution Compliance** | **100% (Articles XI & XIII)** | 100% (Excessive) | NON-COMPLIANT (Missing errata) |
| **90/10 Rule Alignment** | **OPTIMAL** | VIOLATION (Too much code) | 100% Editorial |
| **Blast Radius** | **Isolated** | Wide | None |
| **Recommendation** | **STRONGLY RECOMMENDED** | **REJECTED** | **REJECTED** |

---

## 4. Final Architecture Recommendation

**Option A is selected unanimously.** It fully delivers editorial quality, transparent public errata, reader error reporting, and Chapter 1 founding publication readiness while writing zero speculative infrastructure and zero database migrations.
