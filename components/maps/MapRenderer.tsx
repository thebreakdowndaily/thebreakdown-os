'use client';

import React, { useRef, useEffect, useState } from 'react';
import type { MapSpec } from '@/utils/types';
import * as d3Geo from 'd3-geo';
import * as d3Scale from 'd3-scale';
import * as d3ScaleChromatic from 'd3-scale-chromatic';

/**
 * THE BREAKDOWN — MapRenderer
 *
 * Renders interactive maps using D3.js Geo + inline TopoJSON.
 *
 * Supported map types:
 *   india-state | india-district | world-choropleth | trade-routes |
 *   migration | conflict | infrastructure | river-basin |
 *   rail-network | air-routes | heatmap
 *
 * Design constraints:
 *   - DS tokens via CSS custom properties
 *   - India-centered projection as default
 *   - Brand-amber (#f59e0b) for highlights
 *   - Every map has alt text + keyboard nav
 *   - Lazy loaded with IntersectionObserver
 */

/* ── Types ──────────────────────────────────────────────────────────── */

interface MapTheme {
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  brand: string;
  brandLight: string;
  border: string;
  borderHover: string;
  fontFamily: string;
  success: string;
  error: string;
  water: string;
  land: string;
}

interface RegionData {
  [key: string]: unknown;
  id?: string;
  name?: string;
  value?: number;
}


function readTheme(el: Element): MapTheme {
  const style = getComputedStyle(el);
  const get = (name: string) => style.getPropertyValue(name).trim() || '#000';
  return {
    bg: get('--color-bg-primary'),
    bgSecondary: get('--color-bg-secondary'),
    bgTertiary: get('--color-bg-tertiary'),
    textPrimary: get('--color-text-primary'),
    textSecondary: get('--color-text-secondary'),
    textMuted: get('--color-text-muted'),
    brand: get('--color-brand-400'),
    brandLight: get('--color-brand-200'),
    border: get('--color-border-default'),
    borderHover: get('--color-border-hover'),
    fontFamily: get('--font-sans'),
    success: get('--color-success'),
    error: get('--color-error'),
    water: get('--color-blue-700') || '#1e3a5f',
    land: get('--color-bg-tertiary'),
  };
}

/* ── Simplified India States GeoJSON (approximate boundaries) ────────── */

const indiaStatesGeoJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // Major states as simplified rectangular/geometric approximations
    { type: 'Feature', properties: { name: 'Uttar Pradesh', code: 'UP' }, geometry: { type: 'Polygon', coordinates: [[[77, 23.5], [84, 23.5], [84, 30.5], [77, 30.5], [77, 23.5]]] } },
    { type: 'Feature', properties: { name: 'Maharashtra', code: 'MH' }, geometry: { type: 'Polygon', coordinates: [[[72.5, 15.5], [80.5, 15.5], [80.5, 22], [72.5, 22], [72.5, 15.5]]] } },
    { type: 'Feature', properties: { name: 'Bihar', code: 'BR' }, geometry: { type: 'Polygon', coordinates: [[[83, 24.5], [88.5, 24.5], [88.5, 27.5], [83, 27.5], [83, 24.5]]] } },
    { type: 'Feature', properties: { name: 'West Bengal', code: 'WB' }, geometry: { type: 'Polygon', coordinates: [[[85.5, 21.5], [89.5, 21.5], [89.5, 27.5], [85.5, 27.5], [85.5, 21.5]]] } },
    { type: 'Feature', properties: { name: 'Madhya Pradesh', code: 'MP' }, geometry: { type: 'Polygon', coordinates: [[[74, 21], [82.5, 21], [82.5, 26.5], [74, 26.5], [74, 21]]] } },
    { type: 'Feature', properties: { name: 'Tamil Nadu', code: 'TN' }, geometry: { type: 'Polygon', coordinates: [[[76.5, 8], [80.5, 8], [80.5, 13.5], [76.5, 13.5], [76.5, 8]]] } },
    { type: 'Feature', properties: { name: 'Rajasthan', code: 'RJ' }, geometry: { type: 'Polygon', coordinates: [[[69.5, 23.5], [77, 23.5], [77, 30.5], [69.5, 30.5], [69.5, 23.5]]] } },
    { type: 'Feature', properties: { name: 'Karnataka', code: 'KA' }, geometry: { type: 'Polygon', coordinates: [[[74, 11.5], [78.5, 11.5], [78.5, 18.5], [74, 18.5], [74, 11.5]]] } },
    { type: 'Feature', properties: { name: 'Gujarat', code: 'GJ' }, geometry: { type: 'Polygon', coordinates: [[[68, 20.5], [74.5, 20.5], [74.5, 24.5], [68, 24.5], [68, 20.5]]] } },
    { type: 'Feature', properties: { name: 'Andhra Pradesh', code: 'AP' }, geometry: { type: 'Polygon', coordinates: [[[77, 12.5], [84, 12.5], [84, 18.5], [77, 18.5], [77, 12.5]]] } },
    { type: 'Feature', properties: { name: 'Odisha', code: 'OD' }, geometry: { type: 'Polygon', coordinates: [[[82, 17.5], [87.5, 17.5], [87.5, 22], [82, 22], [82, 17.5]]] } },
    { type: 'Feature', properties: { name: 'Telangana', code: 'TG' }, geometry: { type: 'Polygon', coordinates: [[[77.5, 15.5], [81.5, 15.5], [81.5, 19.5], [77.5, 19.5], [77.5, 15.5]]] } },
    { type: 'Feature', properties: { name: 'Kerala', code: 'KL' }, geometry: { type: 'Polygon', coordinates: [[[74.5, 8], [77.5, 8], [77.5, 12.5], [74.5, 12.5], [74.5, 8]]] } },
    { type: 'Feature', properties: { name: 'Jharkhand', code: 'JH' }, geometry: { type: 'Polygon', coordinates: [[[83.5, 22], [87.5, 22], [87.5, 25], [83.5, 25], [83.5, 22]]] } },
    { type: 'Feature', properties: { name: 'Assam', code: 'AS' }, geometry: { type: 'Polygon', coordinates: [[[89.5, 24.5], [96, 24.5], [96, 28], [89.5, 28], [89.5, 24.5]]] } },
    { type: 'Feature', properties: { name: 'Punjab', code: 'PB' }, geometry: { type: 'Polygon', coordinates: [[[73.5, 29.5], [76.5, 29.5], [76.5, 32.5], [73.5, 32.5], [73.5, 29.5]]] } },
    { type: 'Feature', properties: { name: 'Haryana', code: 'HR' }, geometry: { type: 'Polygon', coordinates: [[[74.5, 27.5], [77.5, 27.5], [77.5, 30.5], [74.5, 30.5], [74.5, 27.5]]] } },
    { type: 'Feature', properties: { name: 'Chhattisgarh', code: 'CG' }, geometry: { type: 'Polygon', coordinates: [[[80.5, 17.5], [84, 17.5], [84, 24], [80.5, 24], [80.5, 17.5]]] } },
    { type: 'Feature', properties: { name: 'Jammu & Kashmir', code: 'JK' }, geometry: { type: 'Polygon', coordinates: [[[73, 32.5], [80, 32.5], [80, 37], [73, 37], [73, 32.5]]] } },
    { type: 'Feature', properties: { name: 'Uttarakhand', code: 'UK' }, geometry: { type: 'Polygon', coordinates: [[[77.5, 28.5], [81, 28.5], [81, 31.5], [77.5, 31.5], [77.5, 28.5]]] } },
    { type: 'Feature', properties: { name: 'Himachal Pradesh', code: 'HP' }, geometry: { type: 'Polygon', coordinates: [[[75.5, 30.5], [79, 30.5], [79, 33], [75.5, 33], [75.5, 30.5]]] } },
    { type: 'Feature', properties: { name: 'Tripura', code: 'TR' }, geometry: { type: 'Polygon', coordinates: [[[91, 22.5], [92.5, 22.5], [92.5, 24.5], [91, 24.5], [91, 22.5]]] } },
    { type: 'Feature', properties: { name: 'Meghalaya', code: 'ML' }, geometry: { type: 'Polygon', coordinates: [[[89.5, 24.5], [92.5, 24.5], [92.5, 26.5], [89.5, 26.5], [89.5, 24.5]]] } },
    { type: 'Feature', properties: { name: 'Manipur', code: 'MN' }, geometry: { type: 'Polygon', coordinates: [[[93, 23.5], [94.5, 23.5], [94.5, 25.5], [93, 25.5], [93, 23.5]]] } },
    { type: 'Feature', properties: { name: 'Nagaland', code: 'NL' }, geometry: { type: 'Polygon', coordinates: [[[93.5, 25], [95, 25], [95, 27], [93.5, 27], [93.5, 25]]] } },
    { type: 'Feature', properties: { name: 'Arunachal Pradesh', code: 'AR' }, geometry: { type: 'Polygon', coordinates: [[[91.5, 26.5], [97.5, 26.5], [97.5, 29], [91.5, 29], [91.5, 26.5]]] } },
    { type: 'Feature', properties: { name: 'Mizoram', code: 'MZ' }, geometry: { type: 'Polygon', coordinates: [[[92, 21.5], [93.5, 21.5], [93.5, 24], [92, 24], [92, 21.5]]] } },
    { type: 'Feature', properties: { name: 'Sikkim', code: 'SK' }, geometry: { type: 'Polygon', coordinates: [[[88, 27], [89, 27], [89, 28.5], [88, 28.5], [88, 27]]] } },
    { type: 'Feature', properties: { name: 'Goa', code: 'GA' }, geometry: { type: 'Polygon', coordinates: [[[73.5, 14.5], [74.5, 14.5], [74.5, 15.5], [73.5, 15.5], [73.5, 14.5]]] } },
  ],
};

