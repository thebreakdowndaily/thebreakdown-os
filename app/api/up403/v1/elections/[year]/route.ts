import { loadData, getCachedData, stableSort } from '@/lib/up403/loader';
import { okResponse, notFoundResponse, shouldIncludeProvenance } from '@/lib/up403/response';
import { getApiProvenance } from '@/lib/up403/provenance';

const VALID_YEARS = ['2012', '2017', '2022', '2024-overlay'];

export async function GET(
  request: Request,
  context: { params: Promise<{ year: string }> }
) {
  await loadData();
  const { year } = await context.params;
  const url = new URL(request.url);
  const includeProv = shouldIncludeProvenance(url);

  if (!VALID_YEARS.includes(year)) {
    return notFoundResponse(`Invalid year '${year}'. Valid years: ${VALID_YEARS.join(', ')}`);
  }

  const d = getCachedData();

  if (year === '2024-overlay') {
    const sorted = stableSort(d, r => r.ac_number);
    const data = sorted.map(rec => {
      const obj: Record<string, unknown> = {
        canonical_constituency_id: rec.canonical_constituency_id,
        constituency_name: rec.constituency_name,
        district: rec.district,
        pc_name: rec.pc_name,
        ls2024_pc_winner: rec.ls2024_pc_winner,
        ls2024_pc_winner_party: rec.ls2024_pc_winner_party,
        ls2024_winner_changed_flag: rec.ls2024_winner_changed_flag,
        ls2024_party_changed_flag: rec.ls2024_party_changed_flag,
        current_mp_name: rec.current_mp_name,
        current_mp_party: rec.current_mp_party,
        current_mp_term_start: rec.current_mp_term_start,
        current_mp_term_end: rec.current_mp_term_end,
      };
      if (includeProv) obj._provenance = getApiProvenance(rec);
      return obj;
    });
    return okResponse(data, { count: data.length, year: '2024-overlay', type: 'Lok Sabha' });
  }

  const y = parseInt(year, 10);
  const winnerKey = `winner_${y}` as keyof typeof d[0];
  const partyKey = `winner_party_${y}` as keyof typeof d[0];
  const votesKey = `winner_votes_${y}` as keyof typeof d[0];
  const shareKey = `winner_vote_share_${y}` as keyof typeof d[0];
  const runnerKey = `runner_up_${y}` as keyof typeof d[0];
  const runnerPartyKey = `runner_up_party_${y}` as keyof typeof d[0];
  const marginKey = `victory_margin_pct_${y}` as keyof typeof d[0];
  const totalVotesKey = `total_valid_votes_${y}` as keyof typeof d[0];
  const candidatesKey = `total_candidates_${y}` as keyof typeof d[0];

  const sorted = stableSort(d, r => r.ac_number);
  const records = sorted.map(rec => {
    const obj: Record<string, unknown> = {
      canonical_constituency_id: rec.canonical_constituency_id,
      constituency_name: rec.constituency_name,
      district: rec.district,
      pc_name: rec.pc_name,
      winner: rec[winnerKey],
      winner_party: rec[partyKey],
      winner_votes: rec[votesKey],
      winner_vote_share: rec[shareKey],
      runner_up: rec[runnerKey],
      runner_up_party: rec[runnerPartyKey],
      victory_margin_pct: rec[marginKey],
      total_valid_votes: rec[totalVotesKey],
      total_candidates: rec[candidatesKey],
    };
    if (includeProv) obj._provenance = getApiProvenance(rec);
    return obj;
  });

  return okResponse(records, { count: records.length, year: y, type: 'Vidhan Sabha' });
}
