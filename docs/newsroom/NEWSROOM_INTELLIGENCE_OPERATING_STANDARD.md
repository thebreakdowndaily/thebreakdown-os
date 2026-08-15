# THE BREAKDOWN — NEWSROOM INTELLIGENCE OPERATING STANDARD
## Document Identifier: TBIOS-OPS-STD-1.0
## Version: 1.0 (Governance Frozen)
## Last Updated: 14 Aug 2026

---

## 1. Purpose
This Operating Standard establishes the final operationalization, calibration, security, and governance requirements for the Newsroom Intelligence Operating System (TBIOS). It transitions the platform from active feature expansion to long-term production maintenance. The document defines the operational procedures required to ensure the system remains accurate, secure, explainable, and trustworthy over years of newsroom operations.

---

## 2. Scope
This standard governs:
1. All elements of the newsroom ingestion-to-triage pipeline (Observations, Claims, Clusters, Signals, Priority, Alerts, Beat Routing, Delivery).
2. All newsroom roles, role-based access control (RBAC), and IDOR security barriers.
3. Operating policies for calibration, source health, alert fatigue, SLO tracking, incident response, kill switches, and change control.

It explicitly **does not** cover public or reader alerting, which is permanently disabled.

---

## 3. Canonical Architecture
The TBIOS operates as a unidirectional layered Directed Acyclic Graph (DAG) for processing newsroom intelligence.

### Ingestion-to-Triage Pipeline:
```
[Raw Observations Ingestion]
           ↓
[Extracted Claims Registry]
           ↓
[Story Cluster Correlation]
           ↓
[Canonical Signal Engine]
           ↓
[Velocity / Contradiction / Coverage Engines]
           ↓
[Priority Scoring (P0/P1/P2/P3)]
           ↓
[Logical Alert Generation]
           ↓
[Beat Routing Service]
           ↓
[Deduplicated Delivery Targets]
           ↓
[Human Editorial Triage Action]
           ↓
[Story OS Draft Handoff]
```

### Invariants:
1. **One Signal ➔ One Logical Alert ➔ N Delivery Targets:** Multiple matching beats or overlapping recipients must never cause multiple logical alerts to be created for the same signal.
2. **One Recipient ➔ One Delivery Target:** If a recipient belongs to multiple matching beats for a single alert, the system must deduplicate and dispatch exactly **one** delivery notification.

---

## 4. Frozen 16-Beat Taxonomy
The newsroom taxonomy is permanently frozen at **16 beats**. No additional beats may be added through normal engineering cycles.

| Beat ID | Display Name | Routing Entity Rules | Primary Topics | Expected Volume (Alerts/72h) |
| :--- | :--- | :--- | :--- | :--- |
| `economy` | Economy & Finance | RBI, SEBI, Ministry of Finance, CACP, CEA | Repo rate, inflation, GDP, fiscal policies, budgets | 8–10 |
| `agriculture`| Agriculture & Rural | Ministry of Agriculture, FCI, CACP | MSP, crop prices, rural distress, ethanol, monsoon | 6–8 |
| `judiciary` | Judiciary & Law | Supreme Court, High Courts, CJI, Law Ministry | Verdicts, judgments, constitution benches, key orders | 5–6 |
| `politics` | Politics & Elections | ECI, Parliament, political parties | General elections, assembly polls, bill introductions | 4–5 |
| `defence` | Defence & Security | MoD, Army, Navy, Air Force, NSA, border patrols | Strategic defense, border security, defense purchases | 3–4 |
| `technology` | Technology & MeitY | MeitY, TRAI, CERT-In | Cybersecurity, IT rules, chip fabs, AI regulation | 2–3 |
| `health` | Health & ICMR | MoHFW, ICMR, CDSCO, NCDC | Pandemics, drug approvals, vaccine safety, advisories | 3–4 |
| `education` | Education & UGC | Ministry of Education, UGC, CBSE | Board exams, UGC rules, university curriculum edits | 2–3 |
| `foreign_affairs`| Foreign Affairs | MEA, embassies, United Nations, bilateral | State visits, diplomatic statements, UN votes, sanctions | 3–4 |
| `climate` | Climate & Environment | MoEFCC, IMD, CPCB, IPCC | Weather warnings, emission standards, air quality | 2–3 |
| `telecom` | Telecom & TRAI | TRAI, DoT, telecom operators | Spectrum auctions, tariff rules, licensing updates | 3–4 |
| `labour` | Labour & Employment | MoLE, EPFO, ESIC, trade unions | Minimum wage, EPFO rates, labor codes, gig welfare | 4–5 |
| `science` | Science & CSIR | CSIR, ISRO, DST | Space launches, clinical breakthroughs, research papers | 3–4 |
| `business` | Business & M&A | MCA, SEBI, NCLT, corporate registries | M&A transactions, corporate insolvencies, audits | 3–4 |
| `consumer` | Consumer Protection | CCPA, Ministry of Consumer Affairs | Recalls, misleading advertising, CCPA penalties | 3–4 |
| `transport` | Transport & Safety | DGCA, Railway Board, MoRTH, port authorities | Aviation safety, railway policies, toll revisions | 3–4 |

