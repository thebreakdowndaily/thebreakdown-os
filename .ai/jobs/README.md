# Jobs — Individual Stage Execution

Jobs are the atomic unit of work. A workflow is a sequence of jobs. A job is a single agent invocation that produces a single artifact.

## Architecture

```
User
  ↓
Commands     ← /story create, /story publish
  ↓
Conductor    ← orchestrates, checks state, routes
  ↓
Workflow     ← ordered sequence of jobs
  ↓
Jobs         ← research, verification, knowledge, architecture, narrative, editorial, learning, publication
  ↓
Agents       ← role definitions in .ai/agents/
  ↓
Artifacts    ← permanent output files in runtime/sessions/<slug>/artifacts/
```

## Job contract

Every job follows the same contract:

```
Input:   artifact(s) from previous job(s) + story state
Agent:   the role assigned to perform this work
Output:  artifact file(s) written to runtime/sessions/<slug>/artifacts/
State:   status updated in story.yaml (pending → running → complete | failed)
Gate:    quality check runs before status is set to complete
```

## Idempotency

Before a job starts, the Conductor checks:

1. **Is the job status `complete`?** → Skip. Artifact exists.
2. **Is the job status `running`?** → Resume. Re-run from start.
3. **Is the job status `failed`?** → Retry. Re-run from start.
4. **Is the job status `blocked`?** → Hold. Do not execute.
5. **Is the job status `pending`?** → Execute.

## Job definitions

| Job | Agent | Artifact | Depends on |
|-----|-------|----------|------------|
| research | research-director | research.md | — |
| verification | source-verifier | verification.md | research |
| knowledge | knowledge-modeler | claims.yaml, timeline.yaml | verification |
| architecture | story-architect | story-blueprint.md | knowledge |
| narrative | narrative-editor | draft.md | architecture |
| editorial | editor-in-chief | review.md | narrative |
| learning | learning-designer | learning.md | editorial |
| publication | conductor | publish.md | learning |
