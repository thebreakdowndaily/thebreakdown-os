import type { HTMLAttributes } from 'react';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl';
export type ContainerPadding = 'none' | 'sm' | 'md' | 'lg';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
  padding?: ContainerPadding;
  centered?: boolean;
}
