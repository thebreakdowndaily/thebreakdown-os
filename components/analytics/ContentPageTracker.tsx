'use client';

import { useEffect } from 'react';
import { captureEvent } from '@/lib/analytics/capture';

interface ContentPageTrackerProps {
  contentType: 'topic' | 'entity';
  id: string;
}

/**
 * ContentPageTracker — fires topic_opened / entity_opened once per page view.
 */
export function ContentPageTracker({ contentType, id }: ContentPageTrackerProps) {
  useEffect(() => {
    if (contentType === 'topic') {
      captureEvent('topic_opened', { topic_id: id });
    } else {
      captureEvent('entity_opened', { entity_id: id });
    }
  }, [contentType, id]);

  return null;
}