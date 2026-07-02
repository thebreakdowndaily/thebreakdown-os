import React, { forwardRef } from 'react';
import type { ButtonProps } from './Button.types';

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-brand-400)',
    color: 'var(--color-text-inverse)',
    border: 'var(--border-thin) solid transparent',
  },
  secondary: {
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    border: 'var(--border-thin) solid var(--color-border-default)',
  },
  outline: {
    backgroundColor: 'transparent',
    color: 'var(--color-brand-400)',
    border: 'var(--border-thin) solid var(--color-brand-400)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-text-primary)',
    border: 'var(--border-none) solid transparent',
  },
  danger: {
    backgroundColor: 'var(--color-error)',
    color: 'var(--color-text-inverse)',
    border: 'var(--border-thin) solid transparent',
  },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: {
    padding: 'var(--spacing-1-5) var(--spacing-3)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    borderRadius: 'var(--radius-sm)',
    gap: 'var(--spacing-1)',
  },
  md: {
    padding: 'var(--spacing-2-5) var(--spacing-4)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    borderRadius: 'var(--radius-default)',
    gap: 'var(--spacing-2)',
  },
  lg: {
    padding: 'var(--spacing-3-5) var(--spacing-6)',
    fontSize: 'var(--text-base)',
    lineHeight: 'var(--text-base--line-height)',
    borderRadius: 'var(--radius-md)',
    gap: 'var(--spacing-2-5)',
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className = '',
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={className}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          transition: 'all var(--duration-fast) var(--easing-out)',
          opacity: disabled ? 'var(--opacity-disabled)' : 1,
          width: fullWidth ? '100%' : undefined,
          whiteSpace: 'nowrap',
          userSelect: 'none',
          textDecoration: 'none',
          ...variantStyles[variant],
          ...sizeStyles[size],
          ...style,
        }}
        {...props}
      >
        {loading && (
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: 'var(--spacing-4)',
              height: 'var(--spacing-4)',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: 'var(--radius-full)',
              animation: 'spin 1s var(--easing-linear) infinite',
            }}
          />
        )}
        {!loading && leftIcon && <span aria-hidden="true">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
