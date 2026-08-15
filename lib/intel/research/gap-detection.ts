/**
 * ─── Research Intelligence Engine — Gap Detection ────────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Deterministic detection of research gaps from the current state of a
 * research project. Each gap carries an actionable recommendation and
 * suggested queries so a researcher can act on it directly.
 */

import type {
  ResearchGap,
  ResearchGapSeverity,
  ResearchGapStatus,
  ResearchGapType,
} from '@/types/research-intelligence';
import { createGapId } from './ids';

export interface GapDetectionInput {
  projectId: string;
  claims: Array<{ id: string; verificationState: string; entityMentions: string[]; firstSeenAt: string }>;
  sources: Array<{ id: string; sourceClass: string }>;
  contradictions: Array<{ id: string }>;
  events: Array<{ datePrecision: string }>;
}

export function detectGaps(input: GapDetectionInput): ResearchGap[] {
  const gaps: ResearchGap[] = [];
  const now = new Date().toISOString();
  const add = (
    type: ResearchGapType,
    severity: ResearchGapSeverity,
    title: string,
    description: string,
    recommendedAction: string,
    suggestedQueries: string[],
    relatedClaimIds: string[] = [],
    relatedEntityMentions: string[] = []
  ) => {
    gaps.push({
      id: createGapId(),
      projectId: input.projectId,
      type,
      severity,
      title,
      description,
      relatedClaimIds,
      relatedEntityMentions,
      evidenceCount: 0,
      recommendedAction,
      suggestedQueries,
      status: 'OPEN',
      detectedAt: now,
    });
  };

  const primarySourceCount = input.sources.filter((s) => ['PRIMARY', 'OFFICIAL', 'REGULATORY', 'JUDICIAL', 'PARLIAMENTARY'].includes(s.sourceClass)).length;
  if (primarySourceCount === 0) {
    add(
      'MISSING_PRIMARY_SOURCE',
      'CRITICAL',
      'No primary sources located',
      'No official, government, regulatory, judicial or parliamentary sources have been discovered for this topic.',
      'Add official sources (site:gov.in), gazette notifications, parliamentary records or regulatory filings.',
      ['site:gov.in tariffs', 'official statement tariffs', 'gazette notification trade']
    );
  }

  const unverified = input.claims.filter((c) => c.verificationState === 'SIGNAL_ONLY' || c.verificationState === 'UNVERIFIED');
  if (unverified.length > 0) {
    add(
      'UNVERIFIED_CLAIM',
      unverified.length > 5 ? 'HIGH' : 'MEDIUM',
      `${unverified.length} claim(s) remain unverified`,
      'Claims exist but have no independent corroboration.',
      'Run additional discovery for the exact claim statements to find corroborating or contradicting sources.',
      [],
      unverified.slice(0, 10).map((c) => c.id),
      Array.from(new Set(unverified.slice(0, 10).flatMap((c) => c.entityMentions)))
    );
  }

  if (input.contradictions.length > 0) {
    add(
      'CONTRADICTION',
      'HIGH',
      `${input.contradictions.length} open contradiction(s)`,
      'Sources present conflicting values or statements that must be adjudicated.',
      'Resolve each contradiction by locating the primary source and recording the adjudication.',
      []
    );
  }

  const datedEvents = input.events.filter((e) => e.datePrecision !== 'UNKNOWN').length;
  if (datedEvents < 3) {
    add(
      'MISSING_TIMELINE',
      'MEDIUM',
      'Timeline is sparse',
      'Fewer than three dated events have been established.',
      'Run historical + event queries to build a dated chronology.',
      ['timeline', 'events', 'history']
    );
  }

  const oldClaims = input.claims.filter((c) => Date.now() - new Date(c.firstSeenAt).getTime() > 30 * 24 * 60 * 60 * 1000);
  if (oldClaims.length > 0) {
    add(
      'STALE_DATA',
      'LOW',
      `${oldClaims.length} claim(s) older than 30 days`,
      'Claims may have changed since first detected.',
      'Re-run discovery and check for updates.',
      ['latest', 'update', 'current status']
    );
  }

  if (gaps.length === 0) {
    add(
      'UNKNOWN',
      'LOW',
      'No major gaps detected',
      'The project has reasonable primary source coverage and corroborated claims.',
      'Continue monitoring for changes and new developments.',
      ['latest']
    );
  }

  return gaps;
}

export type { ResearchGapStatus };
