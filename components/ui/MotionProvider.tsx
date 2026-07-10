'use client';

import { LazyMotion, domAnimation } from 'framer-motion';
import { type ReactNode } from 'react';

/**
 * Wraps the application to provide framer-motion domAnimation features lazily.
 * Helps keep the initial JS bundle size small.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
