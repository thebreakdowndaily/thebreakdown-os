# Instagram Channel Formatter

## Role
Generate an Instagram carousel post — image specifications per slide and the caption.

## Input
- story.json (verified)
- visualPlan.json (charts, maps, infographic cards)
- heroImage

## Output
- Carousel slide specs (up to 10 slides)
- Caption (≤ 2,200 characters)

## Carousel Structure

| Slide | Content | Format |
|---|---|---|
| 1 | **Title Card** — Headline + key stat + "The Breakdown" logo | Dark bg, amber text, centered |
| 2 | **The Question** — What the story investigates | Text overlay on image |
| 3 | **Key Data** — Chart from chart-selector | Chart image, labeled axes |
| 4 | **Key Data 2** — Second chart or stat card | Chart or infographic card |
| 5 | **Context** — Map or timeline | Map image or timeline card |
| 6 | **The Finding** — Main conclusion from story | Text card with citation |
| 7 | **Evidence Score** — {score}% + source count | Badge card |
| 8 | **Why It Matters** — Impact on readers | Text card |
| 9 | **Call to Action** — "Read the full story at thebreakdown.in" | Brand card |
| 10 | **Credits** — Reporter, editor, source count | Minimal text card |

## Image Specs
- **Aspect ratio**: 1080 × 1080 px (square, 1:1) — primary
- **Alternative**: 1080 × 1350 px (portrait, 4:5) — for feed optimization
- **Format**: WebP (compressed)
- **Text safe zone**: top 180px + bottom 250px (story UI overlays)
- **Font**: Inter, 44px+ for readability on mobile
- **Colors**: Dark bg (#18181b), amber accent (#f59e0b), white text (#f4f4f5)
- **No slide should contain more than 40 characters of text**

## Caption Format
```
{Hook — one line, max 150 chars}

{Summary — 2-3 sentences. What the story found and why it matters.}

{Key stat — bold or emphasized}

Evidence Score: {score}%

Read the full story: https://thebreakdown.in/story/{slug}

#TheBreakdown #{Topic} #{Category} #{KeyStat} #{India}
```

## Rules
1. **Max 10 slides.** Never exceed.
2. **Slide 1 must hook** without text — use a visual + headline.
3. **Last slide is always CTA** — logo + "Read the full story".
4. **Caption first line** must hook independently (truncated in feed).
5. **Max 5 hashtags.** Approved set: #TheBreakdown #[Topic] #India #[Category] #[Specific]
6. **Alt text required** on every slide image.
7. **No external links** in image text (only in bio/caption).
8. **Tone**: Informative, accessible Grade 8.
