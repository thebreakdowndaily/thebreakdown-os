

interface StoryEditorHeaderProps {
  title: string;
  slug: string;
  status: string;
  savedIndicator: 'saved' | 'saving' | 'unsaved';
  showPreview: boolean;
  onTitleChange: (title: string) => void;
  onSlugChange: (slug: string) => void;
  onTogglePreview: () => void;
  onSave: () => void;
}

export default function StoryEditorHeader({
  title,
  slug,
  status,
  savedIndicator,
  showPreview,
  onTitleChange,
  onSlugChange,
  onTogglePreview,
  onSave,
}: StoryEditorHeaderProps) {
  return (
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
          onChange={(e) => { onTitleChange(e.target.value); }}
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
            onChange={(e) => { onSlugChange(e.target.value); }}
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
            background: status === 'published'
              ? 'color-mix(in srgb, var(--color-emerald-500) 15%, transparent)'
              : status === 'review'
              ? 'color-mix(in srgb, var(--color-amber-500) 15%, transparent)'
              : 'color-mix(in srgb, var(--color-text-tertiary) 15%, transparent)',
            color: status === 'published'
              ? 'var(--color-emerald-500)'
              : status === 'review'
              ? 'var(--color-amber-500)'
              : 'var(--color-text-tertiary)',
            textTransform: 'capitalize',
          }}
        >
          {status}
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
          onClick={onTogglePreview}
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
          onClick={onSave}
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
  );
}
