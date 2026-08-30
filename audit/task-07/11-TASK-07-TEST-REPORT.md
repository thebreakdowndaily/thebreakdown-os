# TASK-07 — Test Report

## Executed

| Check | Command | Result |
|-------|---------|--------|
| TypeScript | `npx tsc --noEmit` | Clean |
| Regression suite | `npx tsx tests/analytics-taxonomy.test.ts` | **33/33 PASS** |
| Build | `npm run build` | Passes (253 pages) |
| Lint (new modules) | `npx next lint` (filtered to new files) | 0 errors introduced |

## Analytics taxonomy regression suite (tests/analytics-taxonomy.test.ts)

| Area | Assertions | Result |
|------|-----------|--------|
| Event naming | unique, lowercase_snake_case, ≤40 chars, no GA4-reserved (`page_view`, `scroll`, etc.) | PASS |
| Param contract | allow-list defined per event; param names snake_case ≤40 | PASS |
| Privacy scan | no PII / secret / email-style param names | PASS |
| Production gating | thebreakdown.in + www allowed; vercel.app/localhost/preview excluded; non-prod NODE_ENV blocked | PASS |
| Referrer classification | google.com + google.co.in → organic_search; x.com/t.me → social; generic → referral; blank → direct | PASS |
| Discovery channel | utm_source=newsletter → newsletter; twitter referrer → social | PASS |
| Validation helpers | valid/invalid/reserved/unknown event acceptance; query truncation ≤200 | PASS |

Two bugs surfaced by tests and fixed during implementation:
1. `google.co.in` (and Google country domains) were not classified as search — replaced
   prefix matching with an explicit search-host suffix table.
2. `utm_source=newsletter` was misclassified as `social` because the substring `x`
   matched inside `newsletter` — replaced substring matching with token matching.

## Production access verification (data integrity)

Machine-verifiable checks are green. Human-verifiable access is documented as
**NOT VERIFIED — PRODUCTION ACCESS REQUIRED**:

- GA4 property existence / data stream / demo+advanced params.
- Google Search Console domain + sitemap + watch queries.
- Newsletter provider connection (required before `newsletter_subscribed` may fire).
- Sentry DSN live in production env.

No numbers in this report import fabricated analytics; every baseline uses the
`NOT VERIFIED` marker from 01-access-audit.csv.