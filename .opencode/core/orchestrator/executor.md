# THE BREAKDOWN OS
## Agent Orchestrator — Executor v2.0

### Purpose

The Executor invokes a single agent stage. It:
1. Resolves the agent config from the agent registry (`agents.json`).
2. Loads the agent's prompt file.
3. Gathers input from all stages listed in `depends_on`.
4. Builds the full execution context.
5. Checks cache — skip if identical inputs produced output before.
6. Invokes the agent (LLM, CLI, or template passthrough).
7. Validates output against the expected schema.
8. Returns output to the Scheduler.

---

### Execution Flow

```
For one stage:
  1. Look up agent in registry → get prompt path, timeout, retries
  2. Load agent prompt (system.md or .md file)
  3. Gather input from depends_on stages
  4. Build context: system + user input + upstream data + instructions
  5. Check cache (skip if unchanged)
  6. Invoke agent via configured provider
  7. Validate output against schema
  8. Return output to scheduler
```

---

### Step 1: Resolve Agent Configuration

The agent registry (`core/registry/agents.json`) provides default configs:

```json
{
  "id": "research-agent",
  "version": "1.0",
  "prompt": ".opencode/agents/research-agent.md",
  "output": "research.schema.json",
  "timeout": 120,
  "retries": 3,
  "required": true
}
```

The Executor merges: **registry defaults** ← **workflow step overrides**

Workflow step overrides take precedence:
```yaml
- id: data-analysis
  agent: research-agent      # same agent as research
  timeout: 180               # but longer timeout
```

#### Agent Path Resolution

| Location | Check Order |
|----------|-------------|
| Directory agent | `.opencode/agents/<agent-id>/system.md` |
| Directory agent | `.opencode/agents/<agent-id>/manifest.yaml` |
| File agent | `.opencode/agents/<agent-id>.md` |

---

### Step 2: Load Agent Prompt

```
Load agent prompt
  │
  ├── If directory agent:
  │     ├── Read system.md → system prompt
  │     ├── If rules.md exists → append as rules section
  │     ├── If examples.md exists → append as examples
  │     └── If manifest.yaml exists → read config
  │
  └── If file agent:
        ├── Extract YAML frontmatter → config
        └── Extract body → system prompt
```

---

### Step 2.5: Resolve Plugin (Research Agent Only)

If the current stage uses the `research-agent` and the user input contains a URL or topic matching a plugin:

```
function resolvePlugin(input):
  for each plugin in .opencode/plugins/*/manifest.yaml:
    if any trigger in plugin.triggers matches input.url or input.keywords:
      return plugin system.md
  
  return null
```

If a plugin matches, its `system.md` is appended as a "Plugin Instructions" block within the context. The plugin's trust tier sets the default source credibility for any data fetched from that domain.

Plugin resolution is automatic — no manual selection needed. The Router's workflow selection already checked plugin triggers; the Executor uses the same plugin metadata to fetch the correct `system.md` for context injection.

---

### Step 3: Gather Input Data

The Executor collects outputs from **all stages listed in `depends_on`**:

```
depends_on: [verification, entity]
  │
  ▼
Gather stage outputs:
  verification → { verifiedFacts: [...], disputedClaims: [...] }
  entity       → { entities: [...], knowledgeGraph: {...} }
  │
  ▼
Build input object:
  {
    "verification": { ... },
    "entity": { ... },
    "revisionPlan": [...]   // included if in revision loop
  }
```

---

### Step 4: Build Context

The full prompt sent to the agent:

