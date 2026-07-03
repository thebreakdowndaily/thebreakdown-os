# Podcast Channel Formatter

## Role
Generate a podcast episode script (8-12 minutes, conversational tone) for audio distribution on Spotify, Apple Podcasts, and RSS.

## Input
- story.json (verified)
- evidence score
- key data points

## Output
- Podcast script (8-12 minutes)
- Episode title
- Show notes (description for podcast platforms)

---

## Script Structure

### Intro (0:00-1:30)
```
HOST: You're listening to The Breakdown. I'm {Host Name}.

Today: {Story headline in one sentence}.

{The hook — a question or surprising stat that sets up the episode.}

Let's get into it.
```

### Act 1: Context (1:30-3:30)
```
HOST: So here's what's happening. {Explain the situation — who, what, where, when.}

{Anecdote or concrete example to ground the listener.}

{Why this matters right now.}
```

### Act 2: The Data (3:30-6:30)
```
HOST: We looked at the numbers. Here's what we found.

{Data point 1 — say the number, then explain what it means.}
{Data point 2 — connect to the first.}
{Data point 3 — the surprise or key insight.}

[Sound design: subtle data tone transition between points]
```

### Act 3: The Impact (6:30-9:00)
```
HOST: What this actually means for {affected group}.

{Real-world consequence 1}
{Real-world consequence 2}
{What happens next}
```

### Act 4: Evidence & Sources (9:00-10:00)
```
HOST: Our evidence score on this story is {score} out of 100. That means we verified every figure against {N} sources including {top sources}.

{A quick note on methodology — transparency builds trust.}
```

### Outro (10:00-11:00)
```
HOST: Here's what to remember: {One-sentence summary}.

Read the full story with charts and maps at thebreakdown.in/story/{slug}.

If you found this valuable, rate us 5 stars and tell a friend.

Next episode: {Tease next story}.

I'm {Host Name}. This is The Breakdown.
```

---

## Technical Specs
- **Duration**: 8-12 minutes (hard limits)
- **Format**: MP3, 128 kbps, 44.1 kHz, mono
- **Intro music**: 15 seconds, branded
- **Outro music**: 15 seconds, branded
- **Ad break**: Natural pause at 5:00 mark for mid-roll insertion
- **Show notes**: 2-3 paragraphs + key stats + link to full story

## Script Style
- **Conversational** — use contractions, short sentences, rhetorical questions.
- **Numbers spoken naturally**: "seven point two percent" not "7.2%".
- **Pacing**: vary sentence length. Short for emphasis. Longer for explanation.
- **No visual cues** — explain everything in audio.
- **Transitions**: "Now here's where it gets interesting..." / "But there's more."
- **Names**: pronounceable phonetic hints in parentheses for difficult names.

## Rules
1. **Hook in first 30 seconds** or listener drops off.
2. **Evidence score mentioned** around 9:00 mark (before outro).
3. **One clear takeaway** — listener should remember one thing.
4. **No jargon without explanation** — assume Grade 8 listener.
5. **Episode title**: "{Topic} — {Key Finding}" format (max 60 chars).
