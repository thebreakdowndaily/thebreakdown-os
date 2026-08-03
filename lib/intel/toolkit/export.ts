import type { ConstituencyToolkit, InterviewBrief, StoryAngle } from './types';

// Governing document: docs/intelligence/roadmap.md (Part 8 — Journalist Toolkit)
// Serialisers produce the print-ready Reporter Brief and the full JSON object.
// Nothing here is authored text: every line derives from the toolkit model.

function heading(level: number, text: string): string {
  return `${'#'.repeat(level)} ${text}`;
}

function sectionHeadings(): string {
  return [
    'Reporter Brief',
    'Constituency Brief',
    'Interview Briefs',
    'Reporting Checklist',
    'Story Angles',
    'Verification Workspace',
    'Field Reporting Pack',
    'Evidence Explorer',
    'Research Summary',
    'Scenario Analysis',
  ]
    .map((h) => `- ${h}`)
    .join('\n');
}

function briefSection(toolkit: ConstituencyToolkit): string {
  const b = toolkit.brief;
  return [
    heading(2, 'Constituency Brief'),
    `**Overview:** ${b.overview}`,
    '',
    `**Political summary:** ${b.politicalSummary}`,
    '',
    `**Prediction summary:** ${b.predictionSummary}`,
    '',
    `**Competitiveness:** ${b.competitiveness}`,
    '',
    `**Momentum:** ${b.momentum}`,
    '',
    `**Evidence confidence:** ${b.evidenceConfidence}`,
    '',
    '**Historical trends:**',
    ...b.historicalTrends.map((t) => `- ${t}`),
    '',
    '**Regional context:**',
    `- ${b.regionalContext}`,
    '',
    `**Research summary:** ${b.researchSummary}`,
    '',
    '**Known risks:**',
    ...(b.knownRisks.length > 0 ? b.knownRisks.map((r) => `- ${r}`) : ['- None recorded']),
    '',
    '**Data gaps:**',
    ...(b.dataGaps.length > 0 ? b.dataGaps.map((g) => `- ${g}`) : ['- None recorded']),
    '',
    `**Last updated:** ${b.lastUpdated}`,
  ].join('\n');
}

