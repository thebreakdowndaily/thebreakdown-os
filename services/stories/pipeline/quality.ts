import { KnowledgeStory, StoryBuilder } from './builder';

export class QualityBuilder implements StoryBuilder {
  async build(story: KnowledgeStory): Promise<KnowledgeStory> {
    let score = 100;
    const issues = [];

    if (!story.visualAssets?.hero || story.visualAssets.hero.resolvedAsset?.optimization.cdnUrl.includes('/placeholders/')) {
      score -= 20;
      issues.push('Missing Official Hero Image');
    }
    
    // Check visual richness
    if (!story.visualAssets?.gallery || story.visualAssets.gallery.length < 2) {
      score -= 5;
      issues.push('Lacking Visual Context (Gallery)');
    }

    if (!story.unifiedTimeline || story.unifiedTimeline.length === 0) {
      score -= 10;
      issues.push('Missing Timeline');
    }

    if (!story.raw.sources || story.raw.sources.length === 0) {
      score -= 30;
      issues.push('Missing Sources');
    }

    if (!story.raw.claims || story.raw.claims.length === 0) {
      score -= 15;
      issues.push('Missing Evidence');
    }

    if (!story.resolvedEntities?.primary) {
      score -= 15;
      issues.push('Missing Primary Entity Link');
    }

    story.qualityScore = {
      score: Math.max(0, score),
      issues,
      status: score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Review',
      visualScore: {
        score: Math.min(100, 20 + (story.visualAssets?.portraits.length || 0)*10 + (story.visualAssets?.logos.length || 0)*10 + (story.visualAssets?.maps.length || 0)*20),
        hero: !!story.visualAssets?.hero,
        people: story.visualAssets?.portraits.length || 0,
        organizations: story.visualAssets?.logos.length || 0,
        maps: story.visualAssets?.maps.length || 0,
        charts: story.visualAssets?.charts.length || 0,
        gallery: story.visualAssets?.gallery.length || 0,
      }
    };

    return story;
  }
}
