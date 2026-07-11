/* eslint-disable */
import { GlobeLayerStrategy } from '../registries/GlobeLayerRegistry';
import type { GlobeSpec } from '@/types/canonical';
import type { GlobeTheme } from '../hooks/useGlobeTheme';

export const TradeRoutesLayer: GlobeLayerStrategy = {
  apply(globeInstance: any, spec: GlobeSpec, theme: GlobeTheme) {
    const raw = spec.features?.arcs;
    const arcs = Array.isArray(raw) ? raw : [];

    if (arcs.length === 0) {
      globeInstance.arcsData([]);
      return;
    }

    globeInstance
      .arcsData(arcs)
      .arcStartLat((d: any) => d.source[0])
      .arcStartLng((d: any) => d.source[1])
      .arcEndLat((d: any) => d.target[0])
      .arcEndLng((d: any) => d.target[1])
      .arcColor(() => [theme.brand, theme.brand])
      .arcStroke(0.5)
      .arcDashLength(0.15)
      .arcDashGap(0.05)
      .arcDashAnimateTime(3000);
  },
  remove(globeInstance: any) {
    globeInstance.arcsData([]);
  }
};
