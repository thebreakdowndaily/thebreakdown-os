import React, { forwardRef } from 'react';
import type { HeadingProps, HeadingLevel } from './Heading.types';

const headingStyleMap: Record<HeadingLevel, React.CSSProperties> = {
  h1: {
    fontSize: 'var(--heading-h1)',
    lineHeight: 'var(--heading-h1--line-height)',
    fontWeight: 700,
    letterSpacing: '-0.025em',
  },
  h2: {
    fontSize: 'var(--heading-h2)',
    lineHeight: 'var(--heading-h2--line-height)',
    fontWeight: 600,
    letterSpacing: '-0.02em',
  },
  h3: {
    fontSize: 'var(--heading-h3)',
    lineHeight: 'var(--heading-h3--line-height)',
    fontWeight: 600,
    letterSpacing: '-0.015em',
  },
  h4: {
    fontSize: 'var(--heading-h4)',
    lineHeight: 'var(--heading-h4--line-height)',
    fontWeight: 600,
  },
  h5: {
    fontSize: 'var(--heading-h5)',
    lineHeight: 'var(--heading-h5--line-height)',
    fontWeight: 600,
  },
  h6: {
    fontSize: 'var(--heading-h6)',
    lineHeight: 'var(--heading-h6--line-height)',
    fontWeight: 600,
  },
};

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      as = 'h2',
      variant,
      color,
      truncate = false,
      children,
      className = '',
      style,
      ...props
    },
    ref,
  ) => {
    const Tag = as;
    const styles = headingStyleMap[variant || as];

    return (
      <Tag
        ref={ref}
        className={className}
        style={{
          fontFamily: 'var(--font-display)',
          color: color || 'var(--color-text-primary)',
          margin: 0,
          ...styles,
          ...(truncate
            ? {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }
            : {}),
          ...style,
        }}
        {...props}
      >
        {children}
      </Tag>
    );
  },
);

Heading.displayName = 'Heading';
