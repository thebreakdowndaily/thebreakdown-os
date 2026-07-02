# Auth System — Tests

## Identity & Configuration
- [ ] `apiKeyManager` is a singleton instance
- [ ] Default dev key is created when `API_KEYS` env var is empty
- [ ] Keys are parsed correctly from `API_KEYS` env var (format: key:name:role)
- [ ] Multiple comma-separated keys are all registered
- [ ] Default role is `reader` when role is not specified in env var

## Key Validation (`validateApiKey`)
- [ ] Returns the ApiKey object for a valid key
- [ ] Returns null for an unknown key
- [ ] Returns null for a revoked key
- [ ] Returns null for an empty string
- [ ] Sets `lastUsed` on successful validation
- [ ] Case-sensitive key matching

## Rate Limiting (`checkRateLimit`)
- [ ] Returns `allowed: true` with `remaining: 99` on first request
- [ ] Returns `allowed: true` with decreasing remaining count on subsequent requests
- [ ] Returns `allowed: false` when rate limit (100/min) is exceeded
- [ ] Returns `remaining: 0` when rate limited
- [ ] `resetMs` is positive when rate limited
- [ ] Rate limit resets after the window passes (sliding window)
- [ ] Different keys have independent rate limits
- [ ] Rate limit does not degrade with idle time (old entries are pruned)

## Key Management
- [ ] `createKey()` generates a valid UUID
- [ ] `createKey()` sets the correct name and role
- [ ] `createKey()` returns an enabled key
- [ ] `revokeKey()` sets `enabled: false`
- [ ] `revokeKey()` returns `true` for existing key
- [ ] `revokeKey()` returns `false` for unknown key
- [ ] `deleteKey()` removes the key from the store
- [ ] `deleteKey()` returns `false` for unknown key
- [ ] `getAllKeys()` returns all keys including created ones

## Middleware (`middleware.ts`)
- [ ] Returns 401 when `x-api-key` header is missing
- [ ] Returns 403 when invalid API key is provided
- [ ] Returns 429 when rate limit is exceeded
- [ ] Includes `X-RateLimit-*` headers on successful requests
- [ ] Public paths (`/api/docs`, `/api/feed`) bypass auth check
- [ ] Non-API paths (`/search`, `/story/...`) bypass middleware
- [ ] Valid API key with rate remaining passes through to the route handler

## Auth API Endpoints
- [ ] `GET /api/auth/keys` returns 403 for non-admin keys
- [ ] `GET /api/auth/keys` returns masked key list for admin keys
- [ ] `POST /api/auth/keys` creates a key with specified name/role
- [ ] `POST /api/auth/keys` defaults to `reader` role when not specified
- [ ] `POST /api/auth/keys` returns 400 for invalid JSON
- [ ] `DELETE /api/auth/keys/:keyId` revokes and deletes the key
- [ ] `DELETE /api/auth/keys/:keyId` returns 403 for non-admin keys
- [ ] After revocation, the key returns 403 on next use

## OpenAPI Docs
- [ ] `GET /api/docs` is public (no auth required)
- [ ] OpenAPI spec includes `securitySchemes` with `apiKeyAuth`
- [ ] OpenAPI spec includes global `security: [{ apiKeyAuth: [] }]`
- [ ] All protected endpoints have 401 and 429 response descriptions

## Integration
- [ ] Valid key + rate remaining → successful API response
- [ ] Valid key + rate exceeded → 429
- [ ] Invalid key → 403
- [ ] No key → 401
- [ ] Admin key can call `/api/auth/keys`
- [ ] Reader key gets 403 on `/api/auth/keys`
- [ ] Key created via POST can immediately authenticate requests
- [ ] Key deleted via DELETE immediately returns 403 on next request

## Edge Cases
- [ ] Race condition: concurrent requests from same key count against rate limit correctly
- [ ] Very long API key (256+ chars) is handled
- [ ] API key with special characters is handled
- [ ] Multiple spaces in env var key format are trimmed
- [ ] Empty API_KEYS env var falls back to dev key
