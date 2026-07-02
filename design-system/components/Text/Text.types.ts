import type { HTMLAttributes } from 'react';

export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
export type TextWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type TextElement = 'p' | 'span' | 'div' | 'label';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: TextElement;
  size?: TextSize;
  color?: string;
  weight?: TextWeight;
  align?: TextAlign;
  truncate?: number;
}
