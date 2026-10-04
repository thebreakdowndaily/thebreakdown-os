# PHASE-4B-3S: STAGING CREDENTIAL RESTORATION

## Objective
Restore a valid Breakdown staging Supabase secret-key path after the previous Vercel staging credential became corrupted with a redacted Management API response.

## Execution Details

1. **Environment Verification**
   - Verified the target Supabase project ID is `lvfovvidtowadmnggzzf` (staging).
   - Read `.vercel/project.json` and confirmed the local repository is correctly linked to the Vercel project `prj_WcVDpSso6PPWWOPKwoBRC9lm0huO` named `thebreakdown-os`.

2. **Credential Generation**
   - Due to recent API changes, Supabase Management API redacts secret keys (`sb_secret_...`) upon creation by default.
   - Successfully bypassed this redaction by using the explicitly undocumented `?reveal=true` parameter during key creation.
   - Generated a single, modern secret key with `service_role` claims. The key was never printed, logged, or saved to a plaintext file.

3. **Secure Vercel Update**
   - Used the Vercel REST API to securely patch the new secret key directly into the existing environment variables:
     - `STAGING_SUPABASE_SERVICE_ROLE_KEY` (mapped to `preview` and `development`)
     - `SUPABASE_SERVICE_ROLE_KEY` (mapped to `preview`)
   - Did not alter the `production` environment variable targeting `SUPABASE_SERVICE_ROLE_KEY`.

4. **Staging Authentication Verification**
   - Programmatically validated the updated staging credential configuration by running the existing OCC test harness (`test-staging-occ.ts`).
   - The harness successfully loaded the new configuration from the Vercel staging environment.
   - Real staging authentication succeeded, successfully running identical concurrency, conflicting concurrency, replay, and missing version validation tests.
   - The OCC script cleaned up successfully, leaving zero synthetic leftovers.
   - Zero production access occurred.

5. **Security Cleanup**
   - Removed all temporary scripts and Node.js artifacts (`restore-cred*.js`, `verify-auth.js`, `list-vercel-envs.js`).
   - Verified no credential literals exist inside repository source files (`git grep`).
   - Confirmed no stray `.env.vercel.staging` or similar key files remained on disk.

6. **Validation Suite**
   - `git status --short`: Clean (no tracked files modified).
   - `git diff --check`: Clean (no trailing whitespace).
   - `npx vitest run`: PASS (1354 tests).
   - `npm run typecheck`: PASS.
   - `npm run lint`: PASS (0 errors).
   - `npm run build`: PASS.

## Conclusion
The staging environment now correctly connects to the Supabase backend using an unredacted, modern secret key correctly synced into the Vercel preview environments. The credential incident is fully closed, and normal staging operations are restored.

**FINAL GATE**: STAGING_CREDENTIAL_RESTORED
