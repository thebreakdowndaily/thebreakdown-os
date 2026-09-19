# Phase 2 — Database Security & RLS Architecture Map

**Target Repository:** `c:/newsjack-content/thebreakdown-os`  
**Phase:** Phase 2 (Database Security, RLS & Authorization Enforcement)  
**Evaluation Date:** September 2026  

---

## 1. Executive Database Inventory

The Breakdown OS database layer consists of multiple PostgreSQL schemas:
1. **`public`**: Core public knowledge objects (`stories`, `topics`, `entities`, `timelines`, `fixes`, `media_items`, `datasets`), dataset dimensions/series/observations, editorial schedule, and legacy users/bookmarks.
2. **`identity`**: User profiles, bookmarks, reading history, follows.
3. **`editorial`**: Canonical claims, sources, citations, evidence items.
4. **`newsroom`**: Ingestion pipelines, observations, signals, alerts, source health.
5. **`research`**: Structured investigation entities, political parties, financial records, search protocols.
6. **`workspace`**: User investigation cases, tasks, exports, notes.
7. **`gov`**: Governance intelligence (ministries, budgets, schemes, audits).

---

## 2. Application-Facing Table Inventory & Security Posture

| Table Name | Schema | Data Sensitivity | Ownership Model | Org/Tenant Model | Current RLS Status | Current Service-Role Usage | Intended Access Policy |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `stories` | `public` | Mixed (Public published / Editorial drafts) | Author / Editorial Staff | Single Platform | **DISABLED (CRITICAL)** | Used via `db()` / `SupabaseStoryRepository` (silent service-role escalation) | **Public**: `SELECT` where `status = 'published'`.<br>**Editorial**: `SELECT`/`INSERT`/`UPDATE` for staff (`is_editor()` or `is_staff()`).<br>**Owner**: `DELETE` restricted to `is_admin()`. |
| `topics` | `public` | Public Knowledge | System / Editorial | Single Platform | **DISABLED (CRITICAL)** | Used via `db()` / `SupabaseTopicRepository` | **Public**: `SELECT` all.<br>**Editorial**: `INSERT`/`UPDATE`/`DELETE` restricted to `is_editor()`. |
| `entities` | `public` | Public Knowledge | System / Editorial | Single Platform | **DISABLED (CRITICAL)** | Used via `db()` / `SupabaseEntityRepository` | **Public**: `SELECT` all.<br>**Editorial**: `INSERT`/`UPDATE`/`DELETE` restricted to `is_editor()`. |
| `timelines` | `public` | Public Knowledge | System / Editorial | Single Platform | **DISABLED (CRITICAL)** | Used via `db()` / `SupabaseTimelineRepository` | **Public**: `SELECT` all.<br>**Editorial**: `INSERT`/`UPDATE`/`DELETE` restricted to `is_editor()`. |
| `fixes` | `public` | Mixed (Public published / Editorial drafts) | Editorial Staff | Single Platform | **DISABLED (CRITICAL)** | Used via `SupabaseFixRepository` | **Public**: `SELECT` where `status = 'published'`.<br>**Editorial**: Full CRUD for `is_editor()`. |
| `media_items` | `public` | Mixed (Public assets / Private pending) | Editorial Staff / Photographer | Single Platform | **DISABLED (CRITICAL)** | Used via `SupabaseMediaRepository` | **Public**: `SELECT` all.<br>**Editorial**: `INSERT`/`UPDATE`/`DELETE` for `is_staff()`. |
| `datasets` | `public` | Public Knowledge | Research / Data Desk | Single Platform | **DISABLED (CRITICAL)** | Used via `SupabaseDatasetRepository` | **Public**: `SELECT` all.<br>**Editorial**: Full CRUD for `is_editor()` / `is_staff()`. |
| `dataset_versions` | `public` | Public Knowledge | System / Versioned | Single Platform | **DISABLED (CRITICAL)** | Used via `SupabaseDatasetRepository` | **Public**: `SELECT` all.<br>**Staff**: Write access for `is_staff()`. |
| `dataset_metrics` | `public` | Public Knowledge | System | Single Platform | **DISABLED (CRITICAL)** | Used via `SupabaseDatasetRepository` | **Public**: `SELECT` all.<br>**Staff**: Write access for `is_staff()`. |
| `dataset_dimensions` | `public` | Public Knowledge | System | Single Platform | **DISABLED (CRITICAL)** | Used via `SupabaseDatasetRepository` | **Public**: `SELECT` all.<br>**Staff**: Write access for `is_staff()`. |
| `dataset_series` | `public` | Public Knowledge | System | Single Platform | **DISABLED (CRITICAL)** | Used via `SupabaseDatasetRepository` | **Public**: `SELECT` all.<br>**Staff**: Write access for `is_staff()`. |
| `dataset_observations` | `public` | Public Knowledge | System | Single Platform | **DISABLED (CRITICAL)** | Used via `SupabaseDatasetRepository` | **Public**: `SELECT` all.<br>**Staff**: Write access for `is_staff()`. |
| `dataset_visualizations` | `public` | Public Knowledge | Editorial / System | Single Platform | **DISABLED (CRITICAL)** | Used via `SupabaseDatasetRepository` | **Public**: `SELECT` all.<br>**Staff**: Write access for `is_staff()`. |
| `users` | `public` | Sensitive / Profile | User-owned (`id = auth.uid()::text`) | Single Platform | **DISABLED (CRITICAL)** | None directly in repo | **User**: `SELECT`/`UPDATE` own row (`id = auth.uid()::text`).<br>**Admin**: `SELECT` all for `is_admin()`.<br>**Public**: No access. |
| `bookmarks` | `public` | Private User Data | User-owned (`user_id = auth.uid()::text`) | Single Platform | **DISABLED (CRITICAL)** | None directly in repo | **User**: `SELECT`/`INSERT`/`UPDATE`/`DELETE` strictly where `user_id = auth.uid()::text`.<br>**Public/Others**: No access. |
| `user_roles` *(NEW)* | `public` | Authoritative Security | System Authorization | Platform / Org | **TO BE CREATED WITH RLS** | Server-side role resolution | **User**: `SELECT` own role (`user_id = auth.uid()`).<br>**Admin**: `SELECT` all for `is_admin()`.<br>**Mutation**: Restricted to service role and `is_admin()`. |
| `editorial_schedule` | `public` | Editorial Internal | Editorial Staff | Single Platform | **ENABLED (014)** | Cron worker & `services/editorial/schedule.ts` | **Staff**: `SELECT`/`INSERT`/`UPDATE` for staff roles.<br>**Public**: No access. |
| `publication_gate_log` | `public` | Editorial Internal | Automated Gate Log | Single Platform | **ENABLED (014)** | Scheduled publish worker | **Staff**: Read access.<br>**Worker**: Service-role write. |
| `corrections` | `public` | Public Transparency | Editorial Staff | Single Platform | **ENABLED (013)** | Service role / internal | **Public**: Read access.<br>**Staff**: Write access. |
| `reader_corrections` | `public` | Reader Feedback | Submitter / Editorial | Single Platform | **ENABLED (013)** | Service role / internal | **Public**: Submit new correction (`INSERT` with `status = 'received'`).<br>**Staff**: Triage and read. |
| `newsroom.*` (17 tables) | `newsroom` | Ingestion / Intelligence | Newsroom Staff | Single Platform | **ENABLED (012)** | Newsroom ingestion pipeline (`services/intelligence/newsroom/persistence/supabase.ts`) | **Staff**: Scoped read/write.<br>**Ingestion**: Service role. |
| `research_*` (14 tables) | `public` | Research Knowledge | Research Desk | Single Platform | **ENABLED (004, 005, 009)** | Research ingestion pipeline (`services/intelligence/research/persistence/supabase.ts`) | **Staff**: Scoped read/write.<br>**Public**: Read for published claims/evidence. |
| `workspace_*` (6 tables) | `public` | Private Investigation | User-owned (`user_id = auth.uid()::text`) | Single Platform | **ENABLED (010)** | Workspace service | **User**: Strict ownership isolation. |
| `gov_*` (6 tables) | `public` | Public Governance Data | Research Desk | Single Platform | **ENABLED (011)** | Governance service | **Public**: Read access.<br>**Staff**: Write access. |

