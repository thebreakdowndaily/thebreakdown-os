import * as d3Geo from 'd3-geo';
import { Registry } from '@/lib/registry';

export type ProjectionStrategy = (
  params: [number, number, number], 
  dimensions: { width: number; height: number }
) => d3Geo.GeoProjection;

export const ProjectionRegistry = new Registry<ProjectionStrategy>();

ProjectionRegistry.register('mercator', (params, dimensions) => {
  const [centerLat, centerLng, scale] = params;
  return d3Geo.geoMercator()
    .center([centerLng, centerLat])
    .scale(scale)
    .translate([dimensions.width / 2, dimensions.height / 2]);
});

export function getProjection(
  type: string, 
  params: [number, number, number], 
  dimensions: { width: number; height: number }
) {
  const strategy = ProjectionRegistry.get(type);
  if (strategy) {
    return strategy(params, dimensions);
  }
  
  // Default fallback
  const defaultStrategy = ProjectionRegistry.get('mercator');
  if (defaultStrategy) {
    return defaultStrategy(params, dimensions);
  }
  
  // Hard fallback if registry is somehow empty
  const [centerLat, centerLng, scale] = params;
  return d3Geo.geoMercator()
    .center([centerLng, centerLat])
    .scale(scale)
    .translate([dimensions.width / 2, dimensions.height / 2]);
}
