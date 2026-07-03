# THE BREAKDOWN OS
## Agent Orchestrator — Cache v1.0

### Purpose

The Cache prevents re-executing stages when their inputs haven't changed. If a stage has already been executed with the same inputs, reuse the previous output.

Huge speed improvement.

---

### Cache Key

The cache key is a hash of:

```
cache_key = hash(stage.id + input_signature)
```

Where `input_signature` is a deterministic hash of all input data the stage receives:

```
input_signature = hash(
  stage.depends_on.map(dep => state.getStageOutput(dep))
)
```

If any dependency's output changes, the input signature changes, and the cache is invalidated.

### When Cache Is Checked

```
Before executing any stage:
  │
  1. Compute cache_key from stage.id + current input data
  2. Check if cache_key exists in cache store
  │
  ├── HIT → Load output from cache
  │        → Log: "Cache hit for {stage.id}"
  │        → Skip execution
  │        → Return cached output
  │
  └── MISS → Execute stage normally
           → Save output to cache on completion
```

### When Cache Is Written

```
After successful stage execution:
  │
  1. Compute cache_key
  2. Store output in cache with:
     - key: cache_key
     - value: stage output
     - ttl: settings.cache_ttl_hours (default: 24)
     - timestamp: now
     - metadata: { workflow, stage, input_signature }
```

### Cache Invalidation

| Event | Action |
|-------|--------|
| Stage re-executed with different inputs | New cache entry written. Old entry orphaned. |
| Revision loop triggered | Writer's cache entry is explicitly cleared. |
| Cache TTL expired | Entry ignored. Treated as cache miss. |
| Manual invalidation | `cache.clear(stageId)` — used for debugging. |
| Workflow definition changed | All cache entries invalidated (version check). |

### Cache Storage

```json
{
  "cache/":
    "research-abc123": {        # cache_key = hash(stage_id + input sig)
      "output": { ... },
      "timestamp": 1719763200,
      "ttl": 86400,
      "workflow": "explainer",
      "stage": "research",
      "inputSignature": "abc123"
    },
    "verification-def456": {
      "output": { ... },
      "timestamp": 1719763200,
      "ttl": 86400,
      "workflow": "explainer",
      "stage": "verification",
      "inputSignature": "def456"
    }
}
```

Storage location: `.opencode/workflows/cache/` (filesystem-based for simplicity).

### Cache Benefits by Stage

| Stage | Typical Savings | Why |
|-------|----------------|-----|
| Research | 2–5 min | Same topic researched before |
| Verification | 1–3 min | Same sources verified before |
| Entity | 30–60s | Same entities extracted before |
| Timeline | 30–60s | Same events reconstructed before |
| Knowledge | 1–2 min | Same data synthesized before |
| Editorial Thinking | 30–60s | Same angle considered before |
| Story Architecture | 1–2 min | Same story type designed before |
| Writer | 3–10 min | Same story written before (rare) |
| SEO | 10–30s | Same metadata generated before |
| Visual | 2–5 min | Same charts generated before |

### Cache Invalidation Policy

| Scenario | Invalidate? |
|----------|-------------|
| Same topic, same workflow | Cache HIT |
| Same topic, different workflow | Cache MISS (different stages) |
| New research added | Cache MISS (input signature changed) |
| Revision loop | Writer cache cleared |
| Workflow version changed | All cache cleared |
| Cache older than TTL | Cache MISS |
| Manual purge | All cache cleared |

### Command Reference

```
Cache Operations:
  hit(key)      → boolean
  get(key)      → output | null
  set(key, output, ttl) → void
  clear(stageId) → void
  clearAll()    → void
  stats()       → { entries, hitRate, oldest, newest }
```
