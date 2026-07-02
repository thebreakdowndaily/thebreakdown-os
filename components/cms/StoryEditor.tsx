'use client';

import React, { useState, useCallback } from 'react';
import type { CMSStory, Block, BlockType } from '@/utils/cms-data';
import { reorderBlocks, updateBlock, removeBlock, addBlock, duplicateBlock, getBlockIcon, getBlockLabel } from '@/utils/cms-data';
import BlockToolbar from './BlockToolbar';
import BlockPalette from './BlockPalette';
import HeroBlock from './blocks/HeroBlock';
import TextBlock from './blocks/TextBlock';
import TimelineBlock from './blocks/TimelineBlock';
import EvidenceBlock from './blocks/EvidenceBlock';
import ChartBlock from './blocks/ChartBlock';
import FAQBlock from './blocks/FAQBlock';
import SourcesBlock from './blocks/SourcesBlock';
import ImageBlock from './blocks/ImageBlock';
import QuoteBlock from './blocks/QuoteBlock';
import StatisticsBlock from './blocks/StatisticsBlock';
import CalloutBlock from './blocks/CalloutBlock';
import TableBlock from './blocks/TableBlock';

interface StoryEditorProps {
  story: CMSStory;
  onSave: (story: CMSStory) => void;
}

interface BlockRendererProps {
  block: Block;
  onUpdate: (data: Record<string, unknown>) => void;
}

const BLOCK_RENDERERS: Record<string, React.FC<BlockRendererProps>> = {
  hero: HeroBlock,
  text: TextBlock,
  timeline: TimelineBlock,
  evidence: EvidenceBlock,
  chart: ChartBlock,
  faq: FAQBlock,
  sources: SourcesBlock,
  image: ImageBlock,
  quote: QuoteBlock,
  statistics: StatisticsBlock,
  callout: CalloutBlock,
  table: TableBlock,
};