---

## 3. Service-Role Usage Audit & Classification

| Invocation Site | File Path | Current Usage | Classification | Remediation Plan |
| :--- | :--- | :--- | :---: | :--- |
| `getSupabaseClient()` | `supabase/client.ts:64` | Defaults to `getServiceClient()` if `window === undefined` | **UNSAFE / BYPASS** | Remove default service-role fallback. Route to user-scoped client preserving authenticated JWT or anon key. |
| `db()` | `lib/api-v2/index.ts:12` | Calls `getSupabaseClient()` | **UNSAFE / BYPASS** | Switch to user-scoped client with RLS enforcement. |
| Repositories | `services/repositories/supabase/*.ts` | Calls `db()` or `getSupabaseClient()` | **SHOULD USE USER-SCOPED** | Convert to user-scoped client respecting RLS. |
| Editorial Actions | `app/intel/editorial/actions.ts:20` | Calls `getServiceClient()` | **LEGITIMATELY PRIVILEGED / ACTION** | Verify caller principal first with `requireRole('editor')`, then execute privileged database operation. |
| Scheduled Publishing | `services/editorial/schedule.ts:16` | Calls `getServiceClient()` | **BACKGROUND-ONLY** | Valid background daemon usage for automated publishing cron. |
| Cloudflare Cron | `services/editorial/schedule-cf.ts:26` | Uses `env.SUPABASE_SERVICE_ROLE_KEY` | **BACKGROUND-ONLY** | Valid worker background cron. |
| Newsroom Ingestion | `services/intelligence/newsroom/persistence/supabase.ts:57` | Uses `SUPABASE_SERVICE_ROLE_KEY` | **BACKGROUND-ONLY** | Valid background ETL pipeline ingestion. |
| Research Ingestion | `services/intelligence/research/persistence/supabase.ts:66` | Uses `SUPABASE_SERVICE_ROLE_KEY` | **BACKGROUND-ONLY** | Valid background ETL pipeline ingestion. |
| Scheduled Publish Worker | `workers/scheduled-publish/index.ts:36` | Uses `SUPABASE_SERVICE_ROLE_KEY` | **BACKGROUND-ONLY** | Valid automated edge worker. |

