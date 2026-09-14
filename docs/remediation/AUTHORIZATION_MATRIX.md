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
