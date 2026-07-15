# Status Machine

Every stage in every workflow returns a status. The Editorial Conductor reads the status and decides the next action. No stage advances itself — the Conductor owns routing.

---

## Status Values

| Status | Meaning | Who Sets |
|--------|---------|----------|
| `PENDING` | Stage has not started. Inputs may not be ready. | Conductor |
| `RUNNING` | Stage is actively being worked. | Role assigned to stage |
| `PASSED` | Stage complete. Quality gate passed. All outputs ready. | Role assigned to stage |
| `FAILED` | Stage complete. Quality gate not passed. Outputs may be partial or missing. | Role assigned to stage |
| `REVISION_REQUIRED` | Downstream stage found issues that require this stage to redo part of its work. | Conductor |
| `BLOCKED` | Stage cannot proceed because dependencies are not met. | Role assigned to stage |
| `SKIPPED` | Stage was bypassed by authorised exception. | Conductor |

---

## Routing Rules

```
Current Status        Conductor Action
─────────────         ───────────────
PENDING               →   Check dependencies.
                        If met: set RUNNING, assign to role.
                        If not met: set BLOCKED, escalate.

RUNNING               →   Wait. No action until stage signals completion.

PASSED                →   Verify quality gate.
                        If gate passes: advance to next stage (set next to RUNNING).
                        If gate fails: override to FAILED, return to current role.

FAILED                →   Determine return stage.
                        If failure is in current stage work: return to current stage, set PENDING.
                        If failure cascades from upstream: return to upstream stage, set REVISION_REQUIRED.

REVISION_REQUIRED     →   Return to specified stage, set PENDING.
                        Attach revision brief: what failed, what is required.

BLOCKED               →   Escalate to affected upstream stages.
                        Blocked stage stays BLOCKED until dependencies resolve.

SKIPPED               →   Set deferred tasks as post-publication remediations.
                        Advance to next stage.
```

---

## Routing Matrix

Each status produces a specific next action. No interpretation — the matrix is the rule.

```
┌────────────────────┬────────────────────┬─────────────────────┐
│ Stage Returns      │ Conductor Routes   │ Next State          │
├────────────────────┼────────────────────┼─────────────────────┤
│ PASSED             │ → Next Stage       │ Next: RUNNING       │
│ FAILED             │ → Same Stage       │ Current: PENDING    │
│ FAILED (3x)        │ → Escalate to EiC  │ Current: BLOCKED    │
│ REVISION_REQUIRED  │ → Upstream Stage   │ Upstream: PENDING   │
│ BLOCKED            │ → Escalate         │ Current: BLOCKED    │
│ SKIPPED            │ → Next Stage       │ Current: SKIPPED    │
└────────────────────┴────────────────────┴─────────────────────┘
```

---

## Stage Lifecycle

```
PENDING ──→ RUNNING ──→ PASSED ──→ (advance)
                         │
                         └──→ FAILED ──→ PENDING (retry)
                         │
                         └──→ FAILED (3x) ──→ BLOCKED (escalate)

PENDING ──→ RUNNING ──→ FAILED ──→ REVISION_REQUIRED (upstream) ──→ PENDING

BLOCKED ──→ (dependencies resolve) ──→ PENDING
```

---

## Status Flow: Example

```
Conductor:        Research Director → RUNNING
Researcher:       (working) → PASSED
Conductor:        Gate: source list adequate ✓ → Source Verification → RUNNING
Verifier:         (working) → FAILED
Conductor:        Gate: 3 sources failed verification. Return to Research Director → REVISION_REQUIRED
Conductor:        Research Director → PENDING (with revision brief)
Researcher:       (revision) → PASSED
Conductor:        Gate: sources replaced ✓ → Source Verification → RUNNING
...
```

---

## Status Record

Every status transition is recorded with:
- Timestamp
- Stage name
- Previous status
- New status
- Role or person responsible
- Brief rationale

The status record forms the production log for each chapter. No status change is silent.

---

## Conductor Authority

The Conductor may override a status only in these cases:

- **Override PASSED → FAILED**: Gate check discovered issues the stage missed. Document what was missed.
- **Override FAILED → BLOCKED**: Same stage failed 3 consecutive times. Escalation required before another attempt.
- **Override any → SKIPPED**: Editor-in-Chief authorisation required. Document which gates were skipped and set post-publication remediation tasks.

The Conductor may not override a PASSED status to advance a chapter that has not passed gate. That is not routing — that is bypassing quality.
