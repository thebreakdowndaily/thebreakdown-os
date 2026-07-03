# THE BREAKDOWN OS
## Agent Orchestrator — Router v2.0

### Purpose

The Router has two responsibilities:

1. **Workflow Selection** — Analyze the incoming `/story` request. Match it to a workflow from the workflow registry based on content type and keywords.
2. **Decision Routing** — After each stage completes (especially editorial review), determine which stage to execute next. Handle branching for revision loops.

---

### Part 1: Workflow Selection

The Router does NOT hardcode workflow names. It reads the workflow registry at `.opencode/core/registry/workflows.json` and matches input against each workflow's `triggers` list.

```
/story
  │
  ▼
Detect Input Type
  │
  ├── URL → Extract domain + path
  │         ├── Known domain? → Check plugin registry
  │         │   ├── pib.gov.in → PIB Plugin → match workflow triggers
  │         │   ├── eci.gov.in → Election Commission Plugin → match workflow triggers
  │         │   ├── rbi.org.in → RBI Plugin → match workflow triggers
  │         │   ├── sansad.in → Parliament Plugin → match workflow triggers
  │         │   ├── egazette.gov.in → Gazette Plugin → match workflow triggers
  │         │   ├── worldbank.org → World Bank Plugin → match workflow triggers
  │         │   ├── imf.org → IMF Plugin → match workflow triggers
  │         │   └── who.int → WHO Plugin → match workflow triggers
  │         │
  │         ├── youtube.com / youtu.be → Transcribe → match triggers
  │         ├── instagram.com → Scrape → match triggers
  │         ├── x.com → Scrape → match triggers
  │         ├── *.gov.in → Fetch → match triggers
  │         ├── *.pdf → Extract text → match triggers
  │         └── other → Fetch → extract keywords → match triggers
  │
  ├── Topic → Extract keywords → match triggers
  │
  └── Unknown → Default workflow
```

#### Plugin-aware Detection

The orchestrator loads all plugins from `.opencode/plugins/*/manifest.yaml`. Each plugin declares `triggers` (keywords and domains). If the input URL's domain matches a plugin trigger, the plugin's `system.md` is passed to the research agent as specialized fetch instructions.

Plugin trust tiers map directly to the source tier system (Tier 1 = 0.95, Tier 2 = 0.80).

#### Detection Rules

| Input | Pattern | Action |
|-------|---------|--------|
| URL matching plugin domain | `pib.gov.in`, `eci.gov.in`, etc. | Plugin fetch + match workflow triggers |
| URL ending in `.pdf` | `*.pdf` | Extract text |
| YouTube URL | `youtube.com/*`, `youtu.be/*` | Transcribe audio |
| Instagram URL | `instagram.com/*` | Scrape post + comments |
| X/Twitter URL | `x.com/*` | Scrape thread |
| Government URL | `*.gov.in/*` | Fetch full page |
| Topic string | — | Extract keywords |
| No match | — | Use default workflow |

#### Workflow Matching Algorithm

```
function selectWorkflow(input, registry):
  keywords = extractKeywords(input)
  
  bestMatch = null
  highestScore = 0
  
  for workflow in registry:
    score = countMatchingTriggers(keywords, workflow.triggers)
    if score > highestScore:
      highestScore = score
      bestMatch = workflow

  if highestScore == 0:
    return registry.find(w => w.id == "explainer")  // default
  
  return bestMatch
```

The workflow registry defines triggers per workflow:

```json
[
  { "id": "breaking-news", "triggers": ["news", "breaking", "event", "update"] },
  { "id": "fact-check", "triggers": ["fact-check", "claim", "verify", "misleading"] },
  { "id": "investigation", "triggers": ["corruption", "scandal", "probe"] }
]
```

#### Input Pre-processing

| Input Type | Pre-processing | Output |
|------------|---------------|--------|
| URL (article) | Fetch HTML, extract article text | `{ url, title, content, domain }` |
| URL (PDF) | Download, extract text | `{ url, title, content, pages }` |
| YouTube | Download transcript | `{ url, title, transcript, duration }` |
| Instagram | Scrape post text, comments | `{ url, poster, content, engagement }` |
| X/Twitter | Scrape thread, replies | `{ url, author, thread, engagement }` |
| Topic | Search web, compile results | `{ query, results[], snippets[] }` |

---

### Part 2: Decision Routing

After each stage completes, the Router determines what runs next.

