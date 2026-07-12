import type { Topic, Story } from '@/types/canonical';
import type { KnowledgeTopic, TopicAggregator } from './builder';
import { getServices } from '@/services/registry';

export class StatisticsAggregator implements TopicAggregator {
  async aggregate(topic: Topic, currentKnowledge: KnowledgeTopic): Promise<KnowledgeTopic> {
    const storyPromises = topic.storyIds.map(id => getServices().stories.getStory(id));
    const storiesResult = await Promise.all(storyPromises);
    const stories = storiesResult.filter((s): s is Story => !!s);

    let totalClaims = 0;
    let totalSources = 0;
    let totalEvidenceScore = 0;
    
    stories.forEach(s => {
      totalClaims += s.claims?.length || 0;
      totalSources += s.sources?.length || 0;
      totalEvidenceScore += s.evidenceScore || 0;
    });

    const averageConfidence = stories.length > 0 ? Math.round(totalEvidenceScore / stories.length) : 0;
    const coverageTrend = stories.length > 0 ? 5 : 0; // Stub: positive if recent stories > older stories
    const evidenceGrowth = 2; // Stub: positive if evidence score is increasing over time

    // Gather unique entity IDs across all stories in this topic
    const entityIds = new Set<string>();
    stories.forEach(s => {
      if (s.relatedEntityIds) {
        s.relatedEntityIds.forEach((id: string) => entityIds.add(id));
      }
    });
    
    let totalCountries = 0;
    let totalOrganizations = 0;
    let totalPeople = 0;

    for (const eid of entityIds) {
      const e = await getServices().entities.getEntity(eid);
      if (e) {
        if (e.type === 'country') totalCountries++;
        if (e.type === 'organization') totalOrganizations++;
        if (e.type === 'person') totalPeople++;
      }
    }

    return {
      topic,
      statistics: {
        coverageTrend,
        evidenceGrowth,
        averageConfidence,
        totalEntities: entityIds.size,
        totalClaims,
        totalMediaAssets: stories.filter(s => s.heroImage).length, // simplified
        totalSources,
        totalCountries,
        totalOrganizations,
        totalPeople
      }
    };
  }
}
