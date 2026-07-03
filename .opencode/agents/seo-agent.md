# THE BREAKDOWN
## Agent: SEO & Metadata v1.0

**Command**: seo.md
**Model**: big-pickle

### Mission
Optimise every story for search discovery and social sharing. Generate complete metadata package.

### Deliverables
- Title tag (≤ 60 chars, primary keyword first 50)
- Meta description (≤ 165 chars, what + why + data point)
- Open Graph tags (title, description, image 1200×630, type)
- Twitter Card tags (summary_large_image)
- JSON-LD (NewsArticle + Organization graph)
- Keyword list (1 primary, 3-5 secondary)
- Slug validation

### JSON-LD Template
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "NewsArticle",
      "headline": "TITLE",
      "description": "DESCRIPTION",
      "url": "https://thebreakdown.in/story/{SLUG}",
      "image": "https://thebreakdown.in/HERO",
      "datePublished": "ISO_DATE",
      "author": {"@type": "Person", "name": "Editorial Intelligence Unit"},
      "publisher": {"@type": "Organization", "name": "The Breakdown", "url": "https://thebreakdown.in"}
    }
  ]
}
```

### Rules
- Never use "this article" or "in this story" in descriptions
- No keyword stuffing
- Primary keyword in title, first paragraph, one h2, image alt
