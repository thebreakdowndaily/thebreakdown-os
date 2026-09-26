'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { CorrectionCategory, ReaderCorrectionSubmissionResult } from '@/types/corrections';

interface CorrectionSubmissionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  storySlug: string;
  storyTitle?: string;
  initialExcerpt?: string;
  claimId?: string;
}

export default function CorrectionSubmissionDrawer({
  isOpen,
  onClose,
  storySlug,
  storyTitle,
  initialExcerpt = '',
  claimId,
}: CorrectionSubmissionDrawerProps) {
  const [category, setCategory] = useState<CorrectionCategory>('factual');
  const [passageExcerpt, setPassageExcerpt] = useState(initialExcerpt);
  const [suggestedCorrection, setSuggestedCorrection] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [supportingEvidenceUrl, setSupportingEvidenceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ReaderCorrectionSubmissionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const drawerRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialExcerpt) {
      setPassageExcerpt(initialExcerpt);
    }
  }, [initialExcerpt]);

  // Focus management and ESC key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timeout = setTimeout(() => {
      firstInputRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/corrections/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storySlug,
          claimId,
          category,
          passageExcerpt,
          suggestedCorrection,
          submitterEmail: submitterEmail || undefined,
          supportingEvidenceUrl: supportingEvidenceUrl || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || (data.errors ? data.errors.join(' ') : 'Submission failed.'));
      } else {
        setResult(data);
      }
    } catch {
      setErrorMsg('Network error. Unable to reach editorial intake desk. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setErrorMsg(null);
    setSuggestedCorrection('');
    setPassageExcerpt('');
    setSubmitterEmail('');
    setSupportingEvidenceUrl('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="correction-drawer-title"
    >
      <div
        ref={drawerRef}
        className="w-full max-w-lg bg-surface border-l border-border h-full shadow-2xl flex flex-col justify-between overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 id="correction-drawer-title" className="text-lg font-serif font-bold text-text-primary">
              Report an Error or Correction
            </h2>
            <p className="text-xs text-text-muted mt-1">
              Editorial Constitution Article XIII: Continuous factual accountability
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors focus:ring-2 focus:ring-brand-400"
            aria-label="Close correction drawer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1">
          {result ? (
            <div className="space-y-4 py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-text-primary">Correction Report Received</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {result.message}
              </p>
              <div className="p-3 bg-surface-secondary rounded-lg border border-border text-xs text-text-muted font-mono">
                Tracking ID: {result.submissionId}
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Close & Return to Reading
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-xs" role="alert">
                  {errorMsg}
                </div>
              )}

              {storyTitle && (
                <div className="text-xs text-text-muted">
                  Story: <span className="font-semibold text-text-primary">{storyTitle}</span>
                </div>
              )}

              {/* Category */}
              <div>
                <label htmlFor="correction-category" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  id="correction-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CorrectionCategory)}
                  className="w-full bg-surface-secondary border border-border text-text-primary text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-brand-400 focus:border-brand-400"
                >
                  <option value="factual">Factual Error (Dates, Numbers, Events)</option>
                  <option value="source">Source Misattribution or Broken Citation</option>
                  <option value="clarification">Clarification / Ambiguity</option>
                  <option value="interpretive">Historiographical / Interpretive Dispute</option>
                  <option value="context_update">Recent Development / Context Update</option>
                </select>
              </div>

              {/* Passage Excerpt */}
              <div>
                <label htmlFor="passage-excerpt" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Passage in Question <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="passage-excerpt"
                  ref={firstInputRef}
                  required
                  rows={3}
                  value={passageExcerpt}
                  onChange={(e) => setPassageExcerpt(e.target.value)}
                  placeholder="Paste or cite the specific sentence or paragraph from the story..."
                  className="w-full bg-surface-secondary border border-border text-text-primary text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-brand-400 focus:border-brand-400 resize-none font-sans"
                />
              </div>

              {/* Suggested Correction */}
              <div>
                <label htmlFor="suggested-correction" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Correction or Additional Context <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="suggested-correction"
                  required
                  rows={4}
                  value={suggestedCorrection}
                  onChange={(e) => setSuggestedCorrection(e.target.value)}
                  placeholder="Explain what is inaccurate and provide the accurate facts..."
                  className="w-full bg-surface-secondary border border-border text-text-primary text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-brand-400 focus:border-brand-400 resize-none font-sans"
                />
              </div>

              {/* Supporting Evidence URL */}
              <div>
                <label htmlFor="supporting-evidence-url" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Supporting Evidence / Citation URL <span className="text-text-muted font-normal">(Optional)</span>
                </label>
                <input
                  id="supporting-evidence-url"
                  type="url"
                  value={supportingEvidenceUrl}
                  onChange={(e) => setSupportingEvidenceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-surface-secondary border border-border text-text-primary text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-brand-400 focus:border-brand-400"
                />
              </div>

              {/* Submitter Email */}
              <div>
                <label htmlFor="submitter-email" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Your Email <span className="text-text-muted font-normal">(Optional — strictly confidential)</span>
                </label>
                <input
                  id="submitter-email"
                  type="email"
                  value={submitterEmail}
                  onChange={(e) => setSubmitterEmail(e.target.value)}
                  placeholder="scholar@university.edu"
                  className="w-full bg-surface-secondary border border-border text-text-primary text-xs rounded-lg p-2.5 focus:ring-2 focus:ring-brand-400 focus:border-brand-400"
                />
                <p className="text-[10px] text-text-muted mt-1">
                  Used solely if our editorial verification bureau requires clarification. Never published or shared.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 focus:ring-2 focus:ring-brand-400 focus:ring-offset-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting to Editorial Desk...
                    </>
                  ) : (
                    'Submit Correction Report'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-secondary border-t border-border text-[11px] text-text-muted text-center">
          The Breakdown Editorial Constitution Article XIII — All verified corrections are publicly recorded.
        </div>
      </div>
    </div>
  );
}
