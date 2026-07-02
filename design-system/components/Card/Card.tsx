import React, { forwardRef } from 'react';
import type { CardProps } from './Card.types';

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: 'var(--color-bg-secondary)',
    border: 'var(--border-thin) solid var(--color-border-default)',
    boxShadow: 'none',
  },
  elevated: {
    backgroundColor: 'var(--color-bg-secondary)',
    border: 'var(--border-none) solid transparent',
    boxShadow: 'var(--shadow-md)',
  },
  bordered: {
    backgroundColor: 'var(--color-bg-primary)',
    border: 'var(--border-thin) solid var(--color-border-default)',
    boxShadow: 'none',
  },
  interactive: {
    backgroundColor: 'var(--color-bg-secondary)',
    border: 'var(--border-thin) solid var(--color-border-default)',
    boxShadow: 'none',
    cursor: 'pointer',
    transition: 'box-shadow var(--duration-fast) var(--easing-out), transform var(--duration-fast) var(--easing-out)',
  },
};

const paddingStyles: Record<string, React.CSSProperties> = {
  none: { padding: 'var(--spacing-0)' },
  sm: { padding: 'var(--spacing-3)' },
  md: { padding: 'var(--spacing-5)' },
  lg: { padding: 'var(--spacing-8)' },
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      header,
      footer,
      children,
      className = '',
      style,
      onClick,
      ...props
    },
    ref,
  ) => {
    const isInteractive = variant === 'interactive' || !!onClick;
    return (
      <div
        ref={ref}
        className={className}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          isInteractive
            ? (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
                }
              }
            : undefined
        }
        aria-label={isInteractive && props['aria-label'] ? props['aria-label'] : undefined}
        style={{
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          ...variantStyles[variant],
          ...paddingStyles[padding],
          ...style,
        }}
        {...props}
      >
        {header && (
          <div style={{ marginBottom: 'var(--spacing-3)' }}>{header}</div>
        )}
        {children}
        {footer && (
          <div
            style={{
              marginTop: 'var(--spacing-3)',
              paddingTop: 'var(--spacing-3)',
              borderTop: 'var(--border-thin) solid var(--color-border-default)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    );
  },
);

Card.displayName = 'Card';
