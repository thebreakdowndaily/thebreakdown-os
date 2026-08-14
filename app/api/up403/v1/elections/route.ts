import { loadData, getCachedData } from '@/lib/up403/loader';
import { okResponse } from '@/lib/up403/response';

export async function GET(request: Request) {
  await loadData();
  const d = getCachedData();

  const constituency = request.url ? new URL(request.url).searchParams.get('constituency') : null;

  let filtered = d;
  if (constituency) {
    filtered = d.filter(r =>
      r.canonical_constituency_id === constituency || r.constituency_name.toLowerCase().includes(constituency.toLowerCase())
    );
  }

  const years = [2012, 2017, 2022];
  const elections = years.map(year => {
    const winnerKey = `winner_party_${String(year)}` as keyof typeof d[0];
    const validKey = `total_valid_votes_${String(year)}` as keyof typeof d[0];

    const partyCounts: Record<string, number> = {};
    let totalValid = 0;

    for (const rec of filtered) {
      const party = rec[winnerKey] as string;
      if (party) partyCounts[party] = (partyCounts[party] || 0) + 1;
      totalValid += (rec[validKey] as number) || 0;
    }

    return {
      year,
      label: `${String(year)} Uttar Pradesh Vidhan Sabha Election`,
      type: 'Vidhan Sabha',
      constituencies_contested: filtered.length,
      total_valid_votes: totalValid,
      winner_parties: Object.fromEntries(
        Object.entries(partyCounts).sort((a, b) => b[1] - a[1])
      ),
    };
  });

  const ls2024PartyCounts: Record<string, number> = {};
  for (const rec of filtered) {
    if (rec.ls2024_pc_winner_party) {
      ls2024PartyCounts[rec.ls2024_pc_winner_party] = (ls2024PartyCounts[rec.ls2024_pc_winner_party] || 0) + 1;
    }
  }

  elections.push({
    year: 2024,
    label: '2024 Lok Sabha Election (overlay)',
    type: 'Lok Sabha',
    constituencies_contested: filtered.length,
    total_valid_votes: 0,
    winner_parties: Object.fromEntries(
      Object.entries(ls2024PartyCounts).sort((a, b) => b[1] - a[1])
    ),
  });

  return okResponse(elections);
}
