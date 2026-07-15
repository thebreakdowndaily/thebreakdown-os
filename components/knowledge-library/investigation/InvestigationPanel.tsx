'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { enrichClaimLazy, getKnowledgeCore } from '@/lib/knowledge/knowledge-core';
import { getAllTimelineEvents } from '@/lib/knowledge/timeline-registry';
import { getThinkersByConcept } from '@/lib/knowledge/thinker-registry';
import { InvestigationContent } from './InvestigationContent';
import type { EnrichedClaim } from '@/lib/knowledge/knowledge-core';
import type { CanonicalTimelineEvent, CanonicalThinker, CanonicalClaim } from '@/types/canonical';

export function InvestigationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [claim, setClaim] = useState<EnrichedClaim | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<CanonicalTimelineEvent[]>([]);
  const [thinkers, setThinkers] = useState<CanonicalThinker[]>([]);
  const [relatedClaims, setRelatedClaims] = useState<CanonicalClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const loadClaim = useCallback((id: string) => {
    setClaimId(id);
    setLoading(true);

    const enriched = enrichClaimLazy(id);
    if (enriched) {
      setClaim(enriched);

      const allEvents = getAllTimelineEvents();
      setTimelineEvents(allEvents.filter(ev => ev.claimIds.includes(id)));

      const thinkerMap = new Map<string, CanonicalThinker>();
      for (const conceptId of enriched.conceptIds) {
        const t = getThinkersByConcept(conceptId);
        t.forEach(thinker => thinkerMap.set(thinker.id, thinker));
      }
      setThinkers(Array.from(thinkerMap.values()));

      const core = getKnowledgeCore();
      const seen = new Set<string>();
      const related: CanonicalClaim[] = [];
      const addIfMissing = (c: CanonicalClaim) => { if (c.id !== id && !seen.has(c.id)) { seen.add(c.id); related.push(c); } };
      for (const entityId of enriched.entityIds) {
        core.claims.byEntity(entityId).forEach(addIfMissing);
      }
      for (const conceptId of enriched.conceptIds) {
        core.claims.byConcept(conceptId).forEach(addIfMissing);
      }
      setRelatedClaims(related.slice(0, 5));
    } else {
      setClaim(null);
      setTimelineEvents([]);
      setThinkers([]);
      setRelatedClaims([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      triggerRef.current = document.activeElement as HTMLElement;
      loadClaim(customEvent.detail);
      setIsOpen(true);
    };

    window.addEventListener('open-investigation', handleOpen);
    return () => { window.removeEventListener('open-investigation', handleOpen); };
  }, [loadClaim]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        panelRef.current?.focus();
      });
    } else {
      requestAnimationFrame(() => {
        triggerRef.current?.focus();
        triggerRef.current = null;
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  const chapterTitle = claim?.appearsIn?.[0]?.contentTitle;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />

          <motion.div
            ref={panelRef}
            tabIndex={-1}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[520px] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col outline-none"
            role="dialog"
            aria-label="Knowledge Investigation Panel"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h2 className="text-base font-semibold text-gray-900">Investigation</h2>
              </div>
              <button
                onClick={handleClose}
                className="px-3 py-1.5 rounded text-xs font-medium text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Return to the story"
              >
                Return to story
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}

            {/* Error */}
            {!loading && !claim && claimId && (
              <div className="flex-1 flex items-center justify-center p-6">
                <p className="text-sm text-gray-500">Could not load investigation data for this claim.</p>
              </div>
            )}

            {/* Content */}
            {!loading && claim && (
              <InvestigationContent
                claim={claim}
                timelineEvents={timelineEvents}
                thinkers={thinkers}
                relatedClaims={relatedClaims}
                chapterTitle={chapterTitle}
                onInvestigateClaim={loadClaim}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
