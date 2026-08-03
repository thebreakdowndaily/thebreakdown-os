import type { ChecklistItem, ChecklistStatus } from './types';
import type { SeatFacts } from './facts';

// Governing document: docs/intelligence/roadmap.md (Part 8 — Journalist Toolkit)

function item(id: string, label: string, status: ChecklistStatus, detail: string): ChecklistItem {
  return { id, label, status, detail };
}

export function buildChecklist(facts: SeatFacts): ChecklistItem[] {
  const rec = facts.record;
  const ev = facts.evidence;
  const items: ChecklistItem[] = [];

  const hasElectionData = ev.items.some((i) => i.status === 'available' && i.category === 'official_election_data');
  items.push(item(
    'historical',
    'Historical elections reviewed',
    hasElectionData ? 'done' : 'todo',
    hasElectionData ? facts.historyLine : 'No recorded election results to review',
  ));

  items.push(item(
    'prediction',
    'Prediction reviewed',
    'done',
    `${facts.predictedWinner} at ${String(facts.predictedProb)}% (CI ${String(facts.prediction.winner_ci[0])}–${String(facts.prediction.winner_ci[1])}%)`,
  ));

  items.push(item(
    'scenarios',
    'Scenario analysis reviewed',
    'done',
    'Per-seat flip risk computed from all scenario definitions',
  ));

  items.push(item(
    'research',
    'Research reviewed',
    'done',
    `Evidence coverage ${String(ev.coverage)}% across ${String(ev.items.length)} registered fields`,
  ));

  items.push(item(
    'evidence',
    'Evidence reviewed',
    'done',
    `${String(ev.items.filter((i) => i.status === 'available').length)} available evidence nodes linked to this seat`,
  ));

  const verified = rec.verification_date ? `Verified on ${rec.verification_date}` : 'No verification date recorded';
  items.push(item(
    'sources',
    'Sources verified',
    rec.verification_date ? 'done' : 'warning',
    verified,
  ));

  const devGap = ev.categoryCoverage.find((c) => c.category === 'development_indicators');
  items.push(item(
    'dev-indicators',
    'Missing development indicators',
    devGap && devGap.pct < 100 ? 'warning' : 'todo',
    devGap && devGap.pct < 100 ? `${String(devGap.available)}/${String(devGap.total)} development fields present — ${devGap.label} gap requires field reporting` : 'Development indicators complete',
  ));

  const healthGap = ev.items.find((i) => i.sourceField === 'district_hospitals_count' && i.status === 'gap');
  items.push(item(
    'health',
    'Missing health indicators',
    healthGap ? 'warning' : 'todo',
    healthGap ? 'Hospital/PHC/CHC counts are not available at constituency level' : 'Health indicators present',
  ));

  const eduGap = ev.items.find((i) => i.sourceField === 'government_schools_count' && i.status === 'gap');
  items.push(item(
    'education',
    'Missing education indicators',
    eduGap ? 'warning' : 'todo',
    eduGap ? 'School and college counts are not available at constituency level' : 'Education indicators present',
  ));

  items.push(item(
    'local-verification',
    'Local verification',
    ev.debt > 0 ? 'warning' : 'todo',
    ev.debt > 0 ? `${String(ev.debt)} registered evidence gaps need ground verification` : 'No evidence gaps registered',
  ));

  return items;
}