---

## 4. Role Hierarchy & Authoritative Model Architecture

```
                       Supabase Auth (JWT)
                               │
                               ▼
                    Extract auth.uid()
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
Database Lookup (authoritative)         JWT app_metadata claim (convenience cache)
    SELECT role, status                     (fallback if DB record pending sync)
    FROM public.user_roles                        │
    WHERE user_id = auth.uid()                    │
            │                                     │
            └──────────────────┬──────────────────┘
                               ▼
                 Authoritative Principal & Role
                 ('owner', 'managing_editor', 'editor',
                  'reporter', 'researcher', 'analyst',
                  'fact_checker', 'guest')
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
 Application Policy Engine              PostgreSQL RLS Engine
 can(principal, permission)              current_app_role()
                                         is_editor() / is_staff()
```

---

## 5. Migration Strategy (`015_enable_rls_and_consolidate_roles.sql`)

1. **Table Creation**: Create authoritative `public.user_roles` table with foreign key to `auth.users(id)` and strict role/status constraints.
2. **Deterministic Role Consolidation**:
   - Map legacy roles (`admin` → `owner`, `writer` → `reporter`, `viewer`/`reader`/`designer` → `guest`).
   - Relax `public.users.role` check constraint to allow authoritative `IntelRole` values.
   - Seed `user_roles` from existing `users` rows deterministically.
3. **SECURITY DEFINER Authorization Helpers**:
   - `public.current_app_role()`: Returns role from `user_roles` (fallback to `app_metadata.role`, default `'guest'`).
   - `public.is_staff()`: Checks if role is in `('owner', 'managing_editor', 'editor', 'reporter', 'researcher', 'analyst', 'fact_checker')`.
   - `public.is_editor()`: Checks if role is in `('owner', 'managing_editor', 'editor')`.
   - `public.is_admin()`: Checks if role is in `('owner', 'managing_editor')`.
4. **Enable RLS on Core Base Tables**:
   - `stories`, `topics`, `entities`, `timelines`, `fixes`, `media_items`, `datasets`, `dataset_versions`, `dataset_metrics`, `dataset_dimensions`, `dataset_series`, `dataset_observations`, `dataset_visualizations`, `users`, `bookmarks`, `user_roles`.
5. **Add Explicit Business Policies**:
   - Published vs Draft story isolation.
   - User bookmarks and user profile strict self-ownership isolation (`auth.uid() = user_id`).
   - Read-only public reference datasets.
   - Editorial write authorization.
