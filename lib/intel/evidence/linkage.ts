import type { ConstituencyPrediction } from '@/lib/intel/predictions/types';
import type { ConstituencyIntelligence, ScoreKey } from '@/lib/intel/scoring/types';
import type { ConstituencyEvidence, EvidenceItem } from './types';

function patternMatches(pattern: string, field: string): boolean {
  if (pattern === field) return true;
  if (pattern.endsWith('_*')) {
    const prefix = pattern.slice(0, -1);
    return field.startsWith(prefix);
  }
  return false;
}

export function resolveSourceField(evidence: ConstituencyEvidence, sourceField: string): EvidenceItem[] {
  return evidence.items.filter((item) => patternMatches(sourceField, item.sourceField));
}

function scoreKeyFromSourceField(sourceField: string): ScoreKey | null {
  const clean = sourceField.replace('intel.scoring.', '').split('|')[0];
  const valid: ScoreKey[] = ['momentum', 'competitiveness', 'incumbency_risk', 'volatility', 'investigation_priority'];
  return (valid as string[]).includes(clean) ? (clean as ScoreKey) : null;
}

export interface PredictionEvidenceLink {
  factor: string;
  direction: string;
  sourceField: string;
  viaScore: ScoreKey | null;
  supporting: EvidenceItem[];
}

export function linkPredictionToEvidence(
  prediction: ConstituencyPrediction,
  intel: ConstituencyIntelligence,
  evidence: ConstituencyEvidence,
): PredictionEvidenceLink[] {
  return prediction.drivers.map((driver) => {
    const scoreKey = scoreKeyFromSourceField(driver.sourceField);

    let supporting: EvidenceItem[] = [];
    if (scoreKey) {
      const scoreDrivers = intel.scores[scoreKey].drivers;
      for (const sd of scoreDrivers) {
        supporting = supporting.concat(resolveSourceField(evidence, sd.sourceField));
      }
    } else {
      supporting = resolveSourceField(evidence, driver.sourceField);
    }

    return {
      factor: driver.factor,
      direction: driver.direction,
      sourceField: driver.sourceField,
      viaScore: scoreKey,
      supporting,
    };
  });
}

export function totalSupportingEvidence(links: PredictionEvidenceLink[]): number {
  return links.reduce((sum, link) => sum + link.supporting.length, 0);
}
