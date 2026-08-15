# Production Gate Register — Newsroom Intelligence

**Status:** AUTHORITATIVE
**Date:** 15 Aug 2026
**Phase:** Production Convergence Verification
**Governing documents:** `docs/newsroom/NEWSROOM_INTELLIGENCE_OPERATING_STANDARD.md`, `docs/newsroom/NEWSROOM_INTELLIGENCE_PRODUCTION_CERTIFICATION.md`

## Gate Status Legend

| Status | Meaning |
|--------|---------|
| `VERIFIED` | Direct evidence produced, locally reproducible |
| `SIMULATED` | Exercised under controlled/staged conditions, not live |
| `NOT VERIFIED` | No direct production evidence available |
| `BLOCKED` | A prerequisite is false in the live environment; cannot verify until resolved |

**GO requires ALL critical gates `VERIFIED`.** Any `NOT VERIFIED` or `BLOCKED` critical gate ⇒ NO-GO.

---

## Production Environment Inventory (Vercel)

- Production domain: `https://thebreakdown.in`
- Deployment: `dpl_RtvnxH8B6Rf2c9VAjEHVp9XDVZ3x` (Ready, 13 Aug 2026 23:18 IST)
- Project: `thebreakdown-os` (`prj_WcVDpSso6PPWWOPKwoBRC9lm0huO`), org `team_tbFilNFb4UMox6A5vKhdBngZ`
- **Deployed commit:** `87f72d07e118f8ef5e65fe40b40866f2e1dc99cc` (`gitDirty: 1`)
- **Certified baseline HEAD:** `5be8db67c372cb83fc94e838149db986d0a65780`
- **Delta:** production is 5 commits behind; newsroom code is untracked/uncommitted → newsroom is absent from the deployed build.

### Environment variables (authoritative, from Vercel API `v9/projects/{id}/env`, names only)

| Variable | Production | Preview | Impact |
|----------|-----------|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | Auth configured |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | Auth configured |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | Service auth |
| `CANONICAL_READ_PATH` | ✅ | ❌ | Platform (sensitive) |
| `NEWSROOM_STATE_PROVIDER` | ❌ | ❌ | **Newsroom persistence** |
| `NEWSROOM_STATE_FILE` | ❌ | ❌ | **Newsroom persistence** |
| `CRON_SECRET` | ❌ | ❌ | **Cron auth** |
| `PIB_FEED_URL` | ❌ | ❌ | **Feed URL** (default used if absent) |
| `API_KEYS` | ❌ | ❌ | Falls back to hardcoded dev key (pre-existing platform behaviour) |

---

## Gate Matrix

### A. Deployment Integrity

| Gate | Status | Evidence |
|------|--------|----------|
| A1. Newsroom UI deployed | **BLOCKED** | `https://thebreakdown.in/newsroom` → 404. Deployed commit predates newsroom code (uncommitted). |
| A2. Newsroom API deployed | **NOT VERIFIED** | `/api/v2/newsroom/*` → 401 (masked by global `x-api-key` middleware — inconclusive; route presence cannot be confirmed). |
| A3. Certified commit == deployed commit | **BLOCKED** | `87f72d0` (deployed) ≠ `5be8db6` (certified HEAD). Fix requires commit + deploy (institution). |

### B. Environment

| Gate | Status | Evidence |
|------|--------|----------|
| B1. Newsroom persistence vars configured | **NOT VERIFIED** | `NEWSROOM_STATE_PROVIDER`, `NEWSROOM_STATE_FILE` absent in all scopes. |
| B2. Cron secret configured | **NOT VERIFIED** | `CRON_SECRET` absent. |
| B3. Feed URL configured | **NOT VERIFIED** | `PIB_FEED_URL` absent (default URL used at runtime). |
| B4. Supabase auth configured | **VERIFIED** | URL + anon + service keys present in production. |

### C. Live Ingestion (Cron)

| Gate | Status | Evidence |
|------|--------|----------|
| C1. Cron schedule configured | **SIMULATED** | `vercel.json` defines `30 * * * *` → `/api/v2/newsroom/observations/pull`; no live run observed. |
| C2. Cron can reach the route | **BLOCKED** | Middleware requires `x-api-key` for all `/api/*` not in `PUBLIC_API_PATHS` (`middleware.ts:53-64`); the pull route is not public, and Vercel cron headers are fixed (`x-vercel-cron`, `Authorization: Bearer $CRON_SECRET`) — the cron **cannot** pass the middleware gate without a code exemption. |
| C3. Cron auth (CRON_SECRET bearer + `x-vercel-cron`) | **NOT VERIFIED** | Route logic correct (`pull/route.ts:24-32`), secret absent in production. |
| C4. Real PIB ingestion end-to-end | **SIMULATED** | Local live run: 20 real PIB observations ingested, idempotent on re-fetch (0 re-ingested), restart recovery verified. |
| C5. Feed failure → 502 | **VERIFIED** | `PibFeedError` → 502 handled (`pull/route.ts:42-46`); covered by adapter tests. |

