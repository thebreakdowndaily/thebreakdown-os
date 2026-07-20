# Security: Row-Level Security Design

Version: 1.0
Status: Remediated — Awaiting Real PostgreSQL/Supabase Execution
Migration: `004_canonical_research_schema.sql`
Last Updated: 20 Jul 2026

---

## Two Distinct Authorization Layers

This design enforces a strict separation between infrastructure identity and application authorization.

### Infrastructure JWT Role (Supabase-managed)

| Value | Source | Meaning |
|-------|--------|---------|
| `anon` | Supabase Auth | Unauthenticated request |
| `authenticated` | Supabase Auth | Valid signed-in user |
| `service_role` | Supabase Auth | Server-side privileged access, bypasses RLS |

This role is controlled by Supabase Auth. It lives at the **top level** of the JWT: `jwt -> 'role'`.

Never use this value for application authorization decisions.

### Application Research Role (UP403-managed)

| Value | Source | Meaning |
|-------|--------|---------|
| `researcher` | `app_metadata.research_role` | Can insert DRAFT claims, update DRAFT claims |
| `reviewer` | `app_metadata.research_role` | Can update `human_review_status`, cannot publish |
| `editor` | `app_metadata.research_role` | Can publish, close bitemporal history |
| `administrator` | `app_metadata.research_role` | Can archive claims |
| `automated_ingestion_agent` | `app_metadata.research_role` | Can insert claims locked to DRAFT/UNREVIEWED |

This role is set via the Supabase Admin API at user creation time. It lives at `jwt -> 'app_metadata' -> 'research_role'`.

Ordinary users **cannot** modify their own `app_metadata`. Only service-role / admin API calls can set this value.

---

## Claim Path (Canonical)

Every RLS policy that checks application authorization reads:

```sql
(SELECT auth.jwt() -> 'app_metadata' ->> 'research_role')
```

**Never** reads:

```sql
-- FORBIDDEN: conflates infrastructure role with application role
current_setting('request.jwt.claims', true)::json->>'role'
```

The `SELECT` wrapper ensures PostgreSQL evaluates the function once per query, not once per row.

---

## Policy Matrix

### research_claims

| Policy | Operation | USING (row filter) | WITH CHECK (insert/update constraint) |
|--------|-----------|--------------------|---------------------------------------|
| `public_read_published_claims` | SELECT | `publication_status = 'PUBLISHED'` | — |
| `researcher_insert_claims` | INSERT | — | `research_role = 'researcher'` |
| `researcher_update_claims` | UPDATE | `research_role = 'researcher' AND publication_status = 'DRAFT'` | (defaults to USING) |
| `reviewer_update_claims` | UPDATE | `research_role = 'reviewer'` | `publication_status NOT IN ('PUBLISHED')` |
| `editor_publish_claims` | UPDATE | `research_role = 'editor'` | (defaults to USING) |
| `admin_update_claims` | UPDATE | `research_role = 'administrator'` | (defaults to USING) |
| `agent_insert_claims` | INSERT | — | `research_role = 'automated_ingestion_agent' AND publication_status = 'DRAFT' AND human_review_status = 'UNREVIEWED'` |

No DELETE policy exists. Hard deletes are blocked at the RLS layer for all authenticated users. Only `service_role` (which bypasses RLS entirely) can delete.

### research_party_affiliation_history

| Policy | Operation | USING | WITH CHECK |
|--------|-----------|-------|------------|
| `public_read_active_history` | SELECT | `system_to IS NULL` | — |
| `editor_close_history` | UPDATE | `research_role = 'editor'` | (defaults to USING) |

### research_financial_records

| Policy | Operation | USING | WITH CHECK |
|--------|-----------|-------|------------|
| (none) | — | — | — |

RLS is enabled but no policies are defined. All operations are denied for non-`service_role` users. This table is managed exclusively through the service-role / admin path.

---

## Authorization Matrix

| Operation | Public (anon) | No role | Researcher | Reviewer | Editor | Admin | Agent | Service Role |
|-----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| SELECT (PUBLISHED) | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| SELECT (DRAFT) | No | No | No | No | No | No | No | Yes |
| INSERT | No | No | Yes | No | No | No | Yes* | Yes |
| UPDATE DRAFT | No | No | Yes** | Yes*** | Yes | Yes | No | Yes |
| UPDATE PUBLISHED | No | No | No | Yes*** | Yes | Yes | No | Yes |
| DELETE | No | No | No | No | No | No | No | Yes |

\* Agent INSERT is locked to `publication_status = 'DRAFT'` and `human_review_status = 'UNREVIEWED'`
\** Researcher UPDATE restricted to `publication_status = 'DRAFT'`
\*** Reviewer UPDATE has WITH CHECK: `publication_status NOT IN ('PUBLISHED')` — can change `human_review_status` but cannot publish

---

## Security Properties

1. **Fail closed**: Missing or unknown `research_role` → all write operations denied
2. **No self-promotion**: `app_metadata` is server-side only; client `updateUser()` writes to `user_metadata`, not `app_metadata`
3. **No hard deletes via RLS**: No DELETE policy exists for any role; only `service_role` bypasses RLS
4. **Separation of concerns**: Infrastructure role (`authenticated`) and application role (`research_role`) are never conflated
5. **Agent constraint**: Automated ingestion produces only DRAFT/UNREVIEWED records — requires human promotion

---

## Operational Notes

- `service_role` bypasses all RLS. It is an infrastructure privilege, not an application research role. Never represent it as `research_role`.
- User provisioning must use the Supabase Admin API (`supabaseAdmin.auth.admin.createUser`) to set `app_metadata.research_role`. This is a trusted administrative operation.
- RLS policies apply to all three tables with `ENABLE ROW LEVEL SECURITY`: `research_claims`, `research_party_affiliation_history`, `research_financial_records`.
- Tables without RLS policies (`research_evidence_items`, `research_sources`, `research_constituencies`, `research_persons`, `research_political_parties`, `research_projects`, `research_claim_subject_relationships`, `research_corrections`) are fully accessible to all authenticated users. Access control for these tables relies on application-level authorization, not database-level RLS.

---

## Known Limitations

1. **No per-row ownership**: Policies are role-based, not ownership-based. Any researcher can update any DRAFT claim, not just their own.
2. **No INSERT on history/financial**: Only `service_role` can write to `research_party_affiliation_history` and `research_financial_records`.
3. **Review scope**: Reviewers can update `human_review_status` on any claim (including PUBLISHED), which may be broader than intended.
4. **RLS not yet tested against real Supabase**: All tests are currently skipped pending `.env.test` configuration with disposable project credentials.

---

## Regression Protection

Static consistency tests in `tests/research/db-integration.test.ts` (Section 10) verify:

1. No policy uses `current_setting('request.jwt.claims', true)::json->>'role'`
2. All 7 role-based policies use `auth.jwt() -> 'app_metadata' ->> 'research_role'`
3. `agent_insert_claims` enforces DRAFT + UNREVIEWED
4. No policy compares against reserved infrastructure roles (`authenticated`, `anon`, `service_role`)

These tests run against the migration SQL file on disk and do not require a database connection.
