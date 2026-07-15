# /story review — Editorial Review Pipeline

Review a completed chapter draft before publication.

## Syntax

```
/story review <chapter-slug>
```

## State-driven execution

The review command is **stateful**. Running it again resumes from the last incomplete stage. Completed reviews are not re-executed.

Session state persists in `runtime/sessions/<slug>/story.yaml`.

## Workflow

`workflows/review.md`

## Stages

```
1. Narrative Self-Review      → completed checklist
2. Editorial Conductor Gate   → independent verification
3. Peer Review                → 2+ reviewer reports
4. Editorial Review (EiC)     → written decision
5. Revision Loop              → revised draft + memo (if needed)
6. Approval                   → written approval
```

## Agent-to-Stage Mapping

| Stage | Agent File |
|-------|-----------|
| 1 | `agents/narrative-editor.md` (self-review) |
| 2 | `agents/editorial-conductor.md` (gate check) |
| 3 | External reviewers (not an agent file) |
| 4 | `agents/editor-in-chief.md` |
| 5 | `agents/narrative-editor.md` (revision) |
| 6 | `agents/editor-in-chief.md` |

## Output

```
Chapter: <slug>
Status: Approved
Next: /story publish <slug>
```

## Quality Gates

- Stage 1: All 12 Narrative Quality Review items pass
- Stage 2: Conductor independently samples claims, language, transitions
- Stage 3: Two reviewers from different perspectives
- Stage 4: Written EiC decision with specific conditions
- Stage 5: Every condition addressed in revision memo
- Stage 6: Written approval on record

## Time Estimate

3–10 days depending on reviewer availability and revision depth.

## Status Machine

`status-machine.md` — Revisions return to Stage 1 (self-review) or Stage 5 (revision loop) depending on source.

## Exception Handling

- Two reviewers identify same critical issue → return to Narrative Editor
- Conditions cannot be met without evidence changes → escalate to Editor-in-Chief
- 3 consecutive gate failures at any stage → BLOCKED, escalate to Editor-in-Chief
