# Job: publication

Assembles all artifacts into a publication-ready package. This is the terminal job of the create workflow.

## Performed by

Editorial Conductor (no dedicated agent — assembly and verification).

## Input

All preceding artifacts: `research.md`, `verification.md`, `claims.yaml`, `timeline.yaml`, `story-blueprint.md`, `draft.md`, `review.md`, `learning.md`.

## Artifact

`artifacts/publish.md`

Contains: final version number, change log entry, Trust Score update, visual assets verified and licensed, internal links resolved, SEO metadata complete, Knowledge Graph node instructions, cross-references, corrections policy link, methodology link.

## Quality gate

All internal links resolve. Visual assets have documented provenance and license. SEO metadata complete. Knowledge Graph references bidirectional.

## State

`pending` → `running` → `complete` | `failed`
