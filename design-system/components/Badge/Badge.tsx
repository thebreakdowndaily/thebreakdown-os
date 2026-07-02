import React, { forwardRef } from 'react';
import type { BadgeProps } from './Badge.types';

const variantStyles: Record<string, React.CSSProperties> = {
  success: {
    backgroundColor: 'var(--color-success-light)',
    color: 'var(--color-success-dark)',
  },
  warning: {
    backgroundColor: 'var(--color-warning-light)',
    color: 'var(--color-warning-dark)',
  },
  error: {
    backgroundColor: 'var(--color-error-light)',
    color: 'var(--color-error-dark)',
  },
  info: {
    backgroundColor: 'var(--color-info-light)',
    color: 'var(--color-info-dark)',
  },
  neutral: {
    backgroundColor: 'var(--color-bg-tertiary)',
    color: 'var(--color-text-secondary)',
  },
  brand: {
    backgroundColor: 'var(--color-brand-100)',
    color: 'var(--color-brand-700)',
  },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: {
    padding: '0 var(--spacing-1-5)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
    borderRadius: 'var(--radius-sm)',
    gap: 'var(--spacing-1)',
  },
  md: {
    padding: 'var(--spacing-0-5) var(--spacing-2)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    borderRadius: 'var(--radius-default)',
    gap: 'var(--spacing-1-5)',
  },
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'neutral',
      size = 'md',
      dot = false,
      removable = false,
      onRemove,
      children,
      className = '',
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <span
        ref={ref}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          ...variantStyles[variant],
          ...sizeStyles[size],
          ...style,
        }}
        {...props}
      >
        {dot && (
          <span
            aria-hidden="true"
            style={{
              width: 'var(--spacing-2)',
              height: 'var(--spacing-2)',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'currentColor',
              opacity: 0.8,
              flexShrink: 0,
            }}
          />
        )}
        {children}
        {removable && (
          <button
            type="button"
            aria-label="Remove"
            onClick={onRemove}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'var(--spacing-4)',
              height: 'var(--spacing-4)',
              marginLeft: 'var(--spacing-1)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'inherit',
              padding: 0,
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)',
              lineHeight: 1,
            }}
          >
            &#x2715;
          </button>
        )}
      </span>
    );
  },
);

Badge.displayName = 'Badge';
