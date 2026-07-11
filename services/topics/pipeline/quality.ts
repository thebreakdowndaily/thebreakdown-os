import type { Topic, Story } from '@/types/canonical';
import type { KnowledgeTopic, TopicAggregator } from './builder';
import { getServices } from '@/services/registry';

export class TopicQualityAggregator implements TopicAggregator {
  async aggregate(topic: Topic, currentKnowledge: KnowledgeTopic): Promise<KnowledgeTopic> {
    const missingStories: string[] = [];
    const weakEvidence: string[] = [];
    const missingTimeline: string[] = [];
    const missingMedia: string[] = [];
    const brokenLinks: string[] = [];

    const stories = topic.storyIds
      .map(id => getServices().stories.getStory(id))
      .filter((s): s is Story => s !== null);

    if (stories.length === 0) missingStories.push('No stories associated with topic.');
    
    stories.forEach(s => {
      if (s.evidenceScore < 70) weakEvidence.push(`Weak evidence in story: ${s.slug}`);
      if (!s.timeline || s.timeline.length === 0) missingTimeline.push(`Missing timeline in story: ${s.slug}`);
      if (!s.heroImage) missingMedia.push(`Missing media in story: ${s.slug}`);
    });

    if (!topic.timeline || topic.timeline.length === 0) missingTimeline.push('Topic missing main timeline.');
    if (!topic.image) missingMedia.push('Topic missing hero image.');

    const totalIssues = missingStories.length + weakEvidence.length + missingTimeline.length + missingMedia.length + brokenLinks.length;
    
    // Base score 100, deduct points for issues
    let score = 100;
    score -= missingStories.length * 20;
    score -= weakEvidence.length * 5;
    score -= missingTimeline.length * 5;
    score -= missingMedia.length * 5;
    
    score = Math.max(0, Math.min(100, score));

    let status: 'Excellent' | 'Good' | 'Needs Review' = 'Needs Review';
    if (score >= 90) status = 'Excellent';
    else if (score >= 70) status = 'Good';

    // Coverage completeness proxy
    const coverageCompleteness = stories.length > 5 && score > 80 ? 100 : Math.min(90, stories.length * 15);

    return {
      topic,
      qualityScore: {
        score,
        status,
        coverageCompleteness,
        missingStories,
        weakEvidence,
        missingTimeline,
        missingMedia,
        brokenLinks
      }
    };
  }
}
