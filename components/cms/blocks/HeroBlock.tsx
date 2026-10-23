'use client';

import type { Block, HeroBlockData } from '@/utils/cms-data';

interface HeroBlockProps {
  block: Block;
  onUpdate: (data: Record<string, unknown>) => void;
}

export default function HeroBlock({ block, onUpdate }: HeroBlockProps) {
  const d = block.data as HeroBlockData;

  return (
    <div style={{ padding: '0 4px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
          Headline
        </label>
        <input
          value={d.headline || ''}
          onChange={(e) => { onUpdate({ ...d, headline: e.target.value }); }}
          placeholder="Story headline..."
          style={{
            width: '100%',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '8px',
            padding: '12px 14px',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            background: 'var(--color-surface-secondary)',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
          Summary
        </label>
        <textarea
          value={(d as { summary: string }).summary || ''}
          onChange={(e) => { onUpdate({ ...d, summary: e.target.value }); }}
          placeholder="One or two sentences summarizing the story..."
          rows={2}
          style={{
            width: '100%',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            background: 'var(--color-surface-secondary)',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
            lineHeight: 1.5,
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
            Author
          </label>
          <input
            value={(d as { author: string }).author || ''}
            onChange={(e) => { onUpdate({ ...d, author: e.target.value }); }}
            placeholder="Author name"
            style={{
              width: '100%',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '6px',
              padding: '8px 10px',
              fontSize: '13px',
              color: 'var(--color-text-primary)',
              background: 'var(--color-surface-secondary)',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
            Category
          </label>
          <select
            value={(d as { category: string }).category || ''}
            onChange={(e) => { onUpdate({ ...d, category: e.target.value }); }}
            style={{
              width: '100%',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '6px',
              padding: '8px 10px',
              fontSize: '13px',
              color: 'var(--color-text-primary)',
              background: 'var(--color-surface-secondary)',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          >
            <option value="">Select category</option>
            <option value="economy">Economy</option>
            <option value="policy">Policy</option>
            <option value="technology">Technology</option>
            <option value="education">Education</option>
            <option value="health">Health</option>
            <option value="environment">Environment</option>
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
            Hero Image URL
          </label>
          <input
            value={d.heroImage || ''}
            onChange={(e) => {
              const nextImage = e.target.value;
              const imageChanged = nextImage.trim() !== (d.heroImage || '').trim();
              onUpdate({
                ...d,
                heroImage: nextImage,
                ...(imageChanged ? { heroImageAlt: '', heroImageIsDecorative: false, heroImageMetadataConfirmed: false } : {}),
              });
            }}
            placeholder="/images/stories/..."
            style={{
              width: '100%',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '6px',
              padding: '8px 10px',
              fontSize: '13px',
              color: 'var(--color-text-primary)',
              background: 'var(--color-surface-secondary)',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
            Image description (alt text)
          </label>
          <textarea
            value={d.heroImageAlt || ''}
            onChange={(e) => { onUpdate({ ...d, heroImageAlt: e.target.value, heroImageIsDecorative: false, heroImageMetadataConfirmed: true }); }}
            disabled={Boolean(d.heroImageIsDecorative)}
            placeholder="Describe the relevant details of this image for readers who cannot see it..."
            rows={2}
            style={{
              width: '100%',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '6px',
              padding: '8px 10px',
              fontSize: '13px',
              color: 'var(--color-text-primary)',
              background: 'var(--color-surface-secondary)',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              opacity: d.heroImageIsDecorative ? 0.6 : 1,
            }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={Boolean(d.heroImageIsDecorative)}
              onChange={(e) => {
                const isDecorative = e.target.checked;
                onUpdate({
                  ...d,
                  heroImageIsDecorative: isDecorative,
                  heroImageAlt: isDecorative ? '' : (d.heroImageAlt || ''),
                  heroImageMetadataConfirmed: true,
                });
              }}
            />
            This image is decorative and adds no information beyond the story text
          </label>
          <p style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', lineHeight: 1.5, marginTop: '6px' }}>
            Informative images need a meaningful description. Mark an image decorative only when screen-reader users do not need its content.
          </p>
        </div>
      </div>
    </div>
  );
}
