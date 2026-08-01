import { loadData, getCachedData, paginate, stableSort } from '@/lib/up403/loader';
import { okResponse, badRequestResponse, parsePagination, shouldIncludeProvenance } from '@/lib/up403/response';
import { getApiProvenance } from '@/lib/up403/provenance';
import type { ConstituencyRecord, ApiProvenance } from '@/lib/up403/types';

export async function GET(request: Request) {
  await loadData();
  const url = new URL(request.url);
  const { page, limit } = parsePagination(url);
  const includeProv = shouldIncludeProvenance(url);

  let records = [...getCachedData()];

  const search = url.searchParams.get('search');
  if (search) {
    const q = search.toLowerCase().trim();
    records = records.filter(r =>
      r.constituency_name.toLowerCase().includes(q) ||
      r.district.toLowerCase().includes(q) ||
      r.division.toLowerCase().includes(q) ||
      r.current_mla_name?.toLowerCase().includes(q) ||
      r.current_mp_name?.toLowerCase().includes(q)
    );
  }

  const district = url.searchParams.get('district');
  if (district) records = records.filter(r => r.district.toLowerCase() === district.toLowerCase());

  const division = url.searchParams.get('division');
  if (division) records = records.filter(r => r.division.toLowerCase() === division.toLowerCase());

  const region = url.searchParams.get('region');
  if (region) records = records.filter(r => r.region.toLowerCase() === region.toLowerCase());

  const reservation = url.searchParams.get('reservation');
  if (reservation) records = records.filter(r => r.reservation_type.toLowerCase() === reservation.toLowerCase());

  const party = url.searchParams.get('party');
  if (party) {
    const q = party.toLowerCase();
    records = records.filter(r =>
      r.current_mla_party?.toLowerCase() === q ||
      r.current_mp_party?.toLowerCase() === q ||
      r.winner_party_2022?.toLowerCase() === q
    );
  }

  const politicalDna = url.searchParams.get('political_dna');
  if (politicalDna) records = records.filter(r => r.dna_classification.toLowerCase() === politicalDna.toLowerCase());

  const competitiveness = url.searchParams.get('competitiveness');
  if (competitiveness) records = records.filter(r => r.competitiveness_class.toLowerCase() === competitiveness.toLowerCase());

  records = stableSort(records, r => r.ac_number);

  const { items, total } = paginate(records, page, limit);

  const data = items.map(rec => ({
    ...rec,
    ...(includeProv ? { _provenance: getApiProvenance(rec) } : {}),
  }));

  return okResponse(data, {
    count: items.length,
    page,
    limit,
    total,
    filters_applied: {
      search: search || null,
      district: district || null,
      division: division || null,
      region: region || null,
      reservation: reservation || null,
      party: party || null,
      political_dna: politicalDna || null,
      competitiveness: competitiveness || null,
    },
  });
}
