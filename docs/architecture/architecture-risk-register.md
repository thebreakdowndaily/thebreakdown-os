# Architecture Risk Register — Fix Domain (Release AR-13A.0)

**Version:** 1.0.0 — Baseline Baseline  
**Status:** Architecture Release AR-13A.0 (Locked)  
**Date:** July 2026  
**Scope:** Architectural Risks, Mitigation Strategies, & Tracking Schedule  

---

## 1. Executive Summary

This risk register documents known architectural risks, performance assumptions, and deferred decisions for the Fix Domain. It separates structural risks from implementation bugs, ensuring that technical debt and system limits are monitored proactively across Phase 13B and Phase 13C.

---

## 2. Risk Register Matrix

| Risk ID | Risk Description | Severity / Impact | Likelihood | Mitigation Strategy | Review Phase |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `RSK-ARCH-001` | **Array Column Faceted Query Performance**: GIN index queries on `responsibleActorIds` in Supabase may degrade under high concurrency (>100k records). | Medium | Low | Benchmark database query planner execution times in Phase 13B.1; introduce materialized view if latency exceeds 50ms. | Phase 13B.1 |
| `RSK-ARCH-002` | **Graph Traversal Depth Latency**: Multi-hop reachability queries (`FIX -> STORY -> CLAIM -> SOURCE`) may cause performance bottlenecks if graph depth > 4. | Medium | Low | Enforce max hop limit (`depth <= 3`) in Graph Engine query contracts. | Phase 13B.4 |
| `RSK-ARCH-003` | **Search Score Drift**: BM25 field weights may penalize non-traditional policy summaries containing dense technical terminology. | Low | Medium | Empirical tuning of BM25 field weights and boost factors using reader search logs. | Phase 13C |
| `RSK-ARCH-004` | **External Primary Source Rate Limits**: Automated `lastVerified` freshness verification tasks may hit rate limits when pinging government gazette APIs. | Low | Medium | Implement background Queue Workers with exponential backoff and request throttling. | Phase 13B.1 |
| `RSK-ARCH-005` | **Schema.org Specification Drift**: Changes to Schema.org `Legislation` or `GovernmentService` schemas may cause validation warnings in external aggregators. | Low | Low | Isolate metadata generators behind versioned serializer adapters (`JsonLdSerializer`). | Phase 13B.4 |
