# Architecture Decision Log (ADR) — Fix Domain

**Version:** 1.0.0  
**Status:** Architectural Log (Living Document)  
**Date:** July 2026  
**Context:** Phase 13A — Canonical Fix Domain Specification  

---

## Overview

This decision log records key architectural decisions, design rationales, trade-offs evaluated, and rejected alternatives for the Canonical Fix Domain.

---

### ADR-001: Fix as a Canonical Knowledge Object vs. Page Projection

- **Status**: Accepted
- **Context**: Solutions journalism often publishes remedies as episodic news articles or static web pages.
- **Decision**: Treat **The Fix** as a primary, structured, versioned **Knowledge Object** in the platform core, rendering temporary UI projections on demand.
- **Rationale**: Pages decay, fragment, and create duplicated facts. Modeling a Fix as a canonical entity ensures a single source of truth across search, reader surfaces, graph nodes, and API exports.
- **Alternatives Considered**: Creating `/solutions` static pages (Rejected: High maintenance overhead, zero machine readability).

---

### ADR-002: Qualitative Evidence Grading (GRADE-CERQual) vs. Numeric Truth Scores

- **Status**: Accepted
- **Context**: Many civic platforms attempt to assign numeric "truth scores" (e.g., 84% true) or 5-star ratings to policy proposals.
- **Decision**: Adopt an adapted **GRADE-CERQual** framework with qualitative confidence tiers (*High, Moderate, Low/Experimental, Contested*) backed by Level 1–3 citations.
- **Rationale**: Numeric scores create a false sense of mathematical precision on complex social policies. Qualitative badges grounded in primary documents preserve institutional trust and satisfy *Article I & III of the Editorial Constitution*.
- **Alternatives Considered**: 100-point Evidence Score (Rejected: Arbitrary weighting creates editorial bias).

---

### ADR-003: Single Source of Truth for Metadata Generation

- **Status**: Accepted
- **Context**: Search engines, social sharing, and scholarly aggregators require JSON-LD, OpenGraph, and RIS metadata.
- **Decision**: All machine-readable metadata MUST be dynamically projected from the canonical `Fix` model.
- **Rationale**: Eliminates synchronization drift where social preview cards or Schema.org tags contain outdated claims while the underlying page has been updated.
- **Alternatives Considered**: Storing meta fields inside page templates (Rejected: Violates DRY principle).

---

### ADR-004: Absolute Prohibition of Parallel Representations

- **Status**: Accepted
- **Context**: As platforms grow, services often create custom lightweight data models for search indexes or mobile views.
- **Decision**: Strictly prohibit alternative object definitions. All view models, search schemas, and API responses MUST be typed projections derived from `types/canonical.ts`.
- **Rationale**: Prevents type mismatch bugs (e.g., search indexing crashes due to flattened section objects) and guarantees zero schema drift across services.
- **Alternatives Considered**: Maintaining independent search index DTOs (Rejected: Historical cause of critical search crashes).

---

### ADR-005: Privacy-First Learning Analytics vs. User Behavior Tracking

- **Status**: Accepted
- **Context**: Standard web analytics track user clickstreams, session recording, and demographic profiling.
- **Decision**: Analytics in the Fix Domain measure **Learning Journeys** (primary sources opened, comparison matrices viewed, journey completion) aggregated anonymously at the object level with zero personal profiling.
- **Rationale**: Aligns with *Article XIII of the Editorial Constitution* and *Platform Beta Rules*. Respects reader privacy while providing actionable signals on educational impact.
- **Alternatives Considered**: Third-party Google Analytics / Mixpanel user tracking (Rejected: Violates privacy rules and editorial trust).
