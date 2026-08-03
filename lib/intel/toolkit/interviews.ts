import type { InterviewBrief, InterviewPersona, ToolkitInterviewQuestion } from './types';
import type { SeatFacts } from './facts';

// Governing document: docs/intelligence/roadmap.md (Part 8 — Journalist Toolkit)
// Questions are derived from evidence, predictions, scenarios, and registered data gaps.
// No question invents a controversy: every question cites the signal that motivates it.

interface PersonaProfile {
  persona: InterviewPersona;
  personaLabel: string;
  focusAreas: string[];
}

const PERSONA_PROFILES: PersonaProfile[] = [
  { persona: 'MLA', personaLabel: 'MLA (incumbent)', focusAreas: ['Incumbent record', 'Representation change', 'Constituency priorities'] },
  { persona: 'MP', personaLabel: 'MP (Lok Sabha)', focusAreas: ['Parliamentary representation', 'Centre–state links', 'LS segment signals'] },
  { persona: 'district_admin', personaLabel: 'District administration', focusAreas: ['Development delivery', 'Scheme implementation', 'Administrative capacity'] },
  { persona: 'election_official', personaLabel: 'Election officials (RO/ERO)', focusAreas: ['Electoral roll accuracy', 'Turnout patterns', 'Polling logistics'] },
  { persona: 'farmer', personaLabel: 'Farmer', focusAreas: ['Agriculture', 'Irrigation', 'Crop economics'] },
  { persona: 'business_owner', personaLabel: 'Business owner', focusAreas: ['Local economy', 'MSMEs', 'Markets'] },
  { persona: 'women', personaLabel: 'Women residents', focusAreas: ['Service access', 'Safety', 'Participation'] },
  { persona: 'youth', personaLabel: 'Youth', focusAreas: ['Employment', 'Education', 'Aspirations'] },
  { persona: 'teacher', personaLabel: 'Teacher', focusAreas: ['Education infrastructure', 'Enrolment', 'Learning outcomes'] },
  { persona: 'doctor', personaLabel: 'Doctor / health worker', focusAreas: ['Health infrastructure', 'Access to care', 'Public health'] },
  { persona: 'village_head', personaLabel: 'Village head (Pradhan)', focusAreas: ['Local governance', 'Flagship schemes', 'Grievance channels'] },
  { persona: 'civil_society', personaLabel: 'Civil society', focusAreas: ['Governance issues', 'Transparency', 'Verification'] },
];

function historyQuestion(facts: SeatFacts): ToolkitInterviewQuestion {
  return {
    question: `The seat's recorded history is ${facts.historyLine}. What explains the most recent change or continuity in the winner party?`,
    signal: facts.historyLine,
    basis: 'Evidence: historical results (winner_party_2012/2017/2022)',
  };
}

function predictionQuestion(facts: SeatFacts): ToolkitInterviewQuestion {
  return {
    question: `The intelligence model projects ${facts.predictedWinner} at ${String(facts.predictedProb)}% (confidence ${facts.predictionConfidence.replace('_', ' ')}). On the ground, what is missing from that projection?`,
    signal: `${facts.predictedWinner} ${String(facts.predictedProb)}%`,
    basis: 'Prediction engine: winner probability + confidence',
  };
}

function momentumQuestion(facts: SeatFacts): ToolkitInterviewQuestion {
  const score = facts.intel.scores.momentum;
  return {
    question: `The momentum score for this seat is ${String(score.value)}/100. What local factors would confirm or contradict that trend?`,
    signal: `Momentum ${String(score.value)}/100`,
    basis: 'Scoring engine: momentum drivers',
  };
}

function gapQuestion(facts: SeatFacts, topic: string, field: string): ToolkitInterviewQuestion {
  return {
    question: `Constituency-level ${topic} data is registered as missing in the frozen dataset. What official records or ground observation can fill that gap?`,
    signal: facts.devGapLabels.length > 0 ? facts.devGapLabels.join(', ') : 'No development indicators available',
    basis: `Evidence: registered gap (${field})`,
  };
}

