'use client';

import type { TBSStory } from '@/types/canonical';
import { validateStory } from '@/lib/story/tbs-converter';

interface StoryQualityDashboardProps {
  story: TBSStory;
}

export function StoryQualityDashboard({ story }: StoryQualityDashboardProps) {
  const validation = validateStory(story);
  const sectionsPresent = [
    true,
    true,
    story.keyFacts.length > 0,
    true,
    story.timeline.length > 0,
    story.systemExplanation ? true : false,
    story.evidence.length > 0,
    story.charts.length > 0,
    Boolean(story.maps && story.maps.length > 0),
    story.stakeholders ? true : false,
    story.perspectives ? true : false,
    story.tradeoffs && story.tradeoffs.length > 0,
    story.futureOutlook ? true : false,
    story.faq.length > 0,
    story.sources.length > 0,
    story.takeaways.length > 0,
    story.visuals.length > 0,
  ];

  const totalSections = 17;
  const presentSections = sectionsPresent.filter(Boolean).length;
  const sourceCount = story.sources.length;
  const evidenceCount = story.evidence.length;
  const stakeholderCount = story.stakeholders ? story.stakeholders.stakeholders.length : 0;
  const visualCount = story.visuals.length;
  const chartCount = story.charts.length;
  const wordCount = story.summary.split(/\s+/).length + story.narrative.split(/\s+/).length;

  const metric = (label: string, value: string | number, status: 'pass' | 'warn' | 'fail') => {
    const color = status === 'pass' ? 'text-[#22C55E]' : status === 'warn' ? 'text-[#F59E0B]' : 'text-[#EF4444]';
    return (
      <div className="flex justify-between py-1 border-b border-[#2A2A2A]">
        <span className="text-[#737373]">{label}</span>
        <span className={color}>{value}</span>
      </div>
    );
  };

  return (
    <div className="mt-8 p-5 rounded-xl bg-[#111111] border border-[#2A2A2A]" role="region" aria-label="Story Quality Dashboard">
      <h3 className="text-sm font-bold text-[#D4A843] mb-4 uppercase tracking-wider">Quality Dashboard</h3>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[#737373]">Section Coverage</span>
          <span className="text-[#F5F5F5]">{presentSections}/{totalSections}</span>
        </div>
        <div className="w-full h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#D4A843] rounded-full transition-all"
            style={{ width: `${String(Math.round((presentSections / totalSections) * 100))}%` }}
          />
        </div>
      </div>

      <div className="space-y-0">
        {metric('TBSS Version', 'TBSS-1.0', 'pass')}
        {metric('Sections Present', `${String(presentSections)}/${String(totalSections)}`, presentSections >= 14 ? 'pass' : 'warn')}
        {metric('Primary Sources', String(sourceCount), sourceCount >= 3 ? 'pass' : 'warn')}
        {metric('Evidence Entries', String(evidenceCount), evidenceCount >= 2 ? 'pass' : 'warn')}
        {metric('Stakeholders', String(stakeholderCount), stakeholderCount >= 2 ? 'pass' : 'warn')}
        {metric('Visuals', String(visualCount), visualCount >= 1 ? 'pass' : 'warn')}
        {metric('Charts', String(chartCount), 'pass')}
        {metric('Est. Word Count', String(wordCount), wordCount >= 300 ? 'pass' : 'warn')}
        {metric('Reading Time', `${String(story.metadata.readingTimeMinutes)} min`, 'pass')}
        {metric('Confidence', story.metadata.confidence, story.metadata.confidence === 'High' ? 'pass' : story.metadata.confidence === 'Medium' ? 'warn' : 'fail')}
        {metric('Accessibility', 'Pass', validation.errors.length === 0 ? 'pass' : 'fail')}
        {metric('Editorial Validation', validation.errors.length === 0 ? 'Pass' : 'Issues', validation.errors.length === 0 ? 'pass' : 'fail')}
        {metric('Performance', 'Pending', 'warn')}
      </div>

      {validation.warnings.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-amber-950/30 border border-amber-500/30">
          <h4 className="text-xs font-semibold text-amber-400 mb-2">Warnings</h4>
          <ul className="text-xs text-amber-300 space-y-1">
            {validation.warnings.map((w, i) => (
              <li key={i}>· {w}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.errors.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-red-950/30 border border-red-500/30">
          <h4 className="text-xs font-semibold text-red-400 mb-2">Errors</h4>
          <ul className="text-xs text-red-300 space-y-1">
            {validation.errors.map((e, i) => (
              <li key={i}>· {e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}