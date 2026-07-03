# THE BREAKDOWN OS
## Agent Orchestrator — Execution Log v1.0

### Purpose

The Logger records everything that happens during a workflow execution. Every stage execution, every decision, every error, every cache operation — saved as a structured log.

Users love seeing progress. Developers need to debug failures. The Execution Log serves both.

---

### Per-Stage Log Entry

Every stage execution produces a log entry:

```json
{
  "timestamp": "2026-07-01T10:30:00Z",
  "workflow": "explainer",
  "runId": "run-1719763200",
  "stage": "research",
  "agent": "research-agent",
  "status": "completed",
  "duration": 45.2,
  "durationUnit": "seconds",
  "tokensIn": 1250,
  "tokensOut": 8400,
  "cacheHit": false,
  "retryAttempt": 0,
  "error": null,
  "outputSummary": {
    "sourceCount": 24,
    "tier1Count": 12,
    "entitiesFound": 8
  }
}
```

### Log Fields

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | ISO 8601 | When the stage completed |
| `workflow` | string | Workflow name (breaking, explainer, etc.) |
| `runId` | string | Unique run identifier |
| `stage` | string | Stage ID from workflow |
| `agent` | string | Agent name |
| `status` | enum | `running`, `completed`, `failed`, `skipped`, `cached`, `retrying` |
| `duration` | number | Execution time in seconds |
| `tokensIn` | number | Input tokens (for LLM calls) |
| `tokensOut` | number | Output tokens (for LLM calls) |
| `cacheHit` | boolean | Whether output was loaded from cache |
| `retryAttempt` | integer | 0 = first attempt, 1+ = retry |
| `error` | string | Error message if failed, null if successful |
| `outputSummary` | object | Stage-specific summary (varies by stage) |

### Progress Display

While the workflow is running, the Logger provides real-time progress:

```
Status: RUNNING
  Workflow: Explainer — MGNREGA Budget 2026
  Run ID: run-1719763200
  ─────────────────────────────────────────────
  Research        ██████████ 100%  45.2s  8.4K tokens
  Verification    ██████░░░░ 60%   22.1s  3.2K tokens
  Entity          ████░░░░░░ 40%   15.8s  2.1K tokens
  Timeline        ░░░░░░░░░░ waiting
  Knowledge       ░░░░░░░░░░ waiting
  ─────────────────────────────────────────────
  Elapsed: 83.1s  |  Stages: 4/12  |  Cache hits: 0
```

### Progress Calculation

```
For running stage:
  progress = min(elapsed / estimatedDuration, 0.9)
  estimatedDuration = stage.timeout * 0.6

For queued stage:
  progress = 0

For completed stage:
  progress = 100

For cached stage:
  progress = 100 (instant)

For failed stage:
  progress = 100 (with FAILED marker)

For skipped stage:
  progress = 0 (with skipped label)
```

### Log Storage

```
.opencode/
  workflows/
    logs/
      run-1719763200.log       ← JSON Lines format, one entry per stage
      run-1719763300.log
      ...
```

### Log Format: JSON Lines

Each log file is JSON Lines (one JSON object per line):

```
{"timestamp":"2026-07-01T10:30:00Z","stage":"research","status":"running","duration":0,...}
{"timestamp":"2026-07-01T10:30:45Z","stage":"research","status":"completed","duration":45.2,...}
{"timestamp":"2026-07-01T10:30:46Z","stage":"verification","status":"running","duration":0,...}
{"timestamp":"2026-07-01T10:31:08Z","stage":"verification","status":"completed","duration":22.1,...}
```

### Log Aggregation

After the workflow completes, the Logger aggregates:

```json
{
  "runId": "run-1719763200",
  "workflow": "explainer",
  "story": "MGNREGA Budget 2026",
  "totalDuration": 543.2,
  "totalTokensIn": 15200,
  "totalTokensOut": 84500,
  "totalCost": 1.27,
  "stagesCompleted": 12,
  "stagesFailed": 0,
  "stagesCached": 2,
  "cacheHitRate": "16.7%",
  "revisionCount": 0,
  "finalVerdict": "approved",
  "finalScore": 94
}
```

### Log Retention

| Environment | Retention | Purpose |
|-------------|-----------|---------|
| Development | 7 days | Debugging |
| Staging | 30 days | Testing |
| Production | 90 days | Audit trail |

### Log Viewer Commands

```
View logs:
  tail -f .opencode/workflows/logs/run-1719763200.log

Search logs:
  grep '"status":"failed"' .opencode/workflows/logs/*.log

Aggregate stats:
  jq -s 'group_by(.stage) | map({stage: .[0].stage, avg_duration: map(.duration) | add/length})' .opencode/workflows/logs/run-1719763200.log

Watch running workflow:
  watch -n 2 'tail -5 .opencode/workflows/logs/run-1719763200.log | jq .'
```

### Log Levels

| Level | When Used |
|-------|-----------|
| `INFO` | Stage started, completed, skipped, cached |
| `WARN` | Retry attempt, minor validation warning, cache TTL expired |
| `ERROR` | Stage failed, validation failed, API error |
| `DEBUG` | Full prompt text, full response text, dependency resolution |
