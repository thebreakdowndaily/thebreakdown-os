'use client';

import { useMemo } from 'react';
import type { CMSStory, BlockType } from '@/utils/cms-data';
import BlockPalette from './BlockPalette';
import StoryPreview from './StoryPreview';
import StoryEditorHeader from './StoryEditorHeader';
import BlockCanvas from './BlockCanvas';

// Hooks
import { useStoryEditor } from '@/hooks/cms/useStoryEditor';
import { useAutosave } from '@/hooks/cms/useAutosave';
import { useDragAndDrop } from '@/hooks/cms/useDragAndDrop';
import { usePreviewMode } from '@/hooks/cms/usePreviewMode';

interface StoryEditorProps {
  story: CMSStory;
  onSave: (story: CMSStory) => void;
}

export default function StoryEditor({ story: initialStory, onSave }: StoryEditorProps) {
  const editor = useStoryEditor(initialStory);
  
  const autosave = useAutosave(() => {
    onSave({
      ...editor.state.story,
      updatedAt: new Date().toISOString()
    });
  }, 5000);

  const dnd = useDragAndDrop((source, drop) => {
    editor.actions.reorder(source, drop);
    autosave.actions.markUnsaved();
  });

  const preview = usePreviewMode(false);

  // Grouped editor actions that trigger autosave automatically
  const editorActions = useMemo(() => ({
    setTitle: (title: string) => { editor.actions.setTitle(title); autosave.actions.markUnsaved(); },
    setSlug: (slug: string) => { editor.actions.setSlug(slug); autosave.actions.markUnsaved(); },
    updateBlock: (id: string, data: Record<string, unknown>) => { editor.actions.updateBlock(id, data); autosave.actions.markUnsaved(); },
    moveUp: (idx: number) => { editor.actions.moveUp(idx); autosave.actions.markUnsaved(); },
    moveDown: (idx: number) => { editor.actions.moveDown(idx); autosave.actions.markUnsaved(); },
    duplicate: (id: string) => { editor.actions.duplicate(id); autosave.actions.markUnsaved(); },
    delete: (id: string) => { editor.actions.delete(id); autosave.actions.markUnsaved(); },
    toggleCollapse: editor.actions.toggleCollapse,
    addBlock: (type: BlockType) => { editor.actions.addBlock(type); autosave.actions.markUnsaved(); }
  }), [editor.actions, autosave.actions]);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* ─── Editor Area ─────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', maxWidth: '900px', margin: '0 auto' }}>
        
        <StoryEditorHeader
          title={editor.state.title}
          slug={editor.state.slug}
          status={editor.state.story.status}
          savedIndicator={autosave.state.savedIndicator}
          showPreview={preview.state.showPreview}
          onTitleChange={editorActions.setTitle}
          onSlugChange={editorActions.setSlug}
          onTogglePreview={preview.actions.togglePreview}
          onSave={autosave.actions.save}
        />

        {/* Preview mode or Editor mode */}
        {preview.state.showPreview ? (
          <StoryPreview title={editor.state.title} blocks={editor.state.blocks} />
        ) : (
          <BlockCanvas
            blocks={editor.state.blocks}
            dragState={dnd.state}
            dndActions={dnd.actions}
            editorActions={editorActions}
          />
        )}
      </div>

      {/* ─── Block Palette ─────────────────────────── */}
      <BlockPalette onAddBlock={editorActions.addBlock} storyBlockCount={editor.state.blocks.length} />
    </div>
  );
}
