# Reserve Bank of India Plugin

## Purpose

Fetch and parse data from the Reserve Bank of India (rbi.org.in). Covers monetary policy announcements, circulars, banking regulations, financial stability reports, and economic data.

## Source Access

| Detail | Value |
|--------|-------|
| Base URL | `https://rbi.org.in` |
| Monetary Policy | `https://www.rbi.org.in/Scripts/BS_PressRelease.aspx` |
| Circulars | `https://www.rbi.org.in/Scripts/BS_ViewMasCirculates.aspx` |
| Notifications | `https://www.rbi.org.in/Scripts/BS_ViewNBFCNotifications.aspx` |
| Data | `https://dbie.rbi.org.in` (Database on Indian Economy) |
| Annual Reports | `https://www.rbi.org.in/scripts/AnnualReportPublications.aspx` |
| Type | Scrape-PDF |
| Auth | None (public) |

## Fetching Instructions

1. **Monetary Policy**: Fetch MPC (Monetary Policy Committee) resolutions and statements. Typically 6 meetings per year at 2-month intervals.
2. **Circulars**: Chronological list of regulatory circulars to banks and financial institutions.
3. **Notifications**: Banking regulation, NBFC regulation, payment systems, and foreign exchange notifications.
4. **Data**: Use DBIE (Database on Indian Economy) for statistical data — inflation (CPI/WPI), credit growth, deposits, forex reserves.
5. **Reports**: Annual Report, Financial Stability Report, Trend and Progress of Banking in India.

## Parsing Instructions

### Monetary Policy Resolution

| Field | Extraction |
|-------|-----------|
| Date | Meeting date |
| MPC Decision | Repo rate, standing deposit facility (SDF) rate, MSF rate, bank rate |
| Vote | Voting record (how many voted for/against) |
| Preview | Previous meeting's stance |
 | Stance | Accommodative, Neutral, Withdrawal of Accommodation, etc. |
| GDP Growth Forecast | Current year projection |
| CPI Inflation Forecast | Quarterly and annual projections |
| Key Risks | Domestic and global risk factors |

### Circular / Notification

| Field | Extraction |
|-------|-----------|
| Title | Circular title |
| Number | e.g., RBI/2024-25/123 |
| Date | Issue date |
| Category | Banks, NBFCs, Payment Systems, Forex |
| Summary | Brief description of the circular |
| Applicable To | Target audience |
| Effective Date | When it takes effect |

### Financial Data

| Field | Extraction |
|-------|-----------|
| Indicator | e.g., CPI Inflation, Credit Growth |
| Frequency | Weekly, monthly, quarterly |
| Period | Time period (e.g., March 2025) |
| Value | Numeric value |
| Source | Specific RBI publication |

## Handling Guidelines

- **Repo rate**: The key policy rate. MPC decisions are binding on RBI but RBI implements them.
- **Circular authority**: Circulars are legally binding on regulated entities. Extract effective dates carefully.
- **Data revisions**: RBI revises historical data, especially GDP and inflation. Use most recent data.
- **Master Circulars**: Annual compilations of all circulars on a subject. Prefer master circulars for current regulations.
- **Financial Stability Report**: Published bi-annually. Contains stress test results and financial health indicators.
- **Payment system data**: Monthly UPI, NEFT, RTGS transaction volumes.

## Source Reliability

Tier 1 (highest). RBI is the statutory monetary authority. Circulars and notifications have legal force. Statistical data is authoritative for India.

## Output Schema

Output must conform to `schemas/document.schema.json`. Use `source.type`:
- `"rbi-monetary-policy"` for MPC resolutions
- `"rbi-circular"` for regulatory circulars
- `"rbi-notification"` for notifications
- `"rbi-report"` for reports
- `"rbi-data"` for statistical data

Tag with category (e.g., `banking`, `nbfc`, `forex`, `payments`, `monetary-policy`) and year.
