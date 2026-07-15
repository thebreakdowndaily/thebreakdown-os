# Capability Matrix — Editorial OS v1.0

The operational map of the system. Every capability the Editorial Operating System provides, mapped to its workflow, jobs, human touchpoints, and output.

## Core capabilities

| Capability | Command | Workflow | Jobs executed | Human required | Output |
|---|---|---|---|---|---|
| **Create Story** | `/story create` | `create-story.md` | research → verification → knowledge → architecture → narrative → editorial → learning → publication | Final publish | Publication Package |
| **Review Story** | `/story review` | `review.md` | narrative (self-review) → conductor gate → peer review → editorial → revision loop → approval | Peer reviewers + Editor-in-Chief | Approved draft |
| **Publish** | `/story publish` | `publish.md` | assembly → visual verification → metadata → graph update → cross-reference → preflight → human approval → release → post-pub verification | Named human editor | Published chapter |
| **Update Story** | `/story update` | `update-story.md` | change assessment → canonical update → narrative revision → editorial review → version bump → human approval → publication | Editor-in-Chief + human approval | Updated chapter |
| **Living Update** | _(triggers from fact-check)_ | `living-update.md` | correction receipt → triage → verification → scope → approval → update → human approval → publication → notification | Human approval | Corrected chapter |
| **Investigate** | `/story investigate` | `create-story.md` | research → verification → knowledge → architecture → narrative → editorial → learning → publication | Final publish | Investigation Package |
| **Fact-Check** | _(standalone)_ | `fact-check.md` | receipt → assessment → source ID → verification → evaluation → judgment → report → publication | — | Published fact-check |

## Support capabilities

| Capability | Source | Description |
|---|---|---|
| **Status tracking** | `runtime/sessions/<slug>/story.yaml` | Every job transition logged with timestamp and agent |
| **Artifact storage** | `runtime/sessions/<slug>/artifacts/` | Permanent output from every completed job |
| **Resumption** | `runtime/sessions/<slug>/story.yaml` | Interrupted workflows resume from last incomplete job |
| **Idempotency** | Runtime state check | Completed jobs are never re-executed |
| **Manifest** | `runtime/sessions/<slug>/manifest.yaml` | Artifact index with checksums for reproducibility |
| **Human gate** | All publish paths | Named human editor must authorise every release |

## Not covered (by design)

The following are out of scope for Editorial OS v1.0:

- **Editorial Intelligence** — deciding whether a story is worth pursuing, whether it needs full or lightweight review, whether it should be a story vs. investigation vs. timeline
- **Reader analytics** — tracking which sections readers engage with
- **Automated evidence gap detection** — surfacing missing sources without human direction
- **Cross-chapter dependency management** — detecting when updating one chapter affects others
- **Content scheduling** — publication calendar management

These are editorial decisions, not execution decisions. They belong in a future "Decision Engine" layer.

## Version

**Editorial OS v1.0** — frozen.

From this point forward:
- New stories use the system
- Bugs are fixed
- Minor improvements are allowed (refinements to agent prompts, template adjustments, quality gate tuning)
- Structural changes (new workflows, new layers, new abstractions) require a design review and approval

The bottleneck is no longer infrastructure. It is editorial quality, storytelling craft, and reader experience.
