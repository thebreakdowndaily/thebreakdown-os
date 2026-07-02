/**
 * THE BREAKDOWN — Icon Factory
 *
 * Helper to create consistent icon components.
 *
 * Usage:
 *   export const Search = createIcon(
 *     <path d="M21 21l-4.35-4.35..." />
 *   );
 */

import React from 'react';
import { Icon } from './Icon';
import type { IconProps } from './Icon.types';

export function createIcon(icon: React.ReactNode) {
  const Component: React.FC<Omit<IconProps, 'icon'>> = (props) => (
    <Icon icon={icon} {...props} />
  );
  Component.displayName = 'Icon';
  return Component;
}
