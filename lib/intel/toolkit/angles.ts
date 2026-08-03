import type { ConfidenceTier } from '@/lib/intel/scoring/types';
import type { StoryAngle, InterviewPersona } from './types';
import type { SeatFacts } from './facts';

// Governing document: docs/intelligence/roadmap.md (Part 8 — Journalist Toolkit)
// Every angle is derived from a real signal. Angles for missing data are labelled
// as gap-driven: they state the absence of data, never an assumed fact.

interface AngleCandidate {
  id: string;
  title: string;
  whyItMatters: string;
  evidenceUsed: string[];
  confidence: ConfidenceTier;
  suggestedInterviews: InterviewPersona[];
  suggestedDocuments: string[];
  suggestedFieldReporting: string[];
}

function confidenceFromScore(value: number): ConfidenceTier {
  if (value >= 75) return 'HIGH';
  if (value >= 50) return 'MEDIUM';
  return 'LOW';
}

export function buildStoryAngles(facts: SeatFacts): StoryAngle[] {
  const angles: AngleCandidate[] = [];
  const rec = facts.record;
  const ev = facts.evidence;
  const comp = facts.intel.scores.competitiveness;
  const momentum = facts.intel.scores.momentum;
  const incRisk = facts.intel.scores.incumbency_risk;

  // 1. Election competitiveness — always, from competitiveness score
  const compStory: AngleCandidate = {
    id: 'competitiveness',
    title: `How competitive is this seat really? (score ${String(comp.value)}/100)`,
    whyItMatters: comp.interpretation,
    evidenceUsed: [
      `Competitiveness score ${String(comp.value)}/100 (confidence ${comp.confidence.replace('_', ' ')}): ${comp.confidenceReason}`,
      `Classification: ${rec.competitiveness_class || 'not recorded'}`,
      `Average margin: ${String(rec.competitiveness_avg_margin_pct || 0)}%`,
    ],
    confidence: confidenceFromScore(comp.value),
    suggestedInterviews: ['MLA', 'election_official', 'civil_society'],
    suggestedDocuments: ['ECI official results 2012/2017/2022'],
    suggestedFieldReporting: ['Visit polling booths with narrow recorded margins and ask voters what decided their vote'],
  };
  angles.push(compStory);

  // 2. Development gap — always true for the frozen dataset
  const dev = ev.categoryCoverage.find((c) => c.category === 'development_indicators');
  const devStory: AngleCandidate = {
    id: 'development-gap',
    title: 'The development data gap: what official records do not say',
    whyItMatters: 'Constituency-level demographics, economy, and infrastructure are not available in the frozen dataset. The absence of public data is itself a reporting subject.',
    evidenceUsed: dev
      ? [`${dev.label}: ${String(dev.available)}/${String(dev.total)} fields present (${String(dev.pct)}%)`]
      : ['Development indicators registered as gaps'],
    confidence: 'HIGH',
    suggestedInterviews: ['district_admin', 'village_head', 'teacher', 'doctor'],
    suggestedDocuments: ['Census of India 2011 PCA tables', 'District statistical handbooks', 'RTI requests for scheme data'],
    suggestedFieldReporting: ['Collect district-level development figures and test whether they are published at constituency level'],
  };
  angles.push(devStory);

  // 3. Changing political alignment — conditional on realignment signals
  const dnaRealigned = (rec.dna_classification || '').includes('REALIGNMENT');
  const trajectoryShifts = rec.trajectory_total_shifts || 0;
  if (dnaRealigned || trajectoryShifts > 1 || facts.ls2024Changed) {
    angles.push({
      id: 'alignment',
      title: `Changing political alignment (${rec.dna_classification || 'realignment signals'})`,
      whyItMatters: 'The seat has shown party-turnover signals that the current winner may not persist.',
      evidenceUsed: [
        `DNA classification: ${rec.dna_classification || 'n/a'} — ${rec.dna_reasoning || 'no reasoning recorded'}`,
        `Trajectory shifts: ${String(trajectoryShifts)}`,
        facts.ls2024Changed ? `LS2024 segment changed party to ${facts.ls2024Party}` : 'LS2024 segment unchanged',
      ],
      confidence: confidenceFromScore(Math.max(incRisk.value, momentum.value)),
      suggestedInterviews: ['MLA', 'civil_society', 'village_head'],
      suggestedDocuments: ['Election results by booth', 'Party switch affidavits'],
      suggestedFieldReporting: ['Interview voters who changed their party across the last two cycles'],
    });
  }

  // 4. Alliance dynamics — conditional on coalition-relevant runner-up
  const coalitionRunner = ['SP', 'INC', 'RLD', 'BSP'].includes(facts.runnerUpParty);
  if (coalitionRunner || facts.ls2024Changed) {
    angles.push({
      id: 'alliance',
      title: `Alliance arithmetic in the contest (runner-up ${facts.runnerUpParty || 'n/a'})`,
      whyItMatters: `The runner-up is ${facts.runnerUpParty || 'unrecorded'}. Coalition seat-sharing decides whether the projected winner holds.`,
      evidenceUsed: [
        `2022 runner-up: ${facts.runnerUpParty || 'n/a'} (${facts.runnerUpName || 'name not recorded'})`,
        `2022 margin: ${String(rec.victory_margin_pct_2022 || 0)}%`,
        facts.ls2024Changed ? `LS2024 segment moved to ${facts.ls2024Party}` : 'LS2024 segment unchanged',
      ],
      confidence: confidenceFromScore(comp.value),
      suggestedInterviews: ['MP', 'civil_society'],
      suggestedDocuments: ['Coalition seat-sharing statements', '2022 ECI result sheets'],
      suggestedFieldReporting: ['Ask candidates how alliance partners would transfer votes in this seat'],
    });
  }

  // 5. Regional trend — always, from region + LS segment
  angles.push({
    id: 'regional',
    title: `Regional context: ${rec.region}`,
    whyItMatters: `The seat sits in ${rec.region}${rec.pc_name ? ` under the ${rec.pc_name} LS segment` : ''}. Regional swings can override local signals.`,
    evidenceUsed: [
      `Region: ${rec.region}`,
      rec.pc_name ? `LS segment: ${rec.pc_name}` : '',
      `Current MP: ${rec.current_mp_name || 'not recorded'} (${rec.current_mp_party || 'party not recorded'})`,
      facts.ls2024Party ? `LS2024 winner: ${facts.ls2024Party}` : '',
    ].filter(Boolean),
    confidence: confidenceFromScore(momentum.value),
    suggestedInterviews: ['MP', 'civil_society', 'business_owner'],
    suggestedDocuments: ['Regional election analysis', 'LS2024 result by assembly segment'],
    suggestedFieldReporting: ['Compare this seat to neighbouring seats in the same region'],
  });

  // 6. Historical voting pattern — always
  angles.push({
    id: 'history',
    title: `What ${facts.historyLine} says about the next cycle`,
    whyItMatters: 'Long-run winners and margins define the baseline a challenger must overcome.',
    evidenceUsed: [
      `History: ${facts.historyLine}`,
      `Most persistent party: ${rec.most_persistent_party || 'n/a'}`,
      `Seat volatility index: ${String(rec.seat_volatility_index || 0)}`,
    ],
    confidence: confidenceFromScore(50 + Math.abs(facts.predictedProb - 50)),
    suggestedInterviews: ['MLA', 'election_official'],
    suggestedDocuments: ['ECI results 2012/2017/2022'],
    suggestedFieldReporting: ['Map turnout and winner margins over the three recorded elections'],
  });

  // 7. Candidate comparison — conditional on a distinct runner-up
  if (facts.runnerUpParty && facts.runnerUpParty !== facts.incumbentParty) {
    angles.push({
      id: 'candidate',
      title: `Incumbent ${facts.incumbentParty} vs runner-up ${facts.runnerUpParty}`,
      whyItMatters: 'A direct comparison of the two leading contenders frames voter choice.',
      evidenceUsed: [
        `2022 winner: ${facts.incumbentParty} (${facts.incumbentName})`,
        `2022 runner-up: ${facts.runnerUpParty} (${facts.runnerUpName})`,
        `2022 margin: ${String(rec.victory_margin_pct_2022 || 0)}%`,
        `Prediction: ${facts.predictedWinner} at ${String(facts.predictedProb)}%`,
      ],
      confidence: confidenceFromScore(comp.value),
      suggestedInterviews: ['MLA', 'civil_society', 'business_owner'],
      suggestedDocuments: ['Candidate affidavits', '2022 ECI result sheets'],
      suggestedFieldReporting: ['Compare public commitments versus delivered outcomes for both camps'],
    });
  }

  // 8. Governance / incumbent record — derived from governance fields (may be gaps)
  const governanceGap = ev.items.find((i) => i.sourceField === 'governance_issue_summary' && i.status === 'gap');
  angles.push({
    id: 'governance',
    title: `Incumbent governance record: verifiable outcomes vs recorded gaps`,
    whyItMatters: `Incumbency risk is ${String(incRisk.value)}/100. The record of the sitting MLA is the core test of the re-election claim.`,
    evidenceUsed: [
      `Incumbency risk score ${String(incRisk.value)}/100: ${incRisk.confidenceReason}`,
      governanceGap ? 'Governance issue summaries are registered as gaps in the frozen dataset' : `Governance issues: ${String(rec.governance_issue_count || 0)} recorded`,
    ],
    confidence: confidenceFromScore(incRisk.value),
    suggestedInterviews: ['MLA', 'village_head', 'district_admin'],
    suggestedDocuments: ['MLA question-hour records', 'Scheme-wise fund utilisation', 'District grievance logs'],
    suggestedFieldReporting: ['Verify two or three flagship-project sites in the constituency'],
  });

  // 9. Momentum shift
  angles.push({
    id: 'momentum',
    title: `Momentum signal: is the seat trending toward ${facts.predictedWinner}? (score ${String(momentum.value)}/100)`,
    whyItMatters: momentum.interpretation,
    evidenceUsed: momentum.drivers.slice(0, 3).map((d) => d.evidence),
    confidence: confidenceFromScore(momentum.value),
    suggestedInterviews: ['youth', 'business_owner', 'farmer'],
    suggestedDocuments: ['Latest opinion/electoral analysis', 'LS2024 segment results'],
    suggestedFieldReporting: ['Ask recent vote-share movers what changed their view'],
  });

  return angles.map((a) => ({
    id: a.id,
    title: a.title,
    whyItMatters: a.whyItMatters,
    evidenceUsed: a.evidenceUsed,
    confidence: a.confidence,
    suggestedInterviews: a.suggestedInterviews,
    suggestedDocuments: a.suggestedDocuments,
    suggestedFieldReporting: a.suggestedFieldReporting,
  }));
}
