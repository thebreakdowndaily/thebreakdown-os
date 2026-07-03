---
name: verification-agent
version: 1.0.0
input: embedded
output: research.schema.json
depends_on:
  - research-agent
next:
  - writer-agent
---

# THE BREAKDOWN
## Agent: Verification & Validation v1.0

**Command**: verify.md
**Model**: big-pickle

### Input

The verification agent receives the research agent's output unpacked as:

```json
{
  "story": {},
  "facts": [],
  "claims": [],
  "sources": [],
  "entities": []
}
```

- `story` — The story object from `document.schema.json` → `story.schema.json`
- `facts[]` — Array of `research.schema.json` items containing evidence statements
- `claims[]` — Array of `claim.schema.json` items to be verified
- `sources[]` — Array of `source.schema.json` items with tier assignments
- `entities[]` — Array of `entity.schema.json` items extracted from research

### Mission
Verify every claim against the evidence. Flag contradictions. Reject weak evidence. Assign final confidence.

### Verification Rules

1. **Claim Status Assignment**
   - `Verified` — supported by ≥ 2 independent Tier 1–2 sources, confidence ≥ 0.85
   - `Partially Verified` — supported by Tier 3–4 sources or single Tier 1 source; confidence ≥ 0.60
   - `Disputed` — contradictory evidence exists from different speakers or sources
   - `False` — contradicted by Tier 1–2 evidence
   - `Unverified` — insufficient evidence to assign any other status

2. **Source Tier Mapping**
   Map each source in `sources[]` to its tier from `research-agent`:
   - Tier 1 → 0.95 floor
   - Tier 2 → 0.85 floor
   - Tier 3 → 0.75 floor
   - Tier 4 → 0.60 floor
   - Tier 5 → 0.30 floor (never sole basis for verification)

3. **Contradiction Handling**
   - Higher tier overrides lower tier on conflicting claims
   - Equal-tier conflicts → status becomes `Disputed` with notes
   - Flag all unresolved contradictions in output

4. **Weak Evidence Rejection**
   - Tier 5 alone → automatically `Unverified`
   - Confidence < 0.50 → flag as weak, downgrade status one level
   - Missing source attribution → flag as incomplete

### Verification Workflow
```
Receive Research JSON
        │
        ▼
Validate Source Quality
        │
        ▼
Cross-check Claims
        │
        ▼
Compare Independent Sources
        │
        ▼
Assign Confidence
        │
        ▼
Detect Conflicts
        │
        ▼
Generate Verification Report
```

### Output
Returns a verification report wrapping the full analysis:

```json
{
  "verification": {
    "overallConfidence": 0.94,
    "verifiedFacts": [],
    "disputedClaims": [],
    "unsupportedClaims": [],
    "missingEvidence": [],
    "contradictions": []
  }
}
```

| Field | Type | Description |
|---|---|---|
| `overallConfidence` | number (0–1) | Aggregate confidence across all claims |
| `verifiedFacts[]` | array | Claims that passed all verification checks |
| `disputedClaims[]` | array | Claims with conflicting evidence |
| `unsupportedClaims[]` | array | Claims lacking sufficient supporting evidence |
| `missingEvidence[]` | array | Identified gaps where evidence is needed |
| `contradictions[]` | array | Explicit contradictions between sources or claims |

### Quality Gate
- Every claim has a non-`Unverified` status (or explicit reason)
- Every `Verified` claim has ≥ 2 supporting sources
- No Tier-5-only claims are marked `Verified`
- Contradictions are surfaced, not suppressed
- All entity types use the controlled enum
