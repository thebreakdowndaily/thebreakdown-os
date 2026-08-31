# Security Baseline Audit Report

This report outlines the structural security boundaries and operational policy compliances.

---

## 1. Security Architecture & Controls

### HTTPS & Transport Security
- Production hosting requires DNS SSL verification. HSTS headers (`Strict-Transport-Security`) are enforced with `max-age=31536000` to prevent downgrades.

### Content Security Policy (CSP)
- CSP is configured via HTTP response headers in [`middleware.ts`](file:///C:/newsjack-content/thebreakdown-os/middleware.ts):
  - `default-src 'self'`
  - Script and style injection attempts are restricted to trusted domains and hashes.

### Input Sanitization (XSS)
- The utility [`sanitizeHtmlInput`](file:///C:/newsjack-content/thebreakdown-os/lib/infrastructure/security-audit.ts) encodes standard characters into HTML entities (e.g. `<` to `&lt;`), neutralising malicious injections.

---

## 2. API & Access Controls

### Rate Limiting Protection
- Bounded rate limiting is executed server-side.
- `/api/checkout`, `/api/newsletter`, and `/api/citations` enforce cool-down checks (e.g. 1 checkout request per minute per IP/email pair) stored in-memory to prevent spamming.

### Authentication Boundaries
- Admin and Editorial workspace routes require valid Supabase JWT tokens. 
- Role flags are verified **server-side** during mutations (e.g., creating or updating citations). Client-side role claims are ignored.

### Secret Isolation
- Sensitive keys (`BEEHIIV_API_KEY`, `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are bound exclusively to server-side context. No secrets are prefixed with `NEXT_PUBLIC_` to prevent leakage to bundle files.
- Local secret files (`.env.local`, `.env.test`) are ignored in `.gitignore`.
