import { useRef } from 'react';

export function useSectionTracking(_storySlug: string, _sectionId: string) {
  return useRef<HTMLElement>(null);
}