import type { ChartSpec } from '@/utils/types';
import { Registry } from '@/lib/registry';

export interface D3Theme {
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  brand: string;
  brandLight: string;
  border: string;
  borderHover: string;
  fontFamily: string;
  fontSize: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

export type ChartRenderFunction = (
  svg: SVGSVGElement,
  data: Record<string, unknown>[],
  width: number,
  height: number,
  theme: D3Theme,
  spec: ChartSpec
) => void;

export const ChartRegistry = new Registry<ChartRenderFunction>();
