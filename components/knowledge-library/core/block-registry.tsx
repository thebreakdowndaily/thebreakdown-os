import type { BlockType, ReadingDepth } from '@/types/canonical';
import type { FC } from 'react';

export interface BlockComponentProps {
  id: string;
  data: Record<string, unknown>;
  depth: ReadingDepth;
}

type BlockRenderer = FC<BlockComponentProps>;

const registry = new Map<BlockType, BlockRenderer>();

export function registerBlock(type: BlockType, component: BlockRenderer): void {
  registry.set(type, component);
}

export function getBlockRenderer(type: BlockType): BlockRenderer | undefined {
  return registry.get(type);
}

export function getAllBlockTypes(): BlockType[] {
  return Array.from(registry.keys());
}
