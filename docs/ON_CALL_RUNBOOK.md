# THE BREAKDOWN OS — ON-CALL RUNBOOK & INCIDENT MANAGEMENT

**Version:** 1.0  
**Status:** Living Engineering Standard for On-Call Engineers & System Operators  
**Governing Documents:** `AGENTS.md`, `docs/ci-pipeline.md`, `docs/product-quality.md`

---

## 1. Incident Severity Definitions & Escalation SLAs

| Severity | Definition | Target Acknowledgement | Target Mitigation | Escalation Path |
|---|---|---|---|---|
| **P0 (Critical)** | Complete site outage (`5xx` errors), data corruption/breach, catastrophic misinformation published, or complete build/deployment failure on main. | $< 10$ minutes | $< 60$ minutes | On-Call Lead → Lead Architect → Editor-in-Chief |
| **P1 (High)** | Core subsystem degraded: Radar collectors stalled, Search index desynchronized, Sitemap corrupt or failing, or high-velocity false alert flood. | $< 30$ minutes | $< 4$ hours | On-Call Engineer → Service Lead |
| **P2 (Medium)** | Individual secondary source failing, non-critical latency elevation ($>5$s), minor layout or styling defect, or non-blocking scheduled task delay. | $< 2$ hours | $< 24$ hours | On-Call Engineer (Next business shift) |
| **P3 (Low)** | Cosmetic imperfection, internal documentation inaccuracy, minor lint warning, or exploratory task. | $< 24$ hours | Next sprint | Backlog triage |

---

## 2. Emergency Operational Playbooks

### Playbook A: P0 Total Site Outage / 5xx Surge
1. **Assess Scope**:
   ```bash
   curl -I https://thebreakdown.in/
   curl -I https://thebreakdown.in/api/health
   ```
2. **Inspect Edge / Vercel Status**:
   - Check Vercel deployment console or Cloudflare edge logs.
   - Look for unhandled server-side exceptions or bundle crashes during Server Component rendering.
3. **Trigger Emergency Rollback**:
   If the incident occurred immediately following a production deployment:
   ```bash
   # List recent production deployments
   npx vercel list --prod
   # Rollback / alias to last known healthy deployment
   npx vercel alias set <PREVIOUS_HEALTHY_DEPLOYMENT_URL> thebreakdown.in
   ```
4. **Verify Mitigation**:
   Run deployment parity probe:
   ```bash
   node scripts/test-deployment-parity.js
   ```

---

### Playbook B: Radar Alert Flood / Alert Fatigue Runaway
1. **Symptom**: Hundreds of P0/P1 notifications firing rapidly, queue clogged, or upstream source flapping.
2. **Engage Newsroom Kill Switch**:
   In `services/intelligence/newsroom/index.ts`:
   - Call `newsroomIntelligenceCore.engageKillSwitch()`.
   - All external notifications (webhooks, SMS, internal dispatch) are immediately halted.
   - Internal observations continue to be recorded silently without triggering alert storms.
3. **Isolate Flapping Source**:
   - Identify source in Radar Health Monitor:
   ```bash
   npm test tests/radar-source-health.test.ts
   ```
   - Mark source as `unavailable` or `disabled` in repository:
   ```ts
   radarHealthMonitor.markUnavailable(sourceId, "Flapping upstream content detected");
   ```
4. **Flush Anti-Fatigue Cache**:
   ```ts
   globalTriageEngine.resetHistory();
   ```
5. **Disengage Kill Switch**:
   Once root cause is identified and noise suppressed, re-enable standard alerting.

---

### Playbook C: Cross-Surface Desynchronization (Sitemap / Search Index Stale)
1. **Symptom**: Newly published stories or series chapters not appearing in `/sitemap.xml` or returning 404 on search.
2. **Run Consistency Reconciliation Probe**:
   Execute the automated reconciliation audit:
   ```ts
   import { globalReconciliationEngine } from '@/services/monitoring/reconciliation-engine';
   const report = await globalReconciliationEngine.auditReconciliation();
   console.log(report.anomalies);
   ```
3. **Verify Sitemap Output**:
   ```bash
   curl -s https://thebreakdown.in/sitemap.xml | grep -i "<loc>" | head -n 30
   ```
4. **Trigger Search Re-index**:
   Rebuild in-memory search index:
   ```ts
   import { searchService } from '@/services/search/service';
   await searchService.rebuild();
   ```
5. **Redeploy Static Assets**:
   If static routes are stale, trigger a clean redeployment.

---

### Playbook D: Errata & Retraction Execution
1. **Symptom**: A published claim or factual assertion requires immediate retraction or correction.
2. **Execute Errata Workflow**:
   - Never delete the story or silently edit text.
   - Register an errata entry in `data/corrections/` or canonical Fix repository:
     - Specify `storyId`, `originalText`, `correctedText`, `explanation`, `timestamp`, `editorId`.
   - Update story component to display the prominent red/amber correction callout.
3. **Verify Transparency Page**:
   - Ensure the correction renders on `https://thebreakdown.in/transparency/corrections`.
4. **Re-run Automated Tests**:
   Ensure `npm test` passes before pushing errata release.

---

## 3. Communication & Post-Mortem Standard

Every P0 or P1 incident requires an institutional Post-Mortem within 48 hours:
- **Root Cause Analysis (5 Whys)**.
- **Timeline of Detection, Acknowledgement, Mitigation, and Resolution**.
- **Permanent Remediation Tickets**: Architectural or procedural fixes to prevent recurrence.
- **Archive Location**: Store post-mortem reports in `docs/audits/post-mortems/`.
