import React from 'react';
import { EntityTerminalViewModel } from '@/types/canonical';

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

interface EntityTerminalProps {
  viewModel: EntityTerminalViewModel;
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
        context={buildCopilotContext(viewModel)} 
        suggestedQuestions={copilot.entity.generateSuggestedQuestions(buildCopilotContext(viewModel))} 
      />
    </div>
  );
}
