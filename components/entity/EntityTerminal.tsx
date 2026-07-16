import React from 'react';
import Link from 'next/link';
import { EntityTerminalExtendedViewModel } from '@/features/entity/view-model';

import TerminalHeader from './TerminalHeader';
import TerminalOverview from './TerminalOverview';
import TerminalSignals from './TerminalSignals';
import TerminalStats from './TerminalStats';
import TerminalDocuments from './TerminalDocuments';
import TerminalRelationships from './TerminalRelationships';
import TerminalTimeline from './TerminalTimeline';
import TerminalEvidence from './TerminalEvidence';
import TerminalMedia from './TerminalMedia';
import KnowledgeCopilotSidebar from '@/components/copilot/KnowledgeCopilotSidebar';
import { buildCopilotContext } from '@/features/ai/entity-context';
import { copilot } from '@/services/ai/copilot';

import { FeedbackSection } from '@/components/rxs/LearningFooter';

interface EntityTerminalProps {
  viewModel: EntityTerminalExtendedViewModel;
}

function TerminalRelatedContent({ viewModel }: { viewModel: EntityTerminalExtendedViewModel }) {
  const { relatedChapters, relatedInvestigations } = viewModel;

  if ((!relatedChapters || relatedChapters.length === 0) && (!relatedInvestigations || relatedInvestigations.length === 0)) {
    return null;
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col gap-4">
      {relatedChapters && relatedChapters.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-2 mb-3">
            Related Chapters
          </h2>
          <div className="flex flex-col gap-2">
            {relatedChapters.map((ch) => (
              <Link
                key={ch.slug}
                href={`/series/${ch.collectionSlug}/volume/${ch.volumeSlug}/chapter/${ch.slug}`}
                className="group flex flex-col p-3 rounded-lg bg-[#0c0c0c] border border-neutral-800/50 hover:border-emerald-500/30 transition-all"
              >
                <span className="text-sm text-neutral-300 font-medium group-hover:text-emerald-400 transition-colors">
                  {ch.title}
                </span>
                <span className="text-xs text-neutral-500 line-clamp-1 mt-1">
                  {ch.summary}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {relatedInvestigations && relatedInvestigations.length > 0 && (
        <div className="mt-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-2 mb-3">
            Related Investigations
          </h2>
          <div className="flex flex-col gap-2">
            {relatedInvestigations.map((inv) => (
              <Link
                key={inv.slug}
                href={`/investigation/${inv.slug}`}
                className="group flex flex-col p-3 rounded-lg bg-[#0c0c0c] border border-neutral-800/50 hover:border-amber-500/30 transition-all"
              >
                <span className="text-sm text-neutral-300 font-medium group-hover:text-amber-400 transition-colors">
                  {inv.title}
                </span>
                <span className="text-xs text-neutral-500 line-clamp-1 mt-1">
                  {inv.subtitle || inv.summary}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EntityTerminal({ viewModel }: EntityTerminalProps) {
  return (
    <div className="flex-1 w-full bg-[#0a0a0a]" role="main">
      <TerminalHeader viewModel={viewModel} />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Overview, Signals, Stats */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <TerminalOverview viewModel={viewModel} />
            <TerminalSignals viewModel={viewModel} />
            <TerminalStats viewModel={viewModel} />
            <TerminalDocuments viewModel={viewModel} />
            <TerminalRelatedContent viewModel={viewModel} />
            <FeedbackSection className="mb-0" />
          </div>

          {/* RIGHT COLUMN: Graph, Timeline, Evidence */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <TerminalRelationships viewModel={viewModel} />
            <TerminalTimeline viewModel={viewModel} />
            
            {/* Deep Dive Panels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <TerminalEvidence viewModel={viewModel} />
               <TerminalMedia viewModel={viewModel} />
            </div>
          </div>

        </div>
      </div>
      
      {/* Epic 5: Knowledge Copilot Layer */}
      <KnowledgeCopilotSidebar 
        context={buildCopilotContext(viewModel as any)} 
        suggestedQuestions={copilot.entity.generateSuggestedQuestions(buildCopilotContext(viewModel as any))} 
      />
    </div>
  );
}
