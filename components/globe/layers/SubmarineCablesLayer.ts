/* eslint-disable */
import { GlobeLayerStrategy } from '../registries/GlobeLayerRegistry';
import type { GlobeSpec } from '@/utils/types';
import type { GlobeTheme } from '../hooks/useGlobeTheme';

export const SubmarineCablesLayer: GlobeLayerStrategy = {
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
      .arcColor(() => ['#60a5fa', '#3b82f6'])
      .arcStroke(0.8)
      .arcDashLength(0.3)
      .arcDashGap(0.1)
      .arcDashAnimateTime(5000);
  },
  remove(globeInstance: any) {
    globeInstance.arcsData([]);
  }
};