function buildQuestionsFor(facts: SeatFacts, persona: InterviewPersona): ToolkitInterviewQuestion[] {
  const rec = facts.record;
  const gapQuestions = (topic: string, field: string) => gapQuestion(facts, topic, field);

  switch (persona) {
    case 'MLA':
      return [
        historyQuestion(facts),
        momentumQuestion(facts),
        {
          question: facts.incumbentParty
            ? `You represent this seat for ${facts.incumbentParty}. What were the two or three most consequential delivery outcomes of your current term?`
            : 'What were the two or three most consequential delivery outcomes of the current term?',
          signal: facts.incumbentParty || 'Incumbent record',
          basis: 'Evidence: current MLA + representation change',
        },
        predictionQuestion(facts),
        gapQuestions('development indicators', 'development_indicators'),
      ];
    case 'MP':
      return [
        {
          question: facts.incumbentParty
            ? `How does the state-level outcome here (${facts.incumbentParty}) relate to your parliamentary constituency's results?`
            : 'How do state-level results here relate to the parliamentary constituency results?',
          signal: rec.pc_name || 'Lok Sabha segment',
          basis: 'Evidence: current MP + LS2024 segment',
        },
        {
          question: facts.ls2024Changed
            ? `The parent LS segment changed party to ${facts.ls2024Party} in 2024. What does that shift reflect on the ground?`
            : `The parent LS segment voted for ${facts.ls2024Party || 'the recorded party'} in 2024. What does that signal for the state contest here?`,
          signal: `${facts.ls2024Party}${facts.ls2024Changed ? ' (changed)' : ''}`,
          basis: 'Evidence: ls2024_party_changed_flag + ls2024_pc_winner_party',
        },
        gapQuestions('scheme coverage and development', 'development_indicators'),
      ];
    case 'district_admin':
      return [
        {
          question: 'Which development schemes are being executed in this constituency, and where are the implementation bottlenecks?',
          signal: `linked_projects_count=${String(rec.linked_projects_count || 0)}`,
          basis: 'Evidence: linked flagship projects (PMGSY/JJM/PMAY)',
        },
        gapQuestions('socio-economic indicators', 'development_indicators'),
        {
          question: 'What administrative data does the district hold for this constituency that is not yet in the public dataset?',
          signal: 'Registered data gaps',
          basis: 'Evidence: development indicator gaps + governance reports',
        },
      ];
    case 'election_official':
      return [
        {
          question: `What is the electoral roll status for this constituency (AC ${String(rec.ac_number)}), and are there known discrepancies?`,
          signal: `AC ${String(rec.ac_number)}`,
          basis: 'Evidence: constituency identity fields',
        },
        {
          question: `Turnout history is recorded across 2012/2017/2022. Which polling areas show notable turnout changes and why?`,
          signal: 'Turnout history',
          basis: 'Evidence: total_valid_votes_2012/2017/2022',
        },
        gapQuestions('polling logistics and accessibility', 'development_indicators'),
      ];
    case 'farmer':
      return [
        gapQuestions('agriculture and irrigation', 'major_crops_summary'),
        {
          question: 'What are the dominant crops and the water situation in this constituency, and how does the monsoon affect the vote?',
          signal: rec.major_rivers || 'Agriculture registered as unavailable',
          basis: 'Evidence: agriculture fields (gap) + geography fields',
        },
        {
          question: 'How are agricultural support schemes (MSP, irrigation, crop insurance) reaching farmers here?',
          signal: 'Agriculture support',
          basis: 'Evidence: development indicator gaps',
        },
      ];
    case 'business_owner':
      return [
        gapQuestions('local economy and MSMEs', 'major_industries_summary'),
        {
          question: 'What are the main local industries or business clusters, and what is their economic trajectory?',
          signal: rec.major_industries_summary || 'Economy registered as unavailable',
          basis: 'Evidence: economy fields (gap)',
        },
        {
          question: 'How do infrastructure (roads, power, connectivity) affect business operations in this area?',
          signal: 'Infrastructure registered as unavailable',
          basis: 'Evidence: infrastructure indicator gaps',
        },
      ];
    case 'women':
      return [
        gapQuestions('services access for women', 'development_indicators'),
        {
          question: 'How accessible are health, education, and livelihood services for women in this constituency?',
          signal: 'Development indicators unavailable',
          basis: 'Evidence: health/education indicator gaps',
        },
        {
          question: 'What barriers do women face in political participation and public-service access here?',
          signal: 'Gender-neutral dataset fields',
          basis: 'Evidence: development indicator gaps (no gender-disaggregated data)',
        },
      ];
    case 'youth':
      return [
        gapQuestions('employment and education for youth', 'degree_colleges_count'),
        {
          question: 'What are the employment and skilling opportunities for young people in this constituency?',
          signal: 'Education/employment registered as unavailable',
          basis: 'Evidence: education + economy indicator gaps',
        },
        {
          question: 'What do young voters say drives their voting choice here, and how does it match the projected winner?',
          signal: `${facts.predictedWinner} ${String(facts.predictedProb)}%`,
          basis: 'Prediction engine: winner probability',
        },
      ];
    case 'teacher':
      return [
        gapQuestions('schools and education infrastructure', 'government_schools_count'),
        {
          question: 'What is the state of school infrastructure, enrolment, and learning outcomes in this constituency?',
          signal: 'Education registered as unavailable',
          basis: 'Evidence: education indicator gaps',
        },
        {
          question: 'How do midday meals, scholarships, and transport affect attendance here?',
          signal: 'Education support schemes',
          basis: 'Evidence: education indicator gaps',
        },
      ];
    case 'doctor':
      return [
        gapQuestions('health infrastructure and access', 'district_hospitals_count'),
        {
          question: 'What is the coverage of public health facilities (PHC/CHC/hospital) and referral access for this constituency?',
          signal: 'Health registered as unavailable',
          basis: 'Evidence: health indicator gaps (phc_count, chc_count, district_hospitals_count)',
        },
        {
          question: 'What are the dominant public-health concerns here, and how are health schemes reaching residents?',
          signal: 'Public health',
          basis: 'Evidence: health indicator gaps + disaster/environment fields',
        },
      ];
    case 'village_head':
      return [
        {
          question: 'Which flagship schemes (PMGSY roads, Jal Jeevan water, PMAY housing) are active in the villages here, and what is the completion status?',
          signal: `linked_projects_count=${String(rec.linked_projects_count || 0)}`,
          basis: 'Evidence: linked flagship projects',
        },
        gapQuestions('local infrastructure and services', 'infrastructure_availability_status'),
        {
          question: 'What are the most common grievances raised by residents, and how are they resolved?',
          signal: rec.governance_issue_summary || 'Governance issues registered as unavailable',
          basis: 'Evidence: governance_issue fields (gap)',
        },
      ];
    case 'civil_society':
      return [
        gapQuestions('governance issues', 'governance_issue_summary'),
        {
          question: 'What governance issues or service-delivery failures should journalists independently verify in this constituency?',
          signal: rec.governance_issue_summary || 'Governance summary unavailable',
          basis: 'Evidence: governance_issue_summary + disaster_risks_summary',
        },
        {
          question: 'Which official datasets should be cross-checked against ground reality to verify the recorded evidence?',
          signal: facts.evidence.items.filter((i) => i.status === 'available').map((i) => i.sourceDataset).join(', ') || 'Source datasets',
          basis: 'Evidence: research_sources + provenance',
        },
      ];
    default:
      return [historyQuestion(facts)];
  }
}

