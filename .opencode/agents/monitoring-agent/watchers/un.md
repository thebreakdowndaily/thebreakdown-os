# Watcher: United Nations

## Source
- **URL**: `https://www.un.org/press/en` | `https://www.un.org/en/rss`
- **Format**: RSS
- **Poll**: Every 24 hours
- **Last State Key**: `monitor:last_poll:un`

## What We Track

### India-Specific
- UN Security Council resolutions on India-related topics (Kashmir, terrorism, neighbours)
- India at UNGA (voting records, statements)
- India's UNSC non-permanent seat term updates
- India's SDG progress reports
- India in UN peacekeeping missions

### Global (with India impact)
- Climate change reports (IPCC)
- Human Development Report (India ranking)
- World Happiness Report (India ranking)
- Terrorism reports
- Refugee / migration reports
- Food security reports (India + neighbours)

## Severity Mapping
| Change Type | Default Severity |
|---|---|
| UNSC resolution on India-related issue | critical |
| India UNSC vote on major resolution | major |
| India HDI ranking change | major |
| IPCC report with India implications | major |
| General Assembly resolution | minor |

## Diff Strategy
1. Fetch RSS feeds
2. Filter for India keywords + general development topics
3. Compare GUIDs
4. Track India's UNSC voting record (if in term)
