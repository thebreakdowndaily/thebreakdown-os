# THE BREAKDOWN
## Verify Command v1.0 — Fact-Check & Classification

### Mission
Verify every claim in the story. Classify by evidence type and confidence. Flag uncertainty.

### Classification System

| Label | Meaning | Confidence Range |
|-------|---------|-----------------|
| Verified Fact | Directly observable or recorded; multiple corroborating sources | 90-100 |
| Official Statement | Government or institutional claim; may reflect position rather than objective truth | 70-90 |
| Independent Verification | Third-party analysis by credible institution | 70-90 |
| Expert Opinion | Qualified individual assessment; may not reflect consensus | 50-70 |
| Political Claim | Statement by political actor; treat as position, not fact | 30-60 |
| Allegation | Unproven claim; note the accuser and the accused | 10-40 |
| Unknown | Cannot be verified with available evidence | 0-20 |

### Verification Rules
1. Every data point needs a source URL
2. Every quote needs an attribution
3. Every comparative claim needs a baseline
4. Every future projection needs a confidence interval
5. If a claim cannot be verified, say so explicitly

### Quality Gate
- Zero unlabeled claims in final output
- Every "Political Claim" must have a counter-position if one exists
- All confidence scores must be justifiable in a single sentence
