# Watcher: International Monetary Fund (IMF)

## Source
- **URL**: `https://www.imf.org/en/News/RSS` | `https://www.imf.org/en/Countries/IND`
- **Format**: RSS
- **Poll**: Every 24 hours
- **Last State Key**: `monitor:last_poll:imf`

## What We Track

### India-Specific
- Article IV consultation reports (India economic health check)
- India GDP growth forecasts (revised up/down)
- India inflation forecasts
- India fiscal deficit assessments
- India financial sector assessments (FSAP)
- SDR allocation to India

### Global (with India impact)
- World Economic Outlook (WEO) updates
- Global Financial Stability Report
- Regional Economic Outlook: Asia-Pacific
- Debt sustainability analysis
- Emerging market warnings
- Exchange rate regime assessments

## Severity Mapping
| Change Type | Default Severity |
|---|---|
| India GDP forecast changed (>0.5pp) | critical |
| Article IV report published | major |
| India FSAP published | major |
| Global recession warning | major |
| SDR allocation | major |
| Routine WEO update | minor |

## Diff Strategy
1. Fetch RSS + country page for India
2. Check for new Article IV publication date
3. Track GDP forecast numbers across WEO releases — compare against prior
4. Parse report executive summaries for India-specific findings
