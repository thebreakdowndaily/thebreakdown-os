'use client';

import type { BlockType, BlockMap, StoryBlock } from './types';

import ExecutiveSummaryBlock from './ExecutiveSummaryBlock';
import EvidencePanelBlock from './EvidencePanelBlock';
import KeyNumbersBlock from './KeyNumbersBlock';
import ComparisonBlock from './ComparisonBlock';
import InteractiveTimelineBlock from './InteractiveTimelineBlock';
import RelatedIntelligenceBlock from './RelatedIntelligenceBlock';
import FAQBlock from './FAQBlock';
import SourcesBlock from './SourcesBlock';
import ChartBlock from './ChartBlock';
import { DatasetReferenceBlock } from './DatasetReferenceBlock';
import CalloutBlock from './CalloutBlock';
import ChapterHeadingBlock from './ChapterHeadingBlock';
import ImageBlock from './ImageBlock';
import MapBlock from './MapBlock';
import EvidenceInlineBlock from './EvidenceInlineBlock';
import TextBlockClient from './TextBlockClient';
import HeroBlock from './HeroBlock';
import AuthorBoxBlock from './AuthorBoxBlock';
import StorySnapshotBlock from './StorySnapshotBlock';
import ConfidenceMeterBlock from './ConfidenceMeterBlock';
import SystemExplanationBlock from './SystemExplanationBlock';
import StakeholdersBlock from './StakeholdersBlock';
import PerspectivesBlock from './PerspectivesBlock';
import FutureOutlookBlock from './FutureOutlookBlock';
import SvgChartBlock from './SvgChartBlock';
import AccountabilityChainBlock from './AccountabilityChainBlock';
import { ClaimBlock } from '@/components/knowledge-library/blocks/ClaimBlock';
import CaseEvidenceCardBlock from './CaseEvidenceCardBlock';
import MgnregaLedgerChartBlock from './MgnregaLedgerChartBlock';
import DocumentaryEvidenceBlock from './DocumentaryEvidenceBlock';
import SourcesMethodologyBlock from './SourcesMethodologyBlock';
import { normalizeChartBlockData } from '@/lib/story/chart-contract';

import PartitionSankeyBlock from './PartitionSankeyBlock';

import { LearningBlock } from '@/components/knowledge-library/blocks/LearningBlock';
import { ListBlock } from '@/components/knowledge-library/blocks/ListBlock';
import { DocumentBlock } from '@/components/knowledge-library/blocks/DocumentBlock';

import { DecisionMatrixBlock } from '@/components/knowledge-library/blocks/DecisionMatrixBlock';
import { ThinkerBlock } from '@/components/knowledge-library/blocks/ThinkerBlock';
import { RelationshipCardBlock } from '@/components/knowledge-library/blocks/RelationshipCardBlock';
import { HistoriographyBlock } from '@/components/knowledge-library/blocks/HistoriographyBlock';
import { CounterfactualBlock } from '@/components/knowledge-library/blocks/CounterfactualBlock';