function prepNotesFor(persona: InterviewPersona, facts: SeatFacts): string[] {
  const notes: string[] = [];
  if (persona === 'MLA') {
    notes.push(`Verify the MLA's own account against the recorded history: ${facts.historyLine}.`);
    if (facts.topSensitivityScore) notes.push(`Most sensitive score: ${facts.topSensitivityScore.replace('_', ' ')} (${facts.topSensitivityEffect}).`);
  }
  if (persona === 'MP' && facts.ls2024Changed) {
    notes.push('LS2024 party change is the strongest contested signal — probe causes without asserting blame.');
  }
  if (persona === 'election_official') {
    notes.push('Election officials cannot discuss campaign substance; keep questions to process and logistics.');
  }
  return notes;
}

export function buildInterviewBriefs(facts: SeatFacts): InterviewBrief[] {
  return PERSONA_PROFILES.map((profile) => ({
    persona: profile.persona,
    personaLabel: profile.personaLabel,
    focusAreas: profile.focusAreas,
    questions: buildQuestionsFor(facts, profile.persona),
    prepNotes: prepNotesFor(profile.persona, facts),
  }));
}

export function interviewQuestionCount(briefs: InterviewBrief[]): number {
  return briefs.reduce((sum, b) => sum + b.questions.length, 0);
}
