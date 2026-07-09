import React, { useMemo } from 'react';
import * as d3Geo from 'd3-geo';
import * as d3Scale from 'd3-scale';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import type { MapTheme } from '../config/theme';

interface ChoroplethLayerProps {
  features: GeoJSON.Feature[];
  valueMap: Map<string, number>;
  projection: d3Geo.GeoProjection;
  theme: MapTheme;
  labelField: string;
  joinField: string;
  onHover: (name: string, value: number | undefined, event: React.MouseEvent) => void;
  onLeave: () => void;
}

export default function ChoroplethLayer({
  features,
  valueMap,
  projection,
  theme,
  labelField,
  joinField,
  onHover,
  onLeave
}: ChoroplethLayerProps) {
  const pathGen = useMemo(() => d3Geo.geoPath().projection(projection), [projection]);

  const colorScale = useMemo(() => {
    const allValues = Array.from(valueMap.values());
    const minVal = Math.min(...allValues, 0);
    const maxVal = Math.max(...allValues, 1);
    return d3Scale.scaleSequential(d3ScaleChromatic.interpolateOranges)
      .domain([minVal, maxVal]);
  }, [valueMap]);

  return (
    <g className="choropleth-layer">
      {features.map((feature, i) => {
        const props = feature.properties;
        if (!props) return null;
        
        const rawName: unknown = props[labelField];
        const name = typeof rawName === 'string' ? rawName : '';
        const rawJoin: unknown = props[joinField];
        const joinKey = (typeof rawJoin === 'string' ? rawJoin : name).toLowerCase();
        
        const value = valueMap.get(joinKey);
        const hasValue = value !== undefined;
        
        const d = pathGen(feature);
        if (!d) return null;

        const fillColor = hasValue ? colorScale(value) : theme.land;
        const opacity = hasValue ? 0.85 : 0.4;

        return (
          <path
            key={`${joinKey}-${String(i)}`}
            d={d}
            stroke={theme.border}
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
            fill={fillColor}
            opacity={opacity}
            style={{ cursor: 'pointer', transition: 'stroke-width 0.1s, stroke 0.1s' }}
            aria-label={`${name}${hasValue ? `: ${String(value)}` : ''}`}
            onMouseEnter={(e) => {
              e.currentTarget.setAttribute('stroke', theme.brand);
              e.currentTarget.setAttribute('stroke-width', '2');
              onHover(name, value, e);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.setAttribute('stroke', theme.border);
              e.currentTarget.setAttribute('stroke-width', '0.8');
              onLeave();
            }}
            onMouseMove={(e) => {
              onHover(name, value, e);
            }}
          />
        );
      })}
    </g>
  );
}