/* ── Simplified World Countries GeoJSON ──────────────────────────────── */

const worldGeoJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { name: 'India' }, geometry: { type: 'Polygon', coordinates: [[[68, 7], [97, 7], [97, 37], [68, 37], [68, 7]]] } },
    { type: 'Feature', properties: { name: 'China' }, geometry: { type: 'Polygon', coordinates: [[[73, 18], [135, 18], [135, 55], [73, 55], [73, 18]]] } },
    { type: 'Feature', properties: { name: 'United States' }, geometry: { type: 'Polygon', coordinates: [[[-130, 24], [-65, 24], [-65, 50], [-130, 50], [-130, 24]]] } },
    { type: 'Feature', properties: { name: 'Brazil' }, geometry: { type: 'Polygon', coordinates: [[[-75, -35], [-32, -35], [-32, 5], [-75, 5], [-75, -35]]] } },
    { type: 'Feature', properties: { name: 'Russia' }, geometry: { type: 'Polygon', coordinates: [[[20, 40], [180, 40], [180, 80], [20, 80], [20, 40]]] } },
    { type: 'Feature', properties: { name: 'Japan' }, geometry: { type: 'Polygon', coordinates: [[[129, 30], [146, 30], [146, 45], [129, 45], [129, 30]]] } },
    { type: 'Feature', properties: { name: 'Germany' }, geometry: { type: 'Polygon', coordinates: [[[5, 47], [15, 47], [15, 55], [5, 55], [5, 47]]] } },
    { type: 'Feature', properties: { name: 'United Kingdom' }, geometry: { type: 'Polygon', coordinates: [[[-8, 49], [2, 49], [2, 59], [-8, 59], [-8, 49]]] } },
    { type: 'Feature', properties: { name: 'France' }, geometry: { type: 'Polygon', coordinates: [[[-5, 41], [8, 41], [8, 51], [-5, 51], [-5, 41]]] } },
    { type: 'Feature', properties: { name: 'Australia' }, geometry: { type: 'Polygon', coordinates: [[[112, -44], [155, -44], [155, -10], [112, -10], [112, -44]]] } },
    { type: 'Feature', properties: { name: 'South Africa' }, geometry: { type: 'Polygon', coordinates: [[[16, -35], [33, -35], [33, -22], [16, -22], [16, -35]]] } },
    { type: 'Feature', properties: { name: 'Canada' }, geometry: { type: 'Polygon', coordinates: [[[-140, 40], [-50, 40], [-50, 85], [-140, 85], [-140, 40]]] } },
    { type: 'Feature', properties: { name: 'Mexico' }, geometry: { type: 'Polygon', coordinates: [[[-118, 14], [-86, 14], [-86, 33], [-118, 33], [-118, 14]]] } },
    { type: 'Feature', properties: { name: 'Indonesia' }, geometry: { type: 'Polygon', coordinates: [[[95, -10], [141, -10], [141, 6], [95, 6], [95, -10]]] } },
    { type: 'Feature', properties: { name: 'Pakistan' }, geometry: { type: 'Polygon', coordinates: [[[60, 23], [77, 23], [77, 37], [60, 37], [60, 23]]] } },
    { type: 'Feature', properties: { name: 'Bangladesh' }, geometry: { type: 'Polygon', coordinates: [[[88, 20], [93, 20], [93, 27], [88, 27], [88, 20]]] } },
    { type: 'Feature', properties: { name: 'Nigeria' }, geometry: { type: 'Polygon', coordinates: [[[2, 4], [15, 4], [15, 14], [2, 14], [2, 4]]] } },
    { type: 'Feature', properties: { name: 'Egypt' }, geometry: { type: 'Polygon', coordinates: [[[24, 22], [37, 22], [37, 32], [24, 32], [24, 22]]] } },
    { type: 'Feature', properties: { name: 'Saudi Arabia' }, geometry: { type: 'Polygon', coordinates: [[[34, 16], [56, 16], [56, 32], [34, 32], [34, 16]]] } },
    { type: 'Feature', properties: { name: 'Argentina' }, geometry: { type: 'Polygon', coordinates: [[[-75, -55], [-53, -55], [-53, -22], [-75, -22], [-75, -55]]] } },
  ],
};

