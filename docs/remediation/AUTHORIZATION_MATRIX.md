# The Breakdown OS — Authorization Matrix

## 1. Classification of Surfaces
- **PUBLIC**: Public reader surfaces accessible to anonymous and unauthenticated visitors.
- **EDITORIAL**: Editorial tools for content creation, fact-checking, and story composition.
- **INTELLIGENCE**: Investigative and intelligence modules (watch-lists, predictions, scenarios, RTI, newsroom).
- **ADMIN**: Administrative and platform management surfaces (API key management, user roles, system config).

---

## 2. Role Hierarchy & Module Access
Roles ordered by increasing rank (0 to 7):
1. `guest` (0)
2. `fact_checker` (1)
3. `researcher` (2)
4. `reporter` (3)
5. `analyst` (4)
6. `editor` (5)
7. `managing_editor` (6)
8. `owner` (7)

---

## 3. Module Authorization Matrix

| Route / Module | Classification | Minimum Role | Required Permission | Auth Verification |
| :--- | :---: | :---: | :---: | :---: |
| `/story/[slug]` | PUBLIC | None | `story.read` | Public / None |
| `/series/[slug]` | PUBLIC | None | `story.read` | Public / None |
| `/trackers/[slug]` | PUBLIC | None | `story.read` | Public / None |
| `/intel` (Dashboard) | INTELLIGENCE | `guest` | `intel.dashboard` | Verified JWT (`getUser()`) |
| `/intel/verification` | INTELLIGENCE | `fact_checker` | `intel.verification` | Verified JWT (`getUser()`) |
| `/intel/research` | INTELLIGENCE | `researcher` | `intel.research` | Verified JWT (`getUser()`) |
| `/intel/rti` | INTELLIGENCE | `researcher` | `intel.rti` | Verified JWT (`getUser()`) |
| `/intel/candidates` | INTELLIGENCE | `researcher` | `intel.candidates` | Verified JWT (`getUser()`) |
| `/intel/demand` | INTELLIGENCE | `researcher` | `intel.demand` | Verified JWT (`getUser()`) |
| `/intel/media` | INTELLIGENCE | `reporter` | `intel.media` | Verified JWT (`getUser()`) |
| `/intel/toolkit` | INTELLIGENCE | `reporter` | `intel.toolkit` | Verified JWT (`getUser()`) |
| `/intel/tasks` | INTELLIGENCE | `reporter` | `intel.tasks` | Verified JWT (`getUser()`) |
| `/intel/newsroom` | INTELLIGENCE | `reporter` | `intel.newsroom` | Verified JWT (`getUser()`) |
| `/intel/watch-list` | INTELLIGENCE | `analyst` | `intel.watchlist` | Verified JWT (`getUser()`) |
| `/intel/predictions` | INTELLIGENCE | `analyst` | `intel.predictions` | Verified JWT (`getUser()`) |
| `/intel/scenarios` | INTELLIGENCE | `analyst` | `intel.scenarios` | Verified JWT (`getUser()`) |
| `/intel/editorial` | EDITORIAL | `editor` | `intel.editorial` | Verified JWT (`getUser()`) |
| `/intel/story-builder` | EDITORIAL | `editor` | `intel.story_builder` | Verified JWT (`getUser()`) |
| `/editorial/*` | EDITORIAL | `editor` | `story.update` | Verified JWT (`getUser()`) |
| `/admin/*` | ADMIN | `managing_editor` | `audit.read` | Verified JWT (`getUser()`) |
| `/api/auth/keys` (GET) | ADMIN | `owner` / `managing_editor` | `api_key.read` | Verified JWT / Admin API Key |
| `/api/auth/keys` (POST) | ADMIN | `owner` / `managing_editor` | `api_key.create` | Verified JWT / Admin API Key |
| `/api/auth/keys/[id]` (DEL) | ADMIN | `owner` / `managing_editor` | `api_key.revoke` | Verified JWT / Admin API Key |
| `/api/editorial/publish-due` | ADMIN | Machine Cron | Secret Bearer Token | `CRON_SECRET` Match |

---

