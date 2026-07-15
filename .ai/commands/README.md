# Commands — Editorial Slash Commands

The user never speaks to agents directly. The user speaks to the **Conductor** via slash commands. The Conductor interprets the command, selects the workflow, and runs each stage in sequence.

## Command reference

| Command | Workflow | What it does |
|---------|----------|-------------|
| `/story create <title>` | `create-story.md` | Full pipeline from research to publication package |
| `/story review <chapter>` | `review.md` | Editorial review of a completed draft |
| `/story publish <chapter>` | `publish.md` | Publication preparation and release |
| `/story update <chapter>` | `update-story.md` | Substantive update to a published chapter |
| `/story investigate <question>` | `create-story.md` | Investigation pipeline (same stages, investigation template output) |

## State-driven execution

Every command is **idempotent**. The Conductor checks `runtime/sessions/<slug>/story.yaml` before executing. Completed jobs are skipped. Interrupted jobs are resumed. Artifacts from completed jobs are never regenerated.

```
/story create india-china-border    # first run
  → 8 jobs execute in sequence

/story create india-china-border    # resume after interruption at narrative
  → research:    SKIP (artifact exists)
  → verification: SKIP
  → knowledge:   SKIP
  → architecture: SKIP
  → narrative:   RESUME → complete ✓
  → editorial:   pending → ...
```

## How it works

```
/user: /story create India-China Border: The Cold Peace Along the LAC

Conductor interprets:
  command   → /story create
  workflow  → create-story.md
  title     → India-China Border: The Cold Peace Along the LAC
  stages    → Research Director → Source Verification → Knowledge Modeler
              → Story Architect → Narrative Editor → Editorial Review
              → Learning Designer → Publication Package

Conductor executes stage 1:
  → set Research Director → RUNNING
  → wait for completion
  → verify quality gate
  → advance to next stage

... (each stage in sequence) ...

Conductor returns:
  → Publication Package ready for chapter "India-China Border"
```

## Stages are agents, not functions

Each stage in a workflow maps to exactly one agent. The Conductor does not write code — it invokes the agent described in `.ai/agents/<role>.md`, waits for its output, verifies the quality gate, and advances.

## Status machine integration

Every stage transition updates the status machine (`status-machine.md`). The Conductor reads status, applies routing rules, and logs every transition. No stage advances silently.

## Command specification

Each command has a specification file in this directory that defines:

- **Syntax:** exact pattern the user types
- **Workflow:** which workflow file to execute
- **Stages:** agent invocation order
- **Output:** what the Conductor returns at the end
- **Time estimate:** expected duration (for the user's awareness)

## Full architecture

```
User
  ↓
Commands        ← /story create, /story publish, /story review
  ↓
Editorial Conductor  ← reads/writes story.yaml, routes jobs
  ↓
Workflow        ← ordered sequence of jobs
  ↓
Jobs            ← research, verification, knowledge, architecture, narrative, editorial, learning, publication
  ↓
Agents          ← role definitions in .ai/agents/
  ↓
Artifacts       ← permanent output files in runtime/sessions/<slug>/artifacts/
  ↓
Story State     ← runtime/sessions/<slug>/story.yaml
  ↓
Human Approval
  ↓
Publication
```

Agents are no longer the center. The workflow is. Every production is reproducible from its artifact trail.
