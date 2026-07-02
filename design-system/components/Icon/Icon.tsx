/**
 * THE BREAKDOWN — Icon Component
 *
 * Base icon component. Every icon in the system renders through this.
 * Supports size, color, and accessibility tokens.
 */

import React from 'react';
import type { IconProps } from './Icon.types';

export const Icon: React.FC<IconProps> = ({
  icon,
  size = 'DEFAULT',
  className = '',
  label,
  ...props
}) => {
  const sizeMap: Record<string, string> = {
    xs: 'var(--spacing-4)',   // 16px
    sm: 'var(--spacing-5)',   // 20px
    DEFAULT: 'var(--spacing-6)', // 24px
    lg: 'var(--spacing-8)',   // 32px
    xl: 'var(--spacing-10)',  // 40px
    '2xl': 'var(--spacing-12)', // 48px
  };

  const dimension = sizeMap[size] || sizeMap.DEFAULT;

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label={label}
      aria-hidden={!label}
      focusable="false"
      {...props}
    >
      {icon}
    </svg>
  );
};
