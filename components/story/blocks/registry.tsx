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

import DOMPurify from 'isomorphic-dompurify';

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
    <section className="py-8 sm:py-10">
      <div 
        className="text-base text-[#A1A1AA] leading-relaxed space-y-4" 
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} 
      />
    </section>
  ),
  'chart': (props: BlockMap['chart']) => <ChartBlock {...props} />,
  'dataset-reference': (props: BlockMap['dataset-reference']) => <DatasetReferenceBlock {...props} />,
  'quote': ({ text, attribution }: BlockMap['quote']) => (
    <section className="py-8 sm:py-10">
      <blockquote className="relative border-l-2 border-[#D4A843] pl-5 sm:pl-6 py-2">
        <p className="text-lg sm:text-xl italic text-[#F5F5F5] leading-relaxed">&ldquo;{text}&rdquo;</p>
        {attribution && (
          <footer className="mt-3 text-sm text-[#A1A1AA]">&mdash; {attribution}</footer>
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
