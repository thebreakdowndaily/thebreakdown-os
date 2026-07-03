# Watcher: World Bank

## Source
- **URL**: `https://www.worldbank.org/en/news/latest-news` | `https://www.worldbank.org/en/news/rss`
- **Format**: RSS
- **Poll**: Every 24 hours
- **Last State Key**: `monitor:last_poll:world-bank`

## What We Track
- India-specific loans and projects approved
- India economic updates / country partnership framework
- Global economic outlook reports (if India is mentioned)
- Ease of Doing Business / Business Ready reports
- Human Capital Index updates
- Poverty and inequality reports
- Climate finance for India
- Energy / green transition projects in India

## Severity Mapping
| Change Type | Default Severity |
|---|---|
| New India loan approved (>$1B) | major |
| India growth forecast change | critical |
| New country strategy for India | major |
| Major global report with India ranking | major |
| Project restructure / cancellation | minor |

## Diff Strategy
1. Fetch RSS feed
2. Filter for items containing "India" in title/summary
3. Compare GUID against last poll
4. For known India projects, check for status/disbursement changes
