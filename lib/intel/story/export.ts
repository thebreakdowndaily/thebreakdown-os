import type { StoryDraft, StoryPackage } from './types';
import { storyStatusLabel } from './status';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder — Exports)
// Pure, deterministic export builders. Exports are computed on demand from the derived Story
// Draft — no file storage, no persistence, no side effects. The Structured Story Package
// (exportStoryPackage) is the canonical, schema-versioned export and the future CMS API payload.

function headerLine(story: StoryDraft): string {
  return [
    `# ${story.headline}`,
    '',
    `**Constituency:** ${story.constituencyName} (AC ${String(story.acNumber)}) · ${story.district}, ${story.region}`,
    `**Story type:** ${story.storyType.replace(/_/g, ' ')} · **Status:** ${storyStatusLabel(story.status)}`,
    `**Editorial priority:** ${String(story.editorialPriority)}/100 (${story.priorityTier}) · **Confidence:** ${story.confidence.replace('_', ' ')}`,
    `**Version:** ${String(story.version)} · **Generated:** ${new Date(story.updatedAt).toISOString()}`,
    '',
  ].join('\n');
}

export function exportStoryPackage(story: StoryDraft): StoryPackage {
  return {
    format: 'story-package-v1',
    metadata: {
      id: story.id,
      headline: story.headline,
      slug: story.slug,
      storyType: story.storyType,
      status: story.status,
      constituencyId: story.constituencyId,
      constituencyName: story.constituencyName,
      editorialPriority: story.editorialPriority,
      priorityTier: story.priorityTier,
      confidence: story.confidence,
      version: story.version,
      created: story.created,
      updated: story.updatedAt,
      source: story.source,
    },
    brief: story.brief,
    outline: story.outline,
    references: story.references,
    readiness: story.readiness,
    impact: story.impact,
    sourcePanel: story.sourcePanel,
    generatedAt: new Date().toISOString(),
  };
}

export function exportStoryJson(story: StoryDraft): string {
  return JSON.stringify(exportStoryPackage(story), null, 2);
}

export function exportStoryMarkdown(story: StoryDraft): string {
  const lines: string[] = [
    headerLine(story),
    '## Brief',
    '',
    story.brief.sections.map((s) => `### ${s.title}\n\n${s.items.map((i) => `- ${i.text} — _(${i.source})_`).join('\n')}`).join('\n\n'),
    '',
    '## Outline',
    '',
    story.outline.map((block) => `### ${block.title}\n\n${block.items.map((i) => `- ${i.text} — _(${i.basis}; ${i.source})_`).join('\n')}`).join('\n\n'),
    '',
    '## Readiness',
    '',
    `- State: ${story.readiness.state.replace(/_/g, ' ')}`,
    `- Can publish: ${String(story.readiness.canPublish)}`,
    ...story.readiness.blockers.map((b) => `- Blocker: ${b.label} — ${b.detail}`),
    `- Required actions: ${story.readiness.requiredActions.join('; ') || 'none'}`,
    '',
    '## Impact',
    '',
    `- Overall: ${String(story.impact.overall)}/100 (${story.impact.calculationVersion})`,
    ...story.impact.dimensions.map((d) => `- ${d.label}: ${String(d.value)}/100 (weight ${String(d.weight)}) — ${d.limitation}`),
    '',
  ];
  return lines.join('\n');
}

export function exportPrintBrief(story: StoryDraft): string {
  const lines: string[] = [
    `THE BREAKDOWN — STORY BRIEF`,
    `================================`,
    `Headline: ${story.headline}`,
    `Constituency: ${story.constituencyName} (AC ${String(story.acNumber)})`,
    `Status: ${storyStatusLabel(story.status)} · Type: ${story.storyType.replace(/_/g, ' ')}`,
    ``,
    `EXECUTIVE SUMMARY`,
    story.brief.executiveSummary,
    ``,
    `WHY IT MATTERS`,
    ...story.brief.whyItMatters.map((t) => `- ${t}`),
    ``,
    `KEY FINDINGS`,
    ...story.brief.keyFindings.map((t) => `- ${t}`),
    ``,
    `PRIMARY EVIDENCE`,
    ...story.brief.primaryEvidence.map((t) => `- ${t}`),
    ``,
    `READINESS: ${story.readiness.state.replace(/_/g, ' ').toUpperCase()}`,
    ...story.readiness.requiredActions.map((t) => `- ${t}`),
    ``,
    `IMPACT: ${String(story.impact.overall)}/100`,
    ...story.impact.dimensions.map((d) => `- ${d.label}: ${String(d.value)}/100`),
  ];
  return lines.join('\n');
}

export function exportEditorialSummary(story: StoryDraft): string {
  const blockerText = story.readiness.blockers.length > 0
    ? story.readiness.blockers.map((b) => b.label).join(', ')
    : story.readiness.state === 'ready'
      ? 'ready for publication'
      : story.readiness.state.replace(/_/g, ' ');
  return [
    `[${storyStatusLabel(story.status)}] ${story.headline} — ${story.constituencyName}`,
    `Type ${story.storyType.replace(/_/g, ' ')} · priority ${String(story.editorialPriority)} · impact ${String(story.impact.overall)}/100 · confidence ${story.confidence.replace('_', ' ')}`,
    `Readiness: ${blockerText}`,
    `References: ${String(story.references.evidence[0]?.count ?? 0)} evidence · ${String(story.references.verification[0]?.count ?? 0)} verified claims · ${String(story.references.toolkit[0]?.count ?? 0)} toolkit items`,
  ].join('\n');
}

export type { StoryPackage };
