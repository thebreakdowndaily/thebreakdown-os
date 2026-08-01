# THE BREAKDOWN OS — ARCHITECTURE OVERVIEW

Version: Baseline Frozen (v1.0)

## Architectural Principle
The Breakdown is a **Knowledge Operating System**. Pages are temporary projections of canonical knowledge. Every factual assertion lives in the Canonical Domain Layer and is rendered via Bounded Projection Contexts.

## Bounded Subsystems

```
       [ Research OS ] (Knowledge Acquisition & Provenance)
              │
              ▼
    [ Canonical Domain Model ] (13 Knowledge Objects & Invariants)
              │
              ▼
      [ Editorial OS ] (Workflow State Machine & 7-Phase Audit)
              │
              ▼
   [ Bounded Projection Layer ] (Story, Topic, Timeline, Search ViewModels)
              │
              ▼
        [ Reader OS ] (Information Architecture & Projections)
```

## Architectural Governance
The baseline architecture is **implemented and frozen**. Any future architectural modification must follow an explicit **Architecture Decision Record (ADR)** proposal.
