# World Health Organization Plugin

## Purpose

Fetch and parse data from the World Health Organization (who.int). Covers disease outbreaks, health guidelines, global health statistics, and emergency declarations.

## Source Access

| Detail | Value |
|--------|-------|
| Base URL | `https://www.who.int` |
| Data API | `https://ghoapi.azureedge.net/api` (WHO Global Health Observatory) |
| News URL | `https://www.who.int/news-room` |
| Disease Outbreak | `https://www.who.int/emergencies/disease-outbreak-news` |
| Publications | `https://www.who.int/publications` |
| Dashboards | `https://data.who.int/dashboards` |
| Type | API + Scrape |
| Auth | None (public) |

## Fetching Instructions

1. **Disease Outbreak News (DONs)**: Fetch DON articles for emerging outbreaks and public health events.
2. **WHO guidelines**: Health guidelines, protocols, and recommendations by disease or health topic.
3. **Global Health Observatory (GHO)**: Statistical data through the REST API. Use indicator codes for health metrics.
4. **Emergency declarations**: PHEIC (Public Health Emergency of International Concern) declarations by the Director-General.
5. **Situation reports**: Periodic reports on ongoing health emergencies (COVID-19, Mpox, Ebola, etc.).

## Parsing Instructions

### Disease Outbreak News

| Field | Extraction |
|-------|-----------|
| Title | Headline of the DON |
| Date | Publication date |
| Disease | Disease name |
| Country | Affected country |
| Cases | Confirmed cases |
| Deaths | Confirmed deaths |
| Risk Assessment | WHO's risk classification |
| Spread | Geographic spread details |
| WHO Advice | Official recommendations |

### GHO Indicator

| Field | Extraction |
|-------|-----------|
| Indicator Code | e.g., `WHOSIS_000001` |
| Indicator Name | e.g., Life expectancy at birth |
| Country | ISO 3-letter code |
| Year | Data year |
| Value | Numeric value |
| Unit | Per 1000, percentage, years |

### Emergency Declaration

| Field | Extraction |
|-------|-----------|
| Event | Disease or health event |
| PHEIC Status | Declared / Not Declared / Extended |
| Date | Declaration date |
| Committee | Emergency Committee recommendation |
| Temporary Recommendations | WHO's formal recommendations |
| Duration | If PHEIC ended, end date |

## Handling Guidelines

- **PHEIC**: The highest level of alarm under International Health Regulations (IHR). Only issued for events that constitute a public health risk to other states.
- **DON timeliness**: DONs are published rapidly during evolving outbreaks. May be updated with new data.
- **API pagination**: GHO API returns paginated results. Use `$skip` and `$top` parameters.
- **Data completeness**: Some country-indicator combinations have missing data. Note gaps.
- **Country names**: WHO uses official UN country names. Map to ISO 3-letter codes.
- **Multiple updates**: During active outbreaks, multiple DONs may be published for the same event. Track by event ID.

## Common GHO Indicators

| Code | Description |
|------|-------------|
| WHOSIS_000001 | Life expectancy at birth (years) |
| WHS2_100 | Under-five mortality rate (per 1000 live births) |
| SH_DYN_AIDS | AIDS-related deaths (per 100,000) |
| SH_XPD_CHEX_GD_ZS | Current health expenditure (% of GDP) |
| NCD_BMI_30 | Prevalence of obesity among adults (%) |

## Source Reliability

Tier 2. Authoritative for global health data and norms. Outbreak data is best-effort during emergencies and subject to reporting delays.

## Output Schema

Output must conform to `schemas/research.schema.json`. Use `data.type`:
- `"outbreak-report"` for DONs
- `"health-statistic"` for GHO indicators
- `"policy-guideline"` for WHO recommendations
- `"emergency-declaration"` for PHEIC events

Tag with disease, country, and WHO region.
