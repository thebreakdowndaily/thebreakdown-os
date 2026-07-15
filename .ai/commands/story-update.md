# /story update — Substantive Update Pipeline

Update a published chapter with new evidence, corrected claims, or shifted scholarship.

## Syntax

```
/story update <chapter-slug>
```

## State-driven execution

The update command is **idempotent**. Running it again resumes from the last incomplete stage. Completed change assessments and canonical layer updates are not re-executed.

Session state persists in `runtime/sessions/<slug>/story.yaml`.

## Workflow

`workflows/update-story.md`

## Stages

```
1. Change Assessment           → scope document
2. Canonical Layer Update      → updated knowledge objects
3. Narrative Revision          → revised chapter
4. Review                      → approval decision
5. Version Bump                → semver increment
6. Publication                 → updated chapter live
```

## Agent-to-Stage Mapping

| Stage | Agent File |
|-------|-----------|
| 1 | `agents/research-director.md` (change scope) |
| 2 | `agents/knowledge-modeler.md` |
| 3 | `agents/narrative-editor.md` |
| 4 | `agents/editor-in-chief.md` |
| 5 | Conductor assigns version |
| 6 | Conductor publishes |

## Output

```
Chapter: <slug>
Status: Updated
Version: <previous> → <new>
Change Log: <summary of changes>
```

## Quality Gates

- Stage 1: Every affected claim, section, evidence item identified; severity justified
- Stage 2: Changed claims updated with new confidence/evidence; deprecated claims marked not deleted
- Stage 3: Only scoped sections modified; transitions smooth; unaffected sections byte-identical
- Stage 4: Review limited to changed sections; original sections not re-reviewed
- Stage 5: Version consistent with severity; change log written
- Stage 6: Live at URL; Knowledge Graph updated; related chapters notified

## Time Estimate

1–7 days depending on change scope (patch: 1 day; minor: 3 days; major: 7 days).

## Status Machine

`status-machine.md` — Cascading changes beyond identified scope trigger BLOCKED with escalation to Editor-in-Chief.

## Exception Handling

- Change request lacks source verification → BLOCKED until verified
- Narrative changes cascade beyond scope → escalate for scope re-assessment
- Review discovers errors in original sections (unrelated) → log as separate maintenance, do not block this update
- Severity disagrees with actual changes → escalate to Editor-in-Chief
