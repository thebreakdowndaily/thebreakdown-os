import { KnowledgeStory, StoryBuilder } from './builder';

type ImageQualityTier = 'authentic_entity' | 'story_fallback' | 'placeholder' | 'none';

function getImageTier(asset: any): ImageQualityTier {
  if (!asset?.resolvedAsset) return 'none';
  const src = asset.resolvedAsset.optimization?.cdnUrl || asset.resolvedAsset.src || '';
  if (src.includes('placehold.co')) return 'placeholder';
  if (asset.resolvedAsset.id?.startsWith('story-fallback')) return 'story_fallback';
  return 'authentic_entity';
}

export class QualityBuilder implements StoryBuilder {
  async build(story: KnowledgeStory): Promise<KnowledgeStory> {
    const raw = story.raw;
    const visuals = story.visualAssets;
    const heroTier = getImageTier(visuals?.hero);
    
    // Checklists
    const checklist = {
      heroImage: heroTier !== 'none' && heroTier !== 'placeholder',
      heroImageQuality: heroTier,
      summary: !!raw.summary && raw.summary.length > 10,
      timeline: !!story.unifiedTimeline && story.unifiedTimeline.length > 0,
      evidence: !!raw.claims && raw.claims.length > 0,
      sources: !!raw.sources && raw.sources.length > 0,
      faq: !!raw.faq && raw.faq.length > 0,
      relatedStories: !!raw.relatedStoryIds && raw.relatedStoryIds.length > 0,
      relatedEntities: !!raw.relatedEntityIds && raw.relatedEntityIds.length > 0,
      gallery: !!visuals?.gallery && visuals.gallery.length > 0,
      metadata: !!raw.tags && raw.tags.length > 0,
      schema: true,
      socialImage: !!visuals?.hero
    };

    // Sub-scores
    let visualScore = 100;
    if (heroTier === 'none' || heroTier === 'placeholder') visualScore -= 50;
    else if (heroTier === 'story_fallback') visualScore -= 15;
    if (!checklist.gallery) visualScore -= 20;
    if (!visuals?.portraits?.length) visualScore -= 10;
    
    let evidenceScore = 100;
    if (!checklist.evidence) evidenceScore -= 50;
    
    let sourcesScore = 100;
    if (!checklist.sources) sourcesScore -= 50;
    
    let timelineScore = 100;
    if (!checklist.timeline) timelineScore -= 50;
    
    let seoScore = 100;
    if (!checklist.summary) seoScore -= 20;
    if (!checklist.metadata) seoScore -= 10;
    
    let accessibilityScore = 100;
    if (visuals?.hero && !visuals.hero.resolvedAsset?.altText) accessibilityScore -= 30;

    const clamp = (val: number) => Math.max(0, Math.min(100, val));
    visualScore = clamp(visualScore);
    evidenceScore = clamp(evidenceScore);
    sourcesScore = clamp(sourcesScore);
    timelineScore = clamp(timelineScore);
    seoScore = clamp(seoScore);
    accessibilityScore = clamp(accessibilityScore);

    const overallScore = Math.round((visualScore + evidenceScore + sourcesScore + timelineScore + seoScore + accessibilityScore) / 6);

    const issues = [];
    if (heroTier === 'none' || heroTier === 'placeholder') issues.push({ level: 'Critical', message: 'Missing Hero Image' });
    else if (heroTier === 'story_fallback') issues.push({ level: 'Minor', message: 'Hero image sourced from story-level fallback, not primary entity' });
    if (!checklist.timeline) issues.push({ level: 'Important', message: 'Missing Timeline' });
    if (!checklist.sources) issues.push({ level: 'Critical', message: 'Missing Sources' });
    if (!checklist.faq) issues.push({ level: 'Minor', message: 'Missing FAQ' });

    story.qualityScore = {
      score: overallScore,
      status: overallScore >= 90 ? 'Excellent' : overallScore >= 70 ? 'Good' : 'Needs Review',
      subScores: {
        visuals: visualScore,
        evidence: evidenceScore,
        sources: sourcesScore,
        timeline: timelineScore,
        seo: seoScore,
        accessibility: accessibilityScore
      },
      checklist,
      issues
    };

    return story;
  }
}
