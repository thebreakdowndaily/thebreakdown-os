import { KnowledgeStory, StoryBuilder } from './builder';

export class QualityBuilder implements StoryBuilder {
  async build(story: KnowledgeStory): Promise<KnowledgeStory> {
    const raw = story.raw;
    const visuals = story.visualAssets;
    
    // Checklists
    const checklist = {
      heroImage: !!visuals?.hero && !visuals.hero.resolvedAsset?.optimization.cdnUrl.includes('/placeholders/'),
      summary: !!raw.summary && raw.summary.length > 10,
      timeline: !!story.unifiedTimeline && story.unifiedTimeline.length > 0,
      evidence: !!raw.claims && raw.claims.length > 0,
      sources: !!raw.sources && raw.sources.length > 0,
      faq: !!raw.faq && raw.faq.length > 0,
      relatedStories: !!raw.relatedStoryIds && raw.relatedStoryIds.length > 0,
      relatedEntities: !!raw.relatedEntityIds && raw.relatedEntityIds.length > 0,
      gallery: !!visuals?.gallery && visuals.gallery.length > 0,
      metadata: !!raw.tags && raw.tags.length > 0,
      schema: true, // Assuming SEO/Schema is injected if published
      socialImage: !!visuals?.hero // Assume hero is social image for now
    };

    // Sub-scores
    let visualScore = 100;
    if (!checklist.heroImage) visualScore -= 50;
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
    // Mock accessibility check for image alt text presence
    if (visuals?.hero && !visuals.hero.resolvedAsset?.altText) accessibilityScore -= 30;

    // Averages and bounds
    const clamp = (val: number) => Math.max(0, Math.min(100, val));
    visualScore = clamp(visualScore);
    evidenceScore = clamp(evidenceScore);
    sourcesScore = clamp(sourcesScore);
    timelineScore = clamp(timelineScore);
    seoScore = clamp(seoScore);
    accessibilityScore = clamp(accessibilityScore);

    const overallScore = Math.round((visualScore + evidenceScore + sourcesScore + timelineScore + seoScore + accessibilityScore) / 6);

    const issues = [];
    if (!checklist.heroImage) issues.push({ level: 'Critical', message: 'Missing Hero Image' });
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