```
Stage completes with output
  │
  ├── Is this stage a decision_point?
  │     ├── Yes → Read decision from output.status
  │     │         ├── "approved" → Route to failure.goto
  │     │         ├── "revision_required" → Route to failure.goto
  │     │         │     → Attach revisionPlan to writer input
  │     │         │     → Increment revision counter
  │     │         └── "rejected" → Route to null (workflow ends)
  │     │
  │     └── No → Follow depends_on graph (handled by Scheduler)
  │
  └── If no next stages → Workflow complete
```

#### Failure Routing

Each workflow defines `failure:` rules mapping a step to its recovery step:

```yaml
failure:
  verification:
    goto: research
  editorial-review:
    goto: writer
  legal-review:
    goto: editor
```

When a step fails, the Router returns `{ goto: "writer" }`. The Scheduler rewinds the graph to that step.

#### Decision Routing for Editorial Review

The Router reads the Editorial Review Agent's output:

```json
{
  "status": "approved",
  "score": 94,
  "issues": [],
  "revisionPlan": [],
  "checklist": { ... }
}
```

| Output Field | Route To |
|-------------|----------|
| `status: "approved"` | Continue to next in DAG |
| `status: "revision_required"` | Route to writer via `failure.editorial-review.goto` |
| `status: "rejected"` | `null` (workflow halts) |

#### Revision Loop Logic

```
editorial-review returns revision_required
  │
  ├── attempts < max_revision_attempts (manifest setting, default 3)?
  │     ├── Yes → Route to writer
  │     │      → Append revisionPlan to writer's input
  │     │      → Clear writer's cache entry
  │     │      → Log: "Revision attempt N of M"
  │     │
  │     └── No → Override to rejected
  │              → Log: "Max revision attempts exceeded"
  │              → Workflow halts
```

#### Conditional Routing

Steps with a `condition` block are evaluated at route time:

```yaml
- id: legal-review
  agent: legal-review-agent
  condition:
    if: "storyType == 'Investigation'"
```

The Router evaluates the condition. If false, the step is marked `skipped` and its dependents check if all their other dependencies are met.

---

### Part 3: Daemon Agents (Scheduled / Event-driven)

Some agents do not run as part of a story pipeline. They run continuously or on a schedule.

#### Daemon Agent Registry

Daemon agents are registered in `agents.json` with a `triggers` block:

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

The Scheduler manages these agents separately from story workflows, invoking them on their cron schedule.

#### Event Bridge: Daemon → Workflow

When a daemon agent produces an output that matches a workflow trigger, the Router bridges it:

```
Daemon agent completes → output contains { trigger_workflow: "update-story" }
  │
  ├── Look up workflow in registry
  ├── Create execution context from daemon output
  ├── Route to workflow (skip research/verification/entity/timeline)
  └── Add workflow to execution queue
```

The `update-story` workflow in `workflows.json` declares:

```json
{
  "id": "update-story",
  "triggers": ["change_detected", "monitor", "update", "story-update"],
  "source": "monitoring-agent"
}
```

The `source` field tells the Router to expect this trigger from a daemon agent, not from a `/story` request.

#### Daemon Lifecycle

```
Orchestrator starts
  │
  ├── Load daemon agent registry
  ├── Register cron schedules with Scheduler
  ├── For each daemon:
  │     ├── On schedule: invoke agent
  │     ├── On event (from agent output): bridge to workflow
  │     └── On failure: log + retry (or notify ops)
  │
  └── Daemons run independently of story pipelines
```

Daemon agents are non-blocking. They do not block story pipelines. They share the Memory Engine and Knowledge Graph as persistent state.

#### Current Daemon Agents

| Agent | Schedule | Trigger Event | Target Workflow |
|---|---|---|---|
| monitoring-agent | */15 min, */6h, /24h | `change_detected` | update-story |

---

### Part 4: Edge Cases

| Scenario | Behavior |
|----------|----------|
| Step failed with no `failure.goto` | Log error, halt pipeline |
| Route target does not exist in workflow | Log error, halt pipeline |
| Multiple route targets | Scheduler handles — adds all to ready queue |
| Route back to writer, writer not in workflow | Log error, halt pipeline |
| Daemon agent fails continuously (>5x) | Alert ops, pause daemon, manual restart required |
| Daemon output triggers workflow that is already running for same story | Queue update, no concurrent execution |
