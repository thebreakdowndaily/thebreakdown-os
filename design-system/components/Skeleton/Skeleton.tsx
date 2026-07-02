import React, { forwardRef } from 'react';
import type { SkeletonProps } from './Skeleton.types';

const radiusMap: Record<string, string> = {
  none: 'var(--radius-none)',
  sm: 'var(--radius-sm)',
  DEFAULT: 'var(--radius-default)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  '2xl': 'var(--radius-2xl)',
  full: 'var(--radius-full)',
};

const variantDefaults: Record<string, Partial<React.CSSProperties>> = {
  text: {
    width: '100%',
    height: 'var(--spacing-4)',
    borderRadius: 'var(--radius-sm)',
  },
  circular: {
    width: 'var(--spacing-10)',
    height: 'var(--spacing-10)',
    borderRadius: 'var(--radius-full)',
  },
  rectangular: {
    width: '100%',
    height: 'var(--spacing-20)',
    borderRadius: 'var(--radius-md)',
  },
  card: {
    width: '100%',
    height: 'var(--spacing-40)',
    borderRadius: 'var(--radius-lg)',
  },
};

const baseSkeletonStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-bg-tertiary)',
  backgroundImage: 'linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-bg-secondary) 50%, var(--color-bg-tertiary) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s var(--easing-in-out) infinite',
  flexShrink: 0,
};

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
      width,
      height,
      borderRadius,
      count = 1,
      inline = false,
      className = '',
      style,
      ...props
    },
    ref,
  ) => {
    const items = Array.from({ length: count });

    return (
      <>
        {items.map((_, index) => (
          <div
            key={index}
            ref={index === 0 ? ref : undefined}
            className={className}
            aria-hidden="true"
            style={{
              ...baseSkeletonStyle,
              ...variantDefaults[variant],
              ...(width ? { width } : {}),
              ...(height ? { height } : {}),
              ...(borderRadius ? { borderRadius: radiusMap[borderRadius] } : {}),
              ...(inline ? { display: 'inline-block' } : {}),
              ...(count > 1 && index < count - 1 ? { marginBottom: 'var(--spacing-2)' } : {}),
              ...style,
            }}
            {...props}
          />
        ))}
      </>
    );
  },
);

Skeleton.displayName = 'Skeleton';
