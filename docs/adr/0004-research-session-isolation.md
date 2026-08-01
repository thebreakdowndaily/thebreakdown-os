# ADR-0004: Exploratory Research Session & Provenance Isolation

## Context
Exploratory research (candidate claims, working notes, unverified documents) must not pollute verified canonical production database tables.

## Decision
Isolate unverified research within `ResearchSession` instances (`lib/research/session.ts`) until candidate claims pass verification and are promoted to canonical `Claim` and `Evidence` objects. Cryptographic SHA-256 hashes track archival document provenance (`lib/research/provenance.ts`).

## Consequences
- Clean separation between exploratory notes and production knowledge.
- Cryptographic provenance hashes preserve primary document auditability.