---

## 5. Beat Ownership & Recipient Management
1. **Scope Restriction:** Recipients may only receive alerts and access signals matching their authorized beat assignments.
2. **Access Table:**
   - `reporter-01` ➔ Economy & Finance, Agriculture & Rural
   - `reporter-02` ➔ Politics & Elections, Judiciary & Law
   - `reporter-03` ➔ Defence & Security, Technology & MeitY
   - `reporter-04` ➔ Health & ICMR, Education & UGC
   - `reporter-05` ➔ Foreign Affairs, Climate & Environment
   - `reporter-06` ➔ Telecom & TRAI, Labour & Employment
   - `reporter-07` ➔ Science & CSIR, Business & M&A
   - `reporter-08` ➔ Consumer Protection, Transport & Safety
   - `editor-01` ➔ Global Newsroom (All active beats)
   - `managing-editor-01` ➔ Global Newsroom (All active beats)

---

## 6. Overlap Routing Matrix
To prevent ambiguous routing between adjacent beats, the following primary/secondary rules are enforced:

*   **Economy ↔ Business:**
    *   *Primary:* `economy` for macroeconomic indices (GDP, inflation, GST revenues).
    *   *Secondary:* `business` for microeconomic events (corporate filings, earnings, mergers).
*   **Science ↔ Technology:**
    *   *Primary:* `science` for academic research publications or space agency launches (ISRO/CSIR).
    *   *Secondary:* `technology` for consumer device launches or commercial software products.
*   **Technology ↔ Telecom:**
    *   *Primary:* `telecom` for spectrum actions, TRAI tariff orders, or mobile tower infrastructure.
    *   *Secondary:* `technology` for app-level developments, software bugs, or general cyber incidents.
*   **Consumer ↔ Business:**
    *   *Primary:* `consumer` for CCPA product safety recall orders or action against false advertising.
    *   *Secondary:* `business` if it is a general corporate dispute that mentions retail sales.
*   **Health ↔ Consumer:**
    *   *Primary:* `health` for CDSCO drug bans or medical advisories on virus outbreaks.
    *   *Secondary:* `consumer` if it relates to cosmetic product complaints or CCPA labeling guidelines.
*   **Transport ↔ Climate:**
    *   *Primary:* `climate` if transport is disrupted by an extreme weather warning (IMD).
    *   *Secondary:* `transport` if disruptions are caused by airline operational issues or infrastructure maintenance.
*   **Foreign Affairs ↔ Defence:**
    *   *Primary:* `foreign_affairs` for MEA bilateral negotiations or peace summit declarations.
    *   *Secondary:* `defence` for active border standoffs, military exercises, or defense acquisition.
*   **Judiciary ↔ Politics:**
    *   *Primary:* `judiciary` for Supreme Court verdicts, judge appointments, or contempt of court proceedings.
    *   *Secondary:* `politics` for parliamentary debates about judicial bills.

---

## 7. Routing Authority
Routing is resolved deterministically in the following priority order:
1. **Canonical Entities:** Matches specific designated government agencies, courts, or regulators.
2. **Canonical Taxonomy/Topics:** Evaluates matching tags based on the core event definitions.
3. **Event Type:** Matches regulatory actions, alerts, and advisories.
4. **Governed Keywords (Fallback):** Scopes text fields for designated term groupings.

---

## 8. Alert Policy & Priority Thresholds
*   **P0 (Immediate Alert):** Dispatched via critical channels instantly. Reserved for critical national developments, major outbreaks, national-security events, or supreme court constitution bench decisions.
*   **P1 (Near-Immediate Alert):** Dispatched immediately. Reserved for important regulatory updates, major policy drafts, or corroborated contradictions.
*   **P2 (Newsroom Queue):** Added silently to the newsroom desk triage queue. No push alert.
*   **P3 (Monitoring Queue):** Added to the baseline monitoring queue. No push alert.

Thresholds must never be lowered to artificially increase alert volume.

---

## 9. Calibration Governance
All priority engine rules, alert thresholds, and weight coefficients are locked.
1. **No Ad-hoc Changes:** Modifying thresholds in response to a single event is strictly prohibited.
2. **Change Protocol:** Any threshold adjustment requires:
   - A minimum sample of **50 historical events** analyzed.
   - A documented before/after regression analysis.
   - Verification that the change does not cause alert fatigue or increase the missed-beat rate.
   - Explicit written sign-off from the Managing Editor.
   - An immutable record logged to the Audit service containing: `changeId`, `timestamp`, `previousValue`, `newValue`, `evidence`, and `approver`.

