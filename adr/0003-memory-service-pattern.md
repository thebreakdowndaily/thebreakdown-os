---
adr: "0003"
title: Memory* Service Pattern for Data Layer
status: accepted
date: 2024-01-01
---

# ADR 0003 — Memory* Service Pattern for Data Layer

## Status
Accepted

## Context

The platform needs a data layer that:
- Works during static build (no runtime database available)
- Can be swapped to a real backend (Postgres, Firestore, etc.) without changing page or component code
- Supports a service-locator pattern for dependency injection in tests and view-models
- Avoids prop-drilling data through component trees

The previous approach used scattered `utils/` files with hardcoded mock data directly imported by pages, leading to tight coupling and 12 kB+ of inline mock data per page.

## Decision

Adopt a **Memory* service pattern**:

- Each domain (stories, topics, entities, timelines, fixes, media, search, analytics) has a `service.ts` defining an interface (e.g. `StoryService`) and an in-memory implementation (`MemoryStoryService`)
- Services are wired together in `services/init.ts` and registered in `services/registry.ts` (service locator singleton)
- Pages call `bootstrapServices()` from `lib/bootstrap.ts` — an idempotent init that seeds all Memory* services from the CMS store
- View-models (`features/*/view-model.ts`) receive the service registry and assemble page data — zero data fetching inside React components

Swapping to a real backend requires only replacing `Memory*` implementations with API-backed ones, registering them in `init.ts`, and leaving all view-models and components unchanged.

## Consequences

**Easier:**
- Pages are decoupled from data source
- View-models are pure functions — easy to test
- Static build works with zero network calls
- Clear seam for future backend integration

**Harder:**
- All mock/seed data must be maintained in-memory — stale data risk during development
- `bootstrapServices()` must be called before any view-model — easy to forget in new routes
- In-memory services are not thread-safe (not relevant for static build, but matters if moved to a Node.js API server with concurrent requests)
