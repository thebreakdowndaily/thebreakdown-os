import type { Topic, Story } from '@/types/canonical';
import type { KnowledgeTopic, TopicAggregator } from './builder';
import { getServices } from '@/services/registry';

export class StoryAggregator implements TopicAggregator {
  async aggregate(topic: Topic, currentKnowledge: KnowledgeTopic): Promise<KnowledgeTopic> {
    const storyPromises = topic.storyIds.map(id => getServices().stories.getStory(id));
    const storiesResult = await Promise.all(storyPromises);
    const stories = storiesResult.filter((s): s is Story => !!s);

    // Latest: chronologically recent
    const latest = [...stories].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    // Important: High impact level
    const important = stories.filter(s => s.impactLevel === 'critical' || s.impactLevel === 'high');
    
    // Highest Evidence: score >= 90
    const highestEvidence = stories.filter(s => s.evidenceScore >= 90).sort((a, b) => b.evidenceScore - a.evidenceScore);
    
    // Trending: recent + high impact (proxy for trending)
    const trending = latest.slice(0, 5).filter(s => s.impactLevel !== 'low');
    
    // Historical: older than 1 year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const historical = stories.filter(s => new Date(s.publishedAt) < oneYearAgo);
    
    // Recommended: Editor's pick or highly scored
    const recommended = highestEvidence.slice(0, 3);

    return {
      topic,
      storyGroups: {
        latest: latest.slice(0, 10),
        important: important.slice(0, 5),
        highestEvidence: highestEvidence.slice(0, 5),
        trending: trending,
        historical: historical.slice(0, 5),
        recommended: recommended
      }
    };
  }
}
