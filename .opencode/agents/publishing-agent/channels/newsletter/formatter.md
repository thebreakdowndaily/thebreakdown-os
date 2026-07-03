# Newsletter Channel Formatter

## Role
Generate a newsletter edition featuring this story — suitable for Mailchimp, SendGrid, or custom ESP.

## Input
- story.json (verified)
- heroImage (from visualPlan or story)
- evidence score

## Output
- HTML email (dark theme, responsive, single-column)
- Plain text alternative
- Subject line + preheader

## Structure

### Subject Line (≤ 60 chars)
Format: `{Key Stat} | {Headline}`

### Preheader (≤ 85 chars)
The single most compelling reason to open.

### Email Body
```
[THE BREAKDOWN LOGO]

Headline
────────
{Headline}

Key Stat
────────
{Most surprising number from the story}

Story Summary
─────────────
3-4 paragraphs max. Hook → Context → Key finding → Why it matters.

[HERO IMAGE - 600px wide, responsive]

Evidence Score: {score}%

Read the full story →
[Button: "Read on thebreakdown.in"]

─────────────
The Breakdown is an independent, data-driven journalism platform covering Indian policy, politics, and society.
[Unsubscribe] | [Privacy Policy] | [Twitter/X] | [Instagram]
```

## Rules
1. **5 min read max.** Keep body under 1,200 words.
2. **Hero image required.** 600px wide, dark-compatible.
3. **Evidence score badge** displayed after the summary.
4. **One primary call-to-action** — "Read the Full Story".
5. **Unsubscribe link** mandatory (CAN-SPAM / GDPR compliant).
6. **Tracking pixel**: open rate + click tracking.
7. **Send time**: 7:00 AM IST (morning reading habit).
8. **Dark theme** email (background: #18181b, text: #f4f4f5).
