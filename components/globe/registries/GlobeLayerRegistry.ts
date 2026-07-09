/* eslint-disable */
import { Registry } from '@/lib/registry';
import type { GlobeSpec } from '@/utils/types';
import type { GlobeTheme } from '../hooks/useGlobeTheme';
import { CountryHighlightsLayer } from '../layers/CountryHighlightsLayer';
import { TradeRoutesLayer } from '../layers/TradeRoutesLayer';
import { PointDensityLayer } from '../layers/PointDensityLayer';
import { SubmarineCablesLayer } from '../layers/SubmarineCablesLayer';

// Using 'any' for GlobeInstance for now since globe.gl typings are complex.
// The true type is the instance returned by globe.gl.
export interface GlobeLayerStrategy {
  /**
   * Applies the layer to the given globe instance.
   */
  apply(globeInstance: any, spec: GlobeSpec, theme: GlobeTheme): void;
  /**
   * Removes the layer and cleans up resources from the globe instance.
   */
  remove(globeInstance: any): void;
}

export const GlobeLayerRegistry = new Registry<GlobeLayerStrategy>();

GlobeLayerRegistry.register('country-highlights', CountryHighlightsLayer);
GlobeLayerRegistry.register('diplomatic-visits', CountryHighlightsLayer);
GlobeLayerRegistry.register('election-results', CountryHighlightsLayer);

GlobeLayerRegistry.register('trade-routes', TradeRoutesLayer);
GlobeLayerRegistry.register('shipping-lanes', TradeRoutesLayer);

GlobeLayerRegistry.register('point-density', PointDensityLayer);
GlobeLayerRegistry.register('satellite-coverage', PointDensityLayer);

GlobeLayerRegistry.register('submarine-cables', SubmarineCablesLayer);
