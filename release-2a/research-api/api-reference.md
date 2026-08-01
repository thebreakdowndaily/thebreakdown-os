# UP403 Research API — API Reference

**Version:** v1 | **Dataset:** v1.1.0 | **Base URL:** `/api/up403/v1`

## Authentication

The API is publicly accessible. No API key required.

**Note:** All other `/api/*` routes require an `x-api-key` header, but the UP403 Research API is whitelisted.

## Common Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-indexed) |
| `limit` | integer | 20 | Items per page (max 100) |
| `include` | string | — | Set to `provenance` to include provenance metadata |

## Standard Response Format

```json
{
  "success": true,
  "version": "v1",
  "dataset_version": "1.1.0",
  "count": 20,
  "page": 1,
  "limit": 20,
  "total": 403,
  "data": [ ... ]
}
```

## Error Response Format

```json
{
  "success": false,
  "version": "v1",
  "error": "not_found",
  "message": "Constituency 'UP-AC-999' not found. Valid format: UP-AC-001",
  "documentation_url": "/api/up403/v1"
}
```

---

# Endpoints

## 1. API Root

```
GET /api/up403/v1
```

Returns API version, dataset version, research cutoff date, and a complete endpoint index.

**Response:**
```json
{
  "success": true,
  "version": "v1",
  "dataset_version": "1.1.0",
  "data": {
    "api_version": "v1",
    "dataset_version": "1.1.0",
    "research_cutoff": "2026-07-30",
    "total_constituencies": 403,
    "schema_version": "1.0.0",
    "endpoints": { ... }
  }
}
```

## 2. List Constituencies

```
GET /api/up403/v1/constituencies?page=1&limit=20&district=Saharanpur&include=provenance
```

**Filters:**

| Parameter | Example | Description |
|-----------|---------|-------------|
| `search` | `?search=Saharanpur` | Search name, district, division, MLA, MP |
| `district` | `?district=Saharanpur` | Filter by district |
| `division` | `?division=Meerut` | Filter by division |
| `region` | `?region=Western%20UP` | Filter by region |
| `reservation` | `?reservation=SC` | Filter by reservation type |
| `party` | `?party=BJP` | Filter by current winning party |
| `political_dna` | `?political_dna=SAFE` | Filter by DNA classification |
| `competitiveness` | `?competitiveness=COMPETITIVE` | Filter by competitiveness class |

**Response:**
```json
{
  "success": true,
  "version": "v1",
  "dataset_version": "1.1.0",
  "count": 7,
  "page": 1,
  "limit": 20,
  "total": 7,
  "filters_applied": {
    "search": null,
    "district": "Saharanpur",
    "division": null,
    "region": null,
    "reservation": null,
    "party": null,
    "political_dna": null,
    "competitiveness": null
  },
  "data": [
    {
      "canonical_constituency_id": "UP-AC-001",
      "ac_number": 1,
      "constituency_name": "Behat",
      "pc_number": 1,
      "pc_name": "Saharanpur",
      "district": "Saharanpur",
      "division": "Saharanpur",
      "region": "Western UP (NCR + Western)",
      "reservation_type": "GENERAL",
      ... (all 150 fields)
    }
  ]
}
```

## 3. Get Constituency Profile

```
GET /api/up403/v1/constituencies/UP-AC-001
```

Returns the complete 150-field intelligence object for one constituency.

## 4. Search

```
GET /api/up403/v1/search?q=Saharanpur&page=1&limit=10
```

Searchable fields: Constituency name, District, Division, Region, MLA name, MP name, Political Party, DNA classification, ODOP product, Governance issues, Economic indicators.

**Response:**
```json
{
  "success": true,
  "version": "v1",
  "count": 7,
  "page": 1,
  "limit": 10,
  "total": 7,
  "query": "Saharanpur",
  "data": [
    {
      "score": 100,
      "matched_fields": ["district"],
      "record": { ... }
    }
  ]
}
```

