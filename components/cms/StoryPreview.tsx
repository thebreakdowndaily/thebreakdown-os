import type { Block, HeroBlockData, TextBlockData, QuoteBlockData, CalloutBlockData, EvidenceBlockData, StatisticsBlockData } from '@/utils/cms-data';
import { getBlockIcon, getBlockLabel } from '@/utils/cms-data';
import DOMPurify from 'isomorphic-dompurify';

interface StoryPreviewProps {
  title: string;
  blocks: Block[];
}

export default function StoryPreview({ title, blocks }: StoryPreviewProps) {
  return (
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
                <p style={{ fontSize: '18px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>{(block.data as HeroBlockData).summary}</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>By {(block.data as HeroBlockData).author} · {(block.data as HeroBlockData).category}</p>
              </div>
            )}
            {block.type === 'text' && (
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize((block.data as TextBlockData).html || '') }} style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--color-text-primary)' }} />
            )}
            {block.type === 'quote' && (
              <blockquote style={{ borderLeft: '4px solid var(--color-amber-500)', paddingLeft: '20px', margin: '20px 0', fontStyle: 'italic', fontSize: '18px', color: 'var(--color-text-primary)' }}>
                <p>{(block.data as QuoteBlockData).text}</p>
                <footer style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginTop: '8px' }}>— {(block.data as QuoteBlockData).speaker}, {(block.data as QuoteBlockData).context}</footer>
              </blockquote>
            )}
            {block.type === 'callout' && (
              <div style={{ padding: '16px', background: 'var(--color-surface-secondary)', borderRadius: '8px', border: '1px solid var(--color-border-subtle)' }}>
                <strong>{(block.data as CalloutBlockData).title}</strong>
                <p style={{ marginTop: '6px', fontSize: '14px' }}>{(block.data as CalloutBlockData).text}</p>
              </div>
            )}
            {block.type === 'evidence' && (
              <div style={{ padding: '14px', borderLeft: '3px solid var(--color-amber-500)', background: 'var(--color-surface-secondary)', borderRadius: '6px' }}>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}><strong>Claim:</strong> {(block.data as EvidenceBlockData).claim}</p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}><strong>Data:</strong> {(block.data as EvidenceBlockData).data}</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>Source: {(block.data as EvidenceBlockData).source}</p>
              </div>
            )}
            {block.type === 'statistics' && Array.isArray((block.data as StatisticsBlockData).stats) && (block.data as StatisticsBlockData).stats.map((s, i) => {
              const stat = s;
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
  );
}
