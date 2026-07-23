import type { KnowledgeBlock } from '@/types/canonical';
import { getBlockRenderer } from './block-registry';
import { registerAllBlocks } from '../blocks/registry';
import { BlockVisibilityWrapper } from './BlockVisibilityWrapper';

registerAllBlocks();

export function KnowledgeRenderer({ blocks }: { blocks: KnowledgeBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((block) => {
        const Renderer = getBlockRenderer(block.type);
        if (!Renderer) return null;
        return (
          <BlockVisibilityWrapper key={block.id} allowedDepths={block.depth}>
            <Renderer id={block.id} data={block.data} depth={'explorer'} />
          </BlockVisibilityWrapper>
        );
      })}
    </div>
  );
}
