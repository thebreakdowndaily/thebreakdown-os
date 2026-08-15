# LIVE PRODUCTION CONVERGENCE — Runbook

**Program:** `NEWSROOM-INTEL-PRODUCTION-REMEDIATION-01` — closing deliverable
**Status:** CODE REMEDIATION: COMPLETE · PRODUCTION CONVERGENCE: PENDING · GO-LIVE CERTIFICATION: NOT YET
**Governing report:** `docs/newsroom/NEWSROOM_INTELLIGENCE_FINAL_OPERATIONALIZATION_REPORT.md` §0

---

## 1. Acceptance Condition

> **Can a real production source produce a real observation that survives restart,
> becomes a deterministic signal/alert, reaches the correct authorized beat
> recipient, is acknowledged/actioned by the real user, and remains in the
> authoritative state/audit trail afterward?**

Until this is demonstrated against a live source, the system is not GO-LIVE certified.

The chain to demonstrate:

```
PIB production feed (pib.gov.in RSS)
        ↓  POST /api/v2/newsroom/observations/pull  (cron)
NEWSROOM_STATE_PROVIDER=file  (durable snapshot)
        ↓
ensureNewsroomRuntime()  (16 beats + recipient registry)
        ↓
real observations  →  real signals / alerts  (deterministic)
        ↓
authorized Phase 2 routing  →  correct beat recipient
        ↓
authenticated newsroom user  →  /newsroom
        ↓
ack / action
        ↓
persistent audit / state
        ↓
restart / recovery verification
```

---

## 2. Honest Durability Scope (read before deploying)

| Hosting | State provider | Restart recovery | Multi-instance durability | Verdict |
|---------|---------------|------------------|---------------------------|---------|
| Single persistent Node instance (`next start`, Docker/VM) | `file` | ✅ | ✅ (single process owns the file) | **GO-LIVE path — durable today** |
| Vercel serverless (cron + functions) | `file` | ⚠️ per-instance only | ❌ filesystem is ephemeral and instances scale independently | ingestion works; **state is NOT authoritative across scale** |
| Vercel/any serverless with shared DB | `supabase` (seam open) | ✅ | ✅ | required for durable serverless; not yet implemented |

**Consequence:** the file provider is the correct production implementation for a
single persistent process. If the deployment target is Vercel serverless, a
shared-state repository (Supabase) must be wired before claiming durable
multi-instance behavior. This is a documented, gated next step — the
`NewsroomStateRepository` seam is already in place; no architecture change is
required.

The GO-LIVE verification in this runbook therefore assumes a **single persistent
instance** (Option A below). Option B (Vercel) runs the same code but must not
be certified for restart-recovery until a shared backend is attached.

---

## 3. Option A — Single Persistent Instance (Recommended Go-Live Path)

### 3.1 Prerequisites
- Node 22+ runtime, the built Next.js standalone output (`next build` then
  `next start`), or a Docker image of it.
- A writable persistent volume mounted at the state path.
- Supabase credentials for production auth (newsroom users), or a pre-provisioned
  production auth identity for the managing-editor who will authorize Phase 2.

### 3.2 Environment
```bash
NEWSROOM_STATE_PROVIDER=file
NEWSROOM_STATE_FILE=/var/lib/thebreakdown/newsroom/state.json   # on the volume
PIB_FEED_URL=https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3   # optional override
CRON_SECRET=<long random value>          # guards the pull endpoint
NEXT_PUBLIC_SUPABASE_URL=<prod>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<prod>
```

`CRON_SECRET` must match the bearer token sent by the scheduler (below).

### 3.3 Scheduler
Either:
- systemd timer / cron on the host:
  ```
  curl -X POST https://<host>/api/v2/newsroom/observations/pull \
    -H 'Authorization: Bearer <CRON_SECRET>' \
    -H 'x-vercel-cron: 1'
  ```
- or the committed `vercel.json` cron (works only when deployed on Vercel; see
  Option B).

Schedule recommendation: hourly on the half-hour; PIB publishes continuously
through the working day. The pull is idempotent — re-running is harmless.

### 3.4 First Run — Verify Ingestion
```bash
curl -X POST https://<host>/api/v2/newsroom/observations/pull \
  -H 'Authorization: Bearer <CRON_SECRET>' -H 'x-vercel-cron: 1'
```
Expected: `{ fetched: N, ingested: M, duplicates: 0, skippedInvalid: 0, errors: [] }`.
Re-run: `ingested: 0, duplicates: M` (dedup proven against the durable file).

### 3.5 Authorize Phase 2 (human decision, managing_editor or above)
```bash
curl -X POST https://<host>/api/v2/newsroom/authorize \
  -H 'Cookie: <session>' \
  -H 'Content-Type: application/json' \
  -d '{
        "action": "authorize",
        "approvedScope": "Beat alerting activation",
        "approvedRecipients": ["reporter-01"],
        "approvedBeats": ["economy"],
        "approvedChannels": ["beat_desk_channel"],
        "rollbackAuthority": "<your userId>"
      }'
```
Response: `{ action: "authorize", phase2Active: true, authorizedBy: "<userId>" }`.
Bootstrap never auto-authorizes; this step is the explicit human activation.

### 3.6 Full Acceptance Chain
1. Real source → real observation: confirmed by the pull response (above).
2. Survives restart: `systemctl restart thebreakdown` (or restart container),
   then verify observations/signals/alerts are still present via the newsroom
   API and `/newsroom`.
3. Deterministic signal/alert on the correct beat: sign in as the authorized
   recipient's user; the PIB economy release appears in their beat desk queue
   with an alert delivery.
4. Acknowledge/action: ack the alert, apply a triage action. Audit trail records
   the actor (session-derived, no spoofing).
5. Persistent audit/state: restart again; the ack/action and audit records remain.

### 3.7 Rollback
```bash
curl -X POST https://<host>/api/v2/newsroom/authorize \
  -H 'Cookie: <session>' -H 'Content-Type: application/json' -d '{ "action": "revoke" }'
```
Emergency stop additionally available via the alert-engine kill switch
(`engageKillSwitch`). All Phase 2 authorization/revocation events are persisted.

---

## 4. Option B — Vercel Serverless (with documented caveat)

1. Set env vars in the Vercel project: `NEWSROOM_STATE_PROVIDER=file`,
   `CRON_SECRET`, `PIB_FEED_URL` (optional). `NEWSROOM_STATE_FILE` is relative;
   the file lands in the function filesystem (ephemeral).
2. Deploy. The committed `vercel.json` registers the cron. Note: Vercel Hobby
   runs crons at most once daily; Pro allows hourly.
3. Ingestion and routing work and are observable; **restart-recovery across
   instances is NOT guaranteed** because the filesystem is ephemeral. Do not
   certify GO-LIVE durability on Vercel serverless until a shared-state
   repository (Supabase) is attached via the existing seam.

---

## 5. Certification Status Record

After the acceptance chain is demonstrated, update
`docs/newsroom/NEWSROOM_INTELLIGENCE_FINAL_OPERATIONALIZATION_REPORT.md` §0:

```
CODE REMEDIATION:            ✅ COMPLETE
TEST VERIFICATION:           ✅ 638 + 7 (PIB adapter) passing
BUILD:                       ✅ PASS
SMOKE TEST:                  ✅ PASS
LIVE PRODUCTION CONVERGENCE: ✅ COMPLETE   (date, environment)
GO-LIVE CERTIFICATION:       ✅ GRANTED    (date, environment, sign-off)
```

Until then the classification remains **PRODUCTION CONVERGENCE: PENDING**.