---

## 10. Source Governance & Registry
The system tracks the health and reputation of all monitored sources.
1. **Reputation Rules:** Source tier upgrades (e.g. T3 ➔ T2) or downgrades (e.g. T2 ➔ T3) are strictly deterministic.
   - Minimum sample size: **5 verified claims** must be processed before adjusting a source's tier.
   - Bounded adjustments: A source cannot move more than one tier in a 30-day period.
   - Auditable path: Every tier change is logged as an immutable audit event.
2. **Source Degradation Alerting:** If a primary source is silent for more than **24 hours**, a source silence flag is logged, warning editors of potential feed outages.

---

## 11. False-Negative retrospective Program
A retrospective review must be conducted weekly to discover any critical events that the system failed to alert on.
1. **Ground Truth Sources:** Official archives, Lok Sabha circulars, Supreme Court orders, and final published Story OS drafts.
2. **Classification Matrix:**
   - `CAPTURE_MISS`: Feed outage or source missing.
   - `ENTITY_MISS`: Entity resolver failed to identify the agency.
   - `CLAIM_MISS`: Claim extractor failed to isolate the core statement.
   - `CLUSTER_MISS`: Clustering engine split the event into minor groups.
   - `SIGNAL_MISS`: Evaluated but failed to reach priority threshold.
   - `PRIORITY_MISS`: Routed but graded as P2/P3 instead of P0/P1.
   - `ROUTING_MISS`: Assigned to the wrong beat desk.
3. All identified misses are recorded in the post-incident register for root-cause corrections.

---

## 12. Alert-Fatigue Policy
To prevent notification fatigue, the following limits are monitored rolling daily:
1. **Max Alerts Per Recipient:** Scoped at a maximum of **3 alerts per hour** and **15 alerts per day** for reporters (P0/P1 total).
2. **Max Alerts Per Beat:** Scoped at a maximum of **5 alerts per day** for any single beat.
3. **Queue Health:** Triaged queues must be cleared within **4 hours** of receipt to prevent queue backlog.
4. **Usefulness Check:** Usefulness is verified by tracking action rates (Verify/Assign/Story OS Handoff). Acknowledgement alone does not equal usefulness.

---

## 13. Service Level Objectives (SLOs)
All pipeline latency metrics are evaluated on rolling 7-day windows.

| Metric | Target (p50) | Target (p95) | Measurement Method |
| :--- | :--- | :--- | :--- |
| **Ingestion Latency** | < 10 mins | < 20 mins | Feed publication timestamp to Ingestion registry |
| **Signal Evaluation** | < 20 ms | < 50 ms | Ingestion registry write to Signal scoring |
| **Priority & Routing** | < 15 ms | < 30 ms | Signal scoring to Beat Routing mapping |
| **Logical Alert Delivery**| < 25 ms | < 50 ms | Alert generation to Recipient Channel delivery |
| **API GET Latency** | < 150 ms | < 300 ms | Server response duration for newsroom queries |
| **Dashboard Load** | < 250 ms | < 500 ms | Client render completion duration |

System delays must be tracked separately from network transport or human response times.

---

## 14. Reliability Policy & Severity Matrix
1. **Availability Target:** Ingestion and Alert routing availability must meet **99.9% uptime** monthly.
2. **Backlog Limit:** Signal processing queue backlog must remain below **10 events**.
3. **Severity Matrix:**
   - **P0 Incident:** Full alert pipeline outage, security breach, or duplicate alert storm.
   - **P1 Incident:** Beat routing service failure, or latency exceeding 1 hour.
   - **P2 Incident:** Partial UI degradation, or dashboard latency exceeding 1 second.
   - **P3 Incident:** Minor visual defect, or localized non-blocking error.

---

## 15. Incident Response Workflow
Upon detection of a pipeline anomaly (e.g. alert storm, routing failure):
1. **Triage:** Isolate the anomaly. Log the incident into the incident registry.
2. **Mitigation:** Deploy the appropriate beat or global kill switch.
3. **Rollback:** Restore configuration to the latest verified git commit if drift or calibration error is detected.
4. **Analysis:** Complete a post-incident review within 24 hours, recording the rootCause, affect, and preventative actions.

---

## 16. Kill-Switch Hierarchy
The system supports three levels of alert isolation:
*   **LEVEL 1 (Beat Kill Switch):** Disables alerts for a single beat (e.g. `technology` OFF). All other beats continue dispatching normally.
*   **LEVEL 2 (Cohort Kill Switch):** Disables alerts for a specific cohort (e.g. Phase 2D Health + Education OFF).
*   **LEVEL 3 (Global Newsroom Kill Switch):** Stops all internal beat alerting newsroom-wide instantly.

