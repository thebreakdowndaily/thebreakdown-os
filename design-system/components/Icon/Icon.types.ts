/**
 * THE BREAKDOWN — Icon Component Types
 */

import type { SVGAttributes } from 'react';

export type IconSize = 'xs' | 'sm' | 'DEFAULT' | 'lg' | 'xl' | '2xl';

export interface IconProps extends SVGAttributes<SVGElement> {
  icon: React.ReactNode;
  size?: IconSize;
  label?: string;
}
