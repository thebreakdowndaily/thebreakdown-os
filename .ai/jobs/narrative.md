# Job: narrative

Transforms the story blueprint into a full chapter draft.

## Agent

`agents/narrative-editor.md`

## Input

`artifacts/story-blueprint.md` (from architecture job) + `artifacts/claims.yaml` + `artifacts/timeline.yaml` (from knowledge job).

## Artifact

`artifacts/draft.md`

Contains: full chapter draft with hero image selection, hook, executive summary, narrative sections following story pattern, evidence placed at point of reader need, counterarguments at point of disagreement, section transitions, competing interpretations attributed, reflection and continue learning.

## Quality gate

Narrative Diagnostic complete. Blueprint followed (deviations documented). Narrative Quality Review checklist all pass. All Six Questions answered. Three layers distinguishable. Prohibited language absent.

## State

`pending` → `running` → `complete` | `failed`
