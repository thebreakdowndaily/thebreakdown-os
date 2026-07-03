# International Monetary Fund Plugin

## Purpose

Fetch data and reports from the IMF (imf.org). Provides country reports, economic outlook data, financial sector assessments, and macroeconomic indicators.

## Source Access

| Detail | Value |
|--------|-------|
| Data API | `https://www.imf.org/-/api/data` |
| WEO API | `https://www.imf.org/-/api/weo` |
| IFS API | `https://www.imf.org/-/api/ifs` |
| Publications | `https://www.imf.org/en/Publications` |
| Country Pages | `https://www.imf.org/en/Countries/{code}` |
| Type | API + Scrape |
| Auth | None (public, rate-limited) |

## Fetching Instructions

1. **World Economic Outlook (WEO)**: Use the WEO API for GDP growth, inflation, unemployment projections. Query by country and year.
2. **International Financial Statistics (IFS)**: Balance of payments, monetary data, exchange rates.
3. **Country Reports**: Fetch Article IV consultation reports and country-specific publications.
4. **Data Mapper**: Use `https://www.imf.org/external/datamapper/api/v1` for visual-ready data.

## Parsing Instructions

### Economic Projections

| Field | Extraction |
|-------|-----------|
| Country | ISO 3-letter code |
| Indicator | e.g., GDP growth, CPI inflation |
| Year | Projection year |
| Value | Numeric value |
| Unit | Percentage, USD billions |
| Estimate/Projection | Historical or forecast |

### Country Reports

| Field | Extraction |
|-------|-----------|
| Title | Full report title |
| Country | Subject country |
| Date | Publication date |
| Report No. | e.g., IMF Country Report No. 24/123 |
| Sections | Key findings, outlook, risks |

## Common WEO Indicators

| Code | Description |
|------|-------------|
| NGDP_RPCH | GDP, constant prices (% change) |
| PCPIEPCH | Inflation, end of period (% change) |
| LUR | Unemployment rate (%) |
| BCA | Current account balance (US$ billions) |
| GGR_NGDP | General government revenue (% GDP) |
| GGX_NGDP | General government total expenditure (% GDP) |
| GGXWDG_NGDP | General government gross debt (% GDP) |

## Handling Guidelines

- **Forecast vintages**: WEO is updated twice a year (April and October) with interim updates in January and July. Use the most recent vintage.
- **Country codes**: ISO 3-letter codes. Some aggregate codes exist (WEOWORLD = world aggregate).
- **Article IV reports**: Annual consultations with member countries. Published with member consent.
- **Access levels**: Some datasets require IMF registration. Prioritize publicly available data.
- **Statistical discrepancies**: IMF data may differ from country-reported data. Note the source.

## Source Reliability

Tier 2. Authoritative for cross-country economic comparisons. Projections are best-effort forecasts, not guarantees.

## Output Schema

Output must conform to `schemas/research.schema.json`. Use `data.type = "forecast"` for projections and `data.type = "report"` for publications. Tag with country, indicator category, and report type.
