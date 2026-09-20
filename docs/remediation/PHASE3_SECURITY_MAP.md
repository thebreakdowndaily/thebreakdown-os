# Phase 3 Security Map: API Keys, Distributed Rate Limiting & Abuse Prevention

**Branch:** `security/production-hardening`  
**Date:** 2026-09-20  
**Status:** Audit Completed — Implementation in Progress  

---

## 1. Executive Summary & Problem Analysis

The Breakdown OS platform exposes several public and editorial APIs (`/api/stories`, `/api/entities`, `/api/search`, `/api/analytics`, `/api/auth/keys`, `/api/ai/copilot`, `/api/intelligence/resolve-image`, etc.). Prior to Phase 3, API security and rate limiting suffered from critical architectural vulnerabilities:

1. **Ephemeral In-Memory Key Storage (`utils/api-auth.ts`):**
   - API keys were stored in a process-local JavaScript `Map<string, ApiKey>`.
   - In serverless and multi-instance deployments (Vercel Edge/Serverless, Kubernetes, Cloudflare Workers), each lambda/container has an isolated memory space. A key created on one instance did not exist on another.
   - Server restarts or cold starts caused all dynamically generated API keys to vanish.
   - Keys optionally seeded from `API_KEYS` environment variable stored plaintext raw keys in memory.

2. **Ephemeral In-Memory Rate Limiting:**
   - In-memory sliding windows in `utils/api-auth.ts`, `app/api/analytics/route.ts`, `app/api/checkout/route.ts`, and `app/api/newsletter/route.ts` used local `Map<string, RateEntry>`.
   - Under distributed serverless infrastructure, an attacker can bypass rate limits entirely by sending concurrent requests that hit different serverless workers.
   - Memory leak risk: unbounded map growth if traffic comes from randomized IP addresses.

3. **Weak Key Lifecycle & Secret Exposure:**
   - Keys were simple UUIDs without secure random entropy prefixes.
   - Raw keys were stored and compared directly with string equality instead of cryptographically secure hashes and constant-time comparison.
   - Route `app/api/auth/keys/[keyId]/route.ts` passed `keyId` to `revokeApiKey(key)` which checked the raw key in the map, causing revocation by ID to fail silently.
   - Lack of expiration timestamps (`expires_at`), revocation timestamps (`revoked_at`), and ownership tracking (`owner_id`).

4. **Coarse-Grained Authorization:**
   - Keys had only three coarse roles: `admin`, `editor`, `reader`.
   - Any key marked `admin` could perform all operations, bypassing the Phase 1 centralized Principal/Permission/Policy engine.
   - No support for least-privilege scopes (`story:read`, `story:write`, `dataset:read`, etc.).

---

## 2. API Key Architecture Blueprint

### 2.1 Database Schema (`public.api_keys`)

```sql
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix VARCHAR(16) NOT NULL,
  key_hash VARCHAR(64) NOT NULL UNIQUE,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  role TEXT NOT NULL DEFAULT 'reader' CHECK (role IN ('reader', 'contributor', 'reporter', 'editor', 'admin', 'owner')),
  rate_limit_tier TEXT NOT NULL DEFAULT 'standard' CHECK (rate_limit_tier IN ('tier_low', 'standard', 'tier_high', 'unlimited')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ
);
```

### 2.2 Key Format & Generation
- **Prefix:** `tb_live_` (Production) or `tb_test_` (Staging/Test).
- **Entropy:** 32 cryptographically random bytes (256 bits) generated via `crypto.randomBytes(32)`.
- **String Representation:** `tb_live_<base62/hex>` (e.g. `tb_live_9f83...`).
- **Key Prefix (Display):** First 12 characters (e.g. `tb_live_9f83`).
- **Key Hash:** SHA-256 hex digest (`crypto.createHash('sha256').update(rawKey).digest('hex')`).
- **One-Way Storage:** Raw key is returned **strictly once** upon creation in the HTTP response body and is **never** saved to disk, database, logs, Sentry, or analytics.

