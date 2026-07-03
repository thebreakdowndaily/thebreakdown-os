# Map Generator — Interactive Map Specifications

## Purpose

When the decision engine determines that geographic data needs a map, this module selects the map type and specifies its structure.

## Auto-Selection Logic

| Geography | Map Type | Data Required |
|---|---|---|
| India — State level | **India State Map** | State names + values |
| India — District level | **India District Map** | District names + values |
| Global — Country level | **World Map** | Country codes + values |
| Trade between countries | **Trade Routes Map** | Source → Target → Volume |
| Migration patterns | **Migration Map** | Source → Target → Count |
| Conflict zones | **Conflict Map** | Locations + intensity + timeline |
| Infrastructure projects | **Infrastructure Map** | Location + type + status |
| River systems | **River Basin Map** | River paths + states |
| Railway network | **Rail Network Map** | Station nodes + route edges |
| Air travel routes | **Air Routes Map** | Airport nodes + flight edges |
| Any 2D density | **Heatmap** | Lat/lng + intensity |

## Map Types

### 1. India State Map
Best for: state-level data (GDP, literacy, health, elections, schemes)
```
{
  "mapId": "uuid",
  "type": "india-state",
  "purpose": "Show state-wise variation in [metric]",
  "geography": {
    "scope": "india-state",
    "projection": "equirectangular",
    "center": [20.5937, 78.9629],
    "zoom": 4.5
  },
  "data": {
    "source": "reference in research.json",
    "valueField": "metric",
    "colorScale": {
      "type": "sequential | diverging | categorical",
      "domain": [min, max],
      "range": ["var(--color-brand-100)", "var(--color-brand-700)"],
      "steps": 5
    }
  },
  "interaction": {
    "hover": "show tooltip with state name + value",
    "click": "zoom to state, show district data"
  },
  "caption": "...",
  "altText": "..."
}
```

### 2. India District Map
Best for: granular data (development, infra, polling)
Same structure as state map with `"scope": "india-district"` and higher zoom.

### 3. World Map (Choropleth)
Best for: country-level global data (GDP, population, internet access)
```
{
  "mapId": "uuid",
  "type": "world-choropleth",
  "geography": {
    "scope": "world",
    "projection": "equalEarth | naturalEarth | mercator",
    "center": [20, 0],
    "zoom": 2
  },
  "data": {
    "source": "...",
    "joinKey": "iso-a3",
    "valueField": "metric",
    "colorScale": { ... }
  }
}
```

### 4. Trade Routes Map
Best for: import/export flows, economic corridors
```
{
  "mapId": "uuid",
  "type": "trade-routes",
  "features": {
    "nodes": ["country codes with positions"],
    "arcs": [{ "source": "IND", "target": "USA", "value": 89000000000 }],
    "arcHeight": 0.3,
    "arcColor": "var(--color-brand-400)"
  }
}
```

### 5. Migration Map
Best for: internal or international migration
```
{
  "mapId": "uuid",
  "type": "migration",
  "features": {
    "flows": [{ "from": "Uttar Pradesh", "to": "Delhi", "count": 2500000 }],
    "flowWidthMin": 1,
    "flowWidthMax": 10,
    "flowOpacity": 0.6
  }
}
```

### 6. Conflict Map
Best for: active conflicts, historical battle zones
```
{
  "mapId": "uuid",
  "type": "conflict",
  "features": {
    "incidents": [{ "lat": 34.5, "lng": 69.2, "intensity": 85, "date": "2024-01-15", "type": "skirmish | bombing | protest" }],
    "showTimeline": true,
    "clusterPoints": true
  }
}
```

### 7. Infrastructure Map
Best for: roads, railways, power plants, digital infra
```
{
  "mapId": "uuid",
  "type": "infrastructure",
  "features": {
    "points": [{ "lat": 28.6, "lng": 77.2, "type": "power-plant", "status": "operational" }],
    "lines": [{ "from": [28.6, 77.2], "to": [19.0, 72.8], "type": "transmission-line", "status": "planned" }],
    "pointColorBy": "type",
    "lineColorBy": "status"
  }
}
```

## Output Rules

1. **Always include a legend** showing the color scale and units.
2. **Always include zoom controls** or scroll-to-zoom.
3. **Always cluster points** when more than 50 on screen.
4. **Use map-anchored tooltips** (not screen-positioned).
5. **Default projection**: Equirectangular for India maps, Equal Earth for world maps.
6. **Never use Mercator** for world maps (distorts size perception).
7. **Responsive**: map fills container width, aspect ratio preserved.
8. **Dark theme**: map tiles must support dark mode.
