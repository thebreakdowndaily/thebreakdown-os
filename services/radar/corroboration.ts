/**
 * ─── Radar Independence & Wire Corroboration Engine ──────────────────────────
 *
 * Enforces editorial independence standards from AGENTS.md & RIE Operating Standard:
 * - 10 wire syndications (e.g. PTI / ANI) must count as ONE source, not 10 independent sources.
 * - Primary official sources (Gazettes, High Court, Police) provide absolute confirmation.
 * - Secondary media must show independent reporting to satisfy corroboration gates.
 */

export interface SourceCorroborationInput {
  sourceId: string;
  publisher?: string;
  sourceTier?: string; // t1..t5
  isPrimary?: boolean;
  syndicatedFrom?: string;
  contentSnippet?: string;
}

export interface ClusterCorroborationResult {
  primarySourceCount: number;
  independentSourceCount: number;
  wireOrigins: string[];
  isCorroborated: boolean;
  corroborationLevel: 'OFFICIAL_CONFIRMED' | 'INDEPENDENT_CORROBORATED' | 'SINGLE_SOURCE' | 'SYNDICATED_SINGLE_ORIGIN';
}

const WIRE_PATTERNS: Array<{ id: string; name: string; pattern: RegExp }> = [
  { id: 'wire:pti', name: 'PTI', pattern: /\b(?:PTI|\(PTI\)|Press Trust of India)\b/i },
  { id: 'wire:ani', name: 'ANI', pattern: /\b(?:ANI|\(ANI\)|Asian News International)\b/i },
  { id: 'wire:uni', name: 'UNI', pattern: /\b(?:UNI|\(UNI\)|United News of India)\b/i },
  { id: 'wire:reuters', name: 'Reuters', pattern: /\b(?:Reuters|\(Reuters\))\b/i },
  { id: 'wire:ians', name: 'IANS', pattern: /\b(?:IANS|\(IANS\)|Indo-Asian News Service)\b/i },
];

/**
 * Detects whether content has explicit wire byline attribution.
 */
export function detectWireByline(content?: string): string | null {
  if (!content) return null;
  for (const wire of WIRE_PATTERNS) {
    if (wire.pattern.test(content)) {
      return wire.id;
    }
  }
  return null;
}

/**
 * Calculates effective publisher and independence across all reporting sources.
 */
export function evaluateClusterCorroboration(
  sources: SourceCorroborationInput[]
): ClusterCorroborationResult {
  if (sources.length === 0) {
    return {
      primarySourceCount: 0,
      independentSourceCount: 0,
      wireOrigins: [],
      isCorroborated: false,
      corroborationLevel: 'SINGLE_SOURCE',
    };
  }

  let primaryCount = 0;
  const independentEntities = new Set<string>();
  const detectedWires = new Set<string>();

  for (const s of sources) {
    if (s.isPrimary || s.sourceTier === 't1') {
      primaryCount++;
      independentEntities.add(`primary:${s.sourceId}`);
      continue;
    }

    // Check for wire syndication
    const wireId = s.syndicatedFrom || detectWireByline(s.contentSnippet);
    if (wireId) {
      detectedWires.add(wireId);
      independentEntities.add(wireId); // All reposts of wire:pti collapse to one entity
    } else {
      // Independent media outlet
      const pubKey = (s.publisher || s.sourceId).trim().toLowerCase();
      independentEntities.add(`pub:${pubKey}`);
    }
  }

  const independentSourceCount = independentEntities.size;
  const wireOrigins = Array.from(detectedWires);

  let corroborationLevel: ClusterCorroborationResult['corroborationLevel'] = 'SINGLE_SOURCE';
  let isCorroborated = false;

  if (primaryCount >= 1) {
    corroborationLevel = 'OFFICIAL_CONFIRMED';
    isCorroborated = true;
  } else if (independentSourceCount >= 2) {
    corroborationLevel = 'INDEPENDENT_CORROBORATED';
    isCorroborated = true;
  } else if (wireOrigins.length > 0 && sources.length > 1) {
    corroborationLevel = 'SYNDICATED_SINGLE_ORIGIN';
    isCorroborated = false;
  }

  return {
    primarySourceCount: primaryCount,
    independentSourceCount,
    wireOrigins,
    isCorroborated,
    corroborationLevel,
  };
}
