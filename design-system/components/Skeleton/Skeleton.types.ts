import type { HTMLAttributes } from 'react';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card';
export type SkeletonBorderRadius = 'none' | 'sm' | 'DEFAULT' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  borderRadius?: SkeletonBorderRadius;
  count?: number;
  inline?: boolean;
}