## 4. Policy Enforcement Rules
1. **Never Trust Client Metadata:** User role is resolved strictly from server-controlled JWT `app_metadata.role` (or secure database record), never from client-writable `user_metadata`.
2. **Fail Closed:** Any missing, expired, revoked, or unverified session is denied access immediately.
3. **Suspended Accounts:** Users with `status: 'suspended'` or an active `banned_until` timestamp are rejected for all privileged actions regardless of role rank.

---

## 5. PostgreSQL Row-Level Security (RLS) Policies

Database security is enforced directly at the PostgreSQL storage layer (defense-in-depth).

| Table | Policy Name | Command | Role / Condition | Security Boundary |
| :--- | :--- | :---: | :--- | :--- |
| `public.stories` | `public_read_published_stories` | `SELECT` | `status = 'published'` | Anyone can read published stories |
| `public.stories` | `staff_read_all_stories` | `SELECT` | `is_staff()` | Editorial staff can view drafts and embargoed stories |
| `public.stories` | `editor_write_stories` | `INSERT`, `UPDATE` | `is_editor()` | Only editors and higher can create/edit stories |
| `public.stories` | `admin_delete_stories` | `DELETE` | `is_admin()` | Only admins/managing editors/owners can delete stories |
| `public.bookmarks` | `user_select_own_bookmarks` | `SELECT` | `auth.uid()::text = user_id` | **Strict Isolation**: User A cannot read User B bookmarks |
| `public.bookmarks` | `user_insert_own_bookmarks` | `INSERT` | `auth.uid()::text = user_id` | **Strict Isolation**: User A cannot insert on behalf of User B |
| `public.bookmarks` | `user_update_own_bookmarks` | `UPDATE` | `auth.uid()::text = user_id` | **Strict Isolation**: User A cannot update User B bookmarks |
| `public.bookmarks` | `user_delete_own_bookmarks` | `DELETE` | `auth.uid()::text = user_id` | **Strict Isolation**: User A cannot delete User B bookmarks |
| `public.users` | `user_read_own_profile` | `SELECT` | `auth.uid()::text = id OR is_staff()` | Users can read own profile; staff can view user directory |
| `public.users` | `user_update_own_profile` | `UPDATE` | `auth.uid()::text = id` | Users can only modify their own profile data |
| `public.users` | `admin_manage_users` | `ALL` | `is_admin()` | Administrative user governance |
| `public.user_roles` | `user_read_own_role` | `SELECT` | `auth.uid() = user_id OR is_staff()` | Users can view own role; staff can view team roles |
| `public.user_roles` | `admin_manage_roles` | `ALL` | `is_admin()` | Only admins/owners can assign/change roles |
| `public.topics` | `public_read_topics` | `SELECT` | `true` | Publicly readable knowledge graph nodes |
| `public.topics` | `editor_manage_topics` | `ALL` | `is_editor()` | Controlled editorial taxonomy management |
| `public.entities` | `public_read_entities` | `SELECT` | `true` | Publicly readable entity knowledge |
| `public.entities` | `editor_manage_entities` | `ALL` | `is_editor()` | Controlled editorial entity management |
| `public.timelines` | `public_read_timelines` | `SELECT` | `true` | Publicly readable historical timelines |
| `public.timelines` | `editor_manage_timelines` | `ALL` | `is_editor()` | Controlled editorial timeline management |
| `public.fixes` | `public_read_fixes` | `SELECT` | `status = 'verified'` | Publicly viewable corrections log |
| `public.fixes` | `staff_manage_fixes` | `ALL` | `is_staff()` | Fact-checkers and reporters manage corrections |
| `public.media_items` | `public_read_media` | `SELECT` | `true` | Publicly viewable media catalog |
| `public.media_items` | `staff_manage_media` | `ALL` | `is_staff()` | Reporters and editors manage media items |
| `public.datasets` | `public_read_published_datasets`| `SELECT` | `status = 'published'` | Public reader dataset exploration |
| `public.datasets` | `staff_read_all_datasets` | `SELECT` | `is_staff()` | Staff analysis of draft/internal datasets |
| `public.datasets` | `editor_manage_datasets` | `ALL` | `is_editor()` | Editors manage datasets and observation series |

