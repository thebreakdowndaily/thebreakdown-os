import type { FieldPack } from './types';
import type { SeatFacts } from './facts';

// Governing document: docs/intelligence/roadmap.md (Part 8 — Journalist Toolkit)
// Places, documents, and travel notes are derived from what exists in the frozen
// dataset. Where no data exists, the pack states the unknown and asks for field
// confirmation — it never fabricates locations or distances.

export function buildFieldPack(facts: SeatFacts): FieldPack {
  const rec = facts.record;
  const ev = facts.evidence;

  const placesToVisit = [
    `${rec.district || 'District'} district headquarters (administrative hub for ${rec.constituency_name || 'the constituency'})`,
    rec.pc_name ? `${rec.pc_name} Lok Sabha segment offices` : '',
    'Block development office(s) for scheme verification',
    'Polling booths across the constituency (for turnout and infrastructure checks)',
  ].filter(Boolean);

  const peopleToInterview = [
    facts.incumbentName ? `${facts.incumbentName} (${facts.incumbentParty || 'MLA'}) — sitting MLA` : 'Sitting MLA',
    rec.current_mp_name ? `${rec.current_mp_name} (${rec.current_mp_party || 'MP'}) — Lok Sabha MP` : 'Lok Sabha MP',
    'District Magistrate / District Development Officer',
    'District Election Officer / Returning Officer',
    'Farmers, business owners, teachers, doctors, women and youth residents',
    'Village head (Pradhan) and civil-society representatives',
  ].filter(Boolean);

  const documentsToCollect = [
    'ECI official result sheets 2012 / 2017 / 2022 for the constituency',
    'Candidate affidavit for the sitting MLA',
    'Census of India 2011 PCA tables (district level)',
    'Data.gov.in flagship scheme datasets (PMGSY, Jal Jeevan, PMAY)',
    'District grievance and scheme-utilisation reports',
    'RTI responses for any unfilled data gap',
  ];

  const groundVerificationChecklist = [
    'Confirm population and literacy data at the block/ward level (not available at constituency level)',
    'Verify presence and condition of government schools and colleges',
    'Verify public health facilities (hospital/PHC/CHC) coverage',
    'Confirm flagship project sites (PMGSY roads, Jal Jeevan water, PMAY housing)',
    'Check turnout infrastructure: polling booth access, voter-list accuracy',
    'Document infrastructure: roads, power, connectivity',
  ];

  const photographyChecklist = [
    'Polling booth exteriors and signage',
    'Public infrastructure: roads, water, schools, health facilities',
    'Marketplaces and economic activity',
    'Campaign material and political visuals (with captions)',
    'People in context: farmers, workers, daily life',
  ];

  const videoChecklist = [
    'Establishing shot of the constituency and district',
    'Short interviews (10–20s clips) across voter groups',
    'Fly-through of scheme sites being verified',
    'Ambient sound: markets, fields, community spaces',
  ];

  const timeline = [
    'Day 1: Collect documents and confirm the evidence graph with district officials',
    'Day 2: Interviews — MLA, MP, district administration, election officials',
    'Day 3: Field verification — flagship projects, schools, health facilities',
    'Day 4: Voter interviews — farmers, business owners, women, youth',
    'Day 5: Cross-check findings against the verification workspace, draft',
  ];

  // Travel notes only when the dataset actually carries geographic detail.
  const travelNotes: string[] = [];
  if (rec.area_sq_km && rec.area_sq_km > 0) {
    travelNotes.push(`Approximate area: ${String(rec.area_sq_km)} sq km.`);
  }
  if (rec.terrain_type && rec.terrain_type.trim() !== '') {
    travelNotes.push(`Terrain: ${rec.terrain_type}.`);
  }
  if (rec.major_rivers && rec.major_rivers.trim() !== '') {
    travelNotes.push(`Notable rivers: ${rec.major_rivers}.`);
  }
  if (travelNotes.length === 0) {
    travelNotes.push('Travel and terrain notes are not available in the frozen dataset; confirm road access and distances locally before scheduling.');
  }

  const unknowns = ev.gaps.map((g) => g.label);

  return {
    placesToVisit,
    peopleToInterview,
    documentsToCollect,
    groundVerificationChecklist,
    photographyChecklist,
    videoChecklist,
    timeline,
    travelNotes,
    unknowns,
  };
}
