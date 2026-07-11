import React, { useMemo, useState } from 'react';
import type { MapSpec } from '@/types/canonical';
import type { MapTheme } from '../config/theme';
import { mapTypeConfigs, type MapTypeConfig } from '../config/mapTypes';
import { getProjection } from '../projection/ProjectionRegistry';
import { getLayerComponent } from '../renderers/LayerRegistry';
import TooltipLayer from './TooltipLayer';

interface MapCanvasProps {
  map: MapSpec;
  dimensions: { width: number; height: number };
  theme: MapTheme;
  valueMap: Map<string, number>;
}

export default function MapCanvas({ map, dimensions, theme, valueMap }: MapCanvasProps) {
  const [tooltip, setTooltip] = useState({ x: 0, y: 0, visible: false, content: '' });

  const config = mapTypeConfigs[map.type] as MapTypeConfig | undefined;

  const projection = useMemo(() => {
    if (!config) return null;
    return getProjection(config.projection, config.projectionParams, dimensions);
  }, [config, dimensions]);

  if (!config || !projection) return null;

  const LayerComponent = getLayerComponent(config.fillMode);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        style={{
          width: '100%',
          height: `${String(dimensions.height)}px`,
          display: 'block',
        }}
        aria-hidden="true"
        role="graphics-document"
      >
        <rect width={dimensions.width} height={dimensions.height} fill={theme.bg} />
        
        {/* Render declarative layer based on fillMode registry */}
        {React.createElement(LayerComponent, {
          features: config.geoJSON.features,
          valueMap: valueMap,
          projection: projection,
          theme: theme,
          labelField: config.labelField,
          joinField: config.joinField,
          onHover: (name: string, value: number | undefined, event: React.MouseEvent) => {
            const rect = event.currentTarget.closest('svg')?.getBoundingClientRect();
            if (rect) {
              setTooltip({
                x: event.clientX - rect.left + 10,
                y: event.clientY - rect.top + 10,
                visible: true,
                content: `${name}${value !== undefined ? `: ${String(value)}` : ''}`
              });
            }
          },
          onLeave: () => { setTooltip(prev => ({ ...prev, visible: false })); }
        })}

        {map.purpose && (
          <text
            x="12"
            y="22"
            fill={theme.textSecondary}
            fontSize="12"
            fontWeight="600"
            fontFamily={theme.fontFamily}
          >
            {map.purpose}
          </text>
        )}
      </svg>
      
      <TooltipLayer {...tooltip} />
    </div>
  );
}
