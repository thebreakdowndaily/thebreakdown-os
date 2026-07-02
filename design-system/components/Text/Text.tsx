import React, { forwardRef } from 'react';
import type { TextProps, TextSize, TextWeight } from './Text.types';

const sizeStyleMap: Record<TextSize, React.CSSProperties> = {
  xs: { fontSize: 'var(--text-xs)', lineHeight: 'var(--text-xs--line-height)' },
  sm: { fontSize: 'var(--text-sm)', lineHeight: 'var(--text-sm--line-height)' },
  base: { fontSize: 'var(--text-base)', lineHeight: 'var(--text-base--line-height)' },
  lg: { fontSize: 'var(--text-lg)', lineHeight: 'var(--text-lg--line-height)' },
  xl: { fontSize: 'var(--text-xl)', lineHeight: 'var(--text-xl--line-height)' },
  '2xl': { fontSize: 'var(--text-2xl)', lineHeight: 'var(--text-2xl--line-height)' },
  '3xl': { fontSize: 'var(--text-3xl)', lineHeight: 'var(--text-3xl--line-height)' },
  '4xl': { fontSize: 'var(--text-4xl)', lineHeight: 'var(--text-4xl--line-height)' },
  '5xl': { fontSize: 'var(--text-5xl)', lineHeight: 'var(--text-5xl--line-height)' },
  '6xl': { fontSize: 'var(--text-6xl)', lineHeight: 'var(--text-6xl--line-height)' },
};

const weightMap: Record<TextWeight, number> = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
};

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  (
    {
      as = 'p',
      size = 'base',
      color,
      weight,
      align,
      truncate,
      children,
      className = '',
      style,
      ...props
    },
    ref,
  ) => {
    const Tag = as as React.ElementType;

    return (
      <Tag
        ref={ref as React.Ref<HTMLElement>}
        className={className}
        style={{
          fontFamily: 'var(--font-sans)',
          color: color || 'var(--color-text-primary)',
          margin: 0,
          ...sizeStyleMap[size],
          ...(weight ? { fontWeight: weightMap[weight] } : {}),
          ...(align ? { textAlign: align } : {}),
          ...(truncate && truncate > 0
            ? {
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: truncate,
                WebkitBoxOrient: 'vertical',
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

Text.displayName = 'Text';
