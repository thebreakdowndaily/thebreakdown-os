import type { TBSStory } from '@/types/canonical';

export interface StoryBlock {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

export interface ValidationResult {
  warnings: string[];
  errors: string[];
}

/**
 * Conversion Layer: TBSStory → StoryBlock[]
 *
 * This function runs on the server during prerendering.
 * It converts canonical TBSStory objects into StoryBlock[]
 * for the client-side BlockRenderer pipeline.
 *
 * By keeping this in a non-client module, Next.js can execute
 * it during static prerendering without hitting the
 * "Cannot read properties of undefined (reading 'map')" error
 * that occurs when storyToBlocks runs inside a 'use client' component.
 */
export function storyToBlocks(story: TBSStory): StoryBlock[] {
  const blocks: StoryBlock[] = [];
  let order = 0;
  const O = (n: number) => String(n);

  const keyFacts = story.keyFacts || [];
  const timeline = story.timeline || [];
  const evidence = story.evidence || [];
  const sources = story.sources || [];
  const charts = story.charts || [];
  const maps = story.maps || [];
  const tradeoffs = story.tradeoffs || [];
  const faq = story.faq || [];

  blocks.push({ id: `executive-summary-${O(order)}`, type: 'executive-summary', data: {
    summary: story.summary,
    keyPoints: keyFacts.map(f => f.claim),
  }});
  order++;

  blocks.push({ id: `why-it-matters-${O(order)}`, type: 'callout', data: {
    variant: 'why-it-matters' as const,
    title: 'Why It Matters',
    content: story.whyItMatters,
  }});
  order++;

  if (timeline.length > 0) {
    blocks.push({ id: `timeline-${O(order)}`, type: 'timeline', data: {
      events: timeline.map(t => ({ date: t.date, title: t.event, description: t.significance, source: t.source })),
    }});
    order++;
  }

  if (story.systemExplanation) {
    blocks.push({ id: `system-${O(order)}`, type: 'system-explanation', data: story.systemExplanation });
    order++;
  }

  blocks.push({ id: `evidence-${O(order)}`, type: 'evidence', data: {
    overallScore: story.metadata.confidence === 'High' ? 95 : story.metadata.confidence === 'Medium' ? 72 : 45,
    verifiedClaims: evidence.filter(e => e.confidence > 0.5).length,
    claims: evidence.map((e, idx) => ({
      id: String(idx),
      text: e.claim,
      confidence: e.confidence * 100,
      status: e.confidence > 0.7 ? 'verified' as const : e.confidence > 0.5 ? 'strong' as const : 'moderate' as const,
      sources: [{ name: e.source, url: '', group: 'primary' as const }],
      supportingEvidence: [],
    })),
    primarySources: sources.length,
  }});
  order++;

  if (charts.length > 0) {
    charts.forEach((chart, i) => {
      blocks.push({ id: `chart-${O(order)}-${O(i)}`, type: 'chart', data: {
        chartId: `chart-${story.slug}-${O(i)}`,
        type: chart.type,
        title: chart.title,
        data: chart.data,
        xKey: 'label',
        yKey: 'value',
      }});
      order++;
    });
  }

  if (maps && maps.length > 0) {
    maps.forEach((map, i) => {
      blocks.push({ id: `map-${O(order)}-${O(i)}`, type: 'image', data: {
        src: map.data.source || '',
        alt: map.title,
        caption: map.title,
        credit: 'Map data source',
        width: 'full',
      }});
      order++;
    });
  }

  if (story.stakeholders) {
    blocks.push({ id: `stakeholders-${O(order)}`, type: 'stakeholders', data: story.stakeholders });
    order++;
  }

  if (story.perspectives) {
    blocks.push({ id: `perspectives-${O(order)}`, type: 'perspectives', data: story.perspectives });
    order++;
  }

  if (tradeoffs.length > 0) {
    tradeoffs.forEach((t, i) => {
      blocks.push({ id: `tradeoff-${O(order)}-${O(i)}`, type: 'comparison', data: {
        metric: t.option,
        before: { label: 'Risk', value: t.risks.slice(0, 2).join('; ') },
        after: { label: 'Benefit', value: t.benefits.slice(0, 2).join('; ') },
        description: t.evidence,
      }});
      order++;
    });
  }

  if (story.futureOutlook) {
    blocks.push({ id: `future-${O(order)}`, type: 'future-outlook', data: story.futureOutlook });
    order++;
  }

  if (faq.length > 0) {
    blocks.push({ id: `faq-${O(order)}`, type: 'faq', data: {
      questions: faq.map(f => ({ question: f.question, answer: f.answer })),
    }});
    order++;
  }

  blocks.push({ id: `sources-${O(order)}`, type: 'sources', data: {
    sources: sources.map(s => ({ title: s.title, url: s.url || '', type: 'editorial', tier: 1 })),
  }});
  order++;

  return blocks;
}

/**
 * Validates a TBSStory and returns warnings/errors.
 * Non-blocking: warnings do not prevent rendering.
 * Errors indicate content that may mislead readers.
 */
export function validateStory(story: TBSStory): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  const keyFacts = story.keyFacts || [];
  const evidence = story.evidence || [];
  const sources = story.sources || [];
  const timeline = story.timeline || [];

  if (!story.title || story.title.trim() === '') {
    errors.push('Story title is missing');
  }
  if (!story.summary || story.summary.trim() === '') {
    warnings.push('Executive summary is missing');
  }
  if (!story.hero.image) {
    warnings.push('Hero image is missing');
  }
  if (keyFacts.length === 0) {
    warnings.push('No key facts provided');
  }
  if (story.metadata.confidence === 'Insufficient') {
    errors.push('Confidence is Insufficient — story should not be published');
  }
  if (story.metadata.confidence === 'Low') {
    warnings.push('Confidence is Low — verify sources before publishing');
  }
  if (evidence.length === 0) {
    warnings.push('No evidence entries provided');
  }
  if (sources.length === 0) {
    warnings.push('No sources cited');
  }
  if (story.metadata.lastVerified === '') {
    warnings.push('Last verified date is not set');
  }
  if (timeline.length > 0) {
    const hasDate = timeline.every(t => t.date && t.date.trim() !== '');
    if (!hasDate) {
      warnings.push('Some timeline events are missing dates');
    }
  }

  return { warnings, errors };
}