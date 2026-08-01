# THE BREAKDOWN OS — OPERATIONS RUNBOOK & SECURITY MODEL

## Health Monitoring
Health endpoint available at `/api/health`. Evaluates status, uptime, cache policy, and subsystem readiness.

## Security Controls
- **Headers:** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **Authenticated Isolation:** `/editorial/*`, `/research/*`, and `/admin/*` routes set `Cache-Control: no-store` and `X-Robots-Tag: noindex, nofollow`.
- **Rate Limiting:** In-memory request rate limiting via `checkRateLimit()` in `lib/infrastructure/security-audit.ts`.
- **Circuit Breaker:** Fail-closed/fail-open protection via `executeWithCircuitBreaker()` in `lib/infrastructure/reliability.ts`.
