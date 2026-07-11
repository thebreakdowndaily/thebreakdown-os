'use client';

import type { StorySnapshotBlockData } from './types';
import StorySnapshot from '@/components/story/StorySnapshot';

export default function StorySnapshotBlock(props: StorySnapshotBlockData) {
  return <StorySnapshot {...props} />;
}
