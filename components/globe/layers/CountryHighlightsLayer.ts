/* eslint-disable */
import { GlobeLayerStrategy } from '../registries/GlobeLayerRegistry';
import type { GlobeSpec } from '@/utils/types';
import type { GlobeTheme } from '../hooks/useGlobeTheme';

export const CountryHighlightsLayer: GlobeLayerStrategy = {
  apply(globeInstance: any, spec: GlobeSpec, theme: GlobeTheme) {
    const raw = spec.features?.highlightedCountries;
    const countries: string[] = Array.isArray(raw) ? raw as string[] : [];

    if (countries.length === 0) {
      globeInstance.hexBinPointsData([]);
      return;
    }

    const hexData = countries.map((c) => {
      const coords: Record<string, [number, number]> = {
        India: [20, 78], China: [35, 105], 'United States': [38, -97],
        Brazil: [-14, -52], Russia: [60, 40], Japan: [36, 138],
        Germany: [51, 10], UK: [55, -3], France: [46, 2],
        Australia: [-25, 135], 'South Africa': [-30, 25],
        'Saudi Arabia': [24, 45], Indonesia: [-5, 120],
        Pakistan: [30, 70], Bangladesh: [24, 90], Nigeria: [8, 8],
        Egypt: [26, 30], Mexico: [23, -102], Canada: [56, -106],
        Argentina: [-38, -64],
      };
      const pos = coords[c] || [0, 0];
      return { lat: pos[0], lng: pos[1], color: theme.brand, label: c };
    });

    globeInstance
      .hexBinPointsData(hexData)
      .hexBinPointLat('lat')
      .hexBinPointLng('lng')
      .hexBinPointColor('color')
      .hexBinLabel((d: any) => d.label)
      .hexBinResolution(4)
      .hexMargin(0.2);
  },
  remove(globeInstance: any) {
    globeInstance.hexBinPointsData([]);
  }
};
