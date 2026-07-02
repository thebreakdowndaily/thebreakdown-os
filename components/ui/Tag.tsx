import React from 'react';

interface TagProps {
  label: string;
  href?: string;
  variant?: 'default' | 'category' | 'topic';
  onRemove?: () => void;
}

const categoryColors: Record<string, string> = {
  policy: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  economy: 'bg-green-500/20 text-green-400 border-green-500/30',
  technology: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  health: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  environment: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  education: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  politics: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  security: 'bg-red-500/20 text-red-400 border-red-500/30',
  default: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const variantStyles = {
  default: 'bg-gray-700 text-gray-300 border-gray-600',
  category: categoryColors[label.toLowerCase()] || categoryColors.default,
  topic: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const Tag: React.FC<TagProps> = ({ label, href, variant = 'default', onRemove }) => {
  const baseClasses =
    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors';
  const classes = `${baseClasses} ${variantStyles[variant]} ${onRemove ? 'pr-1' : ''}`;

  const content = (
    <>
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-gray-600 transition-colors"
          aria-label={`Remove ${label}`}
        >
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={`${classes} hover:border-amber-400/50`} aria-label={`Tag: ${label}`}>
        {content}
      </a>
    );
  }

  return <span className={classes}>{content}</span>;
};

export default Tag;
