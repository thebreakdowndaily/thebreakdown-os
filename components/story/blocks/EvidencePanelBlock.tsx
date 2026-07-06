'use client';

import type { EvidencePanelData } from './types';
import EvidenceEngine from '@/components/story/evidence/EvidenceEngine';

export default function EvidencePanelBlock(props: EvidencePanelData) {
  return (
    <section id="evidence" aria-label="Evidence panel" className="py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">Evidence</h2>
      <EvidenceEngine {...props} />
    </section>
  );
}
