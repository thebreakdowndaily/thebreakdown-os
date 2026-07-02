import type { HTMLAttributes } from 'react';

export type GridAlign = 'start' | 'center' | 'end' | 'stretch';
export type GridJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
export type GridGap = 0 | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 14 | 16 | 20 | 24 | 28 | 32 | 36 | 40 | 44 | 48 | 52 | 56 | 60 | 64 | 72 | 80 | 96;

export interface ResponsiveColumns {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: number | ResponsiveColumns;
  gap?: GridGap;
  align?: GridAlign;
  justify?: GridJustify;
}
