# World Bank Plugin

## Purpose

Fetch data and reports from the World Bank (worldbank.org). Provides development indicators, country reports, economic data, and research publications.

## Source Access

| Detail | Value |
|--------|-------|
| API Base | `https://api.worldbank.org/v2` |
| Indicators API | `https://api.worldbank.org/v2/country/{code}/indicator/{indicator}?format=json` |
| Search URL | `https://search.worldbank.org/api/v2/wds` |
| Country Data | `https://api.worldbank.org/v2/country` |
| Docs | `https://documents.worldbank.org/en/latest` |
| Type | API (REST, JSON) |
| Auth | None (public, rate-limited) |

## Fetching Instructions

1. **Indicators**: Use the Indicators API with country code and indicator ID. Supports `?date=2018:2023` for ranges and `?per_page=100` for batch.
2. **Country data**: Fetch country metadata including region, income level, capital.
3. **Documents**: Use WDS (World Bank Documents) search API for reports and publications.
4. **Data Catalog**: Use `https://datacatalog.worldbank.org/api` for dataset search.

## Parsing Instructions

### Indicator Data

| Field | Extraction |
|-------|-----------|
| Indicator ID | e.g., `NY.GDP.PCAP.CD` |
| Country | ISO 3-letter code |
| Year | Data year |
| Value | Numeric value (may be null) |
| Unit | Currency, percentage, or ratio |

### Report Data

| Field | Extraction |
|-------|-----------|
| Title | Full title |
| Report ID | e.g., `123456` |
| Published Date | Issue date |
| Abstract | Summary |
| Topics | Assigned categories |
| Regions | Countries/regions covered |
| PDF URL | Download link |

## Common Indicators

| ID | Description |
|----|-------------|
| NY.GDP.PCAP.CD | GDP per capita (current US$) |
| NY.GDP.MKTP.CD | GDP (current US$) |
| SI.POV.DDAY | Poverty headcount ratio at $2.15/day |
| SP.POP.TOTL | Population, total |
| SE.PRM.ENRR | School enrollment, primary |
| SH.XPD.CHEX.GD.ZS | Current health expenditure (% of GDP) |
| NY.GNP.PCAP.CD | GNI per capita (current US$) |
| BX.KLT.DINV.WD.GD.ZS | Foreign direct investment (% of GDP) |

## Handling Guidelines

- **Missing values**: Some year-indicator combinations return null. Note gaps, do not fabricate.
- **Data revisions**: World Bank revises historical data. Use the most recent vintage.
- **API pagination**: Default per_page is 50. Use `?per_page=5000` for full datasets.
- **Country codes**: ISO 3-letter codes (IND, USA, CHN). The API also accepts region codes (ECS, SAS).
- **Rate limiting**: Approximately 100 requests per minute. Batch requests where possible.

## Source Reliability

Tier 2. Reliable statistical data with transparent methodology. Data is authoritative for development indicators but subject to revision.

## Output Schema

Output must conform to `schemas/research.schema.json`. Use `data.type = "statistical"` for indicator data and `data.type = "report"` for publications. Include the indicator metadata and country in the tag set.
