# ADR-0001: Canonical Domain Model & Invariants

## Context
The platform requires a single source of truth for all knowledge objects (claims, evidence, sources, stories, topics, timelines, datasets) to avoid schema fragmentation across UI views.

## Decision
Establish 13 standardized Canonical Knowledge Objects in `types/canonical.ts` governed by pure invariant validators in `lib/domain/validators.ts`.

## Consequences
- Every factual assertion lives in one place.
- Presentation components never define or compute domain logic.