## 5. List People

```
GET /api/up403/v1/people?page=1&limit=50
```

Returns all unique MLAs and MPs across the dataset with their election history.

## 6. Get Person Profile

```
GET /api/up403/v1/people/Yogi%20Aditya%20Nath
```

Returns the person's election history, contested constituencies, party affiliation, and roles.

## 7. Election Overviews

```
GET /api/up403/v1/elections
```

Returns aggregated data for 2012, 2017, 2022 Vidhan Sabha and 2024 Lok Sabha overlay, including party seat counts.

```
GET /api/up403/v1/elections?constituency=UP-AC-001
```

Filter elections by constituency.

## 8. Election Year Detail

```
GET /api/up403/v1/elections/2022
```

Returns per-constituency results for the specified year.

```
GET /api/up403/v1/elections/2024-overlay
```

Returns 2024 Lok Sabha overlay data (MP winners, party flags).

## 9. Knowledge Graph

```
GET /api/up403/v1/graph
```

Returns the full administrative knowledge graph: 570 nodes (divisions, districts, PCs, ACs, persons, parties) with 1446 edges.

```
GET /api/up403/v1/graph/UP-AC-001
```

Returns the sub-graph for a single constituency with relationships to district, division, PC, MLA, MP, and party.

## 10. Timeline

```
GET /api/up403/v1/timeline/UP-AC-001
```

Returns chronological events: elections, representation changes, by-elections, vacancies, governance issues.

## 11. Filter Options

```
GET /api/up403/v1/filter/options
```

Returns all available values for each filter dimension — districts, divisions, regions, reservation types, DNA classifications, competitiveness classes, and parties.

## 12. Compare

```
GET /api/up403/v1/compare?ids=UP-AC-001,UP-AC-050,UP-AC-100&categories=election_history,political_dna
```

Compare 2-5 constituencies across selected categories.

**Categories:** `election_history`, `current_representation`, `political_dna`, `economy`, `development`, `governance`, `issues`, `timeline`

## 13. Analytics

```
GET /api/up403/v1/analytics
```

Read-only derived metrics:
- DNA distribution (count per classification)
- Competitiveness distribution
- Party hold counts
- Regional party dominance
- Volatility summary (average scores, high-volatility and stable seat counts)
- Reservation summary

---

# Provenance

Add `?include=provenance` to any constituency endpoint to receive provenance metadata:

```json
{
  "_provenance": {
    "original_authority": "Election Commission of India / Census of India / UP Government",
    "dataset": "UP403 Constituency Intelligence Dataset",
    "dataset_version": "1.1.0",
    "verification_date": "2026-07-28",
    "research_cutoff_date": "2026-07-30",
    "source_quality": "AUTHENTIC",
    "originating_phase": "UP403-DATA-08"
  }
}
```

---

# Versioning

| Component | Version |
|-----------|---------|
| API Version | `v1` (stable) |
| Dataset Version | `v1.1.0` (frozen) |
| Schema Version | `1.0.0` |
| OpenAPI Spec | `3.1.0` |

**Version Policy:** Future dataset upgrades will not break this API. New fields are additive. No fields will be removed or renamed.

---

# Performance

| Metric | Target | Current |
|--------|--------|---------|
| Average Response | <200ms | ~15-50ms (in-memory) |
| Pagination | ✓ | Supported |
| Compression | ✓ | Via Cloudflare / Next.js |
| ETag Support | ✓ | SHA-256 based |
| Cache Headers | ✓ | `public, max-age=300, stale-while-revalidate=60` |
| Stable Ordering | ✓ | By `ac_number` ascending |

---

# Errors

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `bad_request` | Missing or invalid parameters |
| 404 | `not_found` | Resource not found |
| 405 | `method_not_allowed` | Only GET is supported |
| 429 | `too_many_requests` | Rate limit exceeded |