### D. Persistence & Durability

| Gate | Status | Evidence |
|------|--------|----------|
| D1. File persistence works | **VERIFIED** (single-process) | Evidence harness §11: durable snapshot survives restart; signals/alerts/phase2/audit/acks/actions recovered. |
| D2. Serverless multi-instance durability | **NOT VERIFIED** | File provider is not durable across serverless instances; production provider unset. Known limitation (operating standard §21). |

### E. Authorization & Editorial Controls

| Gate | Status | Evidence |
|------|--------|----------|
| E1. API auth boundary | **VERIFIED** | Middleware gate verified by direct probe (401 without `x-api-key`); Supabase env present. |
| E2. IDOR protection | **VERIFIED** (local) | Evidence §9: cross-beat denial for reporter-02, reader denial, action/ack denials. |
| E3. Phase-2 human authorization | **VERIFIED** (local) | Evidence §10: authorize → operate → revoke → require re-authorization. |
| E4. Session-derived actorId | **VERIFIED** (local) | Evidence §6: audit records use session actor, body-supplied ids rejected. |
| E5. Production auth chain | **NOT VERIFIED** | Newsroom UI not deployed; production session flow untestable. |

### F. Delivery, Alerting, Fatigue

| Gate | Status | Evidence |
|------|--------|----------|
| F1. Staged P0/P1 delivery chain | **SIMULATED** | Evidence §5: staged signal → P0 (composite 86) → alert → beat routing → 4 recipients delivered. |
| F2. Alert generation triggers | **VERIFIED** | Decay regression: fresh P1 → `first_detection` alert; decayed P2 → no alert. |
| F3. Fatigue caps enforced | **VERIFIED** (local) | Evidence §8: counters incremented; tests cover 3/hr, 15/day, 5/beat-day. |
| F4. Live delivery | **NOT VERIFIED** | No live alert fired (production corpus empty). |

### G. Intelligence Quality & Coverage

| Gate | Status | Evidence |
|------|--------|----------|
| G1. Beat routing correctness | **VERIFIED** | Coverage suite: 16/16 beats, precision 0.8636, recall 0.7917, case accuracy 25/32. |
| G2. Priority accuracy | **VERIFIED** | Coverage suite: 100% (all P2 on single-source corpus); staged P0 verified. |
| G3. No alerts on P2 corpus | **VERIFIED** | Coverage suite: alertVolume 0 for all P2 cases. |
| G4. Novelty decay | **VERIFIED** | Decay regression: fresh P1 → 24h/72h P2; novelty 100 → 10 → 10; composite monotonic non-increasing (75 → 62 → 62). |
| G5. PIB English coverage | **BLOCKED** | See GO/NO-GO record — decision `PIB-COVERAGE-LIMITATION-ACCEPTED`. |

### H. Correctness Baseline

| Gate | Status | Evidence |
|------|--------|----------|
| H1. TypeScript | **VERIFIED** | `npx tsc --noEmit` exit 0. |
| H2. Test suite | **VERIFIED** | 52 files / 645 tests + newsroom coverage suite passing. |
| H3. Lint (newsroom scope) | **VERIFIED** | `npx eslint` newsroom scope exit 0. |
| H4. Build | **VERIFIED** | 253 pages. |

### I. Observability

| Gate | Status | Evidence |
|------|--------|----------|
| I1. HTTP error surface | **VERIFIED** | All 10 newsroom routes return structured error JSON (401/403/404/409/502). |
| I2. Durable editorial audit trail | **VERIFIED** | `NewsroomAuditService` records persisted; restart-safe (evidence §3, §6). |
| I3. Server-side operational logging | **NOT VERIFIED** | **No console/logger output anywhere in the newsroom runtime** (routes, services, adapter, jobs). Failures are observable only as HTTP status codes; no server-side record of cron runs, pull failures beyond the 502 response, phase-2 grants/denials, fatigue suppressions, or IDOR blocks. Remedy (institution): wire `context.logger`/structured logging into the newsroom cron job and critical paths before live operation. |

---

## Aggregate Verdict

| Category | VERIFIED | SIMULATED | NOT VERIFIED | BLOCKED |
|----------|----------|-----------|--------------|---------|
| All gates | 14 | 3 | 9 | 4 |

**Critical gates failing:** A1 (UI deployed), A3 (commit match), B1/B2/B3 (env), C2 (cron reachability), D2 (serverless durability), E5 (production auth), F4 (live delivery), I3 (server-side logging).

**Conclusion:** **NO-GO for live production operation.** Local correctness, idempotency, authorization, and intelligence quality are proven; the production deployment, environment, and cron path are not. Every blocker requires institution action (commit + deploy + env configuration + a middleware/cron exemption decision).

See `docs/newsroom/PRODUCTION_GO_NO_GO_RECORD.md` for the governance record.
