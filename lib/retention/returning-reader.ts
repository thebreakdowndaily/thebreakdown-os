import { readStoryHistory } from '@/components/narrative/StoryMemoryWriter';

export interface ReturningReaderState {
  isReturning: boolean;
  storiesRead: number;
  daysSinceLast: number;
}

export function detectReturningReader(): ReturningReaderState {
  if (typeof window === 'undefined') {
    return { isReturning: false, storiesRead: 0, daysSinceLast: 0 };
  }

  const history = readStoryHistory();
  if (history.length < 2) {
    return { isReturning: false, storiesRead: history.length, daysSinceLast: 0 };
  }

  const earliest = history[history.length - 1];
  const now = Date.now();
  
  const earliestDate = new Date(earliest.readAt);
  const nowDate = new Date(now);

  const isDifferentDay = earliestDate.toDateString() !== nowDate.toDateString() || (now - earliest.readAt > 86400000);
  
  if (!isDifferentDay) {
    return { isReturning: false, storiesRead: history.length, daysSinceLast: 0 };
  }

  const diffMs = now - earliest.readAt;
  const daysSinceLast = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  return {
    isReturning: true,
    storiesRead: history.length,
    daysSinceLast,
  };
}
