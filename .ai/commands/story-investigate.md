# /story investigate — Investigation Pipeline

Create a long-form investigation from research to publication package. Same pipeline as `/story create` but produces an investigation document instead of a chapter.

## Syntax

```
/story investigate <question>: <subtitle>
```

## State-driven execution

Same as `/story create` — **idempotent**. Running it again resumes from the last incomplete job. Completed research, verification, and knowledge jobs are skipped.

Session state persists in `runtime/sessions/<slug>/story.yaml`.

## Workflow

`workflows/create-story.md` (same pipeline, investigation template output)

## Stages

```
1. Research Director       → research brief
2. Source Verification     → verified source list
3. Knowledge Modeler       → canonical knowledge objects
4. Story Architect         → investigation blueprint
5. Narrative Editor        → full investigation draft
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

## Output Template

`templates/investigation.md` — uses investigation structure (question definition, evidence collection, findings, implications, methodology) instead of chapter structure.

## Output

```
Investigation: <question>
Status: Publication Package Ready
Version: 0.1.0
Contains: investigation draft, learning section, visual registry,
          metadata block, Knowledge Graph instructions
```

## Differences from `/story create`

| Aspect | Story | Investigation |
|--------|-------|--------------|
| Central question | Answers "what happened?" | Answers "what is the evidence for X?" |
| Structure | Narrative arc with phases | Question → Evidence → Findings → Implications |
| Output template | `templates/story.md` | `templates/investigation.md` |
| Default length | 5,000–15,000 words | 10,000–30,000 words |

## Quality Gates

Identical to `create-story.md` — same gates, same stop conditions, same status routing.

## Time Estimate

Full pipeline: 4–12 weeks depending on investigation scope and evidence availability.

## Status Machine

`status-machine.md` — identical routing rules.
