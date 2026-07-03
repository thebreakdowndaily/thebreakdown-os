# THE BREAKDOWN OS
## Agent Orchestrator — Quality Gates v1.0

### Purpose

Quality Gates are the guardrails of the pipeline. They ensure every story meets THE BREAKDOWN's editorial standards before it reaches the next stage — and especially before publication.

---

### When Quality Is Checked

```
1. Input Validation     → Before executing a stage
   (Does the input data conform to the stage's contract?)

2. Output Validation    → After executing a stage
   (Does the output conform to the stage's schema?)

3. Editorial Review     → After the Writer stage
   (Does the story meet editorial standards for publication?)
```

### Gate 1: Input Validation

Before executing any stage, verify that all required input contracts exist.

**Check:** For each schema in `stage.input_contract`, has a completed stage produced it?

```
input_contract: [research.schema.json, entity.schema.json]
  │
  ├── research.schema.json → produced by: research ✓
  ├── entity.schema.json → produced by: entity ✓
  │
  └── Pass: All required inputs present
```

**Pass:** All required inputs exist and contain data.
**Fail:** Missing input → Halt pipeline. Report which contract is missing.

### Gate 2: Output Schema Validation

After executing any stage, validate the output against its `output_contract`.

**Check:** Does the output conform to the JSON Schema?

**Validation uses:**
- `required` fields must all be present
- Type checks (string, number, array, object)
- Enum values must match
- Minimum/maximum constraints must be satisfied
- Array items must match the schema

**Pass:** Output is valid. Continue to routing.
**Fail:** Output is invalid. Log schema errors. Retry once. If still fails, halt pipeline.

### Gate 3: Editorial Review (The Main Gate)

This is the primary quality gate — the Editorial Review Agent's verdict.

#### Editorial Score Dimensions

| Score | Weight | Measures |
|-------|--------|----------|
| Research | 12% | Breadth and depth of source material |
| Evidence | 15% | How well claims are supported |
| Accuracy | 20% | Factual correctness (highest weight) |
| Structure | 8% | Logical flow and section compliance |
| Readability | 10% | Clarity for target audience |
| Context | 10% | Background and framing |
| VisualPotential | 5% | Opportunities for visual storytelling |
| Originality | 8% | Fresh angle or new information |
| Trust | 12% | Overall confidence in reliability |

#### Overall Score

```
Overall = (Accuracy × 0.20) + (Evidence × 0.15) + (Research × 0.12) +
          (Trust × 0.12) + (Readability × 0.10) + (Context × 0.10) +
          (Structure × 0.08) + (Originality × 0.08) + (VisualPotential × 0.05)
```

#### Quality Gate Thresholds

These are absolute. No exceptions.

| Gate | Minimum | Why |
|------|---------|-----|
| Research | 90 | Without deep research, the story lacks authority |
| Evidence | 90 | Without solid evidence, the story lacks credibility |
| Accuracy | 95 | A single factual error damages trust irreparably |
| Readability | 90 | If readers can't follow it, it doesn't matter |
| Trust | 95 | If we can't trust it, we don't publish it |
| Context | 90 | Without context, readers can't understand why it matters |

**If any gate score is below the minimum, the story is rejected.** Not revision. Rejection.

#### Workflow-Specific Overrides

Some workflows require higher standards:

```yaml
# investigation.yaml
- id: editorial-review
  quality_overrides:
    accuracy_minimum: 98
    evidence_minimum: 95
    trust_minimum: 97
```

| Workflow | Accuracy | Evidence | Trust | Reason |
|----------|----------|----------|-------|--------|
| Breaking | 90 | 85 | 90 | Speed over depth |
| Explainer | 95 | 90 | 95 | Standard |
| Investigation | 98 | 95 | 97 | Maximum rigor |
| Policy | 95 | 90 | 95 | Standard |
| Data | 95 | 95 | 95 | Numbers must be right |
| Fix | 95 | 90 | 95 | Standard |

#### Decision Thresholds

| Score Range | Gate Status | Action |
|-------------|-------------|--------|
| ≥ 85 | All gates pass, all checklist true | Approved |
| 80–84 | All gates pass, minor checklist gaps | Revision Required |
| < 80 | Any gate fails | Rejected |
| Any | Critical issue exists | Rejected |
| Any | Bias detected | Rejected |

### Gate Bypass

Under no circumstance may a quality gate be bypassed in production. However:

| Mode | Behavior | How to Activate |
|------|----------|-----------------|
| **Development** | Gate failures produce warnings, not halts | `ORCHESTRATOR_ENV=development` |
| **Emergency** | Gates lowered by 5 points for speed | `ORCHESTRATOR_EMERGENCY=true` |
| **Manual override** | Human editor can force-publish | `force_publish: true` in config |

All bypasses are logged and audited.

### Gate Audit Trail

Every gate check produces a record:

```json
{
  "runId": "run-1719763200",
  "stageId": "writer",
  "checkType": "output_validation",
  "schema": "writer.schema.json",
  "passed": true,
  "errors": [],
  "timestamp": 1719763200
}
```

These records are stored in the workflow's final state file, forming a complete audit trail.

### Quick Reference

| Gate | When | What Happens on Fail |
|------|------|---------------------|
| Input contract | Before stage execution | Pipeline halts, missing input reported |
| Output schema | After stage execution | Stage retried once, then halts |
| Editorial review | After writer stage | Story rejected or revision requested |
| Research gate | Editorial review | Story rejected |
| Evidence gate | Editorial review | Story rejected |
| Accuracy gate | Editorial review | Story rejected |
| Readability gate | Editorial review | Story rejected |
| Trust gate | Editorial review | Story rejected |
| Context gate | Editorial review | Story rejected |
