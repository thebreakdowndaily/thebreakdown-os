# Watcher: World Health Organization

## Source
- **URL**: `https://www.who.int/rss-feeds/news-english.xml`
- **Format**: RSS
- **Poll**: Every 24 hours
- **Last State Key**: `monitor:last_poll:who`

## What We Track

### Health Alerts
- Public Health Emergency of International Concern (PHEIC) declarations
- Disease outbreaks (COVID, Nipah, Zika, avian flu, mpox) — especially in India / neighbours
- New epidemic/pandemic warnings

### India-Specific
- India health data (TB, malaria, immunization coverage)
- WHO certification (polio-free, yaws-free, etc.)
- India-specific health guidelines
- Tobacco control reports

### Guidelines & Policy
- New treatment guidelines
- Essential medicines list updates
- Vaccine recommendations
- Air quality / climate health guidelines
- Mental health reports

## Severity Mapping
| Change Type | Default Severity |
|---|---|
| PHEIC declared | critical |
| New disease outbreak in India | critical |
| WHO certification for India | major |
| India health ranking change | major |
| New health guideline | minor |

## Diff Strategy
1. Fetch RSS feed
2. Filter for India / South-East Asia keywords
3. Compare GUIDs
4. Track WHO Director-General statements
