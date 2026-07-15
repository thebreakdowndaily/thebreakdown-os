# /story create — Full Editorial Pipeline

Create a new chapter from research brief to publication package.

## Syntax

```
/story create <title>: <subtitle>
```

## State-driven execution

This command is **idempotent**. Running it again on the same slug resumes from the last incomplete job:

```
/story create india-china-border: The Cold Peace Along the LAC
  → research:    complete → SKIP
  → verification: complete → SKIP
  → knowledge:   running  → RESUME → complete ✓
  → architecture: pending → running → ...
```

Session state persists in `runtime/sessions/<slug>/story.yaml`. Artifacts from completed jobs are never regenerated.

## Workflow

`workflows/create-story.md`

## Stages

```
1. Research Director       → research brief
2. Source Verification     → verified source list
3. Knowledge Modeler       → canonical knowledge objects
4. Story Architect         → story blueprint (one page)
5. Narrative Editor        → full chapter draft
6. Editorial Review        → editorial decision
7. Learning Designer       → learning section
8. Publication Package     → publication-ready output
```

## Agent-to-Stage Mapping

| Stage | Agent File |
|-------|-----------|
| 1 | `agents/research-director.md` |
| 2 | `agents/source-verifier.md` |
| 3 | `agents/knowledge-modeler.md` |
| 4 | `agents/story-architect.md` |
| 5 | `agents/narrative-editor.md` |
| 6 | `agents/editor-in-chief.md` |
| 7 | `agents/learning-designer.md` |
| 8 | Conductor assembles output |

## Output

```
Chapter: <title>
Status: Publication Package Ready
Version: 0.1.0
Contains: chapter draft, learning section, visual registry,
          metadata block, Knowledge Graph instructions
```

## Quality Gates

Every stage runs its quality gate before advancing. See `workflows/create-story.md` for exact gate criteria.

## Time Estimate

Full pipeline: 2–6 weeks depending on chapter scope and evidence availability.

## Status Machine

`status-machine.md` — Conductor sets each stage to RUNNING, waits for PASSED/FAILED, applies routing rules, and logs every transition.

## Exception Handling

- Evidence gaps found at Stage 3 → return to Stage 1 with gap documentation
- Blueprint contradictions at Stage 4 → escalate to Editor-in-Chief
- Revision required from Stage 6 → return to Stage 5 with revision brief
- Publication blocked at Stage 8 → hold until dependencies clear
