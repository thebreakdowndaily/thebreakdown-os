/* eslint-disable */
import { GlobeLayerStrategy } from '../registries/GlobeLayerRegistry';
import type { GlobeSpec } from '@/types/canonical';
import type { GlobeTheme } from '../hooks/useGlobeTheme';

export const PointDensityLayer: GlobeLayerStrategy = {
  apply(globeInstance: any, spec: GlobeSpec, theme: GlobeTheme) {
    const raw = spec.features?.points;
    const points = Array.isArray(raw) ? raw : [];

    if (points.length === 0) {
      globeInstance.pointsData([]);
      return;
    }

    globeInstance
      .pointsData(points)
      .pointLat('lat')
      .pointLng('lng')
      .pointAltitude('value')
      .pointColor(() => theme.brand)
      .pointRadius(0.5)
      .pointsMerge(true);
  },
  remove(globeInstance: any) {
    globeInstance.pointsData([]);
  }
};
