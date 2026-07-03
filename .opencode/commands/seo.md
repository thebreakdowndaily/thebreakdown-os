# THE BREAKDOWN
## SEO Command v1.0 — Search & Social Metadata

### Mission
Optimise every story for search discovery and social sharing.

### Title Tag
- Max 60 characters
- Format: `Primary Keyword: Secondary Hook — The Breakdown OS`
- Include target search term within first 50 characters
- No pipe before brand name unless title exceeds 55 chars

### Meta Description
- Max 165 characters
- Must include: what happened, why now, one key data point
- Include primary keyword naturally
- Do not start with "This article" or "In this story"

### Open Graph
- og:title — Same as title tag (max 60)
- og:description — Same as meta description
- og:image — 1200×630 px, must include story-specific visual
- og:type — "article" for stories
- article:published_time — ISO 8601

### Twitter Card
- card: "summary_large_image"
- site: "@thebreakdownin"
- title: Same as og:title
- description: Same as og:description
- image: Same as og:image

### JSON-LD
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "NewsArticle",
      "headline": "...",
      "description": "...",
      "url": "https://thebreakdown.in/story/{slug}",
      "image": "https://thebreakdown.in{hero}",
      "datePublished": "...",
      "author": { "@type": "Person", "name": "Editorial Intelligence Unit" },
      "publisher": { "@type": "Organization", "name": "The Breakdown" }
    }
  ]
}
```

### Keyword Strategy
- Primary keyword: What people search (e.g., "VB-G RAM G", "E20 ethanol Supreme Court")
- Secondary keywords: Related terms (3-5)
- Use in: Title, first paragraph, at least one h2, image alt text
- Do not: Keyword stuff, use jargon as keywords
