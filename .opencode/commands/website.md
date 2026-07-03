# THE BREAKDOWN
## Website Command v1.0 — Production HTML

### Mission
Convert the final story markdown into production-ready HTML with inline SVG charts, structured data, and responsive layout.

### Output Structure
```
stories/{slug}/
├── {slug}.md              — Source markdown
├── index.html              — Production HTML (generated)
├── charts.md               — Chart specifications
├── images.md               — Image asset specifications
├── seo.md                  — SEO metadata
└── carousel-post.md        — Instagram carousel (optional)
```

### HTML Requirements
- Inline SVG charts (no external image dependencies)
- Dark theme compatible (use CSS variables, not hardcoded colors)
- Responsive (mobile-first, max-width containers)
- Print stylesheet (hide nav, share buttons, related stories)
- All images with width/height attributes to prevent CLS
- Lazy loading for below-fold images
- JSON-LD in head

### SVG Chart Standards
- Use viewBox for scaling, not fixed width/height
- Text elements use system fonts (no custom font loading)
- Gold (#D4A843) for primary data, saffron for emphasis
- Tooltip annotations for data points
- Source attribution below every chart

### Inline Styling
- Use Tailwind utility classes for layout
- Inline or `<style>` block for chart-specific styles
- CSS variables for theme colors (--primary, --saffron, etc.)
- No external CSS dependencies for chart rendering

### Build Verification
- W3C HTML validation: 0 errors
- Lighthouse Performance ≥ 90
- All links resolve (internal + external sources)
- Pagefind can index the page
- Print preview shows clean single-column layout
