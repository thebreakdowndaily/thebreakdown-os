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

const blockComponents: { [K in BlockType]: React.ComponentType<BlockMap[K]> } = {
  'executive-summary': ExecutiveSummaryBlock,
  'evidence': EvidencePanelBlock,
  'key-numbers': KeyNumbersBlock,
  'comparison': ComparisonBlock,
  'timeline': InteractiveTimelineBlock,
  'related-intelligence': RelatedIntelligenceBlock,
  'faq': FAQBlock,
  'sources': SourcesBlock,
  'text': ({ content }: BlockMap['text']) => (
    <section className="py-6 sm:py-8">
      <div 
        className="text-[1.05rem] sm:text-[1.125rem] text-text-primary leading-relaxed sm:leading-loose font-serif [&>p]:mb-6 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mt-10 [&>h3]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-6 [&>ul>li]:mb-2 [&>a]:text-brand-400 [&>a]:underline [&>a:hover]:text-brand-500 transition-colors" 
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </section>
  ),
  'chart': (props: BlockMap['chart']) => <ChartBlock {...props} />,
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
};

export function getBlockComponent(type: string): React.ComponentType<any> | null {
  return blockComponents[type as BlockType] ?? null;
}

export function BlockRenderer({ block }: { block: StoryBlock }) {
  const Component = getBlockComponent(block.type);
  if (!Component) {
    console.warn(`[BlockRenderer] Unknown block type: "${block.type}"`);
    return null;
  }
  return <Component {...(block.data as any)} />;
}
