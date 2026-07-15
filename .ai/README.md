# AI Layer — The Breakdown Editorial Operating System

This directory defines the editorial operating system for The Breakdown Knowledge Platform. It is not infrastructure. It is not architecture. It is the executable specification for how knowledge moves from research to publication.

## Structure

```
commands/        User-facing slash commands (/story create, /story publish)
workflows/       Stage sequences that implement each command
jobs/            Atomic unit of work — each job invokes one agent and produces one artifact
agents/          Role definitions for every function in the pipeline
runtime/         Persistent execution state, artifacts, and session management
schemas/         Canonical data formats for handoffs between jobs
templates/       Reusable document structures for knowledge objects
```

## Execution order

```
User → Command → Conductor → Workflow → Jobs → Agents → Artifacts → Story State → Human Approval → Publication
```

## Capabilities

See `CAPABILITIES.md` for the operational map of every command, workflow, job, human touchpoint, and output.

## Freeze Notice — Editorial OS v1.0

This directory is **frozen as Editorial Operating System v1.0**. The architecture is complete.

| Layer | Status |
|-------|--------|
| Commands | ✅ Frozen |
| Workflows | ✅ Frozen |
| Jobs | ✅ Frozen |
| Agents | ✅ Frozen |
| Runtime | ✅ Frozen |
| Schemas | ✅ Frozen |
| Templates | ✅ Frozen |

From this point forward:
- **New stories** use the system
- **Bugs** are fixed
- **Minor improvements** allowed (prompt refinements, template adjustments, quality gate tuning)
- **Structural changes** (new workflows, new layers, new abstractions) require a design review

The bottleneck is no longer infrastructure. It is editorial quality, storytelling craft, and reader experience.

## Governance

These documents are governed by the Editorial Constitution (`docs/editorial/editorial-constitution.md`). No agent, workflow, schema, template, job, runtime, or command may contradict the Constitution. If a conflict is found, the Constitution prevails.
