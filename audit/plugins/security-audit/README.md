# Security Audit Plugin (`security-audit`)

## Overview
This plugin scans the repository for static security vulnerabilities, focusing on exposed secrets, dependency health, and missing Content Security Policy (CSP) configurations.

## Capabilities
- **Secret Scanning**: Scans for the presence of local environment files (`.env.local`, `.vercel.env.production.local`, etc.) that might have been accidentally committed.
- **Content Security Policy**: Verifies that Next.js configurations or layout files define security headers (e.g., `next.config.ts` headers array or `Content-Security-Policy` meta tags).
- **Dependency Health**: Confirms the integrity of lockfiles and package manifests.

## Integration
This plugin emits findings with severe penalties (`critical`) if exposed secrets are found. 

### Policy Rules
Refer to `policy.json` for specific regex patterns matching forbidden files and header definitions.
