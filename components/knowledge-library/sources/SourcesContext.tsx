'use client';

import { createContext, useContext } from 'react';
import type { Source } from '@/types/canonical';

type SourceLookup = (id: string) => number;

const SourcesContext = createContext<SourceLookup>(() => -1);

export function SourcesProvider({ sources, children }: { sources: Source[]; children: React.ReactNode }) {
  const lookup: SourceLookup = (id: string) => sources.findIndex((_, i) => `s${i + 1}` === id);
  return <SourcesContext.Provider value={lookup}>{children}</SourcesContext.Provider>;
}

export function useSources(): SourceLookup {
  return useContext(SourcesContext);
}
