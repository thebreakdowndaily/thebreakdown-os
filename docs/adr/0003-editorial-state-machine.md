# ADR-0003: Domain-Driven Editorial State Machine & Gold Standard Review

## Context
Story publishing lifecycle transitions must be validated by pure backend domain rules rather than arbitrary UI button clicks.

## Decision
Implement `lib/editorial/workflow-state-machine.ts` enforcing valid lifecycle stages (`draft` $\rightarrow$ `research_complete` $\rightarrow$ `evidence_verified` $\rightarrow$ `gold_standard_review` $\rightarrow$ `approved` $\rightarrow$ `published`) alongside the 7-Phase Gold Standard Review audit engine (`lib/editorial/gold-standard-review.ts`).

## Consequences
- Bypassing audit reviews or publishing unverified drafts is blocked at the domain layer.
- Immutable transition audit logs record actor IDs, roles, and timestamps.
