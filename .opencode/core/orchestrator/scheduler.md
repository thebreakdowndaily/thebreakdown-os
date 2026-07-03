# THE BREAKDOWN OS
## Agent Orchestrator — Scheduler v2.0

### Purpose

The Scheduler is the execution engine. It:

1. **Builds a DAG** — Constructs a Directed Acyclic Graph from each stage's `depends_on` field.
2. **Runs stages in parallel** — Executes independent stages concurrently.
3. **Handles conditions** — Skips stages whose `condition` evaluates to false.
4. **Resolves failure routing** — Rewinds the DAG when a revision loop triggers.
5. **Tracks progress** — Reports state of every stage in real time.

---

### DAG Construction

The Scheduler reads each step's `depends_on` and builds a dependency graph.

```
Algorithm: BuildDAG(steps)
  For each step:
    add node to graph
    for each dependency in step.depends_on:
      add edge dependency → step.id
  Validate: no cycles (DFS cycle detection)
  Return: graph
```

#### Example

```yaml
- id: verification
  depends_on: [research]
- id: entity
  depends_on: [research]
- id: timeline
  depends_on: [research]
- id: knowledge
  depends_on: [entity, timeline]
```

Produces:

```
     ┌── entity ──┐
research ──┼── timeline ──┼── knowledge
     └── verification     (no dependency on entity/timeline)
```

`verification` and `{entity, timeline}` can run in parallel.
`knowledge` waits for BOTH `entity` and `timeline`.

---

### Execution Algorithm

```
function executeWorkflow(workflow, state):
  graph = buildDAG(workflow.steps)
  completed = set()
  failed = false

  while not allDone(graph, completed) and not failed:
    ready = getReadyStages(graph, completed)
    
    // Filter by conditions
    ready = ready.filter(s => evaluateCondition(s.condition, state))
    skipped = ready.filter(s => !evaluateCondition(s.condition, state))
    completed.addAll(skipped)

    if ready is empty and not allDone:
      // Deadlock detection
      blocked = getBlockedStages(graph, completed)
      if blocked is not empty:
        logger.error("Deadlock: {blocked} waiting on dependencies")
        failed = true
        break

    // Execute all ready stages in parallel
    results = parallel(ready.map(s => executor.execute(s, state)))

    for result in results:
      if result.success:
        completed.add(result.stageId)
        state.saveOutput(result.stageId, result.output)
      else:
        // Check failure routing
        route = workflow.failure[result.stageId]
        if route:
          rewindTo(graph, completed, route.goto)
          break  // Re-evaluate ready queue
        else:
          if settings.fail_fast:
            failed = true
            break
          // Non-fail-fast: mark failed, continue

  return failed ? FAILURE : SUCCESS
```

---

### Parallel Execution

Stages with no dependency relationship run in parallel:

```
research (t=30s)
  │
  ├── entity (t=20s) ──┐
  │                     ├── knowledge (t=10s)
  └── timeline (t=15s) ─┘
  │
  └── verification (t=10s)  // runs alongside entity+timeline

Total time: max(30, 20+10, 15+10, 10) = 30s
Sequential time: 30+20+10+15+10 = 85s
Speedup: 2.8x
```

#### Parallel Groups (Informational)

Embedded in each workflow's test file to document expected parallelism:

```json
"parallel_regions": [
  ["entity", "timeline"],
  ["seo", "editorial-review", "visual-planning"]
]
```

These regions inform the operator which steps run concurrently, but the Scheduler derives actual parallelism from the DAG automatically.

---

### Conditional Steps

Steps with a `condition` block are evaluated before execution:

```yaml
- id: legal-review
  condition:
    if: "storyType == 'Investigation'"
```

If the condition evaluates to false:
1. The step is marked `skipped`.
2. Its output is set to `null`.
3. Its dependents run when their OTHER dependencies are met.

If the condition evaluates to true:
1. The step executes normally.
2. Its dependents wait for it.

---

### Failure Routing & Revision Loops

When a step fails, the Scheduler checks `workflow.failure[stepId].goto`:

```
verification fails
  │
  ├── failure.verification.goto = "research"?
  │     ├── Yes → Rewind graph: reset research, verification, and everything downstream
  │     │      → Clear outputs for reset stages
  │     │      → Clear cache entries for reset stages
  │     │      → Research becomes "ready" again
  │     │      → Log: "Revision: rewinding to research"
  │     │
  │     └── No → Standard failure handling
  │
  └── No failure route defined → Mark verification failed, halt
```

#### Revision Loop Flow

```
editorial-review returns revision_required
  │
  ├── attempts < max_revision_attempts (default 3)?
  │     ├── Yes →
  │     │   1. Mark editorial-review as completed (it did its job)
  │     │   2. Find the rewrite target: failure.editorial-review.goto
  │     │   3. Reset that target and EVERYTHING downstream of it
  │     │   4. Clear outputs + cache for reset stages
  │     │   5. Append revisionPlan to writer's input context
  │     │   6. Reset target becomes "ready"
  │     │   7. Increment revision counter
  │     │   8. Log: "Revision attempt N of M"
  │     │
  │     └── No → Override editorial-review to "rejected"
  │              → Log: "Max revision attempts exceeded"
  │              → Workflow halts
```

