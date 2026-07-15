'use client';

import { useEffect, useState } from 'react';

interface VisualEntry {
  index: number;
  type: string;
  title: string;
}

const typeLabels: Record<string, string> = {
  image: 'Photo',
  map: 'Map',
  chart: 'Chart',
  diagram: 'Diagram',
  document: 'Document',
};

const typeAbbr: Record<string, string> = {
  image: 'IMG',
  map: 'MAP',
  chart: 'CHT',
  diagram: 'DIA',
  document: 'DOC',
};

export function VisualGallery() {
  const [entries, setEntries] = useState<VisualEntry[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-visual-block]');
    const visualEntries: VisualEntry[] = [];
    els.forEach((el, i) => {
      const type = el.getAttribute('data-visual-block') || 'unknown';
      const figcaption = el.querySelector('figcaption');
      const firstP = figcaption?.querySelector('p');
      const title = firstP?.textContent || type;
      visualEntries.push({ index: i, type, title });
    });
    setEntries(visualEntries);
  }, []);

  const scrollTo = (index: number) => {
    const el = document.querySelectorAll<HTMLElement>('[data-visual-block]')[index];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setOpen(false);
    }
  };

  if (entries.length === 0) return null;

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`transition-transform ${open ? 'rotate-90' : ''}`}>
          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Visuals in this chapter ({entries.length})
      </button>
      {open && (
        <ul className="mt-2 space-y-1 ml-6 text-sm">
          {entries.map((v) => (
            <li key={v.index}>
              <button
                onClick={() => scrollTo(v.index)}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-700 hover:underline transition-colors"
              >
                <span className="text-xs font-mono text-gray-400 w-8">{typeAbbr[v.type] || 'VIS'}</span>
                <span className="text-xs text-gray-400 uppercase w-16 shrink-0">{typeLabels[v.type] || v.type}</span>
                <span className="truncate">{v.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
