# Security Guide

## Cloudflare Pages Constraints
- The platform is deployed statically to Cloudflare Pages.
- API endpoints are primarily pre-rendered stubs. Avoid exposing sensitive data directly in API route code.

## Content Security Policy (CSP)
Ensure any new external resources (images, scripts, fonts) comply with the `next.config.js` CSP.
- `script-src`: 'self' 'unsafe-inline' 'unsafe-eval' thebreakdown.in GTM Cloudflare
- `img-src`: 'self' data: thebreakdown.in placehold.co
- `connect-src`: 'self' thebreakdown.in GTM GA Cloudflare Sentry

## Best Practices
- **Sanitization**: All user or third-party input must be sanitized.
- **Dependencies**: Periodically review and audit npm dependencies.
- **Secrets**: Do not hardcode secrets or API keys. Use environment variables injected at build time.
