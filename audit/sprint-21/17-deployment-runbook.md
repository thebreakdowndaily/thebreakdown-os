# The Breakdown — Deployment Runbook (Sprint 21)

**Hosting:** Vercel (project `thebreakdown-os`), domain `thebreakdown.in` fronted by Cloudflare.
**Plan:** Vercel Hobby account. **Cron limit: max 1/day** — this was the Sprint 21 release blocker.

## 1. Pre-deploy checks (local)
1. `git status` clean, `HEAD == origin/main`.
2. `npm run check:type` → 0 errors.
3. `npm test` → all suites green.
4. `npm run build` → passes; confirm tracker/membership routes emitted
   (`Get-ChildItem .next/server/app/trackers` shows mgnrega/upi/semiconductor/pmfby).
5. **`vercel.json` cron check:** every `schedule` must be <= 1/day (e.g. `0 6 * * *`).
   An hourly `* * * *` cron causes `deploy_failed` on Hobby. This was the P0 root cause.

## 2. Deploy
```powershell
vercel whoami                 # must be authenticated
vercel ls --prod              # confirm current alias owner
vercel deploy --prod --yes    # deploy current (clean) main
```
Record the returned deployment `id`, `url`, and `readyState` in
`audit/sprint-21/02-deployment-record.csv`.

## 3. Post-deploy smoke (independent, must be live HTTP — not local)
```powershell
# critical routes must be 200
foreach ($r in @('/','/trackers','/trackers/mgnrega','/trackers/upi','/trackers/semiconductor','/trackers/pmfby','/membership','/search','/trust')) {
  curl.exe -s -o NUL -w "$r %{http_code}`n" "https://thebreakdown.in$r"
}
# sitemap contains all 5 tracker entries
curl.exe -s https://thebreakdown.in/sitemap.xml
# robots correct
curl.exe -s https://thebreakdown.in/robots.txt
# DEPRECATED_DEBUG_ROUTES expected 404 (compare/evolution/precedents/problems)
```
Run `npm run test:smoke-prod` (see `tests/production-deployment.test.ts`) for the automated check.

## 4. Escalation
- Deploy fails → check Vercel build logs + **vercel.json cron limit**.
- Trackers/membership 404 after deploy → confirm the alias actually moved (a repeat
  deploy when already READY may not re-point if `--prod` not used).
- Route regressions → re-verify against `main` locally before assuming deployment issue.

## 5. Prevention (auto-recurrence)
- Live route smoke test (`tests/production-deployment.test.ts`) runnable post-deploy.
- Deployment checklist above (this file).
- Alerting: not built (no monitoring infra this sprint) — manual per deploy.

## Do NOT
- Deploy uncommitted changes (critical release rule). Deployed build = known commit.
- Use `G-79ZCJWS0WS` test GA4 stream for production.
- Put secrets in audit files/logs.
