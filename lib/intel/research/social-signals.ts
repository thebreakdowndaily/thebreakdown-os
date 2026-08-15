/**
 * ─── Research Intelligence Engine — Social Signals ───────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Social signal handling. Design rules this engine enforces:
 *   1. Social popularity is NOT truth. Engagement computes a *velocityScore*
 *      used only to raise discovery urgency / priority — it never feeds the
 *      evidence or corroboration score.
 *   2. A social post is a SIGNAL, not evidence. status starts at SIGNAL_ONLY
 *      and only moves after the corroboration engine confirms it.
 *   3. Signals are promoted to claims only via the same claim pipeline
 *      (attribution + entity mention checks apply).
 */

import type { ResearchClaim, SocialSignal } from '@/types/research-intelligence';
import { createSignalId } from './ids';
import { sentenceSplit, normalizeText } from './normalization';

export interface SocialSignalInput {
  projectId: string;
  platform: string;
  postId: string;
  permalink?: string;
  author: string;
  text: string;
  postedAt: string;
  engagement?: { likes?: number; shares?: number; comments?: number; views?: number };
}

/** Velocity in [0,1]. Only drives urgency — capped so it can never dominate. */
export function velocityScore(engagement: SocialSignal['engagement']): number {
  const likes = engagement.likes ?? 0;
  const shares = engagement.shares ?? 0;
  const comments = engagement.comments ?? 0;
  const views = engagement.views ?? 0;
  const raw = likes * 0.4 + shares * 1.0 + comments * 0.8 + views * 0.02;
  return Math.round(Math.min(1, Math.max(0, Math.log10(raw + 1) / 6)) * 100) / 100;
}

export function createSocialSignal(input: SocialSignalInput): SocialSignal {
  return {
    id: createSignalId(),
    projectId: input.projectId,
    platform: input.platform,
    postId: input.postId,
    permalink: input.permalink,
    author: input.author,
    text: normalizeText(input.text),
    postedAt: input.postedAt,
    discoveredAt: new Date().toISOString(),
    engagement: input.engagement ?? {},
    velocityScore: velocityScore(input.engagement ?? {}),
    topicClassified: [],
    status: 'SIGNAL_ONLY',
  };
}

/** Classify a signal's topic against a project's entity lexicon. */
export function classifySignalTopic(signal: SocialSignal, entityNames: string[]): string[] {
  const lower = signal.text.toLowerCase();
  return Array.from(new Set(entityNames.filter((e) => lower.includes(e.toLowerCase()))));
}

/** Estimate whether a signal text contains a plausible reportable claim. */
export function signalHasClaim(signal: SocialSignal): boolean {
  const sentences = sentenceSplit(signal.text);
  return sentences.some(
    (s) =>
      s.length >= 40 &&
      /\d+%|\$\d|₹\d|\b(said|announced|reported|claims|according|will|raised|increased|decreased|imposed|new)\b/i.test(s)
  );
}

/** Derive a provisional claim from a signal (verificationState stays SIGNAL_ONLY). */
export function claimFromSignal(signal: SocialSignal, projectId: string): ResearchClaim {
  const text = normalizeText(signal.text);
  const firstSentence = sentenceSplit(text)[0] ?? text;
  return {
    id: `claim_${signal.postId.slice(0, 12)}_signal`,
    projectId,
    claimText: firstSentence,
    normalizedClaim: firstSentence.toLowerCase().replace(/\s+/g, ' ').trim(),
    documentId: '',
    sourceId: '',
    evidenceSpan: firstSentence,
    speaker: signal.author,
    claimType: 'FACT',
    entityMentions: [],
    extractionConfidence: 0.3,
    attribution: { isAttributed: true, attributionSource: signal.author, statement: firstSentence },
    verificationState: 'SIGNAL_ONLY',
    contradictionIds: [],
    firstSeenAt: new Date().toISOString(),
  };
}
