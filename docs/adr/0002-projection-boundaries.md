# ADR-0002: Bounded Projection Contexts & ViewModels

## Context
Raw database schemas and ORM entities must not leak directly into React presentation components.

## Decision
Create 5 bounded projection transformers under `lib/projections/` (`StoryViewModel`, `TopicViewModel`, `TimelineViewModel`, `SearchViewModel`, `ReaderCardViewModel`). UI components consume ViewModels exclusively.

## Consequences
- Zero schema leakage to client renderers.
- Byte-for-byte deterministic snapshot testing across UI surfaces.