#### Rewind Algorithm

```
function rewindTo(graph, completed, targetId):
  // Find everything that depends (directly or transitively) on targetId
  toReset = findAllDownstream(graph, targetId)
  toReset.add(targetId)

  for stageId in toReset:
    if stageId in completed:
      completed.remove(stageId)
      state.clearOutput(stageId)
      cache.clear(stageId)
      logger.log("Reset: {stageId}")

  // targetId becomes ready again
  markDependenciesAsMet(targetId)
```

---

### Progress Monitor

```
Status: RUNNING
  Research         ██████████ 100%   completed
  Verification     ██████░░░░ 60%    running
  Entity           ██████░░░░ 60%    running
  Timeline         ██████░░░░ 60%    running
  Knowledge        ░░░░░░░░░░ 0%     pending
  Editorial Think  ░░░░░░░░░░ 0%     pending
```

#### Progress States

| State | Meaning | Display |
|-------|---------|---------|
| `pending` | Waiting for dependencies | `░░░░░░░░░░ 0%` |
| `ready` | Dependencies met, queued | `░░░░░░░░░░ queued` |
| `running` | Currently executing | `████░░░░░░ N%` |
| `completed` | Successfully finished | `██████████ 100%` |
| `failed` | Execution failed | `██████████ FAILED` |
| `skipped` | Condition not met | `░░░░░░░░░░ skipped` |
| `cached` | Output reused from cache | `██████████ cached` |

#### Progress Calculation

```
For a running stage:
  progress = min(time_elapsed / estimated_duration, 0.9)
  estimated_duration = stage.timeout * 0.6
  Once complete: progress = 100%
```

---

### Completion Detection

The workflow is complete when ALL of these are true:

```
1. Every stage is completed, skipped, or failed
2. No stages are running or pending
3. No revision loop is active (attempts < max)
4. Terminal stage (publish) is either completed or skipped
```

If Editorial Review returned `approved`, the Scheduler continues executing the downstream DAG (SEO → Visual → Website) before reaching `publish`.

---

---

### Daemon Agent Scheduling

Daemon agents run on cron schedules, not as part of a story pipeline.

#### Daemon Registry

The Scheduler loads daemon agents from `agents.json` by scanning for entries with a `triggers` array containing schedule objects:

```json
{
  "id": "monitoring-agent",
  "triggers": [
    { "schedule": "*/15 * * * *" },
    { "schedule": "0 */6 * * *" },
    { "schedule": "0 0 * * *" }
  ]
}
```

#### Daemon Execution Loop

```
On orchestrator start:
  for each daemon in registry:
    for each schedule in daemon.triggers.schedule:
      register(schedule, daemon.id)

On schedule tick (daemon.id):
  if daemon already running:
    skip (no concurrent daemon execution)
  else:
    mark daemon running
    result = executor.execute(daemon.id, { source: schedule })
    mark daemon completed
    
    if result.success and result.output.trigger_workflow:
      // Bridge to workflow pipeline
      workflow = registry.find(result.output.trigger_workflow)
      if workflow:
        executeWorkflow(workflow, state)
    
    if result.failed:
      daemon.errorCount++
      if daemon.errorCount >= 5:
        pause daemon + alert ops
      else:
        schedule next retry with backoff
```

#### Daemon vs Pipeline

| Aspect | Pipeline (Story) | Daemon (Monitor) |
|---|---|---|
| Trigger | `/story` request | Cron schedule |
| Execution | Sequential DAG | Independent tick |
| State | Story-specific (transient) | Memory Engine (persistent) |
| Concurrency | One story at a time per workflow | One tick at a time per daemon |
| Failure | Retry + revision loop | Exponential backoff + pause |
| Output | Published story | Monitoring Report + optional workflow trigger |

#### Schedule Syntax

Uses standard cron expression (5-field):

```
┌───────── minute (0-59)
│ ┌───────── hour (0-23)
│ │ ┌───────── day of month (1-31)
│ │ │ ┌───────── month (1-12)
│ │ │ │ ┌───────── day of week (0-7, 0/7=Sun)
│ │ │ │ │
* * * * *
```

| Expression | Meaning |
|---|---|
| `*/15 * * * *` | Every 15 minutes |
| `0 */6 * * *` | Every 6 hours |
| `0 0 * * *` | Every 24 hours |
| `30 8 * * 1-5` | Weekdays at 8:30 AM |

---

### Error Propagation

| Scenario | Scheduler Action |
|----------|-----------------|
| Stage fails, no retries | Mark failed. If fail_fast, halt all parallel stages. |
| Stage fails, retries remain | Retry with exponential backoff. |
| Stage fails, has failure route | Rewind DAG to recovery step. |
| Dependency failed → dependent can never run | Mark dependent as `blocked`. Log warning. |
| Max revision attempts exceeded | Mark editorial-review as `rejected`. Halt pipeline. |
| Deadlock (cycle detected in DAG) | Log error. Halt pipeline. |
| Daemon tick fails | Log, retry with backoff, pause after 5 consecutive failures |