### 2.3 Verification Pipeline
```text
Incoming Request
  │
  ▼
Extract 'x-api-key' Header
  │
  ├── Missing? ──► 401 Unauthorized
  ▼
Validate Format & Normalize (prefix check, trim)
  │
  ├── Malformed? ──► 403 Forbidden (Invalid format)
  ▼
Compute SHA-256 Hash
  │
  ▼
Query Persistent Database (with in-memory short-lived L1 cache / PostgreSQL)
  │
  ├── Not found? ──► 403 Forbidden (Invalid API key)
  ▼
Check Revocation & Expiration Status
  │
  ├── revoked_at IS NOT NULL? ──► 403 Forbidden (Revoked key)
  ├── expires_at <= NOW()?    ──► 403 Forbidden (Expired key)
  ▼
Construct Authoritative ApiKeyPrincipal
  │
  ├── Attach permissions & role to request context
  ▼
Asynchronously Touch last_used_at
  ▼
Proceed to Rate Limiter & Handler Execution
```

---

## 3. Distributed Rate-Limiting Architecture

### 3.1 Store Abstraction (`RateLimitStore`)
```typescript
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

export interface RateLimitStore {
  increment(key: string, windowMs: number, limit: number): Promise<RateLimitResult>;
  get(key: string, windowMs: number): Promise<{ count: number; resetMs: number }>;
  reset(key: string): Promise<void>;
}
```

### 3.2 Storage Providers
1. **Redis / Upstash (`RedisRateLimitStore`):**
   - High-throughput sliding-window or fixed-window with atomic `INCR` and `PEXPIRE`.
   - Used when `UPSTASH_REDIS_REST_URL` or `REDIS_URL` is configured.
2. **PostgreSQL Distributed Store (`PostgresRateLimitStore`):**
   - Uses `public.rate_limit_buckets` table with atomic `ON CONFLICT DO UPDATE` increments.
   - Provides 100% distributed consistency across all serverless/edge lambdas without requiring third-party Redis subscriptions.
   - Automated TTL sweep removes expired buckets.
3. **Memory Store (`MemoryRateLimitStore`):**
   - Used strictly for local unit tests or offline environments with zero external network connectivity.

### 3.3 Risk-Based Rate Limit Policies

| Endpoint Group | Risk Level | Window | Limit (Standard) | Key Identifier | Action on 429 | Failure Mode |
| :--- | :---: | :---: | :---: | :--- | :---: | :---: |
| **Auth / Login / Keys** | CRITICAL | 1 min | 10 req/min | Client IP | Return 429 + Retry-After | **Fail Closed** |
| **AI / Copilot / Enrichment** | HIGH | 1 min | 15 req/min | Client IP or API Key | Return 429 + Retry-After | **Fail Closed** |
| **Intelligence / Image Gen** | HIGH | 1 min | 20 req/min | Client IP or API Key | Return 429 + Retry-After | **Fail Closed** |
| **Data Download / Export** | MEDIUM | 1 min | 10 req/min | User / IP | Return 429 + Retry-After | **Fail Closed** |
| **Search / Semantic Graph** | MEDIUM | 1 min | 30 req/min | Client IP or API Key | Return 429 + Retry-After | **Fail Closed** |
| **Public Content APIs** | LOW | 1 min | 60 req/min | Client IP | Return 429 + Retry-After | **Degrade Gracefully** |
| **Authenticated API Keys** | CUSTOM | 1 min | 120 req/min | API Key Prefix | Return 429 + Retry-After | **Fail Closed** |

---

## 4. Abuse Prevention & Request Hardening

1. **Payload Size Guard:**
   - JSON requests capped at 1MB by default; file/image uploads capped at 10MB.
   - Requests exceeding bounds rejected with `413 Content Too Large`.
2. **Pagination Boundedness:**
   - All list endpoints enforce `Math.min(100, Math.max(1, pageSize))`.
   - Protects against memory exhaustion from requests passing `?pageSize=1000000`.
3. **Sensitive Audit Logging:**
   - Log all security events: Key Created, Key Revoked, Auth Failed, Rate Limited, Store Degradation.
   - Strict redacting: raw keys, passwords, JWT tokens, and PII are never recorded in audit streams.
