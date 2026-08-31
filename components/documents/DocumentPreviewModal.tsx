'use client';

import { useEffect, useRef } from 'react';
import type { TrackerDocument } from '@/lib/trackers/types';
import { captureEvent } from '@/lib/analytics/capture';

interface DocumentPreviewModalProps {
  document: TrackerDocument | null;
  trackerId?: string;
  onClose: () => void;
}

export default function DocumentPreviewModal({
  document,
  trackerId = 'generic',
  onClose,
}: DocumentPreviewModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!document) return;

    captureEvent('document_preview_opened', {
      document_title: document.title,
      tracker_id: trackerId,
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [document, trackerId, onClose]);

  if (!document) return null;

  const docTypeLabels: Record<string, string> = {
    act: 'Statutory Act',
    notification: 'Gazette Notification',
    report: 'Official Report',
    audit: 'Performance Audit',
    data: 'Dataset Release',
    guideline: 'Procedural Guideline',
    decision: 'Cabinet / Executive Decision',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-preview-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-neutral-950 border border-neutral-800 shadow-2xl p-6 sm:p-8 space-y-6 text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {docTypeLabels[document.type] || document.type}
              </span>
              <span className="text-xs font-mono text-neutral-400">Date: {document.date}</span>
            </div>
            <h2 id="doc-preview-title" className="text-lg sm:text-xl font-bold text-white leading-snug">
              {document.title}
            </h2>
            {document.publisher && (
              <p className="text-xs text-neutral-400 font-mono">Publisher: {document.publisher}</p>
            )}
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close document preview"
            className="p-2 text-neutral-400 hover:text-white rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition-colors shrink-0"
          >
            <span aria-hidden="true" className="text-lg leading-none">✕</span>
          </button>
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
            Executive Summary & Context
          </h3>
          <p className="text-sm text-neutral-300 leading-relaxed bg-neutral-900/50 p-4 rounded-xl border border-neutral-800/80">
            {document.summary}
          </p>
        </div>

        {/* Key Clauses */}
        {document.keyClauses && document.keyClauses.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Key Clauses & Statutory Provisions
            </h3>
            <ul className="space-y-2 text-xs font-mono text-neutral-300 bg-neutral-900/50 p-4 rounded-xl border border-neutral-800/80">
              {document.keyClauses.map((clause, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0">§</span>
                  <span>{clause}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Provenance & Actions */}
        <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-[11px] font-mono text-neutral-400 space-y-0.5">
            <p>✓ Verified Primary Document Record</p>
            <p>Archived by The Breakdown Research Desk</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 transition-colors"
            >
              Close Preview
            </button>
            {document.url && (
              <a
                href={document.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-lg"
              >
                <span>Open Source Document</span>
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
