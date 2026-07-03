# THE BREAKDOWN OS
## Agent Orchestrator — Retry Engine v1.0

### Purpose

The Retry Engine handles two scenarios:

1. **Execution Retry** — An agent fails to produce valid output. Re-invoke with the same inputs.
2. **Workflow Revision** — The Editorial Review Agent determines the story needs improvement. Route back to the Writer Agent with a revision plan.

---

### Part 1: Execution Retry

#### When Retries Happen

| Scenario | Retry? | Max Retries | Backoff |
|----------|--------|-------------|---------|
| LLM API timeout | Yes | 2 | 2s, 4s |
| LLM API 5xx error | Yes | 3 | 2s, 4s, 8s |
| LLM API 4xx error | No (check config) | 0 | — |
| Invalid JSON response | Yes | 2 | Immediate |
| Output schema validation fails | Yes | 1 | Immediate |
| Stage timeout exceeded | Yes | stage.retries | 2s, 4s |

#### Per-Agent Retry Configuration

Each agent in the workflow can specify:

```yaml
- id: research
  agent: research-agent
  timeout: 120       # seconds before timeout
  retries: 3          # max retry attempts
  priority: critical  # affects retry urgency
```

Agent defaults from manifest:

```yaml
agents:
  research-agent:
    default_timeout: 120
    default_retries: 3
    priority: critical
```

Stage-level settings override agent defaults.

#### Retry Flow

```
Agent execution fails
  │
  ├── Is error retryable?
  │     ├── Yes → retries_used < max_retries?
  │     │         ├── Yes → Log retry attempt
  │     │         │        → Apply backoff delay
  │     │         │        → Re-invoke with SAME inputs
  │     │         │
  │     │         └── No → Mark stage as failed
  │     │                  → Halt pipeline (or skip if not fail_fast)
  │     │
  │     └── No → Mark stage as failed immediately
  │              → Halt pipeline
```

#### Backoff Strategy

```
Attempt 1: Wait 2 seconds
Attempt 2: Wait 4 seconds
Attempt 3: Wait 8 seconds
```

Formula: `delay = 2^attempt seconds`

For timeout retries: Wait full timeout duration before retrying.

#### Priority-Based Retry

| Priority | Retry Behavior |
|----------|---------------|
| `critical` | Maximum retries, minimum backoff, alert on failure |
| `high` | Standard retries, standard backoff |
| `medium` | Reduced retries, longer backoff |
| `low` | One retry, longest backoff, can be skipped |

#### Non-Retryable Errors

These errors never trigger a retry:

- Agent file not found
- Input contract missing (dependency failed)
- LLM API 4xx (bad request, auth error)
- Invalid workflow configuration
- Circular dependency detected

These require human intervention to fix.

---

### Part 2: Workflow Revision

#### Revision Loop

```
Editorial Review returns revision_required
  │
  ├── Get revision plan from output
  │
  ├── revisionCount < max_attempts?
  │     ├── Yes:
  │     │     1. Increment revisionCount
  │     │     2. Append revisionPlan to writer's input
  │     │     3. Clear writer's output from state
  │     │     4. Clear writer's cache entry
  │     │     5. Route back to writer stage
  │     │     6. Log: "Revision attempt {N} of {M}"
  │     │
  │     └── No:
  │           1. Override decision to rejected
  │           2. Log: "Max revision attempts ({M}) exceeded"
  │           3. Pipeline halts
  │           4. Include full revision history in final state
```

#### Max Attempts Configuration

```yaml
- id: editorial-review
  decisions:
    revision_required:
      route_to: writer
      max_attempts: 3    # ← configurable per workflow
```

Global default from settings:

```yaml
settings:
  max_revision_attempts: 3
```

Different workflows may have different limits:
- Breaking news: 2 attempts (speed matters)
- Investigation: 4 attempts (accuracy matters)

#### Revision Plan

The Editorial Review Agent returns:

```json
{
  "revisionPlan": [
    {
      "priority": "high",
      "agent": "writer",
      "section": "timeline",
      "reason": "Timeline lists events without explaining what triggered the policy change."
    },
    {
      "priority": "medium",
      "agent": "writer",
      "section": "context",
      "reason": "Break paragraph 3 into two paragraphs."
    }
  ]
}
```

The Retry Engine feeds this into the Writer Agent's input:

```
## Revision Instructions

The Editorial Review Agent has requested revisions (attempt 1 of 3):

1. [HIGH] timeline: Timeline lists events without explaining what triggered
   the policy change.

2. [MEDIUM] context: Break paragraph 3 into two paragraphs.

Please address all items above.
```

#### Revision History

Every revision attempt is preserved:

```json
{
  "runId": "run-1719763200",
  "revisionHistory": [
    {
      "attempt": 1,
      "timestamp": 1719763200,
      "revisionPlan": [ ... ],
      "writerOutput": { ... },
      "editorialReview": { ... }
    },
    {
      "attempt": 2,
      "timestamp": 1719763300,
      "revisionPlan": [ ... ],
      "writerOutput": { ... },
      "editorialReview": { ... }
    }
  ]
}
```

---

### Retry vs. Revision — Quick Reference

| | Execution Retry | Workflow Revision |
|--|----------------|-------------------|
| **Trigger** | Agent error, timeout, bad output | Editorial review finds issues |
| **Max attempts** | 1–3 (per error type) | 3 (configurable) |
| **Inputs change?** | No — same inputs | Yes — revision plan appended |
| **Output expected** | Same as original | Improved version |
| **Cache affected?** | No — cache not written on failure | Yes — writer's cache cleared |
| **Pipeline impact** | No — same stage, same position | Yes — loops back to writer stage |

### Escalation

When a stage exhausts all retries, the pipeline escalates:

1. **Log** — Full error details recorded in execution log.
2. **State** — Pipeline state saved with failure details.
3. **Notify** — In development mode, print to console. In production, trigger alert.
4. **Halt** — Pipeline stops. Dependent stages never execute.
