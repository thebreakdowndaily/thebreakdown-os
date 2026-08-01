# Metadata Specification — Fix Domain

**Version:** 1.0.0  
**Status:** Architectural Specification (Locked)  
**Date:** July 2026  
**Standards:** Schema.org (JSON-LD), OpenGraph Protocol, Dublin Core, RSS 2.0  

---

## 1. Overview & Single Source of Truth Principle

Metadata for Fix Knowledge Objects is generated exclusively by projecting canonical properties from `Fix` objects. No static metadata headers, hardcoded meta tags, or manual HTML overrides are permitted.

---

## 2. Structured Data Specification (JSON-LD)

Every `/fix/[slug]` surface projects a Schema.org compliant `Legislation` / `GovernmentService` hybrid JSON-LD graph structure.

```json
{
  "@context": "https://schema.org",
  "@type": "Legislation",
  "@id": "https://thebreakdown.gov/fix/digital-procurement-audit-trail#fix",
  "url": "https://thebreakdown.gov/fix/digital-procurement-audit-trail",
  "name": "Mandatory Real-Time E-Procurement Auditing for Public Works",
  "headline": "Mandatory Real-Time E-Procurement Auditing for Public Works",
  "description": "Systemic administrative reform mandating automated gazette logging and public API audit trails for infrastructure tenders.",
  "legislationType": "Administrative Reform",
  "legislationPassedBy": {
    "@type": "GovernmentOrganization",
    "name": "Ministry of Finance"
  },
  "datePublished": "2026-07-25T00:00:00Z",
  "dateModified": "2026-07-25T11:30:00Z",
  "publisher": {
    "@type": "NewsMediaOrganization",
    "name": "The Breakdown",
    "url": "https://thebreakdown.gov"
  },
  "citation": [
    {
      "@type": "CreativeWork",
      "name": "Gazette Notification No. 402/2025",
      "url": "https://data.gov.in/gazette/402-2025"
    }
  ]
}
```

---

## 3. Social & OpenGraph Metadata Projection

```html
<!-- OpenGraph Protocol -->
<meta property="og:type" content="article" />
<meta property="og:title" content="Fix: Mandatory Real-Time E-Procurement Auditing" />
<meta property="og:description" content="Evidence-first policy analysis: Costs, trade-offs, and global precedents for public works tender auditing." />
<meta property="og:url" content="https://thebreakdown.gov/fix/digital-procurement-audit-trail" />
<meta property="og:site_name" content="The Breakdown Knowledge Platform" />

<!-- Twitter / X Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Fix: Mandatory Real-Time E-Procurement Auditing" />
<meta name="twitter:description" content="Evidence Grade: High | Responsible Actor: Ministry of Finance | Time to Impact: 1-3 Years" />

<!-- Canonical URL -->
<link rel="canonical" href="https://thebreakdown.gov/fix/digital-procurement-audit-trail" />
```

---

## 4. Machine-Readable Export Endpoints

To support scholarly research and policy analysis, every published Fix provides standardized export formats generated directly from the canonical model:

1. **`GET /api/v1/fix/[slug].json`**: Pure JSON canonical model (Public View).
2. **`GET /api/v1/fix/[slug].jsonld`**: Standardized Schema.org JSON-LD export.
3. **`GET /api/v1/fix/[slug].csv`**: Tabular export of `recommendedActions`, `tradeOffs`, and `successMetrics`.
4. **`GET /api/v1/fix/[slug].ris`**: RIS Bibliographic citation format for EndNote / Zotero.

---

## 5. RSS & Sitemap Integration

- **Sitemap XML**: Automatically includes all `publicationStatus == 'published'` Fixes under `<loc>https://thebreakdown.gov/fix/[slug]</loc>` with `<lastmod>` derived from `updatedAt`.
- **RSS 2.0 / Atom Feed**: `/fix/feed.xml` streams newly published or updated Fixes with evidence grade badges and responsible entity tags.
