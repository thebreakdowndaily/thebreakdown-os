import type { ConstituencyRecord } from './types';
import { getCachedData } from './loader';

const SEARCHABLE_FIELDS: Array<{ key: keyof ConstituencyRecord; weight: number }> = [
  { key: 'constituency_name', weight: 10 },
  { key: 'district', weight: 8 },
  { key: 'division', weight: 7 },
  { key: 'region', weight: 5 },
  { key: 'current_mla_name', weight: 9 },
  { key: 'current_mp_name', weight: 9 },
  { key: 'current_mla_party', weight: 6 },
  { key: 'current_mp_party', weight: 6 },
  { key: 'dna_classification', weight: 4 },
  { key: 'odop_product', weight: 3 },
  { key: 'winner_2022', weight: 5 },
  { key: 'winner_2017', weight: 5 },
  { key: 'winner_2012', weight: 5 },
  { key: 'ls2024_pc_winner', weight: 5 },
  { key: 'winner_party_2022', weight: 4 },
  { key: 'winner_party_2017', weight: 4 },
  { key: 'winner_party_2012', weight: 4 },
  { key: 'governance_issue_summary', weight: 2 },
  { key: 'major_crops_summary', weight: 2 },
  { key: 'major_industries_summary', weight: 2 },
];

interface SearchResult {
  record: ConstituencyRecord;
  score: number;
  matchedFields: string[];
}

export function search(query: string, limit: number = 20, offset: number = 0): { results: SearchResult[]; total: number } {
  const d = getCachedData();
  const q = query.toLowerCase().trim();
  if (!q) return { results: [], total: 0 };

  const qTerms = q.split(/\s+/).filter(Boolean);
  const scored: SearchResult[] = [];

  for (const rec of d) {
    let totalScore = 0;
    const matchedFields: string[] = [];

    for (const { key, weight } of SEARCHABLE_FIELDS) {
      const val = rec[key];
      if (typeof val !== 'string' || !val) continue;
      const lower = val.toLowerCase();

      let matchScore = 0;
      if (lower === q) {
        matchScore = 100;
      } else if (lower.startsWith(q)) {
        matchScore = 50;
      } else if (lower.includes(q)) {
        matchScore = 25;
      } else {
        const allTermsMatch = qTerms.every(t => lower.includes(t));
        if (allTermsMatch) {
          matchScore = 10;
        } else {
          const someTermsMatch = qTerms.some(t => lower.includes(t));
          if (someTermsMatch) matchScore = 5;
        }
      }

      if (matchScore > 0) {
        totalScore += matchScore * weight;
        matchedFields.push(key as string);
      }
    }

    if (totalScore > 0) {
      scored.push({ record: rec, score: totalScore, matchedFields });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const total = scored.length;
  const sliced = scored.slice(offset, offset + limit);
  return { results: sliced, total };
}
