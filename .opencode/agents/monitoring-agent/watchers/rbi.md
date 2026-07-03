# Watcher: Reserve Bank of India (RBI)

## Source
- **URL**: `https://rbi.org.in/Scripts/BS_PressRelease.aspx` | `https://rbi.org.in/Scripts/NotificationUser.aspx`
- **Format**: HTML (scrape) + RSS
- **Poll**: Every 6 hours
- **Last State Key**: `monitor:last_poll:rbi`

## What We Track

### Monetary Policy
- Repo rate changes (current: 6.50% in example)
- Reverse repo rate changes
- CRR, SLR changes
- Standing Deposit Facility (SDF) rate
- Marginal Standing Facility (MSF) rate
- MPC meeting schedule, minutes, voting record
- MPC member changes

### Financial Regulation
- New circulars for banks, NBFCs, payment systems
- Regulatory changes (digital lending, KYC, risk weights)
- PCA (Prompt Corrective Action) framework triggers
- New banking licenses / restrictions
- Payment system policy (UPI, NEFT, RTGS changes)

### Reports
- Financial Stability Report (biannual)
- Trend and Progress of Banking (annual)
- State of the Economy (monthly bulletin)
- Monetary Policy Report (biannual)

### Other
- Foreign exchange reserves data (weekly)
- Inflation forecasts
- GDP growth forecasts
- Digital rupee / CBDC updates

## Severity Mapping
| Change Type | Default Severity |
|---|---|
| Repo rate change | critical |
| CRR/SLR change | major |
| New regulation affecting consumers | major |
| Bank placed under PCA | critical |
| Payment system outage/downtime | critical |
| Digital rupee expansion | major |
| Financial Stability Report | major |

## Diff Strategy
1. Fetch press release list — compare release numbers
2. For known circulars/notifications, check for amendment or supersession
3. Track key rates independently (repo, reverse repo, CRR) — alert on any change
4. Fetch MPC minutes — check for dissenting votes or changed language
