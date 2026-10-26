# Scheduled publication Worker

## Safety model

The Worker is **safe by default**. `DRY_RUN = "true"` is committed in `wrangler.toml`, and missing or invalid values also select preflight mode. In preflight mode the hourly trigger calls:

`https://thebreakdown.in/api/editorial/publish-due/preflight`

That endpoint authenticates `CRON_SECRET` and returns a fixed empty result. It does not query story/schedule tables, evaluate story gates, issue publication tokens, or write any state. It proves endpoint reachability and shared-secret agreement only; it is **not** a substitute for story-level gate tests or editorial review.

The live endpoint `/api/editorial/publish-due` invokes the real publishing service and can publish due stories. Never call it with valid cron credentials as a connectivity test.

## Build and configure

From the repository root:

```sh
npm ci
npm run build:scheduled-worker
```

In the intended Cloudflare account, configure the same approved production secret used by the canonical Next.js runtime. Do not place its value in source code, chat, issue comments, logs, Wrangler `[vars]`, or deployment notes.

```sh
cd workers/scheduled-publish
wrangler secret put CRON_SECRET
wrangler deploy
```

The committed configuration uses `APP_URL = "https://thebreakdown.in"` and `DRY_RUN = "true"`. After the Worker is separately deployed in preflight mode, inspect Cron logs and confirm `editorial.publish_due.preflight.complete` with `mode: "preflight"`. A 401, 500, 404, timeout, or response-contract mismatch must remain a failed preflight, never trigger a DB publishing fallback.

## Enabling actual publication

Do **not** set `DRY_RUN = "false"` until current-head CI is green, the competing editorial/image PR stack has been reconciled, the final code has been reviewed, story-level publication gates and failure paths have passed non-publishing tests, and the owner/editor has explicitly authorized autonomous publishing. The BCCI/Ranji release hold remains independent. This repository patch does not authorize a Worker deployment, database migration, or story publication.