*Note:* Observations and Signal scoring continue running in the background during kill-switch activation. Only downstream notification dispatch is halted.

---

## 17. Rollback Governance
1. **State Preservation:** Cohort rollback must preserve all signals, alerts, delivery records, audit logs, and calibration configuration. Destructive rollback (state deletion) is strictly banned.
2. **Authorized Sign-off:** Rollback can only be initiated by authorized users (Managing Editors).

---

## 18. Security / RBAC / IDOR Barriers
1. **Isolation:** Cross-cohort access is blocked. Reporters only access signals matching their assigned beats. Any attempt to access cross-beat signals yields a **`403 Forbidden`** error.
2. **Tampering Mitigation:** All endpoint query parameters, `signalId`, `alertId`, and `recipientId` inputs are validated server-side against the caller's JWT token beats scope *before* retrieving database records.
3. **Roles Matrix:**
   - `guest` / `reader` ➔ **Access Denied (403)**
   - `reporter` ➔ Read authorized beats only; Verify/Acknowledge/Handoff capability.
   - `editor` ➔ Read/Write triage queues; calibrate within approved scope.
   - `managing_editor` / `owner` ➔ Global read/write; authorization, kill-switch, and rollback execution.

---

## 19. Public Data Isolation
The public API routing layer has zero references to the newsroom intelligence service. Under no circumstances may internal signals, alerts, routing reasons, recipient maps, source reputations, or internal audits be exposed to public routes.

---

## 20. Append-Only Audit Ledger
All state mutations (authorizations, routing matches, acknowledgements, escalations, calibration changes) are recorded in the audit database.
- **Rules:** The registry is append-only. Mutation or deletion of logs is blocked.
- **Fields:** Every audit record must contain `actorId`, `timestamp`, `mutationId`, `objectId`, `previousState`, `newState`, and `reason`.

---

## 21. Persistence & Durability
1. **Durability Invariant:** All signals, alerts, deliveries, actions, and audit logs are written to transaction-safe persistent tables. Under no circumstances is process-local variables used as the authoritative source of truth.
2. **Recovery Invariant:** Replays or worker restarts must yield **zero** state loss, **zero** duplicate logical alerts, and **zero** duplicate deliveries.

---

## 22. Story OS Integration Boundary
TBIOS acts purely as a discovery and triage service. It does not contain document drafting or editing features.
- **Handoff Protocol:** When an alert is accepted, the triage action maps the corresponding `signalId`, `storyClusterId`, `claimId`, and `evidenceId` into a Story OS draft.
- **No Auto-Publishing:** Automated creation or publishing of public articles is strictly prohibited. Human editorial oversight is final.

---

## 23. Observability Dashboard
The dashboard surfaces key metrics using clean, accessible layouts:
- Uses non-color indicators (symbols and shapes) for state changes.
- Exposes rolling statistics for volume, queue backlog, latency, and calibration drift.
- Scoped to show beat-specific views for reporters and global operational status for Managing Editors.

---

## 24. Recertification Schedule
*   **Daily:** Check uptime, feed health, queue backlog.
*   **Weekly:** Evaluate alert precision, wrong-beat routing, false negatives, alert fatigue.
*   **Monthly:** Audit calibration metrics, source reputation adjustments, beat overlap routing.
*   **Quarterly:** Full newsroom intelligence recertification review.

---

## 25. Change Control
Any modification to TBIOS configuration (routing rules, alert priorities, source tiers) must be logged as a formal change request (`changeId`, `reason`, `risk assessment`, `approver`, `rollback plan`) in the audit log. No ad-hoc mutations in production are permitted.

---

## 26. No-Feature-Expansion Rule
The feature lifecycle of the Newsroom Intelligence platform is complete. All future changes are limited to performance improvements, security hardening, defect resolution, and accessibility compliance. No new dashboards or alert engines will be built.

---

## 27. Test Requirements
Any change must execute the complete test suite. The regression test suite must verify:
- Single logical alert invariant.
- Overlapping beats recipient deduplication.
- Cross-cohort IDOR access barriers.
- Optimistic concurrency locks.
- Kill-switch and rollback transitions.

---

## 28. Exceptions & Limitations
1. **Lint Baseline:** The global repository contains accepted historical lint debt (1,428 warnings/errors). Any new modifications must introduce **zero** new lint violations.
2. **Authoritative Dataset:** The system relies on the cached loading of the static baseline dataset. Updates to this dataset must conform to standard loader validations.

---

## 29. Document Ownership & Supremacy
- **Ownership:** Maintained by the Editor-in-Chief.
- **Supremacy:** Governed directly by the Editorial Constitution v1.1. In the event of any conflict, the Editorial Constitution takes precedence.

---

## 30. Revision History
- **v1.0 (14 Aug 2026):** Initial release. Concluded Phase 2H rollout. Beat taxonomy frozen.
