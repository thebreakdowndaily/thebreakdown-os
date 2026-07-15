# /story publish — Publication Pipeline

Prepare and release an approved chapter.

## Syntax

```
/story publish <chapter-slug>
```

## State-driven execution

The publish command is **stateful**. Interrupted publications resume from the last incomplete stage. Preflight Check and Human Approval are never skipped.

Session state persists in `runtime/sessions/<slug>/story.yaml`.

## Workflow

`workflows/publish.md`

## Stages

```
1. Publication Package Assembly → versioned package
2. Visual Asset Verification   → provenance confirmed
3. Metadata & SEO              → complete metadata block
4. Knowledge Graph Update      → bidirectional edges
5. Cross-Reference Audit       → zero broken links
6. Preflight Check             → all gates pass
7. Human Approval              → signed authorisation (mandatory, no automation)
8. Release                     → chapter live
9. Post-Publication Verification → rendering verified
```

## Agent-to-Stage Mapping

| Stage | Agent File |
|-------|-----------|
| 1 | Conductor assembles |
| 2 | Conductor verifies against visual registry |
| 3 | Conductor validates metadata |
| 4 | Conductor updates graph |
| 5 | Conductor audits links |
| 6 | Conductor runs preflight |
| 7 | Conductor releases |
| 8 | Conductor verifies live rendering |

## Output

```
Chapter: <slug>
Status: Published
URL: /chapter/<slug>
Version: 0.1.0
```

## Quality Gates

- Stage 1: Version number follows semver, change log exists, Trust Score populated
- Stage 2: Every visual has provenance, license, pedagogical purpose
- Stage 3: SEO metadata complete, Open Graph validates, canonical URL resolves
- Stage 4: All edges bidirectional, no orphan nodes
- Stage 5: Zero broken internal links
- Stage 6: Every preceding stage passes
- Stage 7: Human editor explicitly authorises release (Conductor must not auto-approve)
- Stage 8: Chapter loads at canonical URL
- Stage 8: All modes render, all images load, navigation works

## Time Estimate

2–5 days depending on visual asset clearance and Knowledge Graph complexity.

## Status Machine

`status-machine.md` — If any stage fails, Conductor returns to the failed stage with specific findings.

## Exception Handling

- Visual assets missing license → BLOCKED until cleared
- Preflight finds unresolved issues → return to specific stage
- Post-pub verification finds critical failure → unpublish, return to Release
- Non-critical post-pub issues → PASSED with deferred remediation tasks
