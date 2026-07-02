import React, { forwardRef } from 'react';
import type { LinkProps } from './Link.types';

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    color: 'var(--color-brand-400)',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2-5) var(--spacing-4)',
    backgroundColor: 'var(--color-brand-400)',
    color: 'var(--color-text-inverse)',
    borderRadius: 'var(--radius-default)',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    transition: 'background-color var(--duration-fast) var(--easing-out)',
  },
  subtle: {
    color: 'var(--color-text-secondary)',
    textDecoration: 'none',
  },
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      variant = 'default',
      external,
      leftIcon,
      rightIcon,
      children,
      href,
      className = '',
      style,
      ...props
    },
    ref,
  ) => {
    const isExternal = external ?? (href?.startsWith('http') || href?.startsWith('//'));

    return (
      <a
        ref={ref}
        href={href}
        className={className}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        aria-label={isExternal ? `Opens in new tab` : undefined}
        style={{
          fontFamily: 'var(--font-sans)',
          transition: 'color var(--duration-fast) var(--easing-out)',
          ...variantStyles[variant],
          ...style,
        }}
        {...props}
      >
        {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
        {children}
        {isExternal && (
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              marginLeft: 'var(--spacing-1)',
              fontSize: 'var(--text-xs)',
            }}
          >
            &#8599;
          </span>
        )}
        {!isExternal && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      </a>
    );
  },
);

Link.displayName = 'Link';
