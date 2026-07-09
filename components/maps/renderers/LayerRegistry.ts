import React from 'react';
import { Registry } from '@/lib/registry';
import ChoroplethLayer from '../layers/ChoroplethLayer';

// Future expansion: HighlightLayer, RouteLayer, HeatmapLayer
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LayerRegistry = new Registry<React.FC<any>>();

LayerRegistry.register('choropleth', ChoroplethLayer);
LayerRegistry.register('highlight', ChoroplethLayer); // fallback for now
LayerRegistry.register('route', ChoroplethLayer);     // fallback for now
LayerRegistry.register('point', ChoroplethLayer);     // fallback for now
LayerRegistry.register('heatmap', ChoroplethLayer);   // fallback for now

export function getLayerComponent(fillMode: string) {
  const Component = LayerRegistry.get(fillMode);
  if (!Component) return ChoroplethLayer;
  return Component;
}
