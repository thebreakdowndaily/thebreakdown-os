# Job: verification

Confirms provenance, authenticity, and reliability of every source in the research brief.

## Agent

`agents/source-verifier.md`

## Input

`artifacts/research.md` (from research job).

## Artifact

`artifacts/verification.md`

Contains: verified source list with provenance, authenticity, reliability assessment, confidence tiers, quarantine records for failed sources.

## Quality gate

Every source has a verification record. Failed sources quarantined with documented reason. No unverified source enters downstream jobs.

## State

`pending` → `running` → `complete` | `failed`
