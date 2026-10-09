# THE BREAKDOWN OS — CONTINUOUS NEWSROOM OPERATING MANUAL

**Version:** 1.0  
**Status:** Living Institutional Standard — Editorial & Engineering Operating Doctrine  
**Governing Documents:** `AGENTS.md`, `docs/editorial/editorial-constitution.md`, `docs/product-quality.md`

---

## 1. Operating Doctrine & Philosophy

The Breakdown is **not** a conventional breaking-news portal or opinion aggregator. It is a **Knowledge Operating System for Understanding India**.

Every observation, signal, claim, and publication must conform to the tenet:
> **Transform information into verified, structural understanding.**

The platform operates as a continuous, self-updating, self-reconciling operating loop that connects real-world upstream evidence changes to rigorous human editorial review, permanent knowledge graphs, and cross-surface reader touchpoints.

---

## 2. The 10-Stage Continuous Operating Loop

The continuous newsroom operating system executes in ten deterministic stages:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   THE 10-STAGE CONTINUOUS OPERATING LOOP               │
└────────────────────────────────────────────────────────────────────────┘

  [1. SENSE]        Universal Collectors (RSS, HTML, JSON, PDF, Browser)
       │            with strict SSRF guards and stream byte limits
       ▼
  [2. DETECT]       NFKC Normalization + SHA-256 Fingerprint Engine
       │            Detects: new, changed, or unchanged artifacts
       ▼
  [3. RESOLVE]      Multilingual Entity Resolution + Indian Geo-Hierarchy
       │            Links artifacts to canonical Knowledge Graph entities
       ▼
  [4. CLUSTER]      Story Cluster Aggregation + Wire De-duplication
       │            Prevents syndicated wire repetition from inflating importance
       ▼
  [5. SCORE]        Deterministic Signal Scoring Engine
       │            9 Component scores: Importance, Evidence, Velocity,
       │            Relevance, Reliability, Novelty, Uncertainty, Risk, Conf
       ▼
  [6. TRIAGE]       Deterministic Signal-to-Noise Ratio (SNR) Triage
       │            SNR = (Δ Salience × Authority × Confidence) / (Freq × Load)
       │            Anti-fatigue noise suppression & alert routing
       ▼
  [7. VERIFY]       Human Editorial Verification (Gold Standard Review)
       │            Primary source check, 4-layer analysis, bias audit
       ▼
  [8. PUBLISH]      Knowledge Object Promotion & Canonical Projection
       │            Story, Topic, Entity, Claim, or Errata publication
       ▼
  [9. RECONCILE]    Cross-Surface Consistency Reconciliation
       │            Validates Sitemap ↔ Search Index ↔ JSON-LD ↔ OpenGraph ↔ RSS
       ▼
 [10. MONITOR]      Production Heartbeat & Errata Replay Loop
                    Continuous telemetry, upstream monitoring, and living updates
```

---

## 3. Signal-to-Noise (SNR) Triage Standard

To prevent alert fatigue and newsroom cognitive exhaustion, incoming signals are triaged mathematically:

$$SNR = \frac{\Delta \text{Evidence Salience} \times \text{Source Authority} \times \text{Confidence}}{\text{Update Frequency} \times \text{Cognitive Load}}$$

### Triage Tiers & Operational Actions

| Tier | SNR Threshold | Priority | Action | SLA | Cadence |
|---|---|---|---|---|---|
| **Critical** | $SNR \ge 0.85$ | `P0` | **Immediate Dispatch**: Breaking investigation desk activated, live brief drafted. | $< 15$ min | Every 30 min |
| **High** | $0.65 \le SNR < 0.85$ | `P1` | **Priority Assignment**: Assign reporter to verify primary documents and interview experts. | $< 1$ hour | Every 2 hours |
| **Medium** | $0.40 \le SNR < 0.65$ | `P2` | **Developing Digest**: Track cluster evolution, aggregate developing reports. | $< 4$ hours | Every 6 hours |
| **Low** | $SNR < 0.40$ | `P3` | **Noise Suppressed**: Automated digest, background entity ledger update. | Daily | Daily digest |

### Anti-Fatigue Rules
1. **Window Guard**: Multiple updates from the same cluster within 60 minutes are suppressed unless $\Delta \text{Evidence Salience} \ge 0.25$.
2. **Wire Attribution**: Multiple outlets reprinting the same PTI/ANI wire receive no additional corroboration credit.
3. **Primary Override**: The emergence of a direct primary source (statute, judicial ruling, official data release) immediately elevates source authority to $0.95+$.

---

## 4. Source Health Lifecycle & The 7 Canonical States

Sources monitored by the News Radar cycle through 7 deterministic states:

| Health State | Definition | Automated Action | Editorial Action |
|---|---|---|---|
| `healthy` | Last probe returned HTTP 200, valid content, zero parse errors. | Normal polling schedule maintained. | None required. |
| `degraded` | 1–2 consecutive failures, high latency ($>10$s), or minor parse warnings. | Probed with linear backoff. | Monitored in Radar dashboard. |
| `failing` | $\ge 3$ consecutive HTTP 5xx, timeouts, or network drops. | Exponential backoff (up to 240 mins). | Engineering alert generated. |
| `stale` | No new updates detected within expected cadence ($>24$h for daily sources). | Flagged as stale in coverage matrix. | Beat editor checks source activity. |
| `changed` | Upstream content changed; fingerprint updated. | Ingested to change-detection pipeline. | Signal routed to triage engine. |
| `unavailable`| Upstream source returned HTTP 404, 410, or DNS failure. | Polling suspended (`DISABLED`). | Source steward investigates URL drift. |
| `disputed` | Reliability, provenance, or neutrality disputed by editorial audit. | Ingestion suspended for primary claims. | Ombudsman / Lead Editor audit. |

---

## 5. Editorial Boundary Rules

1. **AI Never Authors Canonical Truth**: AI tools may assist in summarization, extraction, and drafting, but every published claim must be traced to a human editor's sign-off.
2. **Four-Layer Epistemic Distinction**: Every analytical narrative must clearly distinguish:
   - *What Happened* (Empirical chronology)
   - *What the Evidence Shows* (Data, primary documents)
   - *Where Scholars & Observers Disagree* (Alternative interpretations)
   - *Why It Matters* (Structural significance for Indian citizens)
3. **Prohibited Language Ban**: The words *"clearly"*, *"obviously"*, *"undoubtedly"*, and *"unquestionably"* are permanently forbidden in all analytical copy.
4. **Living Knowledge Updates**: When a story or claim is updated due to upstream developments, an explicit version history and errata entry must be logged.
