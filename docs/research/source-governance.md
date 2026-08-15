# Research Source Governance

Governing document for the Research Source Registry and the News Intelligence →
Research bridge.

Applies to: `data/research-source-registry.ts`, `services/intelligence/research/source-registry.ts`,
`services/intelligence/research/newsroom-bridge.ts`, `services/intelligence/research/production-discovery.ts`.

Status: v1.0 (activation). Amendment: editor-authorised change only.

---

## 1. Purpose

The Research Intelligence Engine discovers sources from feeds configured in the
Research Source Registry. Discovery is **governed**, not ad-hoc: a source cannot
enter the production pipeline without editorial approval, and a feed the editor
has not approved can never be fetched by the engine.

The registry also carries the bridge between News Intelligence and research:
newsroom signals that pass the `researchTrigger` gate are resolved to existing
research projects (or create new ones) and run against **approved sources only**.

## 2. Approval authority

- **Approver:** Editor-in-Chief (and any editor explicitly delegated by the
  Editor-in-Chief). The seed definitions carry `approvedBy: "Editor-in-Chief (initial activation milestone)"`.
- **Grounds for approval:** demonstrated source quality — authority, editorial
  process, freshness, and coverage relevant to The Breakdown's knowledge scope.
- **Approval is recorded** in the definition's `approval` block (status, by,
  at, rationale). Definitions without approval metadata are rejected at load.

## 3. Approval states

| State | Meaning | Eligible for discovery |
|-------|---------|------------------------|
| `PROPOSED` | Identified, not yet approved. Health tracked if probed. | No |
| `APPROVED` | Approved by the Editor-in-Chief. | Yes |
| `ACTIVE` | Approved and confirmed operational. | Yes |
| `PAUSED` | Temporarily withdrawn (e.g. feed incident, editorial review). | No |
| `RETIRED` | Permanently removed. | No |

Transitions: `PROPOSED → APPROVED → ACTIVE ⇄ PAUSED → RETIRED`. Any state may
transition to `RETIRED`. `RETIRED` is terminal.

## 4. Eligibility rule

A source is eligible for discovery iff:

- `approvalStatus` is `APPROVED` or `ACTIVE`, **and**
- `enabled` is `true`.

The production discovery path (`runApprovedSourceDiscovery`) and the newsroom
bridge (`createNewsroomResearchBridge`) use **only** the registry's eligible
sources. The fixture adapter never participates in either path.

## 5. Source classes and primary-source policy

- Every definition declares a `sourceClass` and `sourceType`.
- A source is primary-class when its publisher or feed reports direct, first-hand
  official material (e.g. `Press Information Bureau`, `USTR`). The predicate
  `sourceIsPrimary(sourceClass)` is the single authority for the primary/secondary
  distinction in the bridge's change classification.
- Primary-source policy follows the Editorial Constitution's evidence hierarchy:
  primary material outranks secondary; corroboration requires independent sources;
  contradictions are surfaced, never merged.

## 6. Feed change policy

- Changing a source's feed URL, publisher, class, or primary status is a
  **governance change**, not a code fix. It must be made in
  `data/research-source-registry.ts` with the `changeLog` entry recording who,
  when, and why.
- A feed whose URL changes without a changeLog entry fails validation.

## 7. Runtime health

The registry tracks runtime health **in memory** (v1 limitation — health is not
persisted; see §11). Classification:

| Status | Condition |
|--------|-----------|
| `HEALTHY` | No recent failures. |
| `DEGRADED` | ≥1 consecutive failure, or average latency > 5000 ms. |
| `FAILING` | ≥3 consecutive failures, or ≥5 total failures. |
| `DISABLED` | Source not enabled. |

Health is fed by the RSS adapter's per-feed `onFeedOutcome` callback, which the
registry wires to `recordFeedOutcome` on every run. The UI surfaces this on the
Research Intelligence pages.

## 8. Failure semantics (partial failure, not substitution)

If an approved feed fails during a run:

- The run records a `PARTIAL` status, the failing feed is surfaced in the
  run's error report, and the source's health is updated.
- **No fabricated content is produced.**
- **No fixture content is substituted.** Fixture gating (`isFixtureEnabled`) is
  restricted to non-production environments and opt-in. Production discovery
  (`NODE_ENV=production`, no override) can never reach the fixture adapter.

## 9. News Intelligence → Research bridge

`createNewsroomResearchBridge` returns a handler compatible with
`NewsroomIntelligenceCore.setResearchBridge`. Behaviour:

1. **Refusal without approved sources:** zero eligible sources → the bridge
   returns without doing anything (the newsroom loop is never blocked).
2. **Trigger gate** (`evaluateResearchTrigger`) — most signals are filtered.
   Precedence: explicit editor hint → P0 BREAKING → P1+primary+independent
   BREAKING → keyword match (court/policy/government) → P1 HIGH_IMPORTANCE →
   P2+contradiction+primary SIGNIFICANT_CLAIM → P2 velocity ≥60
   HIGH_SIGNAL_VELOCITY → P2 novelty ≥60 + independent ≥2 NOVEL_EVENT →
   FILTERED. P3 is always filtered unless a hint is present.
3. **Resolution** (`resolveResearchProject`): an active project whose title or
   registered entities overlap the event is updated in place; a new event with
   no overlap creates a new project. Duplicate research universes are prevented.
4. **Discovery**: approved sources only.
5. **Change classification** (`classifyResearchChange`): `BREAKING_DEVELOPMENT`,
   `MAJOR_CHANGE`, `MEANINGFUL_CHANGE`, `MINOR_CHANGE`, `NO_CHANGE`. Only
   MEANINGFUL/MAJOR/BREAKING surface alerts.
6. **Alert**: an evidence-oriented `ResearchUpdateAlert` listing new primary
   sources, contradictions, resolved gaps, new claims, and breaking developments.

The bridge is **fire-and-forget**: the newsroom core invokes it without awaiting,
and the bridge catches its own errors so a research failure can never disrupt
newsroom ingestion.

## 10. Recommended monitoring cadence

- **Health review:** after each discovery run with failures; weekly otherwise.
- **Source review:** monthly — is each ACTIVE source still needed, current, and
  high quality? Reclassify or retire as warranted.
- **Bridge telemetry:** count gated-filtered vs applied events; ensure applied
  events are rare and justified.

## 11. Documented v1 limitations

- The registry is **code-data** (`data/research-source-registry.ts`), not a
  database table. Changing it requires a PR, not a UI action.
- Runtime health is **in-memory** and resets on process restart. Persisted
  health, approval UI, and per-source quotas are future enhancements.
- `ResearchPersistedState` (the frozen schema) is unchanged: registry state and
  health live outside the persisted snapshot. This is deliberate — schema
  changes are Level C and require a new baseline.

## 12. Change log

| Date | Change | Author |
|------|--------|--------|
| 2026-08-15 | v1.0 created. Seed registry: BBC Business (ACTIVE), BBC World (ACTIVE), The Hindu (ACTIVE), The Guardian World (PROPOSED). Bridge + production discovery shipped. | Editor-in-Chief (initial activation milestone) |
