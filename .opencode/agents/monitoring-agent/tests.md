# Monitoring Engine — 75 Test Cases

## Watchers (13 tests)

### Parliament Watcher — 1
- [ ] Fetch bill list, detect new bill, flag as `new_entity`
- [ ] Detect bill status change (referred→passed), flag as `status_change`
- [ ] Detect committee report publication, flag as `report_publication`
- [ ] Handle empty bill list (no change), return `no_change`
- [ ] Handle fetch failure, retry with backoff

### Supreme Court Watcher — 2
- [ ] Detect new daily order for ongoing case
- [ ] Detect new judgment published, parse finding (struck down/upheld)
- [ ] Flag 5-judge constitution bench judgment as `critical`
- [ ] Handle PDF parse failure, return raw text fallback

### PIB Watcher — 3
- [ ] Fetch RSS, detect new release, classify by ministry
- [ ] Deduplicate releases already seen in previous poll
- [ ] Handle malformed RSS XML, skip without crashing
- [ ] Detect critical cabinet announcement, flag as `critical`

### Ministry Press Releases — 4
- [ ] Fetch 14 ministry RSS feeds, deduplicate against PIB
- [ ] Detect ministry-specific release not in PIB feed

### RBI Watcher — 5
- [ ] Detect repo rate change from press release
- [ ] Detect new circular/notification
- [ ] Track MPC voting record change

### Election Commission — 6
- [ ] Detect new election schedule announcement
- [ ] Detect MCC imposition
- [ ] Detect by-election result

### CAG Watcher — 7
- [ ] Detect new audit report publication
- [ ] Extract irregularity amount, flag if >Rs 1000cr
- [ ] Detect Action Taken Note publication for known report

### State Govts — 8
- [ ] Fetch 10 state feeds, detect new policy announcement
- [ ] Cross-reference with PIB for state-specific releases

### World Bank — 9
- [ ] Detect new India loan approval
- [ ] Filter non-India items correctly
- [ ] Track India growth forecast change

### UN Watcher — 10
- [ ] Detect India-related UNSC resolution
- [ ] Track India UNSC voting record
- [ ] Detect HDI ranking change

### WHO Watcher — 11
- [ ] Detect PHEIC declaration
- [ ] Detect disease outbreak in India
- [ ] Track India health certification change

### IMF Watcher — 12
- [ ] Detect India GDP forecast revision (>0.5pp)
- [ ] Detect Article IV report publication
- [ ] Compare new forecast vs previous, flag direction

### OECD Watcher — 13
- [ ] Detect India Economic Survey publication
- [ ] Detect India tax transparency rating change
- [ ] Track PISA results (if India participated)

## Diff Engine (6 tests)
- [ ] Ignore trivial changes (whitespace, formatting, pagination)
- [ ] Detect new entity (bill, judgment, policy, report)
- [ ] Detect status change (passed, struck down, approved)
- [ ] Detect value change (rate, percentage, amount)
- [ ] Detect personnel change (new appointment)
- [ ] Handle empty diff (no changes since last poll)

## Impact Analysis (10 tests)
- [ ] Link change to existing story by exact entity name match
- [ ] Link change to existing story by fuzzy entity match (≥0.85)
- [ ] Link change to existing story by topic tag intersection
- [ ] Traverse Knowledge Graph depth 2 to find connected stories
- [ ] Score affected stories by match quality + recency
- [ ] Handle change with no affected stories (log only)
- [ ] Handle change affecting 10+ stories (broad impact flag)
- [ ] Deduplicate stories found via multiple paths
- [ ] Respect story pending-update lock (no concurrent updates)
- [ ] Correctly downgrade stories >90 days old (archived flag)

## Severity Classification (8 tests)
- [ ] Change that reverses story claim → `critical`
- [ ] Change that adds significant facts → `major`
- [ ] Change that adds marginal context → `minor`
- [ ] Change unrelated to any story → `informational`
- [ ] Law struck down by SC → `critical`
- [ ] Repo rate change → `critical`
- [ ] New WHO guideline → `minor`
- [ ] New PIB release about existing scheme → `major`

## Notification Engine (8 tests)
- [ ] Generate dashboard notification for critical change
- [ ] Generate email alert for critical + major changes only
- [ ] Generate Slack message with severity emoji + affected stories
- [ ] Generate mobile push for critical only
- [ ] Suppress duplicate notification within 6 hours
- [ ] Buffer notifications during quiet hours (10PM-8AM IST)
- [ ] Respect editor dismiss (do not re-notify within 24h)
- [ ] Include `suggested_action` in every notification

## Update Workflow (6 tests)
- [ ] Update workflow skips full research + verification steps
- [ ] Update workflow runs: memory → graph → visual → editorial-review → website → publishing
- [ ] Version increments correctly (v1→v2) after update
- [ ] "What Changed" section appended to story
- [ ] Original story ID preserved across versions
- [ ] All 10 publishing channels regenerate with version note

## State Management (6 tests)
- [ ] Last poll state stored in Memory Engine under `monitor:last_poll:<watcher_id>`
- [ ] State correctly retrieved on next poll for diff
- [ ] Empty fetch result does not clear last known state
- [ ] Hash comparison detects meaningful content change
- [ ] Exponential backoff on fetch failure (30s→2min→10min→30min)
- [ ] Rate limiting: max 1 req/5sec per domain

## Error Recovery (6 tests)
- [ ] Watcher fetch timeout → retry with backoff
- [ ] Watcher 500 error → retry with backoff
- [ ] Watcher returns empty → keep last state, skip diff
- [ ] Impact analysis query fails → notify editor with raw change
- [ ] Update workflow fails → retain previous published version
- [ ] All watchers fail → alert ops channel

## Edge Cases (6 tests)
- [ ] Multiple watchers detect same change → deduplicate
- [ ] Change entity has multiple names/aliases → resolve all
- [ ] Story has pending update → queue change, no concurrent
- [ ] Editor dismisses notification → do not re-notify same change
- [ ] Watcher encounters auth failure → flag for config review
- [ ] Source URL changes → manual update required notification

## Integration (6 tests)
- [ ] Full loop: PIB fetch → diff → impact → notification → update workflow → republish
- [ ] Full loop: Supreme Court judgment → diff → impact → notification → update workflow → republish
- [ ] Full loop: RBI rate change → diff → impact (no stories) → log only
- [ ] Monitoring agent registers in orchestrator as async daemon
- [ ] Monitoring engine correctly reports health status
- [ ] Monitoring engine respects schedule intervals (15min/6h/24h)
