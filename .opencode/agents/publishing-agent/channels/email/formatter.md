# Email Alert Formatter

## Role
Generate a transactional email alert for subscribers — concise, actionable, designed for quick reading.

## Input
- story.json (verified)
- heroImage
- evidence score

## Output
- Email subject line (≤ 60 chars)
- Preheader text (≤ 85 chars)
- HTML email body (dark theme, responsive)
- Plain text alternative

---

## Structure

### Subject Line (≤ 60 chars)
```
{Headline shortened to 60 chars} | The Breakdown
```

### Preheader (≤ 85 chars)
```
{Key stat} — {what it means in 85 chars}
```

### HTML Body

```html
<!-- Dark theme, single column, max 600px wide -->

[THE BREAKDOWN LOGO]

Headline
────────
{Headline}

Key Stat
────────
{Most compelling number — large, amber colored}

Summary
───────
{3-4 sentences: hook → context → finding → implication}

[HERO IMAGE — 600px, rounded corners]

Evidence Score: {score}% — verified against {N} sources

─── [READ THE FULL STORY] ───
Button: https://thebreakdown.in/story/{slug}

───
Why this matters: {One sentence on impact}

───
The Breakdown is an independent, data-driven journalism platform
covering Indian policy, politics, and society.

[Unsubscribe] | [Privacy Policy] | [Twitter/X] | [Instagram]
[The Breakdown, {City}, India]
```

---

## Plain Text Alternative
```
Headline
========
{Headline}

Key Stat: {Most compelling number}

{Summary — 3-4 sentences}

Evidence Score: {score}%

Read the full story: https://thebreakdown.in/story/{slug}

───
The Breakdown — India Explained
Unsubscribe: {link}
```

## Rules
1. **Subject ≤ 60 chars** — mobile inbox shows ~40 chars, keep hook in first 40.
2. **Preheader ≤ 85 chars** — visible right after subject in most clients.
3. **Above the fold**: headline + key stat + hero image visible without scrolling.
4. **Single column** — always renders correctly in all email clients.
5. **Dark theme** — background #18181b, text #f4f4f5, buttons amber.
6. **One primary CTA** — "Read the Full Story" button (not multiple links).
7. **Unsubscribe link** required (CAN-SPAM / GDPR).
8. **Physical address** required (CAN-SPAM).
9. **No JavaScript** — plain HTML only.
10. **Tracking**: open rate pixel + click tracking on CTA.
