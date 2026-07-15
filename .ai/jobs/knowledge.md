# Job: knowledge

Transforms verified sources into canonical knowledge objects.

## Agent

`agents/knowledge-modeler.md`

## Input

`artifacts/verification.md` (from verification job).

## Artifacts

- `artifacts/claims.yaml` — registered claims with confidence scores, evidence links, counterarguments
- `artifacts/timeline.yaml` — timeline events registered and linked to claims

## Quality gate

Every proposed claim has a registry entry with confidence score and evidence links. Every evidence item has provenance metadata. Entity and thinker profiles exist. Counterarguments have their own evidence basis.

## State

`pending` → `running` → `complete` | `failed`
