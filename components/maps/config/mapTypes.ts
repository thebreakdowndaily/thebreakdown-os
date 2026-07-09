import { indiaStatesGeoJSON } from '../geo/india';
import { worldGeoJSON } from '../geo/world';

export interface MapTypeConfig {
  geoJSON: GeoJSON.FeatureCollection;
  projection: string;
  projectionParams: [number, number, number]; // center lat, center lng, scale
  labelField: string;
  joinField: string;
  fillMode: 'choropleth' | 'highlight' | 'route' | 'point' | 'heatmap';
}

export const mapTypeConfigs: Record<string, MapTypeConfig> = {
  'india-state': {
    geoJSON: indiaStatesGeoJSON,
    projection: 'mercator',
    projectionParams: [22, 80, 700],
    labelField: 'name',
    joinField: 'code',
    fillMode: 'choropleth',
  },
  'world-choropleth': {
    geoJSON: worldGeoJSON,
    projection: 'mercator',
    projectionParams: [15, 80, 200],
    labelField: 'name',
    joinField: 'name',
    fillMode: 'choropleth',
  },
  'trade-routes': {
    geoJSON: worldGeoJSON,
    projection: 'mercator',
    projectionParams: [15, 80, 200],
    labelField: 'name',
    joinField: 'name',
    fillMode: 'route',
  },
  migration: {
    geoJSON: worldGeoJSON,
    projection: 'mercator',
    projectionParams: [15, 80, 200],
    labelField: 'name',
    joinField: 'name',
    fillMode: 'route',
  },
  conflict: {
    geoJSON: worldGeoJSON,
    projection: 'mercator',
    projectionParams: [15, 80, 200],
    labelField: 'name',
    joinField: 'name',
    fillMode: 'highlight',
  },
  infrastructure: {
    geoJSON: indiaStatesGeoJSON,
    projection: 'mercator',
    projectionParams: [22, 80, 700],
    labelField: 'name',
    joinField: 'code',
    fillMode: 'point',
  },
  'river-basin': {
    geoJSON: indiaStatesGeoJSON,
    projection: 'mercator',
    projectionParams: [22, 80, 700],
    labelField: 'name',
    joinField: 'code',
    fillMode: 'heatmap',
  },
  'rail-network': {
    geoJSON: indiaStatesGeoJSON,
    projection: 'mercator',
    projectionParams: [22, 80, 700],
    labelField: 'name',
    joinField: 'code',
    fillMode: 'route',
  },
  'air-routes': {
    geoJSON: worldGeoJSON,
    projection: 'mercator',
    projectionParams: [15, 80, 200],
    labelField: 'name',
    joinField: 'name',
    fillMode: 'route',
  },
  heatmap: {
    geoJSON: indiaStatesGeoJSON,
    projection: 'mercator',
    projectionParams: [22, 80, 700],
    labelField: 'name',
    joinField: 'code',
    fillMode: 'heatmap',
  },
};

export const mapTypeLabels: Record<string, string> = {
  'india-state': 'India State Map',
  'india-district': 'India District Map',
  'world-choropleth': 'World Map',
  'trade-routes': 'Trade Routes Map',
  migration: 'Migration Map',
  conflict: 'Conflict Map',
  infrastructure: 'Infrastructure Map',
  'river-basin': 'River Basin Map',
  'rail-network': 'Rail Network Map',
  'air-routes': 'Air Routes Map',
  heatmap: 'Heatmap',
};
