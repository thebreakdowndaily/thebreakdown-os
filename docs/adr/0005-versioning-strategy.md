# ADR-0005: Cryptographic Immutable Claim Versioning Strategy

## Context
Factual corrections and editorial updates must preserve full historical lineage without mutating past audit records.

## Decision
Implement `lib/domain/versioning.ts` tracking `ClaimVersionRecord` instances (`v1` $\rightarrow$ `v2` $\rightarrow$ `Correction`) with `previousVersionHash` pointers.

## Consequences
- Historical transparency for readers and editors.
- Full auditability for editorial corrections.
