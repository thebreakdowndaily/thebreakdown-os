import type { ConstituencyRecord, TimelineEvent } from './types';

export function buildTimeline(rec: ConstituencyRecord): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  if (rec.winner_2012) {
    events.push({
      date: '2012',
      type: 'election',
      description: `${rec.winner_2012} (${rec.winner_party_2012}) won with ${String(rec.winner_vote_share_2012)}% vote share`,
      category: 'election',
    });
  }

  if (rec.winner_2017) {
    const changed = rec.winner_2012 && rec.winner_party_2017 !== rec.winner_party_2012;
    events.push({
      date: '2017',
      type: 'election',
      description: `${rec.winner_2017} (${rec.winner_party_2017}) won with ${String(rec.winner_vote_share_2017)}% vote share${changed ? ' — party changed from ' + rec.winner_party_2012 : ''}`,
      category: 'election',
    });
  }

  if (rec.winner_2022) {
    const changed = rec.winner_2017 && rec.winner_party_2022 !== rec.winner_party_2017;
    events.push({
      date: '2022',
      type: 'election',
      description: `${rec.winner_2022} (${rec.winner_party_2022}) won with ${String(rec.winner_vote_share_2022)}% vote share${changed ? ' — party changed from ' + rec.winner_party_2017 : ''}`,
      category: 'election',
    });
  }

  if (rec.ls2024_pc_winner) {
    events.push({
      date: '2024',
      type: 'lok_sabha_election',
      description: `${rec.ls2024_pc_winner} (${rec.ls2024_pc_winner_party}) won Lok Sabha seat${rec.ls2024_party_changed_flag ? ' — party changed' : ''}`,
      category: 'election',
    });
  }

  if (rec.current_mla_name) {
    const via = rec.current_mla_elected_via === 'BY_ELECTION' ? ' (by-election)' : '';
    events.push({
      date: rec.current_mla_by_election_date || '2022',
      type: 'representation',
      description: `${rec.current_mla_name} (${rec.current_mla_party}) serving as MLA${via}`,
      category: 'representation',
    });
  }

  if (rec.current_mla_vacancy_reason && rec.current_mla_previous_representative) {
    events.push({
      date: rec.current_mla_by_election_date || 'unknown',
      type: 'vacancy',
      description: `Vacancy created: ${rec.current_mla_vacancy_reason} (previous: ${rec.current_mla_previous_representative})`,
      category: 'vacancy',
    });
  }

  if (rec.current_mla_elected_via === 'BY_ELECTION') {
    events.push({
      date: rec.current_mla_by_election_date || 'unknown',
      type: 'by_election',
      description: `By-election held: ${rec.current_mla_name} (${rec.current_mla_party}) elected`,
      category: 'by_election',
    });
  }

  if (rec.governance_issue_count > 0 && rec.governance_issue_summary) {
    events.push({
      date: rec.research_cutoff_date,
      type: 'governance',
      description: `${String(rec.governance_issue_count)} governance issue(s): ${rec.governance_issue_summary.slice(0, 200)}`,
      category: 'governance',
    });
  }

  events.sort((a, b) => {
    const da = a.date.replace(/[^0-9]/g, '');
    const db = b.date.replace(/[^0-9]/g, '');
    return da.localeCompare(db) || 0;
  });

  return events;
}
