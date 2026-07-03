# X / Twitter Channel Formatter

## Role
Generate an X (Twitter) thread that tells the story in multi-tweet format.

## Input
- story.json (verified)
- evidence score
- key data points

## Output
- Ordered array of tweets (max 25, each ≤ 280 chars)
- First tweet (visible in feed) must hook independently

## Thread Structure

```
Tweet 1 — THE HOOK (280 chars)
  Question or surprising statistic.
  Format: "{Key question} Here's what we found 🧵"
  Include evidence score badge if possible.

Tweets 2-4 — THE CONTEXT
  Background — what was the situation, what changed
  One tweet per key context point

Tweets 5-10 — THE DATA
  One data point per tweet
  Format: "{Stat} — {what it means}"
  Use bold for numbers via Unicode if possible

Tweets 11-13 — THE ANALYSIS
  What the data means — cause, connection, implication
  Quote key source (attributed)

Tweets 14-16 — THE IMPACT
  Who it affects, why it matters
  Real-world consequences

Tweets 17-20 — THE RESPONSE
  Official response, policy context, what happens next
  Source attribution

Tweet 21 — EVIDENCE SCORE
  "📊 Evidence Score: {score}% — verified by The Breakdown's editorial team"

Tweet 22 — CALL TO ACTION
  "Read the full investigation → thebreakdown.in/story/{slug}"

Tweets 23-25 — ADDITIONAL
  Bonus data, related story, or team credit
```

## Tweet Construction Rules
1. **Every tweet must be complete** — a reader should understand it without context.
2. **No tweet exceeds 280 characters.** Count carefully (URLs count as 23).
3. **First tweet must work as a standalone post** (it's what shows in followers' feeds).
4. **Include the canonical link** in the final CTA tweet.
5. **Use line breaks** within tweets for readability (but count characters).
6. **Avoid hashtags** — they waste characters. Use one topic hashtag max.
7. **Quote marks** for direct quotes, attribution for sources.
8. **Numbers**: use digits (7.2% not seven point two percent).
9. **Never use screenshots of text.** Only data visualizations or hero images.
10. **Thread time**: space tweets 2-3 minutes apart for maximum reach.

## Character Budget per Tweet
- Content: ~250 chars (90% of budget)
- Links: 23 chars (auto-shortened)
- Spaces/formatting: remaining
- Reserve 5 chars buffer

## Example Tweet 1
```
India's GDP grew 7.2% in 2025-26 — but is the growth reaching everyone?

We analysed state-level data across 36 states & UTs. The gap between the richest and poorest states is widening.

🧵 A thread on who's winning and who's being left behind.

Evidence: 92/100
```
