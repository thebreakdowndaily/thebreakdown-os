# Scheduled publishing Worker

This Worker is a scheduler only. Each hourly Cron event dispatches to the canonical
application endpoint `/api/editorial/publish-due`, which enforces editorial review,
fact-check, evidence, and publication-gate rules.

The Worker intentionally has **no direct database/RPC publishing fallback**. Missing
configuration, network errors, non-success HTTP status codes, invalid JSON, or an
unexpected response contract fail closed and are logged as a failed run. Fix the
canonical endpoint/configuration instead of bypassing its checks.

## Configuration

- `APP_URL` is a non-secret HTTPS origin configured in `wrangler.toml`.
- `CRON_SECRET` must match the application deployment's `CRON_SECRET`. Store it
  as a Cloudflare Worker secret, not in source control or the `[vars]` section.

From the repository root, after review and approval to deploy:

```sh
npm ci
npm run build:scheduled-worker
npx wrangler secret put CRON_SECRET --config workers/scheduled-publish/wrangler.toml
npx wrangler deploy --config workers/scheduled-publish/wrangler.toml
```

Do not deploy until a deliberate non-publishing/dry-run validation is available and
the canonical application's cron secret has been verified. No secret values belong
in command history, committed configuration, test fixtures beyond dummy values, or logs.
