import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
	// R2 incremental cache — enable after enabling R2 via Cloudflare Dashboard:
	//   Dashboard > R2 > Enable
	//   wrangler r2 bucket create thebreakdown-media
	// Then uncomment [[r2_buckets]] in wrangler.toml and add:
	//   import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
	//   incrementalCache: r2IncrementalCache,
});
