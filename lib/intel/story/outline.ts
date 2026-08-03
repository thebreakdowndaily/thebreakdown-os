import type { ConstituencyToolkit } from '@/lib/intel/toolkit/types';
import type { InvestigationCase } from '@/lib/intel/editorial/types';
import type { VerificationStatus } from '@/lib/intel/verification';
import type { StoryOutlineBlock, StoryOutlineItem, StoryType } from './types';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder — Outline Generator)
// Generates structured outlines ONLY — never finished articles. Every outline item carries its
// basis and the certified engine that supplies it. Sections reuse toolkit story angles, interview
// briefs, the field pack, research summaries, evidence, prediction, and scenario outputs instead
// of recreating intelligence.

export interface StoryOutlineInputs {
  investigation: InvestigationCase;
  toolkit: ConstituencyToolkit | null;
  storyType: StoryType;
  evidenceCoverage: number;
  verificationStatus: VerificationStatus | null;
  headlineOptions: string[];
}

function item(text: string, basis: string, source: string): StoryOutlineItem {
  return { text, basis, source };
}

/** Build the 14-section structured outline. Outline items reference engines; no prose is drafted. */
export function buildStoryOutline(inputs: StoryOutlineInputs): StoryOutlineBlock[] {
  const { investigation, toolkit, storyType, evidenceCoverage, verificationStatus, headlineOptions } = inputs;
  const constituency = investigation.constituency_name;

  const standfirstBasis = investigation.topReasons[0]?.why ?? 'priority signal';
  const keyTakeaways = [
    item(`Predicted winner: ${investigation.predicted_winner} at ${String(Math.round(investigation.winner_probability))}%.`, 'Prediction engine output.', 'lib/intel/predictions'),
    item(`Top driver: ${investigation.topReasons[0]?.label ?? 'n/a'} — ${standfirstBasis}`, 'Investigation factor decomposition.', 'lib/intel/editorial'),
    ...(toolkit ? toolkit.angles.slice(0, 2).map((a) => item(a.whyItMatters, `Toolkit story angle: ${a.title}.`, 'lib/intel/toolkit')) : []),
  ];

  const background = toolkit
    ? toolkit.brief.historicalTrends.slice(0, 4).map((t) => item(t, 'Toolkit historical trends.', 'lib/intel/toolkit (research)'))
    : [item(`Evidence coverage ${String(Math.round(evidenceCoverage))}% — background not expanded on this surface.`, 'Factor-only projection.', 'lib/intel/evidence')];

  const context = toolkit
    ? [item(toolkit.brief.regionalContext, 'Toolkit regional context.', 'lib/intel/toolkit'), ...toolkit.research.unknowns.slice(0, 3).map((u) => item(u, 'Toolkit research unknowns.', 'lib/intel/toolkit'))]
    : [item(`Regional context unavailable on this surface; district ${investigation.district}, region ${investigation.region}.`, 'Factor-only projection.', 'lib/intel/editorial')];

  const evidence = toolkit
    ? [...toolkit.brief.sourcesUsed.slice(0, 4).map((s) => item(s, 'Toolkit sources used.', 'lib/intel/toolkit')), item(`Evidence coverage ${String(Math.round(evidenceCoverage))}%.`, 'Evidence engine.', 'lib/intel/evidence')]
    : [item(`Evidence coverage ${String(Math.round(evidenceCoverage))}% across registered fields.`, 'Evidence engine.', 'lib/intel/evidence')];

  const analysis = toolkit
    ? toolkit.scenarios.flips.slice(0, 4).map((f) => item(`Scenario ${f.label}: ${f.baselineWinner} → ${f.scenarioWinner}.`, 'Scenario engine flip.', 'lib/intel/scenarios'))
    : [item(`Scenario flips unavailable on this surface; prediction confidence ${investigation.confidence.replace('_', ' ')}.`, 'Factor-only projection.', 'lib/intel/predictions')];

  const counterarguments = toolkit
    ? toolkit.research.unknowns.slice(0, 4).map((u) => item(u, 'Toolkit research unknowns (counterpoints to weigh).', 'lib/intel/toolkit'))
    : [item('Counterarguments not expanded on this surface (factor-only projection).', 'Factor-only projection.', 'lib/intel/evidence')];

  const limitations = [
    item(`Verification status: ${verificationStatus === null ? 'no case in top-priority set' : verificationStatus.replace(/_/g, ' ')}.`, 'Verification workspace.', 'lib/intel/verification'),
    item(`Evidence coverage ${String(Math.round(evidenceCoverage))}% — gaps must be declared in the final piece.`, 'Evidence engine.', 'lib/intel/evidence'),
    ...(toolkit ? toolkit.research.unknowns.slice(0, 2).map((u) => item(u, 'Toolkit research unknowns.', 'lib/intel/toolkit')) : []),
  ];

  const futureOutlook = toolkit
    ? toolkit.scenarios.vulnerableScenarios.slice(0, 4).map((s) => item(s, 'Toolkit vulnerable scenarios.', 'lib/intel/scenarios'))
    : [item('Future outlook not expanded on this surface (factor-only projection).', 'Factor-only projection.', 'lib/intel/scenarios')];

  const suggestedGraphics = toolkit
    ? [...toolkit.fieldPack.photographyChecklist.slice(0, 4).map((p) => item(p, 'Toolkit photography checklist.', 'lib/intel/toolkit')), ...toolkit.fieldPack.videoChecklist.slice(0, 2).map((v) => item(v, 'Toolkit video checklist.', 'lib/intel/toolkit'))]
    : [item('Graphics suggestions require the Journalist Toolkit field pack.', 'Factor-only projection.', 'lib/intel/toolkit')];

  const suggestedDataVisualizations = [
    item(`Winner probability ${String(Math.round(investigation.winner_probability))}% bar/chart.`, 'Prediction engine value.', 'lib/intel/predictions'),
    item(`Evidence coverage ${String(Math.round(evidenceCoverage))}% by category.`, 'Evidence engine coverage.', 'lib/intel/evidence'),
    ...(toolkit ? toolkit.scenarios.flips.slice(0, 3).map((f) => item(`Scenario flip visual: ${f.label}.`, 'Scenario engine flip.', 'lib/intel/scenarios')) : []),
  ];

  const suggestedInterviews = toolkit
    ? toolkit.interviews.slice(0, 5).map((i) => item(`Interview brief: ${i.personaLabel} — ${i.focusAreas.slice(0, 2).join(', ')}.`, 'Toolkit interview brief.', 'lib/intel/toolkit'))
    : [item('Interview suggestions require the Journalist Toolkit.', 'Factor-only projection.', 'lib/intel/toolkit')];

  const suggestedDocuments = toolkit
    ? [...toolkit.verification.recommendedDocuments.slice(0, 4).map((d) => item(d, 'Toolkit verification documents.', 'lib/intel/toolkit')), ...toolkit.fieldPack.documentsToCollect.slice(0, 3).map((d) => item(d, 'Toolkit field pack documents.', 'lib/intel/toolkit'))]
    : [item('Document suggestions require the Journalist Toolkit.', 'Factor-only projection.', 'lib/intel/toolkit')];

  const relatedStories = [
    item(`Related coverage surfaces: Story Builder for ${constituency} and the shared Evidence Atlas.`, 'Collection-level linkage.', 'The Breakdown Knowledge Platform'),
    item(`Cross-links from the Knowledge Graph on ${constituency}.`, 'Knowledge Graph entity links.', 'lib/graph'),
  ];

  const blocks: StoryOutlineBlock[] = [
    { id: 'headline_options', title: 'Headline options', items: headlineOptions.map((h) => item(h, 'Derived from toolkit story angles and prediction/editorial signals.', 'lib/intel/toolkit + lib/intel/editorial')) },
    { id: 'standfirst', title: 'Standfirst', items: [item(standfirstBasis, 'Top investigation reason.', 'lib/intel/editorial')] },
    { id: 'key_takeaways', title: 'Key takeaways', items: keyTakeaways },
    { id: 'background', title: 'Background', items: background },
    { id: 'context', title: 'Context', items: context },
    { id: 'evidence', title: 'Evidence', items: evidence },
    { id: 'analysis', title: 'Analysis', items: analysis },
    { id: 'counterarguments', title: 'Counterarguments', items: counterarguments },
    { id: 'limitations', title: 'Limitations', items: limitations },
    { id: 'future_outlook', title: 'Future outlook', items: futureOutlook },
    { id: 'suggested_graphics', title: 'Suggested graphics', items: suggestedGraphics },
    { id: 'suggested_data_visualizations', title: 'Suggested data visualizations', items: suggestedDataVisualizations },
    { id: 'suggested_interviews', title: 'Suggested interviews', items: suggestedInterviews },
    { id: 'suggested_documents', title: 'Suggested documents', items: suggestedDocuments },
    { id: 'related_stories', title: 'Related stories', items: relatedStories },
  ];

  void storyType;
  return blocks;
}