function interviewSection(briefs: InterviewBrief[]): string {
  const lines = [heading(2, 'Interview Briefs'), ''];
  for (const brief of briefs) {
    lines.push(heading(3, brief.personaLabel), '', `Focus: ${brief.focusAreas.join(', ')}`, '');
    for (const q of brief.questions) {
      lines.push(`- **Q:** ${q.question}`, `  - Signal: ${q.signal}`, `  - Basis: ${q.basis}`);
    }
    if (brief.prepNotes.length > 0) {
      lines.push('', 'Prep notes:');
      for (const n of brief.prepNotes) lines.push(`- ${n}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function checklistSection(toolkit: ConstituencyToolkit): string {
  const mark: Record<string, string> = { done: '[x]', warning: '[!]', todo: '[ ]' };
  const lines = [heading(2, 'Reporting Checklist'), ''];
  for (const item of toolkit.checklist) {
    lines.push(`- ${mark[item.status] ?? '[ ]'} **${item.label}** — ${item.detail}`);
  }
  lines.push('', 'Legend: [x] reviewed · [!] needs attention · [ ] not started');
  return lines.join('\n');
}

function angleSection(angles: StoryAngle[]): string {
  const lines = [heading(2, 'Story Angles'), ''];
  for (const a of angles) {
    lines.push(
      heading(3, `${a.title} (confidence ${a.confidence.replace('_', ' ')})`),
      '',
      `**Why it matters:** ${a.whyItMatters}`,
      '',
      '**Evidence used:**',
      ...a.evidenceUsed.map((e) => `- ${e}`),
      '',
      `**Suggested interviews:** ${a.suggestedInterviews.join(', ')}`,
      '',
      '**Suggested documents:**',
      ...a.suggestedDocuments.map((d) => `- ${d}`),
      '',
      '**Suggested field reporting:**',
      ...a.suggestedFieldReporting.map((f) => `- ${f}`),
      '',
    );
  }
  return lines.join('\n');
}

function verificationSection(toolkit: ConstituencyToolkit): string {
  const v = toolkit.verification;
  const labels: Record<string, string> = {
    claim: 'Claim requiring verification',
    missing_evidence: 'Missing evidence',
    weak_evidence: 'Weak evidence',
    conflicting_evidence: 'Conflicting evidence',
  };
  const lines = [heading(2, 'Verification Workspace'), ''];
  lines.push(`**Overall confidence:** ${v.overallConfidence.replace('_', ' ')}`, '');
  for (const item of v.items) {
    lines.push(`- **[${labels[item.kind] ?? item.kind}]** ${item.title}`, `  - ${item.detail}`, `  - Source: ${item.source}`);
  }
  lines.push('', '**Recommended documents:**');
  for (const d of v.recommendedDocuments) lines.push(`- ${d}`);
  lines.push('', '**Ground reporting:**');
  for (const g of v.groundReporting) lines.push(`- ${g}`);
  lines.push('', '**Official datasets to verify:**');
  for (const d of v.officialDatasets) lines.push(`- ${d}`);
  return lines.join('\n');
}

function fieldPackSection(toolkit: ConstituencyToolkit): string {
  const f = toolkit.fieldPack;
  const blocks: Array<[string, string[]]> = [
    ['Places to visit', f.placesToVisit],
    ['People to interview', f.peopleToInterview],
    ['Documents to collect', f.documentsToCollect],
    ['Ground verification checklist', f.groundVerificationChecklist],
    ['Photography checklist', f.photographyChecklist],
    ['Video checklist', f.videoChecklist],
    ['Timeline', f.timeline],
    ['Travel notes', f.travelNotes],
    ['Unknowns requiring field reporting', f.unknowns],
  ];
  const lines = [heading(2, 'Field Reporting Pack'), ''];
  for (const [label, items] of blocks) {
    lines.push(heading(3, label), '', ...items.map((i) => `- ${i}`), '');
  }
  return lines.join('\n');
}

function explorerSection(toolkit: ConstituencyToolkit): string {
  const lines = [heading(2, 'Evidence Explorer'), ''];
  const walk = (n: { label: string; detail: string; children: unknown[] }, depth: number) => {
    lines.push(`${'  '.repeat(depth)}- **${n.label}**${n.detail ? ` — ${n.detail}` : ''}`);
    for (const child of n.children as Array<{ label: string; detail: string; children: unknown[] }>) walk(child, depth + 1);
  };
  for (const child of toolkit.explorer.children as Array<{ label: string; detail: string; children: unknown[] }>) walk(child, 0);
  return lines.join('\n');
}

function researchSection(toolkit: ConstituencyToolkit): string {
  const r = toolkit.research;
  const blocks: Array<[string, string[]]> = [
    ['Historical trends', r.historicalTrends],
    ['Research findings', r.findings],
    ['Official reports', r.officialReports],
    ['Monitoring areas', r.monitoringAreas],
    ['Unknowns', r.unknowns],
  ];
  const lines = [heading(2, 'Research Summary'), '', `**Evidence strength:** ${r.evidenceStrength}`, ''];
  for (const [label, items] of blocks) {
    lines.push(heading(3, label), '', ...items.map((i) => `- ${i}`), '');
  }
  return lines.join('\n');
}

function scenarioSection(toolkit: ConstituencyToolkit): string {
  const s = toolkit.scenarios;
  const lines = [
    heading(2, 'Scenario Analysis'),
    '',
    `**Baseline winner:** ${s.baselineWinner}`,
    '',
    ...s.flips.map((f) =>
      f.flipped
        ? `- **Flip under "${f.label}":** ${f.baselineWinner} → ${f.scenarioWinner} (${String(f.winnerProbability)}%)`
        : `- Stable under "${f.label}" (${f.baselineWinner} holds, ${String(f.winnerProbability)}%)`,
    ),
    '',
    `**Vulnerable scenarios:** ${s.vulnerableScenarios.length > 0 ? s.vulnerableScenarios.join(', ') : 'None — seat holds across all scenarios'}`,
  ];
  return lines.join('\n');
}

export function toReporterBriefMarkdown(toolkit: ConstituencyToolkit): string {
  const t = toolkit;
  return [
    heading(1, `Reporter Brief — ${t.constituency_name} (${t.canonical_constituency_id})`),
    '',
    `${t.district} district · ${t.region} · ${t.reservation_type} seat`,
    `Generated ${t.generatedAt} · Dataset ${t.dataSource} · Research cutoff ${t.researchCutoff}`,
    '',
    '**Contents:**',
    sectionHeadings(),
    '',
    briefSection(t),
    '',
    interviewSection(t.interviews),
    '',
    checklistSection(t),
    '',
    angleSection(t.angles),
    '',
    verificationSection(t),
    '',
    fieldPackSection(t),
    '',
    explorerSection(t),
    '',
    researchSection(t),
    '',
    scenarioSection(t),
    '',
    `---`,
    `*Reporter Brief generated by the Journalist Intelligence Toolkit (docs/intelligence/roadmap.md Part 8). All figures derive from the frozen canonical dataset and the intelligence engines — no AI-authored content.*`,
  ].join('\n');
}

export function toToolkitJson(toolkit: ConstituencyToolkit): string {
  return JSON.stringify(toolkit, null, 2);
}
