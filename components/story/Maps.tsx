import React from 'react';
import type { GeoData } from '@/utils/types';
import MapRenderer from '@/components/maps/MapRenderer';
import type { MapSpec } from '@/utils/types';

interface MapsProps {
  geoData?: GeoData;
}

/**
 * Convert GeoData (StoryJSON format) to MapSpec (VisualPlan format).
 * MapRenderer expects MapSpec; Maps.tsx bridges the two data models.
 */
function geoDataToSpec(data: GeoData): MapSpec {
  // Encode region data as JSON in data.source for MapRenderer to parse
  const encodedRegions = JSON.stringify(data.regions);

  // Map GeoData types to MapSpec types (StoryJSON format → MapRenderer format)
  const typeMap: Record<string, MapSpec['type']> = {
    'india-map': 'india-state',
    'world-map': 'world-choropleth',
    'state-map': 'india-state',
  };
  const mapType = typeMap[data.type];

  return {
    mapId: `map-${data.type}`,
    type: mapType,
    purpose: 'Geographic data visualization',
    geography: {
      scope: data.type === 'india-map' ? 'India' : data.type === 'world-map' ? 'World' : 'Regional',
      projection: 'equirectangular',
    },
    data: {
      source: encodedRegions,
      valueField: 'value',
      joinKey: 'id',
    },
    caption: `${String(data.regions.length)} regions shown`,
    altText: `Map showing ${String(data.regions.length)} geographic regions`,
    responsive: true,
    lazyLoad: true,
  };
}

const Maps: React.FC<MapsProps> = ({ geoData }) => {
  if (!geoData || geoData.regions.length === 0) return null;

  return (
    <section aria-label="Geographic data" style={{
      width: '100%',
      maxWidth: 'var(--max-width-content)',
      margin: '0 auto',
      padding: 'var(--spacing-8) var(--spacing-4)',
    }}>
      <h2 style={{
        fontSize: 'var(--text-xl)',
        fontWeight: 'var(--font-weight-bold)',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--spacing-6)',
      }}>
        Geographic Distribution
      </h2>

      <MapRenderer map={geoDataToSpec(geoData)} />

      {/* Region table below the map */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 'var(--spacing-2)',
        marginTop: 'var(--spacing-4)',
      }}>
        {geoData.regions.map((region) => (
          <div
            key={region.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-2) var(--spacing-3)',
            }}
          >
            <span style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
            }}>
              {region.name}
            </span>
            <span style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-brand-400)',
            }}>
              {region.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Maps;