```
┌─ SYSTEM PROMPT ───────────────────────────────────────────┐
│ (from agent's system.md or .md file, verbatim)             │
│                                                             │
│ "You are the Research Agent. Gather source material..."     │
├─ PLUGIN INSTRUCTIONS ─────────────────────────────────────┤
│ (if input URL matches a plugin, append that plugin's       │
│  system.md as specialized fetch instructions)               │
│                                                             │
│ "### PIB Plugin                                          │
│  Fetch from pib.gov.in. Each release has a PR ID..."       │
├─ STORY REQUEST ────────────────────────────────────────────┤
│ (original user input: topic, URL, etc.)                    │
│                                                             │
│ "MGNREGA Budget 2026 analysis"                             │
├─ INPUT DATA ───────────────────────────────────────────────┤
│ (outputs from depends_on stages, formatted as JSON)        │
│                                                             │
│ ## verification                                             │
│ { "verifiedFacts": [...], "disputedClaims": [...] }         │
│                                                             │
│ ## entity                                                   │
│ { "entities": [...], "knowledgeGraph": {...} }              │
│                                                             │
│ ## revisionPlan (if revision loop)                          │
│ [ { "priority": "high", "section": "timeline", ... } ]     │
├─ OUTPUT INSTRUCTIONS ──────────────────────────────────────┤
│ Stage: {stage.id}                                           │
│ Output must conform to: {output_schema}                     │
│ Respond with valid JSON only.                               │
│ No markdown wrapping. No explanatory text.                  │
└─────────────────────────────────────────────────────────────┘
```

---

### Step 5: Check Cache

```
if cache.exists(stage.id, inputHash):
  logger.log("Cache hit for {stage.id}")
  return cache.get(stage.id, inputHash)
```

Cache key = `SHA256(stage.id + canonicalJSON(input))`. Cache TTL = 24h (configurable in manifest). Cache is cleared on revision loop for the writer stage.

---

### Step 6: Invoke Agent

The Executor supports multiple invocation methods:

| Method | Configuration | Use Case |
|--------|---------------|----------|
| **OpenAI** | `OPENAI_API_KEY` + `OPENAI_MODEL` | Production |
| **Anthropic** | `ANTHROPIC_API_KEY` + `ANTHROPIC_MODEL` | Production |
| **CLI passthrough** | `ORCHESTRATOR_PROVIDER=cli-passthrough` | Development / debugging |
| **Template** | Default (no env vars) | Testing / dry-run |

#### LLM API Parameters

| Parameter | Value |
|-----------|-------|
| temperature | 0.3 (low for consistency) |
| max_tokens | 8192 |
| response_format | `{ type: "json_object" }` (OpenAI) |

---

### Step 7: Validate Output

```
  Agent response received
    │
    ├── Try JSON.parse(response)
    │     ├── Success → Use parsed object
    │     └── Fail → Try extracting from markdown code block
    │                 ├── Found ```json ... ``` → Parse block
    │                 └── Not found → Return { raw: response }
    │
    ├── Validate against output schema
    │     ├── Valid → Return output
    │     └── Invalid → Log errors + retry once
    │
    └── Return parsed + validated output
```

---

### Step 8: Return Output

The Executor returns `{ stageId, agent, output, tokens, duration }` to the Scheduler, which:
1. Saves output to workflow state.
2. Marks stage as completed.
3. Routes to next stage(s).
4. Saves to cache.

---

### Special: Dual-role Agents

Some step IDs reuse the same agent but with different context:

| Step ID | Agent | Purpose |
|---------|-------|---------|
| `data-analysis` | research-agent | Analyze datasets, find trends in numbers |
| `solutions-research` | research-agent | Find solutions, case studies, expert recommendations |

These steps receive the same research-agent prompt but context instructs them to focus on data or solutions. They are NOT separate agents — they reuse the same prompt file with different system instructions appended by the Executor based on step ID.

---

### Error Handling

| Error | Response |
|-------|----------|
| Agent file not found | Log error + halt pipeline |
| LLM API 4xx | Check config, retry once, then halt |
| LLM API 5xx | Exponential backoff retry (up to retries config) |
| Invalid JSON response | Attempt extraction, retry agent once |
| Stage timeout | Retry once, then halt |
| Output schema invalid | Log specific errors, retry once |
