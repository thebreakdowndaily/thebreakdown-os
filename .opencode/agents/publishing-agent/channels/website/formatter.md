# Website Channel Formatter

## Role
Generate the canonical published story page via the Website Builder.

## Input
- story.json (verified)
- visualPlan.json
- pageSpec.json (from website-builder)

## Output
- Published URL on thebreakdown.in
- Full story page with all sections, visuals, SEO, schema

## Format
```json
{
  "channel": "website",
  "format": "html_page",
  "canonical": true,
  "url": "https://thebreakdown.in/story/{slug}",
  "components": ["hero", "body", "evidence", "charts", "maps", "related-stories"]
}
```

## Rules
1. This is the **canonical source**. All other channels must link here.
2. Full HTML page with SEO meta tags, Open Graph, Twitter Cards, JSON-LD schema.
3. Evidence score displayed prominently in hero section.
4. All figures sourced and linked.
5. Responsive design (dark theme via design system).
6. Page must load under 3 seconds (Core Web Vitals compliant).
