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
  'chart': (props: BlockMap['chart']) => <ChartBlock {...props} />,
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
