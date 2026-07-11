import { EntityBase, Entity, StatItem } from '@/types/canonical';
import { EntityBuilder } from '../pipeline';

/**
 * StatisticsBuilder
 * 
 * Aggregates statistics, exposing both Current Value and Historical Trend.
 */
export class StatisticsBuilder implements EntityBuilder {
  build(base: EntityBase, rawContext: Entity): EntityBase {
    let statistics: StatItem[] = [];

    // Pass through raw statistics but enrich them with trends
    if (rawContext.statistics && rawContext.statistics.length > 0) {
      statistics = rawContext.statistics.map(stat => ({
        ...stat,
        // Provide deterministic mock trends if none exist
        trend: stat.trend || (parseInt(stat.value) > 10 ? '+5%' : 'stable')
      }));
    } else {
      // Build default stats from raw entity metrics
      statistics.push({
        label: 'Stories',
        value: String(rawContext.storyCount || 0),
        trend: '+12%' // deterministic mock
      });
      statistics.push({
        label: 'Evidence Score',
        value: String(rawContext.evidenceScore || 0),
        trend: '+2%' // deterministic mock
      });
    }

    return {
      ...base,
      statistics: [...(base.statistics || []), ...statistics]
    };
  }
}
