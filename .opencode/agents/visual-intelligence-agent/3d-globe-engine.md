# 3D Globe Engine — Interactive 3D Globe ⭐⭐⭐⭐⭐

## Purpose

The 3D globe is **THE BREAKDOWN's signature visual**. It is deployed for any international story that involves geography, movement, or global relationships.

## When to Deploy the Globe

| Story Type | Auto-Deploy? | Visual Elements |
|---|---|---|
| International diplomacy | ✅ Yes | Country highlights, diplomatic visits |
| Trade / Economic corridors | ✅ Yes | Trade routes (arcs), shipping lanes |
| Military / Defense | ✅ Yes | Military movements, bases, alliances |
| Migration / Refugees | ✅ Yes | Migration flows between countries |
| Internet / Cables | ✅ Yes | Submarine cable paths |
| Satellite / Space | ✅ Yes | Satellite orbits, coverage zones |
| Global health | ✅ Yes | Pandemic spread, vaccine coverage |
| Climate / Environment | ✅ Yes | Temperature, emissions, deforestation |
| Elections (multi-country) | ✅ Yes | Country-level results |
| Indian foreign policy | ✅ Yes | Trade, diplomacy, diaspora |
| Single-country domestic | ❌ No | Use map instead |
| Local / state-level India | ❌ No | Use map instead |

## Globe Visual Types

### 1. Country Highlights
Highlight specific countries with color + label.
```
{
  "globeId": "uuid",
  "type": "country-highlights",
  "purpose": "Show which countries are involved in [story]",
  "features": {
    "highlightedCountries": ["IND", "USA", "CHN", "RUS"],
    "highlightColor": "var(--color-brand-400)",
    "defaultColor": "var(--color-neutral-800)",
    "showLabels": true,
    "labelField": "name"
  }
}
```

### 2. Trade Routes (Arcs)
Animated arcs between countries with width proportional to volume.
```
{
  "globeId": "uuid",
  "type": "trade-routes",
  "purpose": "Visualize trade flow between countries",
  "features": {
    "arcs": [
      { "source": [20.5, 78.9], "target": [38.9, -77.0], "value": 89000000000 },
      { "source": [20.5, 78.9], "target": [35.6, 139.6], "value": 45000000000 }
    ],
    "arcColor": "var(--color-brand-400)",
    "arcAltitude": 0.5,
    "arcAltitudeAutoScale": true,
    "animationSpeed": 1,
    "showPulse": true
  }
}
```

### 3. Point Data (Hexbin / Heatmap)
Density of points on the globe.
```
{
  "globeId": "uuid",
  "type": "point-density",
  "purpose": "Show global distribution of [phenomenon]",
  "features": {
    "points": [{ "lat": 28.6, "lng": 77.2, "value": 100 }],
    "aggregation": "hexbin | heatmap",
    "colorScale": ["var(--color-brand-100)", "var(--color-brand-700)"],
    "radius": 0.5
  }
}
```

### 4. Shipping Lanes
Global shipping routes with animated flow direction.
```
{
  "globeId": "uuid",
  "type": "shipping-lanes",
  "purpose": "Show global shipping routes and volume",
  "features": {
    "lanes": [
      { "path": [[lat,lng], [lat,lng], ...], "volume": 5000000 }
    ],
    "laneColor": "var(--color-info)",
    "showDirection": true
  }
}
```

### 5. Submarine Cables
Underwater internet cable map.
```
{
  "globeId": "uuid",
  "type": "submarine-cables",
  "purpose": "Show global internet infrastructure",
  "features": {
    "cables": [{ "name": "SEA-ME-WE-5", "landingPoints": ["Mumbai", "Singapore", ...] }],
    "cableColor": "var(--color-emerald-400)",
    "landingPointColor": "var(--color-brand-400)"
  }
}
```

### 6. Diplomatic Visits
Animated arcs representing high-level diplomatic travel.
```
{
  "globeId": "uuid",
  "type": "diplomatic-visits",
  "purpose": "Show diplomatic engagement patterns",
  "features": {
    "visits": [{ "from": [28.6, 77.2], "to": [38.9, -77.0], "date": "2024-01-15", "level": "head-of-state" }],
    "arcColorByLevel": {
      "head-of-state": "var(--color-brand-400)",
      "minister": "var(--color-warning)",
      "official": "var(--color-info)"
    }
  }
}
```

### 7. Election Results Globe
Country-level election results visualization.
```
{
  "globeId": "uuid",
  "type": "election-results",
  "purpose": "Show election results by country",
  "features": {
    "countries": [{ "iso": "IND", "party": "BJP", "seats": 303, "color": "var(--color-brand-400)" }],
    "displayMode": "party-color | swing | turnout"
  }
}
```

### 8. Satellite Coverage
Satellite orbits and coverage zones.
```
{
  "globeId": "uuid",
  "type": "satellite-coverage",
  "purpose": "Show satellite coverage areas",
  "features": {
    "satellites": [{ "name": "INSAT-3D", "orbitType": "geostationary", "coverage": [[lat,lng],...] }],
    "showCoverageZones": true,
    "showOrbits": true
  }
}
```

## Required Globe Configuration

```json
{
  "globeId": "uuid",
  "technologies": ["three.js", "globe.gl"],
  "globeImage": "/images/earth-blue-marble.jpg",
  "background": "var(--color-bg-primary)",
  "atmosphere": true,
  "atmosphereColor": "var(--color-brand-400)",
  "atmosphereAltitude": 0.15,
  "autoRotate": true,
  "autoRotateSpeed": 0.5,
  "enableZoom": true,
  "enablePan": true,
  "pov": {
    "lat": 20,
    "lng": 70,
    "altitude": 2.5
  }
}
```

## Performance Rules

1. **Point cloud limit**: maximum 10,000 points on globe at once.
2. **Arc limit**: maximum 500 arcs on globe at once.
3. **Resize observer**: globe must resize with container.
4. **Device detection**: disable auto-rotate on mobile (battery).
5. **WebGL fallback**: provide static SVG image if WebGL unavailable.
6. **Lazy load**: globe canvas only mounts when scrolled into view.
7. **Dark theme**: globe background matches theme.

## Accessibility

Every globe instance must include:
- A play/pause button for auto-rotation
- A fully described caption below the globe
- Alt text describing what the globe shows
- Keyboard navigation (arrow keys to rotate)
- High-contrast mode for colorblind viewers

## Signature Style

The BREAKDOWN's 3D globe uses:
- Blue marble texture (NASA) for the earth
- `--color-brand-400` (amber #f59e0b) for all highlighted features
- Subtle atmosphere glow matching the brand color
- Auto-rotation at 0.5 speed (pausable)
- Default point of view centered on the Indian Ocean region (lat: 20, lng: 70)
