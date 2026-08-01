import { promises as fs } from 'fs';
import path from 'path';
import type { ConstituencyRecord, FilterOptions } from './types';

const DATA_PATH = path.join(process.cwd(), 'data', 'master-dataset-v1', 'v1.1.0', 'up403-master-dataset-v1.json');

let data: ConstituencyRecord[] | null = null;
let dataById: Map<string, ConstituencyRecord> | null = null;
let filterOptions: FilterOptions | null = null;
let peopleIndex: Map<string, Set<string>> | null = null;

export async function loadData(): Promise<ConstituencyRecord[]> {
  if (data) return data;
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  data = JSON.parse(raw) as ConstituencyRecord[];
  return data;
}

export function getCachedData(): ConstituencyRecord[] {
  if (!data) throw new Error('Data not loaded. Call loadData() first.');
  return data;
}

export function getDataById(): Map<string, ConstituencyRecord> {
  if (dataById) return dataById;
  const d = getCachedData();
  dataById = new Map();
  for (const rec of d) {
    dataById.set(rec.canonical_constituency_id, rec);
  }
  return dataById;
}

export function getFilterOptions(): FilterOptions {
  if (filterOptions) return filterOptions;
  const d = getCachedData();
  const districts = new Set<string>();
  const divisions = new Set<string>();
  const regions = new Set<string>();
  const reservationTypes = new Set<string>();
  const dnaClassifications = new Set<string>();
  const competitivenessClasses = new Set<string>();
  const parties = new Set<string>();

  for (const rec of d) {
    if (rec.district) districts.add(rec.district);
    if (rec.division) divisions.add(rec.division);
    if (rec.region) regions.add(rec.region);
    if (rec.reservation_type) reservationTypes.add(rec.reservation_type);
    if (rec.dna_classification) dnaClassifications.add(rec.dna_classification);
    if (rec.competitiveness_class) competitivenessClasses.add(rec.competitiveness_class);
    if (rec.current_mla_party) parties.add(rec.current_mla_party);
    if (rec.current_mp_party) parties.add(rec.current_mp_party);
    if (rec.winner_party_2022) parties.add(rec.winner_party_2022);
    if (rec.winner_party_2017) parties.add(rec.winner_party_2017);
    if (rec.winner_party_2012) parties.add(rec.winner_party_2012);
    if (rec.ls2024_pc_winner_party) parties.add(rec.ls2024_pc_winner_party);
  }

  filterOptions = {
    districts: [...districts].sort(),
    divisions: [...divisions].sort(),
    regions: [...regions].sort(),
    reservation_types: [...reservationTypes].sort(),
    dna_classifications: [...dnaClassifications].sort(),
    competitiveness_classes: [...competitivenessClasses].sort(),
    parties: [...parties].sort(),
    election_years: [2012, 2017, 2022],
  };
  return filterOptions;
}

export function buildPeopleIndex(): Map<string, Set<string>> {
  if (peopleIndex) return peopleIndex;
  const d = getCachedData();
  peopleIndex = new Map();

  for (const rec of d) {
    const names: Array<{ name: string; role: string }> = [
      { name: rec.current_mla_name, role: 'MLA' },
      { name: rec.current_mp_name, role: 'MP' },
      { name: rec.winner_2022, role: 'MLA' },
      { name: rec.runner_up_2022, role: 'MLA' },
      { name: rec.winner_2017, role: 'MLA' },
      { name: rec.runner_up_2017, role: 'MLA' },
      { name: rec.winner_2012, role: 'MLA' },
      { name: rec.runner_up_2012, role: 'MLA' },
      { name: rec.ls2024_pc_winner, role: 'MP' },
    ];

    for (const { name } of names) {
      if (!name || name.trim() === '') continue;
      const key = name.toLowerCase().trim();
      if (!peopleIndex.has(key)) {
        peopleIndex.set(key, new Set());
      }
      const bucket = peopleIndex.get(key);
      if (bucket) bucket.add(rec.canonical_constituency_id);
    }
  }

  return peopleIndex;
}

export function getPersonConstituencies(personName: string): string[] {
  const idx = buildPeopleIndex();
  const key = personName.toLowerCase().trim();
  const ids = idx.get(key);
  return ids ? [...ids] : [];
}

export function searchPeople(query: string): string[] {
  const idx = buildPeopleIndex();
  const q = query.toLowerCase().trim();
  const results: string[] = [];
  for (const [name] of idx) {
    if (name.includes(q)) {
      results.push(name);
    }
  }
  return results.slice(0, 50);
}

export function getDatasetVersion(): string {
  const d = getCachedData();
  return d[0]?.master_dataset_version || '1.1.0';
}

export function getResearchCutoff(): string {
  const d = getCachedData();
  return d[0]?.research_cutoff_date || '2026-07-30';
}

export function getTotalConstituencies(): number {
  return getCachedData().length;
}

export function paginate<T>(items: T[], page: number, limit: number): { items: T[]; total: number; page: number; limit: number } {
  const total = items.length;
  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit);
  return { items: paged, total, page, limit };
}

export function stableSort<T>(items: T[], key: (item: T) => string | number): T[] {
  return [...items].sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    if (ka < kb) return -1;
    if (ka > kb) return 1;
    return 0;
  });
}