export default function StoryEditor({ story: initialStory, onSave }: StoryEditorProps) {
  const [story, setStory] = useState<CMSStory>(initialStory);
  const [title, setTitle] = useState(story.title);
  const [slug, setSlug] = useState(story.slug);
  const [blocks, setBlocks] = useState<Block[]>(story.blocks);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  const markUnsaved = useCallback(() => { setSavedIndicator('unsaved'); }, []);

  const handleBlockUpdate = useCallback((blockId: string, data: Record<string, unknown>) => {
    setBlocks((prev) => {
      markUnsaved();
      return updateBlock(prev, blockId, { data });
    });
  }, [markUnsaved]);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setBlocks((prev) => {
      markUnsaved();
      return reorderBlocks(prev, index, index - 1);
    });
  }, [markUnsaved]);

  const handleMoveDown = useCallback((index: number) => {
    setBlocks((prev) => {
      if (index >= prev.length - 1) return prev;
      markUnsaved();
      return reorderBlocks(prev, index, index + 1);
    });
  }, [markUnsaved]);

  const handleDuplicate = useCallback((blockId: string) => {
    setBlocks((prev) => {
      markUnsaved();
      return duplicateBlock(prev, blockId);
    });
  }, [markUnsaved]);

  const handleDelete = useCallback((blockId: string) => {
    setBlocks((prev) => {
      if (prev.length <= 1) return prev;
      markUnsaved();
      return removeBlock(prev, blockId);
    });
  }, [markUnsaved]);

  const handleToggleCollapse = useCallback((blockId: string) => {
    setBlocks((prev) => prev.map((b) => b.id === blockId ? { ...b, collapsed: !b.collapsed } : b));
  }, []);

  const handleAddBlock = useCallback((type: BlockType) => {
    setBlocks((prev) => {
      markUnsaved();
      return addBlock(prev, type, prev[prev.length - 1]?.id);
    });
  }, [markUnsaved]);

  // Drag & Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    // Add a slight delay for visual feedback
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = '0.4';
    }, 0);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragOverIndex(null);
    setDragIndex(null);
    // Reset all opacities
    document.querySelectorAll('[data-block-id]').forEach((el) => {
      (el as HTMLElement).style.opacity = '1';
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (isNaN(sourceIndex) || sourceIndex === dropIndex) {
      setIsDragging(false);
      setDragOverIndex(null);
      return;
    }
    setBlocks((prev) => {
      markUnsaved();
      return reorderBlocks(prev, sourceIndex, dropIndex);
    });
    setIsDragging(false);
    setDragOverIndex(null);
  }, [markUnsaved]);

  const handleSave = useCallback(() => {
    setSavedIndicator('saving');
    const updated: CMSStory = {
      ...story,
      title,
      slug,
      blocks,
      updatedAt: new Date().toISOString(),
    };
    onSave(updated);
    setStory(updated);
    setTimeout(() => { setSavedIndicator('saved'); }, 800);
  }, [story, title, slug, blocks, onSave]);

  // Auto-save on title/slug/blocks change
  React.useEffect(() => {
    if (savedIndicator === 'unsaved') {
      const timer = setTimeout(() => { handleSave(); }, 5000);
      return () => { clearTimeout(timer); };
    }
  }, [savedIndicator, handleSave]);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* ─── Editor Area ─────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', maxWidth: '900px', margin: '0 auto' }}>
        {/* Title bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            gap: '16px',
          }}
        >
          <div style={{ flex: 1 }}>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); markUnsaved(); }}
              placeholder="Story Title"
              style={{
                width: '100%',
                border: 'none',
                padding: '0',
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                background: 'transparent',
                outline: 'none',
                fontFamily: 'inherit',
                letterSpacing: '-0.02em',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>Slug:</span>
              <input
                value={slug}
                onChange={(e) => { setSlug(e.target.value); markUnsaved(); }}
                placeholder="story-slug"
                style={{
                  border: '1px solid transparent',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-text-secondary)',
                  background: 'transparent',
                  outline: 'none',
                  width: '300px',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-border-subtle)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Status badge */}
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '999px',
                background: story.status === 'published'
                  ? 'color-mix(in srgb, var(--color-emerald-500) 15%, transparent)'
                  : story.status === 'review'
                  ? 'color-mix(in srgb, var(--color-amber-500) 15%, transparent)'
                  : 'color-mix(in srgb, var(--color-text-tertiary) 15%, transparent)',
                color: story.status === 'published'
                  ? 'var(--color-emerald-500)'
                  : story.status === 'review'
                  ? 'var(--color-amber-500)'
                  : 'var(--color-text-tertiary)',
                textTransform: 'capitalize',
              }}
            >
              {story.status}
            </span>

            {/* Save indicator */}
            <span
              style={{
                fontSize: '11px',
                color: savedIndicator === 'saved'
                  ? 'var(--color-emerald-500)'
                  : savedIndicator === 'saving'
                  ? 'var(--color-amber-500)'
                  : 'var(--color-text-tertiary)',
                fontFamily: 'var(--font-mono)',
                minWidth: '60px',
                textAlign: 'right',
              }}
            >
              {savedIndicator === 'saved' ? '✓ Saved' : savedIndicator === 'saving' ? 'Saving...' : 'Unsaved'}
            </span>

            {/* Preview toggle */}
            <button
              onClick={() => { setShowPreview(!showPreview); }}
              style={{
                padding: '7px 14px',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: '8px',
                background: showPreview ? 'var(--color-surface-secondary)' : 'none',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                fontFamily: 'inherit',
              }}
            >
              {showPreview ? '✎ Edit' : '👁 Preview'}
            </button>

            {/* Save button */}
            <button
              onClick={handleSave}
              style={{
                padding: '7px 16px',
                border: 'none',
                borderRadius: '8px',
                background: 'var(--color-amber-500)',
                color: '#000',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'inherit',
              }}
            >
              {savedIndicator === 'saving' ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Preview mode */}
        {showPreview ? (
          <div
            style={{
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px', lineHeight: 1.2 }}>
              {title}
            </h1>
            {blocks.map((block) => {
              if (block.collapsed) return null;
              return (
                <div key={block.id} style={{ marginBottom: '24px' }}>
                  {block.type === 'hero' ? null : (
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        color: 'var(--color-text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: '8px',
                        paddingBottom: '4px',
                        borderBottom: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      {getBlockIcon(block.type)} {getBlockLabel(block.type)}
                    </div>
                  )}
                  {block.type === 'hero' && (
                    <div>
                      <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>{block.data.summary}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>By {block.data.author} · {block.data.category}</p>
                    </div>
                  )}
                  {block.type === 'text' && (
                    <div dangerouslySetInnerHTML={{ __html: block.data.html || '' }} style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--color-text-primary)' }} />
                  )}
                  {block.type === 'quote' && (
                    <blockquote style={{ borderLeft: '4px solid var(--color-amber-500)', paddingLeft: '20px', margin: '20px 0', fontStyle: 'italic', fontSize: '18px', color: 'var(--color-text-primary)' }}>
                      <p>{block.data.text}</p>
                      <footer style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginTop: '8px' }}>— {block.data.speaker}, {block.data.context}</footer>
                    </blockquote>
                  )}
                  {block.type === 'callout' && (
                    <div style={{ padding: '16px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-border-subtle)' }}>
                      <strong>{block.data.title}</strong>
                      <p style={{ marginTop: '6px', fontSize: '14px' }}>{block.data.body}</p>
                    </div>
                  )}
                  {block.type === 'evidence' && (
                    <div style={{ padding: '14px', borderLeft: '3px solid var(--color-amber-500)', background: 'var(--color-surface-secondary)', borderRadius: '6px' }}>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}><strong>Claim:</strong> {block.data.claim}</p>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}><strong>Data:</strong> {block.data.data}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>Source: {block.data.source}</p>
                    </div>
                  )}
                  {block.type === 'statistics' && Array.isArray(block.data.stats) && block.data.stats.map((s, i) => {
                    const stat = s as { value?: string; label?: string };
                    return (
                      <div key={i} style={{ display: 'inline-block', padding: '12px 20px', margin: '4px', background: 'var(--color-surface-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-amber-500)' }}>{stat.value}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{stat.label}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          /* ─── Block Editor ─────────────────────────── */
          <div>
            {blocks.map((block, index) => {
              const Renderer = BLOCK_RENDERERS[block.type];

              return (
                <div
                  key={block.id}
                  data-block-id={block.id}
                  style={{
                    marginBottom: '12px',
                    padding: '16px',
                    background: 'var(--color-surface-elevated)',
                    border: dragOverIndex === index && isDragging
                      ? '2px solid var(--color-amber-500)'
                      : '1px solid var(--color-border-subtle)',
                    borderRadius: '12px',
                    transition: 'border 0.15s, opacity 0.15s',
                    opacity: isDragging && dragIndex === index ? 0.4 : 1,
                  }}
                  draggable
                  onDragStart={(e) => { handleDragStart(e, index); }}
                  onDragOver={(e) => { handleDragOver(e, index); }}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => { handleDrop(e, index); }}
                >
                  {/* Block header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: block.collapsed ? 0 : '12px',
                      paddingBottom: block.collapsed ? 0 : '10px',
                      borderBottom: block.collapsed ? 'none' : '1px solid var(--color-border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{getBlockIcon(block.type)}</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        {getBlockLabel(block.type)}
                      </span>
                    </div>

                    <BlockToolbar
                      block={block}
                      index={index}
                      total={blocks.length}
                      onMoveUp={() => { handleMoveUp(index); }}
                      onMoveDown={() => { handleMoveDown(index); }}
                      onDuplicate={() => { handleDuplicate(block.id); }}
                      onDelete={() => { handleDelete(block.id); }}
                      onToggleCollapse={() => { handleToggleCollapse(block.id); }}
                      dragHandlers={{
                        draggable: true,
                        onDragStart: (e) => { handleDragStart(e, index); },
                        onDragOver: (e) => { handleDragOver(e, index); },
                        onDragEnd: handleDragEnd,
                      }}
                    />
                  </div>

                  {/* Block body */}
                  {!block.collapsed && (
                    <Renderer block={block} onUpdate={(data) => { handleBlockUpdate(block.id, data); }} />
                  )}

                  {block.collapsed && (
                    <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontStyle: 'italic', padding: '4px 0' }}>
                      Block collapsed — click ▲ to expand
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add block at bottom */}
            <div
              style={{
                marginTop: '16px',
                padding: '20px',
                border: '2px dashed var(--color-border-subtle)',
                borderRadius: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-amber-500)'; e.currentTarget.style.color = 'var(--color-amber-500)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
              onClick={() => document.getElementById('add-block-btn')?.click()}
            >
              <span style={{ fontSize: '13px', color: 'inherit' }}>
                + Click to add a new block (or use right panel)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Block Palette ─────────────────────────── */}
      <BlockPalette onAddBlock={handleAddBlock} storyBlockCount={blocks.length} />
    </div>
  );
}
