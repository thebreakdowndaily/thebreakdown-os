import { useState, useCallback, useMemo } from 'react';
import type { CMSStory, Block, BlockType, BlockData } from '@/utils/cms-data';
import { reorderBlocks, updateBlock, removeBlock, addBlock, duplicateBlock } from '@/utils/cms-data';

export function useStoryEditor(initialStory: CMSStory) {
  const [title, setTitle] = useState(initialStory.title);
  const [slug, setSlug] = useState(initialStory.slug);
  const [blocks, setBlocks] = useState<Block[]>(initialStory.blocks);

  const story: CMSStory = useMemo(() => ({
    ...initialStory,
    title,
    slug,
    blocks,
  }), [initialStory, title, slug, blocks]);

  const setTitleAction = useCallback((t: string) => { setTitle(t); }, []);
  const setSlugAction = useCallback((s: string) => { setSlug(s); }, []);

  const updateBlockAction = useCallback((blockId: string, data: Record<string, unknown>) => {
    setBlocks((prev) => updateBlock(prev, blockId, { data: data as BlockData }));
  }, []);

  const moveUpAction = useCallback((index: number) => {
    setBlocks((prev) => index === 0 ? prev : reorderBlocks(prev, index, index - 1));
  }, []);

  const moveDownAction = useCallback((index: number) => {
    setBlocks((prev) => index >= prev.length - 1 ? prev : reorderBlocks(prev, index, index + 1));
  }, []);

  const duplicateAction = useCallback((blockId: string) => {
    setBlocks((prev) => duplicateBlock(prev, blockId));
  }, []);

  const deleteAction = useCallback((blockId: string) => {
    setBlocks((prev) => prev.length <= 1 ? prev : removeBlock(prev, blockId));
  }, []);

  const toggleCollapseAction = useCallback((blockId: string) => {
    setBlocks((prev) => prev.map((b) => b.id === blockId ? { ...b, collapsed: !b.collapsed } : b));
  }, []);

  const addBlockAction = useCallback((type: BlockType) => {
    setBlocks((prev) => addBlock(prev, type, prev[prev.length - 1]?.id));
  }, []);

  const reorderAction = useCallback((sourceIndex: number, dropIndex: number) => {
    setBlocks((prev) => reorderBlocks(prev, sourceIndex, dropIndex));
  }, []);

  return {
    state: { story, title, slug, blocks },
    actions: {
      setTitle: setTitleAction,
      setSlug: setSlugAction,
      updateBlock: updateBlockAction,
      moveUp: moveUpAction,
      moveDown: moveDownAction,
      duplicate: duplicateAction,
      delete: deleteAction,
      toggleCollapse: toggleCollapseAction,
      addBlock: addBlockAction,
      reorder: reorderAction,
    }
  };
}
