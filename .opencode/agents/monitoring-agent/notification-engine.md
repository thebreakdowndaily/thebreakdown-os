# Notification Engine

## Purpose
Generate structured editor notifications for detected changes with urgency, affected stories, and suggested actions.

## Input
- `impact_analysis` output (or raw change if analysis fails)
- `editor_preferences` (from Memory Engine: notification channels, quiet hours)

## Output Channels

### 1. Editor Dashboard (Web)
Always sent. Rich HTML card with:
- Severity badge (red=critical, orange=major, yellow=minor, gray=info)
- Source + timestamp
- Change summary (one-line title + 2-3 sentence details)
- Affected stories list (clickable, with version badges)
- Action buttons: "Update & Republish" / "Update Only" / "Dismiss"

### 2. Email Alert
Sent for critical and major changes only.
- Subject: `[Monitor:Critical] {change.title}` (critical) or `[Monitor] {change.title}` (major)
- Preheader: `Affects {n} stories · {change.summary_short}`
- Body: Same as dashboard, simplified for email
- Send during business hours only (8 AM - 10 PM IST) unless critical

### 3. Slack / Team Channel
Sent for all changes (configurable).
```
🔴 CRITICAL — Supreme Court strikes down Section 6A
🕐 2026-07-02 14:30 IST | Source: supreme-court
📰 Affects 2 stories (1 critical, 1 major)
→ story-dpdp-bill-2026 "India's DPDP Bill" [v1] 🔴
→ story-india-tech-regulation "Tech Landscape" [v2] 🟠
```

### 4. Mobile Push
Critical only. One line:
`🔴 [Monitor] DPDP Bill passed in Lok Sabha — affects 2 stories`

## Notification Templates

### Critical Change
```
Subject: [CRITICAL] {entity_name} — {change_type}
Urgency: Immediate action recommended
Source: {source} | {timestamp}

{summary}

Affected Stories:
{story_list}

Suggested: {action}
```

### Major Change
```
Subject: [Major] {entity_name} — {change_type}
Urgency: Review within 24 hours
Source: {source} | {timestamp}

{summary}

Affected Stories:
{story_list}

Suggested: {action}
```

### Minor / Info
Dashboard-only notification:
```
Subject: {entity_name} — {change_type}
Source: {source} | {timestamp}
{summary}
```

## Suppression Rules
- Same change type for same entity within 6 hours → suppress duplicate notification
- Watcher fetch failed → notify once per day (not per failure)
- Quiet hours (10 PM - 8 AM IST): buffer all non-critical notifications
- Editor dismissed same change in last 24h → do not re-notify
- Story in "draft" or "review" state → still notify but note current state

## Output Format
```json
{
  "notification_id": "ntf-2026-7890",
  "severity": "critical",
  "sent_at": "2026-07-02T14:30:00Z",
  "channels": ["dashboard", "email", "slack", "push"],
  "title": "DPDP Amendment Bill passed in Lok Sabha",
  "summary": "The Digital Personal Data Protection (Amendment) Bill, 2026 was passed in Lok Sabha with 3 amendments. It now moves to Rajya Sabha.",
  "affected_count": 2,
  "affected_stories": ["story-dpdp-bill-2026", "story-india-tech-regulation-2026"],
  "action": "update_and_republish",
  "dismissed": false
}
```
