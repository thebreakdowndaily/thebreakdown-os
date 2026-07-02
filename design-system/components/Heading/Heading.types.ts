import type { HTMLAttributes } from 'react';

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
  variant?: HeadingLevel;
  color?: string;
  truncate?: boolean;
}
