import type { Block } from '@/utils/cms-data';
import { getBlockIcon, getBlockLabel } from '@/utils/cms-data';
import BlockToolbar from './BlockToolbar';

// Import block renderers
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

const BLOCK_RENDERERS: Record<string, React.FC<{ block: Block; onUpdate: (data: Record<string, unknown>) => void }>> = {
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

interface BlockCanvasProps {
  blocks: Block[];
  dragState: {
    isDragging: boolean;
    dragIndex: number | null;
    dragOverIndex: number | null;
  };
  dndActions: {
    handleDragStart: (e: React.DragEvent, index: number) => void;
    handleDragOver: (e: React.DragEvent, index: number) => void;
    handleDragEnd: () => void;
    handleDrop: (e: React.DragEvent, index: number) => void;
  };
  editorActions: {
    moveUp: (index: number) => void;
    moveDown: (index: number) => void;
    duplicate: (id: string) => void;
    delete: (id: string) => void;
    toggleCollapse: (id: string) => void;
    updateBlock: (id: string, data: Record<string, unknown>) => void;
  };
}

export default function BlockCanvas({ blocks, dragState, dndActions, editorActions }: BlockCanvasProps) {
  return (
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
              border: dragState.dragOverIndex === index && dragState.isDragging
                ? '2px solid var(--color-amber-500)'
                : '1px solid var(--color-border-subtle)',
              borderRadius: '12px',
              transition: 'border 0.15s, opacity 0.15s',
              opacity: dragState.isDragging && dragState.dragIndex === index ? 0.4 : 1,
            }}
            draggable
            onDragStart={(e) => { dndActions.handleDragStart(e, index); }}
            onDragOver={(e) => { dndActions.handleDragOver(e, index); }}
            onDragEnd={dndActions.handleDragEnd}
            onDrop={(e) => { dndActions.handleDrop(e, index); }}
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
                onMoveUp={() => { editorActions.moveUp(index); }}
                onMoveDown={() => { editorActions.moveDown(index); }}
                onDuplicate={() => { editorActions.duplicate(block.id); }}
                onDelete={() => { editorActions.delete(block.id); }}
                onToggleCollapse={() => { editorActions.toggleCollapse(block.id); }}
                dragHandlers={{
                  draggable: true,
                  onDragStart: (e) => { dndActions.handleDragStart(e, index); },
                  onDragOver: (e) => { dndActions.handleDragOver(e, index); },
                  onDragEnd: dndActions.handleDragEnd,
                }}
              />
            </div>

            {/* Block body */}
            {!block.collapsed && (
              <Renderer block={block} onUpdate={(data: Record<string, unknown>) => { editorActions.updateBlock(block.id, data); }} />
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
        onClick={() => { document.getElementById('add-block-btn')?.click(); }}
      >
        <span style={{ fontSize: '13px', color: 'inherit' }}>
          + Click to add a new block (or use right panel)
        </span>
      </div>
    </div>
  );
}
