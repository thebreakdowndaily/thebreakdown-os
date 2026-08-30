'use client';

import { useState, useEffect } from 'react';
import { captureEvent } from '@/lib/analytics/capture';

interface CitationExporterProps {
  storySlug: string;
  storyTitle: string;
}

export function CitationExporter({ storySlug, storyTitle }: CitationExporterProps) {
  const [isInstitutional, setIsInstitutional] = useState(false);
  const [format, setFormat] = useState('apa');

  useEffect(() => {
    setIsInstitutional(localStorage.getItem('tb_plan_type') === 'institutional');
  }, []);

  const handleCopy = () => {
    let citation = '';
    const url = `https://thebreakdown.in/story/${storySlug}`;
    
    if (format === 'apa') {
      citation = `The Breakdown. (2026). ${storyTitle}. Retrieved from ${url}`;
    } else if (format === 'bibtex') {
      citation = `@misc{thebreakdown_${storySlug},\n  author = {The Breakdown},\n  title = {${storyTitle}},\n  year = {2026},\n  url = {${url}}\n}`;
    } else if (format === 'ris') {
      citation = `TY  - ELEC\nTI  - ${storyTitle}\nAU  - The Breakdown\nPY  - 2026\nUR  - ${url}\nER  - `;
    }

    navigator.clipboard.writeText(citation).then(() => {
      captureEvent('citation_exported', { format, story_slug: storySlug });
    });
  };

  if (!isInstitutional) {
    return (
      <div className="my-6 p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔒</span>
          <div>
            <h4 className="text-sm font-bold text-white">Citation Manager</h4>
            <p className="text-xs text-neutral-400">Exclusive to Institutional Supporters (BibTeX, APA, RIS)</p>
          </div>
        </div>
        <a href="/membership" className="text-xs font-bold text-emerald-400 hover:text-emerald-300">
          Upgrade
        </a>
      </div>
    );
  }

  return (
    <div className="my-6 p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
      <h4 className="text-sm font-bold text-white">Export Citation</h4>
      <div className="flex items-center gap-3">
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="bg-neutral-950 border border-neutral-700 text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="apa">APA</option>
          <option value="bibtex">BibTeX</option>
          <option value="ris">RIS</option>
        </select>
        <button
          onClick={handleCopy}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-4 py-1.5 rounded-lg transition-colors"
        >
          Copy Citation
        </button>
      </div>
    </div>
  );
}
