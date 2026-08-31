'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { TrackerDefinition, TrackerDocument } from '@/lib/trackers/types';
import { captureEvent } from '@/lib/analytics/capture';
import TimeSeriesChart from './TimeSeriesChart';
import DocumentPreviewModal from '@/components/documents/DocumentPreviewModal';

interface GenericTrackerProps {
  tracker: TrackerDefinition;
}

const impactColor = {
  critical: 'bg-red-500/20 text-red-300 border-red-500/40',
  major: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  minor: 'bg-neutral-500/20 text-neutral-300 border-neutral-500/40',
} as const;

const confidenceColor = {
  established: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  strong: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  contested: 'bg-red-500/20 text-red-300 border-red-500/40',
} as const;

const categoryIcon = {
  legislation: '\u{1F4DC}',
  policy: '\u{1F4DD}',
  data: '\u{1F4CA}',
  event: '\u{1F514}',
  industry: '\u{1F3ED}',
} as const;

export default function GenericTracker({ tracker }: GenericTrackerProps) {
  const [selectedDoc, setSelectedDoc] = useState<TrackerDocument | null>(null);

  useEffect(() => {
    captureEvent('tracker_viewed', {
      tracker_id: tracker.id,
      topic: tracker.topicSlug,
    });
    captureEvent('evidence_expanded', {
      content_id: `tracker:${tracker.id}`,
      claim_id: tracker.slug,
    });
  }, [tracker.id, tracker.slug, tracker.topicSlug]);

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-8 font-sans text-neutral-100 max-w-5xl mx-auto shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
            Flagship Knowledge System
          </span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/40 font-bold font-mono">
            Policy Tracker
          </span>
          {tracker.topic && (
            <Link
              href={`/topic/${tracker.topicSlug}`}
              className="text-[10px] bg-neutral-800 text-neutral-300 hover:text-emerald-300 px-2 py-0.5 rounded border border-neutral-700 font-mono transition-colors ml-auto"
            >
              Topic: {tracker.topic} →
            </Link>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
          {tracker.title}
        </h1>
        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-serif">
          {tracker.subtitle}
        </p>
      </div>

      {/* Current Status */}
      <div className="bg-neutral-950/80 border border-emerald-500/40 rounded-xl p-4 sm:p-5 space-y-1.5">
        <strong className="block text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
          Current Operational Status
        </strong>
        <p className="text-sm sm:text-base text-neutral-200 leading-relaxed">
          {tracker.currentStatus}
        </p>
      </div>

      {/* Verification Ledger Metadata */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-neutral-400 border-b border-neutral-800/80 pb-4">
        <span>Last updated: <strong className="text-neutral-200">{tracker.lastUpdated}</strong></span>
        <span>•</span>
        <span>Verified by: <strong className="text-neutral-200">{tracker.lastVerifiedBy}</strong></span>
      </div>

      {/* Key Data Points Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-neutral-400 uppercase font-mono tracking-wider">
          Key Metric Ledger
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {tracker.keyDataPoints.map((dp) => (
            <div key={dp.label} className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-4 space-y-1 hover:border-neutral-700 transition-colors">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">{dp.label}</span>
              <strong className="text-lg sm:text-xl text-white font-mono block">{dp.value}</strong>
              <p className="text-[10px] text-neutral-500 font-mono">{dp.source} ({dp.asOf})</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quantitative Time-Series Visualizations (Sprint 4) */}
      {tracker.timeSeries && tracker.timeSeries.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-neutral-400 uppercase font-mono tracking-wider">
            Verified Quantitative Time-Series ({tracker.timeSeries.length})
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {tracker.timeSeries.map((ts) => (
              <TimeSeriesChart key={ts.id} series={ts} trackerId={tracker.id} />
            ))}
          </div>
        </div>
      )}

      {/* What Changed Recently */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-neutral-400 uppercase font-mono tracking-wider">
          Recent Material Changes
        </h2>
        <div className="space-y-2.5">
          {tracker.recentChanges.map((ch) => (
            <div key={ch.title} className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-4 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded border font-bold font-mono ${impactColor[ch.impact]}`}>
                  {ch.impact}
                </span>
                <strong className="text-sm font-semibold text-white">{ch.title}</strong>
                <span className="text-[10px] font-mono text-neutral-500 ml-auto">{ch.date}</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">{ch.description}</p>
              <p className="text-[10px] text-neutral-500 font-mono">Source: {ch.source}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Timeline */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-neutral-400 uppercase font-mono tracking-wider">
          Chronology & Historical Milestones
        </h2>
        <div className="space-y-2">
          {tracker.timeline.sort((a, b) => a.date.localeCompare(b.date)).map((evt) => (
            <div key={evt.title} className="bg-neutral-950/40 border border-neutral-800/60 rounded-xl p-3.5 flex gap-3.5 items-start text-xs">
              <span className="text-[10px] text-neutral-400 font-mono whitespace-nowrap mt-0.5">
                {categoryIcon[evt.category] || '\u{1F4C5}'} {evt.date}
              </span>
              <div className="space-y-0.5 min-w-0 flex-1">
                <strong className="text-white font-medium block">{evt.title}</strong>
                <p className="text-neutral-400 leading-relaxed">{evt.description}</p>
                <p className="text-[10px] text-neutral-500 font-mono">Source: {evt.source}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Chain */}
      <div className="space-y-3" id="evidence-chain">
        <h2 className="text-xs font-bold text-emerald-400 uppercase font-mono tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Evidence Provenance Chain
        </h2>
        <div className="space-y-3">
          {tracker.evidenceChain.map((ev, i) => (
            <div key={i} className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-4 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded border font-bold font-mono ${confidenceColor[ev.confidence]}`}>
                  {ev.confidence}
                </span>
                <span className="text-[10px] font-mono text-neutral-500 ml-auto">Verified: {ev.lastVerified}</span>
              </div>
              <p className="text-sm font-medium text-neutral-100 leading-snug">{ev.claim}</p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-neutral-400 pt-1 border-t border-neutral-800/60">
                <span>Source: <strong className="text-neutral-300">{ev.source}</strong></span>
                {ev.documentTitle && (
                  <span className="text-emerald-400">Doc: {ev.documentTitle}</span>
                )}
              </div>
              {ev.counterargument && (
                <p className="text-xs text-amber-300/80 bg-amber-950/20 border border-amber-900/30 rounded p-2 mt-1">
                  Counterpoint / Context: {ev.counterargument}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Primary Documents */}
      <div className="space-y-3" id="documents">
        <h2 className="text-xs font-bold text-neutral-400 uppercase font-mono tracking-wider">
          Primary Official Documents ({tracker.documents.length})
        </h2>
        <div className="space-y-2.5">
          {tracker.documents.map((doc) => (
            <div key={doc.title} className="bg-neutral-950/40 border border-neutral-800/60 rounded-xl p-3.5 text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono uppercase font-bold">
                    {doc.type}
                  </span>
                  <strong className="text-neutral-200 font-medium">{doc.title}</strong>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">{doc.date}</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">{doc.summary}</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(doc)}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-emerald-400 font-mono text-[11px] border border-neutral-700 transition-colors"
                >
                  Inspect Document Record →
                </button>
                {doc.url && (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded bg-transparent hover:bg-neutral-900 text-neutral-400 hover:text-white font-mono text-[11px] transition-colors"
                  >
                    Direct Source ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        document={selectedDoc}
        trackerId={tracker.id}
        onClose={() => setSelectedDoc(null)}
      />

      {/* Related Stories & Exploration Links */}
      <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-neutral-800">
        <span className="text-xs font-mono text-neutral-400">Related Exploration:</span>
        {tracker.relatedStorySlugs.map((slug) => (
          <Link
            key={slug}
            href={`/story/${slug}`}
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
          >
            Story: {slug} ↗
          </Link>
        ))}
        {tracker.relatedEntityIds.map((eid) => (
          <Link
            key={eid}
            href={`/entity/${eid}`}
            className="text-xs font-mono text-sky-400 hover:text-sky-300 underline underline-offset-2"
          >
            Entity: {eid}
          </Link>
        ))}
        <Link href="/trust" className="text-xs font-mono text-neutral-400 hover:text-neutral-300 underline underline-offset-2 ml-auto">
          Trust Dashboard
        </Link>
      </div>
    </div>
  );
}
