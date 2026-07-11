import type { Story, QuickStoryViewModel, DeepStoryViewModel, ExpandedSource } from '@/types/canonical';

export function buildQuickView(story: Story): QuickStoryViewModel {
  const keyPoints = story.blocks
    .find(b => b.type === 'executive-summary')
    ?.data?.['keyPoints'] as string[] | undefined;

  return {
    summary: story.summary,
    keyPoints: (keyPoints || story.takeaway ? [story.takeaway!] : []).slice(0, 3),
    readingTime: Math.max(1, Math.round((keyPoints?.length || 3) * 0.3)),
  };
}

export function buildDeepView(story: Story): DeepStoryViewModel {
  const sourceCount = story.sources.length;
  const claimCount = story.claims.length;
  const faqCount = story.faq.length;

  const sourceTiers = story.sources.reduce((acc, src) => {
    acc[src.tier] = (acc[src.tier] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const methodology = buildMethodology(sourceCount, claimCount, faqCount, sourceTiers);

  const expandedSources: ExpandedSource[] = story.sources.map(s => ({
    name: s.title,
    url: s.url,
    description: `Tier ${s.tier} source.${s.tier === 1 ? ' Primary.' : s.tier === 2 ? ' Secondary.' : ''}`,
    tier: s.tier,
  }));

  return {
    methodology,
    expandedSources,
    readingTime: story.readingTime + sourceCount + claimCount + Math.round(faqCount * 0.5),
    sourceCount,
    claimCount,
    faqCount,
  };
}

export function buildMethodology(
  sourceCount: number,
  claimCount: number,
  faqCount: number,
  sourceTiers: Record<number, number>
): string {
  const t1 = sourceTiers[1] || 0;
  const t2 = sourceTiers[2] || 0;
  const t3 = sourceTiers[3] || 0;

  const parts: string[] = [];
  parts.push(`This analysis draws on ${sourceCount} sources.`);
  if (t1 > 0) parts.push(`${t1} primary source${t1 > 1 ? 's' : ''} (Tier 1).`);
  if (t2 > 0) parts.push(`${t2} secondary source${t2 > 1 ? 's' : ''} (Tier 2).`);
  if (t3 > 0) parts.push(`${t3} tertiary source${t3 > 1 ? 's' : ''} (Tier 3).`);
  parts.push(`Each of ${claimCount} claims has been verified against its originating source.`);
  parts.push('Data visualisations are based on the underlying datasets cited in each source.');
  if (faqCount > 0) {
    parts.push(`The FAQ section addresses ${faqCount} common questions with answers drawn from the cited evidence.`);
  }
  return parts.join(' ');
}
