# Telegram Channel Formatter

## Role
Generate a Telegram channel message — rich text with inline media for direct distribution to subscribers.

## Input
- story.json (verified)
- heroImage or key chart
- evidence score

## Output
- Telegram message text (≤ 4,096 characters)
- Inline media attachment

## Message Structure

```
{Bold: Headline}

{Hook — the first 150 characters appear in channel preview.
 Must be compelling enough to make them tap.}

📊 Key Finding: {The single most important data point}

{2-3 paragraph summary of the story:
 - What the story is about
 - What was found
 - Why it matters}

📐 Evidence Score: {score}% — verified against {N} sources

🔗 Read the full story with interactive visuals:
https://thebreakdown.in/story/{slug}

The Breakdown — India Explained
```

## Rules
1. **First 150 characters are the preview** — make them count (visible in channel list).
2. **Total message ≤ 4,096 characters** (Telegram limit).
3. **Formatting**: Bold (`**bold**`), italic (`_italic_`), links for canonical URL.
4. **Inline media**: attach hero image or a key chart as the photo.
5. **Inline link**: "Read the full story" text links to the URL.
6. **No hashtags** — Telegram convention doesn't use them.
7. **Evidence score** included in every post.
8. **Post time**: 8:00 PM IST (evening reading habit).
