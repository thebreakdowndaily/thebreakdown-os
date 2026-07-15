# Runtime — Story Execution State

The Runtime layer makes every workflow **idempotent**, **resumable**, and **auditable**. It gives the Editorial Conductor durable memory — so a story interrupted mid-pipeline can be resumed days later without re-executing completed stages.

## Architecture

```
.ai/runtime/
  README.md
  story-state.yaml          ← schema for story state files
  sessions/
    <story-slug>/
      story.yaml            ← execution state for this story
      artifacts/            ← permanent output of each completed stage
        research.md
        verification.md
        claims.yaml
        timeline.yaml
        story-blueprint.md
        draft.md
        review.md
        learning.md
        publish.md
      manifest.yaml         ← artifact index with checksums
```

## How it works

Every slash command creates or resumes a session:

```
/story create india-china-border
  → runtime/sessions/india-china-border/story.yaml created
  → Conductor reads state
  → research:       pending    → RUNNING → complete → saved as artifacts/research.md
  → verification:   pending    → RUNNING → complete → saved as artifacts/verification.md
  → knowledge:      pending    → RUNNING → complete → saved as artifacts/claims.yaml + timeline.yaml
  → architecture:   pending    → RUNNING → complete → saved as artifacts/story-blueprint.md
  → narrative:      pending    → RUNNING → complete → saved as artifacts/draft.md
  → editorial:      pending    → RUNNING → complete → saved as artifacts/review.md
  → learning:       pending    → RUNNING → complete → saved as artifacts/learning.md
  → publication:    waiting_human
```

If interrupted at `narrative: in_progress` and re-invoked:

```
/story create india-china-border
  → reads state
  → research:       complete   → SKIP (artifact exists)
  → verification:   complete   → SKIP
  → knowledge:      complete   → SKIP
  → architecture:   complete   → SKIP
  → narrative:      in_progress → RESUME
```

## State file format

See `story-state.yaml` for the canonical schema. Every story session produces one `story.yaml` with:

- `story.slug` — unique identifier
- `story.title` — display title
- `story.created` — session creation timestamp
- `story.updated` — last state change timestamp
- `status.<job>` — one of: pending, running, complete, failed, blocked, skipped
- `current_job` — which job is currently executing
- `current_agent` — which agent is assigned to the current job
- `version` — draft version string (e.g., draft-v0.4)
- `history` — ordered list of every state transition with timestamp

## Artifact rules

- Every completed job produces exactly one artifact file (some produce two: claims.yaml + timeline.yaml)
- Artifacts are never overwritten — each version is preserved
- The manifest.yaml records every artifact with filename, job name, timestamp, and checksum
- Artifacts are the canonical handoff between jobs: the next job reads the previous job's artifact as input

## Resumption rules

- If a job status is `complete` and its artifact exists → SKIP (do not re-execute)
- If a job status is `running` but no artifact exists → RESUME (re-run from the beginning of that job)
- If a job status is `failed` → RETRY (re-run from the beginning of that job)
- If a job status is `blocked` → HOLD (do not advance until dependency resolves)
- If a job status is `skipped` → ADVANCE (honour the skip)

## Manifest

Every session generates `manifest.yaml` listing all artifacts with:

```yaml
manifest:
  story: india-china-border
  version: draft-v0.4
  artifacts:
    research:
      file: artifacts/research.md
      job: research
      status: complete
      timestamp: 2026-07-15T10:30:00Z
      checksum: sha256:a1b2c3...
    verification:
      file: artifacts/verification.md
      job: verification
      status: complete
      timestamp: 2026-07-15T11:15:00Z
      checksum: sha256:d4e5f6...
```

This makes every publication fully reproducible — given the manifest and artifact directory, any reader can trace exactly what was produced at every stage.
