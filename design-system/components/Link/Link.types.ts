import type { AnchorHTMLAttributes, ReactNode } from 'react';

export type LinkVariant = 'default' | 'button' | 'subtle';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkVariant;
  external?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}
