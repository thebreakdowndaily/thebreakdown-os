import { forwardRef } from 'react';
import type { ContainerProps } from './Container.types';

const maxWidthMap: Record<string, string> = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
};

const paddingMap: Record<string, string> = {
  none: 'var(--spacing-0)',
  sm: 'var(--spacing-4)',
  md: 'var(--spacing-6)',
  lg: 'var(--spacing-8)',
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      size = 'lg',
      padding = 'md',
      centered = true,
      children,
      className = '',
      style,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          width: '100%',
          maxWidth: maxWidthMap[size],
          marginLeft: centered ? 'auto' : 0,
          marginRight: centered ? 'auto' : 0,
          paddingLeft: paddingMap[padding],
          paddingRight: paddingMap[padding],
          boxSizing: 'border-box',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Container.displayName = 'Container';
