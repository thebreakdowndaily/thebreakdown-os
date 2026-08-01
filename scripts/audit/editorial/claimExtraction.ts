// scripts/audit/editorial/claimExtraction.ts
// Surface-by-surface Material Claim Extraction & Registry Reconciliation

import type { Story } from '../../../types/canonical';
import type { MaterialClaimRecord, ClaimCoverageMetrics, ClaimFactualSurface, CandidateClaimType } from './types';
import { positionalClaimId } from '../../../lib/story/claim-identity';

function cleanText(txt: string): string {
  return txt.replace(/\s+/g, ' ').trim();
}

function normalizeClaim(txt: string): string {
  return cleanText(txt)
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\b(a|an|the|is|are|was|were|in|on|at|of|to|for)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isFactualProposition(txt: string): boolean {
  const cleaned = cleanText(txt);
  if (!cleaned || cleaned.length < 15) return false;
  if (cleaned.endsWith('?')) return false; // Rhetorical question
  if (/^(overview|introduction|conclusion|summary|table of contents|sources|references)$/i.test(cleaned)) return false; // Heading
  return true;
}

export function extractMaterialClaims(story: Story, slug: string): { claims: MaterialClaimRecord[]; metrics: ClaimCoverageMetrics } {
  const candidates: MaterialClaimRecord[] = [];
  let claimCounter = 1;

  function addCandidate(surface: ClaimFactualSurface, text: string, type: CandidateClaimType, blockId?: string) {
    if (!isFactualProposition(text)) return;
    const norm = normalizeClaim(text);

    // Check for semantic duplicate restatement across extracted candidates
    const existing = candidates.find(c => c.normalizedText === norm || (norm.length > 20 && (c.normalizedText.includes(norm) || norm.includes(c.normalizedText))));
    if (existing) {
      return; // Skip duplicate restatement
    }

    candidates.push({
      id: `CLM-EXT-${slug.toUpperCase().slice(0, 8)}-${String(claimCounter++).padStart(3, '0')}`,
      surface,
      claimText: cleanText(text),
      normalizedText: norm,
      blockId,
      claimType: type,
      extractionMethod: 'AUTOMATED',
      status: 'CANDIDATE',
      isEvidenceLinked: false,
      isSourceLinked: false,
      linkedSourceCount: 0,
    });
  }

  // Surface 1: Headline
  if (story.headline) {
    addCandidate('headline', story.headline, 'FACTUAL_ASSERTION');
  }

  // Surface 2: Dek / Subtitle / Summary
  if (story.summary) {
    addCandidate('dek', story.summary, 'FACTUAL_ASSERTION');
  }

  // Surface 3 & 4: Quick Brief / Executive Summary / Key Points
  if (story.keyPoints) {
    story.keyPoints.forEach((kp, idx) => {
      addCandidate('key_takeaways', kp, 'FACTUAL_ASSERTION', `key-point-${idx}`);
    });
  }

  // Surface 5 & 6: Narrative Blocks & Orientation
  if (story.contentBlocks) {
    story.contentBlocks.forEach(b => {
      if (b.type === 'executive-summary' && b.data?.summary) {
        addCandidate('quick_brief', String(b.data.summary), 'FACTUAL_ASSERTION', b.id);
      } else if (b.type === 'key-numbers' && Array.isArray(b.data?.items)) {
        b.data.items.forEach((item: any, idx: number) => {
          addCandidate('key_numbers', `${item.label || ''}: ${item.value || ''} (Source: ${item.source || 'N/A'})`, 'NUMERIC', `${b.id}-${idx}`);
        });
      } else if (b.type === 'faq' && Array.isArray(b.data?.questions)) {
        b.data.questions.forEach((q: any, idx: number) => {
          addCandidate('faq', `Q: ${q.question} A: ${q.answer}`, 'FACTUAL_ASSERTION', `${b.id}-${idx}`);
        });
      }
    });
  }

  // Surface 7: Key Numbers / Facts Array
  if (story.facts) {
    story.facts.forEach((f, idx) => {
      addCandidate('key_numbers', `${f.label}: ${f.value}`, 'NUMERIC', `fact-${idx}`);
    });
  }

  // Surface 8: Claims Array in Story Object
  const registeredClaims = story.claims || [];
  registeredClaims.forEach((c, idx) => {
    addCandidate('narrative_block', c.claim, /\d+/.test(c.claim) ? 'NUMERIC' : /caused|led to|resulted/i.test(c.claim) ? 'CAUSAL' : 'FACTUAL_ASSERTION', positionalClaimId(slug, idx));
  });

  // Surface 9: Timeline Events
  if (story.timeline) {
    story.timeline.forEach((ev, idx) => {
      addCandidate('timeline', `[${ev.date}] ${ev.title}: ${ev.description}`, 'HISTORICAL_EVENT', `timeline-${idx}`);
    });
  }

  // Surface 10: Charts & Captions
  if (story.charts) {
    story.charts.forEach((chart, idx) => {
      addCandidate('chart_caption', `Chart: ${chart.title} (${chart.type})`, 'NUMERIC', `chart-${idx}`);
    });
  }

  // Surface 11 & 12: FAQ & Why-it-matters
  if (story.faq) {
    story.faq.forEach((q, idx) => {
      addCandidate('faq', `${q.question}: ${q.answer}`, 'FACTUAL_ASSERTION', `faq-${idx}`);
    });
  }

  // --- RECONCILIATION STEP ---
  // Confirm candidates and map against story registered claims and sources
  const confirmedClaims: MaterialClaimRecord[] = candidates.map(c => {
    // Check if matched in registered claims
    const registeredMatch = registeredClaims.find(rc => normalizeClaim(rc.claim).includes(c.normalizedText) || c.normalizedText.includes(normalizeClaim(rc.claim)));
    
    let isEvidenceLinked = false;
    let isSourceLinked = false;
    let linkedSourceCount = 0;
    let canonicalClaimId: string | undefined = undefined;

    if (registeredMatch) {
      canonicalClaimId = registeredMatch.id;
      isEvidenceLinked = !!registeredMatch.explanation || !!registeredMatch.source;
      isSourceLinked = !!registeredMatch.source || (story.sources && story.sources.length > 0);
      linkedSourceCount = registeredMatch.source ? 1 : (story.sources?.length || 0);
    } else {
      isSourceLinked = (story.sources && story.sources.length > 0);
      linkedSourceCount = story.sources?.length || 0;
    }

    const supportStrength = isEvidenceLinked && isSourceLinked ? 'STRONG' : isSourceLinked ? 'MODERATE' : 'UNSUPPORTED';

    return {
      ...c,
      status: 'CONFIRMED' as const,
      canonicalClaimId,
      registeredClaimMatch: registeredMatch ? { id: registeredMatch.id || canonicalClaimId || '', statement: registeredMatch.claim, confidence: registeredMatch.confidence } : undefined,
      isEvidenceLinked,
      isSourceLinked,
      linkedSourceCount,
      supportStrength,
    };
  });

  const registeredAndEvidenceLinked = confirmedClaims.filter(c => c.canonicalClaimId && c.isEvidenceLinked).length;
  const registeredButUnsupported = confirmedClaims.filter(c => c.canonicalClaimId && !c.isEvidenceLinked).length;
  const missingFromRegistry = confirmedClaims.filter(c => !c.canonicalClaimId).length;

  const metrics: ClaimCoverageMetrics = {
    totalFactualSurfacesScanned: 12,
    candidateClaimsExtracted: candidates.length,
    confirmedMaterialClaims: confirmedClaims.length,
    registeredCanonicalClaims: registeredClaims.length,
    registeredAndEvidenceLinked,
    registeredButUnsupported,
    materialClaimsMissingFromRegistry: missingFromRegistry,
    orphanEvidenceCount: 0, // Calculated during full audit
    orphanSourceCount: Math.max(0, (story.sources?.length || 0) - confirmedClaims.filter(c => c.isSourceLinked).length),
  };

  return { claims: confirmedClaims, metrics };
}
