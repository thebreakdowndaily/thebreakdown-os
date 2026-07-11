import { EntityBase, Entity } from '@/types/canonical';
import { EntityBuilder } from '../pipeline';

/**
 * SignalBuilder
 * 
 * Computes deterministic signals to make the terminal feel "alive."
 * (e.g. coverage trend, evidence growth, etc.)
 */
export class SignalBuilder implements EntityBuilder {
  build(base: EntityBase, rawContext: Entity): EntityBase {
    // In a real system, these would query timeseries analytics tables.
    // We derive them deterministically from the raw context to maintain stability.
    
    // Derived signals
    const signals = {
      velocity: Math.min(rawContext.storyCount * 2, 100), // Mentions per week (simulated)
      coverageTrend: rawContext.storyCount > 20 ? 'up' as const : rawContext.storyCount > 5 ? 'stable' as const : 'down' as const,
      evidenceGrowth: rawContext.evidenceScore > 80 ? '+5%' : '+1%',
      lastUpdated: rawContext.updatedAt || new Date().toISOString()
    };

    return {
      ...base,
      // We attach signals to the base object or as a dedicated object.
      // Since EntityBase doesn't explicitly have a `signals` object yet, we can map them to statistics 
      // or assume a future `signals` property. For now, we'll ensure they don't break the build.
      signals,
    } as EntityBase & { signals: any };
  }
}
