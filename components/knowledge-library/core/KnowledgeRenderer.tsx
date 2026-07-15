'use client';

import type { KnowledgeBlock, ReadingDepth } from '@/types/canonical';
import { getBlockRenderer } from './block-registry';
import { registerAllBlocks } from '../blocks/registry';
import { useReadingDepth } from '../reader/ReadingModeContext';

registerAllBlocks();

export function KnowledgeRenderer({ blocks }: { blocks: KnowledgeBlock[] }) {
  const depth = useReadingDepth();

  return (
    <div className="space-y-4">
      {blocks.map((block) => {
        if (block.depth && !block.depth.includes(depth)) return null;
        const Renderer = getBlockRenderer(block.type);
        if (!Renderer) return null;
        return <Renderer key={block.id} id={block.id} data={block.data} depth={depth} />;
      })}
    </div>
  );
}
