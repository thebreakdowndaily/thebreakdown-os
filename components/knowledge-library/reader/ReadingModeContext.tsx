'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ReadingDepth } from '@/types/canonical';

const ReadingDepthContext = createContext<ReadingDepth>('explorer');
const SetReadingDepthContext = createContext<(d: ReadingDepth) => void>(() => {});

export function ReadingModeProvider({ children, initial = 'explorer' }: { children: ReactNode; initial?: ReadingDepth }) {
  const [depth, setDepth] = useState<ReadingDepth>(initial);
  return (
    <SetReadingDepthContext.Provider value={setDepth}>
      <ReadingDepthContext.Provider value={depth}>
        {children}
      </ReadingDepthContext.Provider>
    </SetReadingDepthContext.Provider>
  );
}

export function useReadingDepth(): ReadingDepth {
  return useContext(ReadingDepthContext);
}

export function useSetReadingDepth(): (d: ReadingDepth) => void {
  return useContext(SetReadingDepthContext);
}