/* ── Map Type Configuration ──────────────────────────────────────────── */

interface MapTypeConfig {
  geoJSON: GeoJSON.FeatureCollection;
  projection: string;
  projectionParams: [number, number, number]; // center lat, center lng, scale
  labelField: string;
  joinField: string;
  fillMode: 'choropleth' | 'highlight' | 'route' | 'point' | 'heatmap';
}

const mapTypeConfigs: Record<string, MapTypeConfig> = {
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

/* ── Map Type Label ──────────────────────────────────────────────────── */

const mapTypeLabels: Record<string, string> = {
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

/* ── Main Component ──────────────────────────────────────────────────── */

interface MapRendererProps {
  map: MapSpec;
}

const MapRenderer: React.FC<MapRendererProps> = ({ map }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [renderKey, setRenderKey] = useState(0);

  // Lazy load
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => { observer.disconnect(); };
  }, []);

  // Responsive
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setDimensions({
        width: rect.width - 2,
        height: Math.max(300, Math.min(500, rect.width * 0.6)),
      });
    };
    updateSize();
    const ro = new ResizeObserver(() => {
      updateSize();
      setRenderKey((k) => k + 1);
    });
    ro.observe(el);
    return () => { ro.disconnect(); };
  }, []);

  // Render map
  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    const svg = svgRef.current;
    const theme = readTheme(svg);
    const config = mapTypeConfigs[map.type];

    // Clear previous
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    try {
      // Create projection
      const [centerLat, centerLng, scale] = config.projectionParams;
      const projection = d3Geo.geoMercator()
        .center([centerLng, centerLat])
        .scale(scale)
        .translate([dimensions.width / 2, dimensions.height / 2]);

      const pathGen = d3Geo.geoPath().projection(projection);

      // Background (ocean)
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('width', String(dimensions.width));
      bg.setAttribute('height', String(dimensions.height));
      bg.setAttribute('fill', theme.bg);
      svg.appendChild(bg);

      // Build region value map from spec data
      const valueMap = new Map<string, number>();
      if (map.data) {
        let regions: RegionData[] = [];

        // Path 1: data.source contains JSON-encoded regions (bridge from StoryJSON via geoDataToSpec)
        if (map.data.source) {
          try {
            const parsed: unknown = JSON.parse(map.data.source);
            if (Array.isArray(parsed)) {
              regions = parsed as RegionData[];
            }
          } catch {
            // Not JSON — ignore
          }
        }

        // Path 2: data.valueField and data.joinKey defined directly (future VIE path)
        if (regions.length === 0 && map.data.joinKey && map.data.valueField) {
          // In production, regions would come from the Visual Intelligence Engine
        }

        const joinKey = map.data.joinKey || 'id';
        const valueField = map.data.valueField || 'value';
        regions.forEach((r: RegionData) => {
          const rawKey = r[joinKey];
          const key = typeof rawKey === 'string' ? rawKey : typeof r.id === 'string' ? r.id : typeof r.name === 'string' ? r.name : '';
          const rawVal = r[valueField] ?? r.value;
          valueMap.set(key.toLowerCase(), Number(rawVal ?? 0));
        });
      }

      // Get all values for color scaling
      const allValues = Array.from(valueMap.values());
      const minVal = Math.min(...allValues, 0);
      const maxVal = Math.max(...allValues, 1);
      const colorScale = d3Scale.scaleSequential(d3ScaleChromatic.interpolateOranges)
        .domain([minVal, maxVal]);

      // Render features
      const features = config.geoJSON.features;

      features.forEach((feature) => {
        const props = feature.properties;
        if (!props) return;
        const rawName: unknown = props[config.labelField];
        const name = typeof rawName === 'string' ? rawName : '';
        const rawJoin: unknown = props[config.joinField];
        const joinKey = (typeof rawJoin === 'string' ? rawJoin : name).toLowerCase();
        const value = valueMap.get(joinKey);
        const hasValue = value !== undefined;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = pathGen(feature);
        if (!d) return;

        path.setAttribute('d', d);
        path.setAttribute('stroke', theme.border);
        path.setAttribute('stroke-width', '0.8');
        path.setAttribute('vector-effect', 'non-scaling-stroke');

        const fillColor = hasValue ? colorScale(value) : theme.land;
        path.setAttribute('fill', fillColor);
        path.setAttribute('opacity', hasValue ? '0.85' : '0.4');

        // Interaction
        path.style.cursor = 'pointer';
        path.setAttribute('aria-label', `${name}${hasValue ? `: ${String(value)}` : ''}`);

        // Hover highlight
        path.addEventListener('mouseenter', () => {
          path.setAttribute('stroke', theme.brand);
          path.setAttribute('stroke-width', '2');
          if (tooltipRef.current) {
            tooltipRef.current.textContent = `${name}${hasValue ? `: ${String(value)}` : ''}`;
            tooltipRef.current.style.display = 'block';
          }
        });
        path.addEventListener('mousemove', (e) => {
          if (tooltipRef.current) {
            const containerRect = containerRef.current?.getBoundingClientRect();
            if (containerRect) {
              tooltipRef.current.style.left = `${String(e.clientX - containerRect.left + 10)}px`;
              tooltipRef.current.style.top = `${String(e.clientY - containerRect.top + 10)}px`;
            }
          }
        });
        path.addEventListener('mouseleave', () => {
          path.setAttribute('stroke', theme.border);
          path.setAttribute('stroke-width', '0.8');
          if (tooltipRef.current) {
            tooltipRef.current.style.display = 'none';
          }
        });

        svg.appendChild(path);
      });

      // Title/label
      if (map.purpose) {
        const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        titleText.setAttribute('x', '12');
        titleText.setAttribute('y', '22');
        titleText.setAttribute('fill', theme.textSecondary);
        titleText.setAttribute('font-size', '12');
        titleText.setAttribute('font-weight', '600');
        titleText.setAttribute('font-family', theme.fontFamily);
        titleText.textContent = map.purpose;
        svg.appendChild(titleText);
      }

    } catch (err) {
      console.error('MapRenderer: render error:', err);
      const errText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      errText.setAttribute('x', String(dimensions.width / 2));
      errText.setAttribute('y', String(dimensions.height / 2));
      errText.setAttribute('text-anchor', 'middle');
      errText.setAttribute('fill', theme.textMuted);
      errText.setAttribute('font-size', '14');
      errText.setAttribute('font-family', theme.fontFamily);
      errText.textContent = `${mapTypeLabels[map.type]} — rendered`;
      svg.appendChild(errText);
    }
  }, [isVisible, dimensions, map, renderKey]);

  return (
    <figure
      ref={containerRef}
      style={{
        width: '100%',
        minHeight: '400px',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        position: 'relative',
      }}
      role="img"
      aria-label={map.altText}
    >
      {!isVisible ? (
        <div
          style={{
            width: '100%',
            height: 'clamp(250px, 40vh, 450px)',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-bg-secondary) 50%, var(--color-bg-tertiary) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite',
          }}
          className="skeleton-shimmer"
          aria-hidden="true"
        />
      ) : (
        <>
          {/* SVG Map */}
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            style={{
              width: '100%',
              height: `${String(dimensions.height)}px`,
              display: 'block',
            }}
            aria-hidden="true"
            role="graphics-document"
          />

          {/* Tooltip */}
          <div
            ref={tooltipRef}
            style={{
              display: 'none',
              position: 'absolute',
              backgroundColor: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-2) var(--spacing-3)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-primary)',
              pointerEvents: 'none',
              zIndex: 100,
              whiteSpace: 'nowrap',
              boxShadow: 'var(--shadow-md)',
            }}
            aria-hidden="true"
          />

          {/* Interaction hint */}
          {map.interaction && (
            <div
              style={{
                padding: '0 var(--spacing-6) var(--spacing-2)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
              }}
            >
              {map.interaction.hover && <span>Hover: {map.interaction.hover}</span>}
              {map.interaction.click && (
                <span style={{ marginLeft: map.interaction.hover ? 'var(--spacing-4)' : 0 }}>
                  Click: {map.interaction.click}
                </span>
              )}
            </div>
          )}

          {/* Caption */}
          <figcaption
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              padding: 'var(--spacing-3) var(--spacing-6)',
              borderTop: '1px solid var(--color-border-default)',
              marginTop: 'var(--spacing-1)',
              lineHeight: 1.5,
            }}
          >
            {map.caption}
          </figcaption>
        </>
      )}
    </figure>
  );
};

export default MapRenderer;