const blockComponents: { [K in BlockType]: React.ComponentType<BlockMap[K]> } = {
  'executive-summary': ExecutiveSummaryBlock,
  'evidence': EvidencePanelBlock,
  'key-numbers': KeyNumbersBlock,
  'comparison': ComparisonBlock,
  'timeline': InteractiveTimelineBlock,
  'related-intelligence': RelatedIntelligenceBlock,
  'faq': FAQBlock,
  'sources': SourcesBlock,
  'callout': CalloutBlock,
  'chapter-heading': ChapterHeadingBlock,
  'image': ImageBlock,
  'evidence-inline': EvidenceInlineBlock,
  'text': ({ content }: BlockMap['text']) => <TextBlockClient content={content} />,
  'chart': (props: BlockMap['chart']) => {
    const chart = normalizeChartBlockData(props);
    if (!chart) return null;

    if (chart.type === 'sankey') {
      return <PartitionSankeyBlock data={chart} />;
    }

    if (chart.type === 'svg') {
      return <SvgChartBlock {...chart} />;
    }
    return <ChartBlock {...chart} />;
  },
  'map': MapBlock,
  'dataset-reference': (props: BlockMap['dataset-reference']) => <DatasetReferenceBlock {...props} />,
  'quote': ({ text, attribution }: BlockMap['quote']) => (
    <section className="py-8 sm:py-10">
      <blockquote className="relative border-l-2 border-brand-400 pl-5 sm:pl-6 py-2 bg-surface-tertiary/50">
        <p className="text-xl sm:text-2xl font-serif text-text-primary leading-relaxed">&ldquo;{text}&rdquo;</p>
        {attribution && (
          <footer className="mt-4 text-sm text-text-secondary font-bold uppercase tracking-widest">&mdash; {attribution}</footer>
        )}
      </blockquote>
    </section>
  ),
  'hero': HeroBlock,
  'author-box': AuthorBoxBlock,
  'story-snapshot': StorySnapshotBlock,
  'confidence-meter': ConfidenceMeterBlock,
  'system-explanation': (props: BlockMap['system-explanation']) => <SystemExplanationBlock {...props} />,
  'stakeholders': (props: BlockMap['stakeholders']) => <StakeholdersBlock {...props} />,
  'perspectives': (props: BlockMap['perspectives']) => <PerspectivesBlock {...props} />,
  'future-outlook': (props: BlockMap['future-outlook']) => <FutureOutlookBlock {...props} />,
  'accountability-chain': (props: BlockMap['accountability-chain']) => <AccountabilityChainBlock {...props} />,
  'case-evidence': (props: BlockMap['case-evidence']) => <CaseEvidenceCardBlock {...props} />,
  'mgnrega-ledger': (props: BlockMap['mgnrega-ledger']) => <MgnregaLedgerChartBlock {...props} />,
  'documentary-evidence': (props: BlockMap['documentary-evidence']) => <DocumentaryEvidenceBlock {...props} />,
  'sources-methodology': (props: BlockMap['sources-methodology']) => <SourcesMethodologyBlock {...props} />,
  'claim': (props: BlockMap['claim']) => <ClaimBlock id="claim-block" data={props as unknown as Record<string, unknown>} depth="explorer" />,

  'learning': (props: BlockMap['learning']) => <LearningBlock id="learning-block" data={props as unknown as Record<string, unknown>} depth="explorer" />,
  'list': (props: BlockMap['list']) => <ListBlock id="list-block" data={props as unknown as Record<string, unknown>} depth="explorer" />,
  'document': (props: BlockMap['document']) => <DocumentBlock id="document-block" data={props as unknown as Record<string, unknown>} depth="explorer" />,

  'decision-matrix': (props: BlockMap['decision-matrix']) => <DecisionMatrixBlock id="decision-matrix-block" data={props as unknown as Record<string, unknown>} depth="explorer" />,
  'thinker': (props: BlockMap['thinker']) => <ThinkerBlock id="thinker-block" data={props as unknown as Record<string, unknown>} depth="explorer" />,
  'relationship-card': (props: BlockMap['relationship-card']) => <RelationshipCardBlock id="relationship-card-block" data={props as unknown as Record<string, unknown>} depth="explorer" />,
  'historiography': (props: BlockMap['historiography']) => <HistoriographyBlock id="historiography-block" data={props as unknown as Record<string, unknown>} depth="explorer" />,
  'counterfactual': (props: BlockMap['counterfactual']) => <CounterfactualBlock id="counterfactual-block" data={props as unknown as Record<string, unknown>} depth="explorer" />,
};

export function getBlockComponent(type: string): React.ComponentType<any> | null {
  return blockComponents[type as BlockType] ?? null;
}

export function BlockRenderer({ block }: { block: StoryBlock }) {
  const Component = blockComponents[block.type as BlockType];
  if (!Component) {
    console.warn(`[BlockRenderer] Unknown block type: "${block.type}"`);
    return null;
  }
  return <Component {...(block.data as any)} />;
}
