'use client';

import { useReadingDepth } from '@/components/knowledge-library/reader/ReadingModeContext';
import type { ReadingDepth } from '@/types/canonical';

export function BlockVisibilityWrapper({ allowedDepths, children }: { allowedDepths?: ReadingDepth[]; children: React.ReactNode }) {
  const depth = useReadingDepth();
  
  if (allowedDepths && !allowedDepths.includes(depth)) {
    return null;
  }
  
  return <>{children}</>;
}
