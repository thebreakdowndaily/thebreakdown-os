'use client';

import type { ConfidenceMeterBlockData } from './types';
import ConfidenceMeter from '@/components/story/ConfidenceMeter';

export default function ConfidenceMeterBlock(props: ConfidenceMeterBlockData) {
  return (
    <div className="mt-12 mb-8 border-t border-[#2A2A2A] pt-10">
      <h2 className="text-xl font-bold text-text-primary mb-6">Evidence & Confidence Summary</h2>
      <ConfidenceMeter {...props} />
    </div>
  );
}
