import { escapeHtmlText } from '@/lib/security/sanitize-rich-html';
import type { StoryBlock } from '@/types/canonical';
import type { APIStory } from '@/utils/data-layer/types';

export function createBlocksFromStory(s: APIStory): StoryBlock[] {
  if ((s as any).blocks && Array.isArray((s as any).blocks) && (s as any).blocks.length > 0) {
    return (s as any).blocks;
  }

  const blocks: StoryBlock[] = [];

  const allSources = [
    ...(s.sources || []).map((src) => ({ name: src.name, url: src.url, type: src.type, tier: src.tier })),
    ...(s.sources || []).filter(src => src.type === 'primary').map((ps) => ({ name: ps.name, url: ps.url, type: ps.type || 'primary', tier: 1 })),
  ];

  // HERO BLOCK (Region: hero)
  blocks.push({
    id: 'hero',
    type: 'hero',
    region: 'hero',
    data: {
      headline: s.headline,
      summary: s.summary,
      heroImage: s.heroImage,
      publishedAt: s.publishedAt,
      updatedAt: s.updatedAt,
      readingTime: s.readingTime,
      author: typeof s.author === 'string' ? s.author : (s.author?.name || ''),
      evidenceScore: s.evidenceScore ?? 0,
      sources: allSources,
      tags: s.tags || [],
      category: s.category || '',
      slug: s.slug,
      versionHistory: s.versionHistory,
    }
  });

  // STORY SNAPSHOT BLOCK (Region: sidebar)
  blocks.push({
    id: 'story-snapshot',
    type: 'story-snapshot',
    region: 'sidebar',
    data: {
      status: s.status,
      category: s.category,
      location: s.location,
      stakeholderNames: s.stakeholderNames || [],
      impactLevel: s.impactLevel,
      legislation: s.legislation,
      costValue: s.costValue,
      updatedAt: s.updatedAt,
      evidenceScore: s.evidenceScore ?? 0,
      sourceCount: allSources.length,
    }
  });

  // 1. Chapter 1: Context & Core Significance
  blocks.push({
    id: 'ch-context-heading',
    type: 'chapter-heading',
    region: 'main',
    data: { title: 'Context & Core Significance' },
  });

  const contextParagraphs: string[] = [];
  const whyItMatters = (s as any).whyItMatters;
  const takeaway = (s as any).takeaway;

  if (s.summary) {
    contextParagraphs.push(`<p class="leading-relaxed text-neutral-200 text-lg mb-4">${escapeHtmlText(s.summary)}</p>`);
  }
  if (whyItMatters && whyItMatters !== s.summary) {
    contextParagraphs.push(`<p class="leading-relaxed text-neutral-300 mt-2">${escapeHtmlText(String(whyItMatters))}</p>`);
  }
  if (takeaway && takeaway !== s.summary && takeaway !== whyItMatters) {
    contextParagraphs.push(`<blockquote class="border-l-2 border-emerald-500 pl-4 py-2 my-4 text-white font-medium italic bg-neutral-900/40 rounded-r-lg">${escapeHtmlText(String(takeaway))}</blockquote>`);
  }
  if (contextParagraphs.length === 0 && s.keyPoints && s.keyPoints.length > 0) {
    contextParagraphs.push(`<p class="leading-relaxed text-neutral-200">${escapeHtmlText(s.keyPoints[0])}</p>`);
  }

  blocks.push({
    id: 'ch-context-text',
    type: 'text',
    region: 'main',
    data: { content: contextParagraphs.join('\n') },
  });

  // 2. Chapter 2: Key Developments
  const keyPoints = (s.keyPoints && s.keyPoints.length > 0) 
    ? s.keyPoints 
    : (s.claims && s.claims.length >= 2 ? s.claims.slice(0, 4).map((c) => c.claim) : []);

  if (keyPoints.length > 0) {
    blocks.push({
      id: 'ch-developments-heading',
      type: 'chapter-heading',
      region: 'main',
      data: { title: 'Key Developments' },
    });

    const developmentsHtml = [
      '<ul class="space-y-3 my-4 list-disc pl-5">',
      ...keyPoints.map((kp) => `<li class="leading-relaxed text-neutral-200">${escapeHtmlText(kp)}</li>`),
      '</ul>',
    ].join('\n');

    blocks.push({
      id: 'ch-developments-text',
      type: 'text',
      region: 'main',
      data: { content: developmentsHtml },
    });
  }

  // 3. Chapter 3: Investigative Evidence & Detailed Analysis (Authored Claims with Explanations)
  const claimsWithExplanations = (s.claims || []).filter((c) => c.explanation && c.explanation.trim().length > 0);
  if (claimsWithExplanations.length > 0) {
    blocks.push({
      id: 'ch-evidence-analysis-heading',
      type: 'chapter-heading',
      region: 'main',
      data: { title: 'Investigative Evidence & Findings' },
    });

    const claimsAnalysisHtml = claimsWithExplanations.map((c) => `
      <div class="my-5 p-5 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-2">
        <div class="flex items-center justify-between gap-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider text-emerald-400 bg-emerald-950/50 border border-emerald-800/40">
            ${c.verification === 'false' ? 'Common Misconception' : 'Verified Finding'}
          </span>
          ${c.source ? `<span class="text-xs font-mono text-neutral-400">Source: ${escapeHtmlText(c.source)}</span>` : ''}
        </div>
        <h4 class="text-base font-semibold text-white leading-snug">${escapeHtmlText(c.claim)}</h4>
        <p class="text-sm text-neutral-300 leading-relaxed">${escapeHtmlText(c.explanation)}</p>
      </div>
    `).join('\n');

    blocks.push({
      id: 'ch-evidence-analysis-text',
      type: 'text',
      region: 'main',
      data: { content: claimsAnalysisHtml },
    });
  }

  // 3. Chapter 3: Key Figures & Official Data
  if ((s.facts && s.facts.length > 0) || (s.charts && s.charts.length > 0)) {
    blocks.push({
      id: 'ch-data-heading',
      type: 'chapter-heading',
      region: 'main',
      data: { title: 'Key Figures & Data' },
    });

    if (s.facts && s.facts.length > 0) {
      blocks.push({
        id: 'key-numbers',
        type: 'key-numbers',
        region: 'main',
        data: { items: s.facts.map((f) => ({ value: f.value, label: f.label, source: f.source })) },
      });
    }

    if (s.charts && s.charts.length > 0) {
      s.charts.forEach((c, i: number) => {
        blocks.push({
          id: `chart-${i}`,
          type: 'chart',
          region: 'main',
          data: { chartId: String(i), type: c.type, title: c.title, data: c.data, xKey: c.xKey, yKey: c.yKey },
        });
      });
    }
  }

  // 4. Chapter 4: Key Clarifications & Analysis (if FAQs exist)
  if (s.faq && s.faq.length > 0) {
    blocks.push({
      id: 'ch-clarifications-heading',
      type: 'chapter-heading',
      region: 'main',
      data: { title: 'Key Clarifications' },
    });

    const faqHtml = s.faq
      .map((item) => `
        <div class="my-4 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
          <h4 class="font-bold text-white text-base mb-1.5">${escapeHtmlText(item.question)}</h4>
          <p class="text-sm text-neutral-300 leading-relaxed">${escapeHtmlText(item.answer)}</p>
        </div>
      `)
      .join('\n');

    blocks.push({
      id: 'ch-clarifications-text',
      type: 'text',
      region: 'main',
      data: { content: faqHtml },
    });
  }

  const relData: Record<string, unknown> = {};
  if (s.relatedStories && s.relatedStories.length > 0) {
    relData.stories = s.relatedStories;
  }
  if (s.relatedEntities && s.relatedEntities.length > 0) {
    relData.entities = s.relatedEntities;
  }
  if (Object.keys(relData).length > 0) {
    blocks.push({ id: 'related-intelligence', type: 'related-intelligence', region: 'footer', data: relData });
  }

  // AUTHOR BOX BLOCK (Region: footer)
  blocks.push({
    id: 'author-box',
    type: 'author-box',
    region: 'footer',
    data: {
      author: typeof s.author === 'string' ? { name: s.author } : (s.author || { name: 'The Breakdown' })
    }
  });

  return blocks;
}
