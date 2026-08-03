import type { CoalitionDef, ScenarioDef } from './types';

export const COALITIONS: CoalitionDef[] = [
  { id: 'nda', label: 'NDA (BJP + AD(S) + NISHAD + SBSP)', members: ['BJP', 'AD(S)', 'NISHAD', 'SBSP'], note: 'BJP-led bloc, aligned with current ruling coalition at state level' },
  { id: 'sp-led', label: 'SP + INC + RLD', members: ['SP', 'INC', 'RLD'], note: 'Samajwadi-led opposition bloc (2024 LS alliance pattern)' },
  { id: 'bsp', label: 'BSP', members: ['BSP'], note: 'Bahujan Samaj Party alone' },
  { id: 'others', label: 'Others', members: ['OTHER'], note: 'Remaining candidates/independents' },
];

export const SCENARIOS: ScenarioDef[] = [
  {
    id: 'baseline',
    label: 'Baseline projection',
    description: 'No swings applied — current intelligence scores unchanged.',
    rationale: 'Reference projection from the prediction engine; used to compare every scenario against.',
    type: 'uniform',
    swings: [],
  },
  {
    id: 'bjp-wave',
    label: 'BJP wave (+4 pts, uniform)',
    description: 'A uniform 4-point shift toward the BJP across all 403 constituencies.',
    rationale: 'Models a statewide wave (e.g., a national/statewide issue that consolidates the vote behind the incumbent BJP state government).',
    type: 'uniform',
    swings: [{ target: 'BJP', delta: 4, scope: { applyToAll: true }, note: 'Uniform 4pt swing to BJP' }],
  },
  {
    id: 'sp-surge',
    label: 'SP surge (+4 pts, uniform)',
    description: 'A uniform 4-point shift toward the Samajwadi Party across all constituencies.',
    rationale: 'Models a consolidated OBC/Muslim/Yadav realignment behind the SP, the main opposition pole.',
    type: 'uniform',
    swings: [{ target: 'SP', delta: 4, scope: { applyToAll: true }, note: 'Uniform 4pt swing to SP' }],
  },
  {
    id: 'western-rld',
    label: 'Western UP RLD surge (+8 pts, regional)',
    description: 'An 8-point shift toward RLD in Western UP (138 constituencies).',
    rationale: 'Models a Jat-led regional surge in the western belt (Saharanpur–Muzzafarnagar–Meerut axis), where RLD has its base.',
    type: 'regional',
    swings: [{ target: 'RLD', delta: 8, scope: { region: 'Western UP (NCR + Western)' }, note: '8pt regional swing to RLD in West UP' }],
  },
  {
    id: 'bsp-comeback',
    label: 'BSP comeback (+6 pts, uniform)',
    description: 'A uniform 6-point shift toward the BSP across all constituencies.',
    rationale: 'Models a Dalit consolidation behind the BSP after the 2022 reverse, a structural swing the model otherwise does not assume.',
    type: 'uniform',
    swings: [{ target: 'BSP', delta: 6, scope: { applyToAll: true }, note: 'Uniform 6pt swing to BSP' }],
  },
  {
    id: 'anti-incumbent',
    label: 'Anti-incumbent stress (−5 pts vs sitting MLA)',
    description: 'A 5-point swing against every sitting MLA party, redistributed to challengers.',
    rationale: 'Stress-test for a broad anti-incumbency mood; penalises the current_mla_party of each seat.',
    type: 'stress',
    swings: [{ target: 'INCUMBENT', delta: -5, scope: { applyToAll: true }, note: 'Remove 5pt from each seat\u2019s incumbent party' }],
  },
];
