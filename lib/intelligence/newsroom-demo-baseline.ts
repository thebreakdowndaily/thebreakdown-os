/**
 * ─── Newsroom Demo Baseline (Dev Sandbox Only) ───────────────────────────────
 *
 * Seeds a deterministic, multi-beat pipeline of observations + clusters into
 * the Newsroom Intelligence Core so the dashboard is populated in local
 * development and in the smoke test. Seeding is idempotent (guarded by an
 * empty signal set) and ONLY ever runs when isDemoMode() is true — i.e. no
 * Supabase configured AND NODE_ENV !== 'production'. It is never reachable in
 * production; production state remains empty until real ingestion feeds are
 * wired to ingestObservation/upsertCluster.
 */

import { NewsroomObservation, StoryCluster } from '@/types/newsroom-intelligence';

export interface DemoSeedResult {
  observationsSeeded: number;
  clustersSeeded: number;
  signalsCreated: number;
}

interface DemoScenario {
  clusterId: string;
  title: string;
  summary: string;
  snippet: string;
  entities: string[];
  sourceTier: 't1' | 't2' | 't3';
  source: string;
  secondsAgo: number;
}

const SCENARIOS: DemoScenario[] = [
  { clusterId: 'demo-economy', title: 'RBI signals review of benchmark rates', summary: 'Reserve Bank of India begins a formal review of its monetary policy stance.', snippet: 'RBI said it is reviewing benchmark rate settings amid evolving fiscal conditions.', entities: ['RBI', 'Ministry of Finance'], sourceTier: 't1', source: 'src-demo-rbi', secondsAgo: 30 },
  { clusterId: 'demo-agriculture', title: 'MSP announcement expected for kharif procurement', summary: 'Cabinet Committee on Agricultural Prices convenes to finalise kharif support prices.', snippet: 'Sources indicate a decision on kharif minimum support prices is imminent.', entities: ['CACP', 'Ministry of Agriculture'], sourceTier: 't2', source: 'src-demo-cacp', secondsAgo: 300 },
  { clusterId: 'demo-judiciary', title: 'Supreme Court to hear constitutional bench matter', summary: 'A constitution bench is set to hear a question on the scope of judicial review.', snippet: 'The CJI listed the matter before a constitution bench for detailed hearing.', entities: ['Supreme Court', 'CJI'], sourceTier: 't1', source: 'src-demo-sc', secondsAgo: 600 },
  { clusterId: 'demo-politics', title: 'Election Commission issues model code guidance', summary: 'The Election Commission released updated guidance ahead of upcoming polls.', snippet: 'ECI issued fresh model code of conduct advisories to political parties.', entities: ['ECI', 'Parliament'], sourceTier: 't1', source: 'src-demo-eci', secondsAgo: 900 },
  { clusterId: 'demo-defence', title: 'Ministry of Defence advances border infrastructure works', summary: 'The defence ministry has prioritised roads along the northern border.', snippet: 'MoD fast-tracked construction of strategic border roads in the northern sector.', entities: ['MoD', 'Ministry of Defence'], sourceTier: 't2', source: 'src-demo-mod', secondsAgo: 1200 },
  { clusterId: 'demo-technology', title: 'MeitY proposes digital data protection rules', summary: 'The ministry is drafting implementation rules under the digital data protection act.', snippet: 'MeitY floated draft rules on data protection implementation for public comment.', entities: ['MeitY'], sourceTier: 't1', source: 'src-demo-meity', secondsAgo: 1500 },
  { clusterId: 'demo-health', title: 'ICMR issues updated infectious disease advisory', summary: 'ICMR published revised clinical management guidance for respiratory infections.', snippet: 'ICMR updated its advisory on managing respiratory infections in outpatient settings.', entities: ['ICMR', 'MoHFW'], sourceTier: 't1', source: 'src-demo-icmr', secondsAgo: 1800 },
  { clusterId: 'demo-education', title: 'UGC floats draft curriculum framework', summary: 'The University Grants Commission released a draft framework for university curricula.', snippet: 'UGC invited feedback on its proposed undergraduate curriculum framework.', entities: ['UGC', 'Ministry of Education'], sourceTier: 't2', source: 'src-demo-ugc', secondsAgo: 2400 },
  { clusterId: 'demo-foreign', title: 'MEA confirms bilateral summit preparations', summary: 'Foreign ministry confirms preparatory talks for an upcoming bilateral summit.', snippet: 'MEA said advance teams have begun preparations for the bilateral summit.', entities: ['MEA', 'Ministry of External Affairs'], sourceTier: 't1', source: 'src-demo-mea', secondsAgo: 3000 },
  { clusterId: 'demo-climate', title: 'IMD tracks developing cyclone over the bay', summary: 'The meteorological department is monitoring a low-pressure system expected to intensify.', snippet: 'IMD issued a tracking bulletin for a weather system over the Bay of Bengal.', entities: ['IMD', 'MoES'], sourceTier: 't1', source: 'src-demo-imd', secondsAgo: 3600 },
  { clusterId: 'demo-telecom', title: 'TRAI releases tariff transparency recommendations', summary: 'Telecom regulator published recommendations on tariff plan transparency.', snippet: 'TRAI recommended clearer disclosure of tariff plans to consumers.', entities: ['TRAI', 'DoT'], sourceTier: 't2', source: 'src-demo-trai', secondsAgo: 4200 },
  { clusterId: 'demo-labour', title: 'EPFO updates wage ceiling consultation', summary: 'The provident fund body is consulting on proposed wage ceiling changes.', snippet: 'EPFO opened consultations on revising the wage ceiling for coverage.', entities: ['EPFO', 'Ministry of Labour'], sourceTier: 't2', source: 'src-demo-epfo', secondsAgo: 4800 },
  { clusterId: 'demo-science', title: 'ISRO plans next launch window', summary: 'The space agency announced a launch window for its next orbital mission.', snippet: 'ISRO scheduled the next launch mission for the coming quarter.', entities: ['ISRO'], sourceTier: 't1', source: 'src-demo-isro', secondsAgo: 5400 },
  { clusterId: 'demo-business', title: 'NCLT admits insolvency petition against firm', summary: 'The tribunal admitted a corporate insolvency resolution petition.', snippet: 'NCLT admitted an insolvency petition against a listed infrastructure firm.', entities: ['NCLT', 'SEBI'], sourceTier: 't2', source: 'src-demo-nclt', secondsAgo: 6000 },
  { clusterId: 'demo-consumer', title: 'CCPA orders probe into misleading claims', summary: 'Consumer regulator ordered an investigation into unsubstantiated product claims.', snippet: 'CCPA directed an inquiry into misleading advertisements for a consumer product.', entities: ['CCPA', 'Ministry of Consumer Affairs'], sourceTier: 't2', source: 'src-demo-ccpa', secondsAgo: 6600 },
  { clusterId: 'demo-transport', title: 'DGCA issues operational guidance for regional airlines', summary: 'The aviation regulator released updated operational guidance.', snippet: 'DGCA issued revised operational directives for regional airline operations.', entities: ['DGCA', 'Air India'], sourceTier: 't1', source: 'src-demo-dgca', secondsAgo: 7200 },
];

export function seedNewsroomDemoBaseline(
  core: {
    ingestObservation(obs: NewsroomObservation): void;
    upsertCluster(cluster: StoryCluster): unknown;
  }
): DemoSeedResult {
  let observationsSeeded = 0;
  let clustersSeeded = 0;
  let signalsCreated = 0;

  for (const scenario of SCENARIOS) {
    const now = Date.now();
    const detectedAt = new Date(now - scenario.secondsAgo * 1000).toISOString();
    const publishedAt = new Date(now - scenario.secondsAgo * 1000 - 90_000).toISOString();

    const obs: NewsroomObservation = {
      id: `obs-${scenario.clusterId}`,
      sourceId: scenario.source,
      title: scenario.snippet,
      snippet: scenario.snippet,
      contentHash: `hash-${scenario.clusterId}`,
      publicationTimestamp: publishedAt,
      ingestionTimestamp: new Date(now - scenario.secondsAgo * 1000 - 30_000).toISOString(),
      sourceTier: scenario.sourceTier,
      isPrimarySource: scenario.sourceTier === 't1',
      duplicateState: 'unique',
      entities: scenario.entities,
    };
    core.ingestObservation(obs);
    observationsSeeded += 1;

    const cluster: StoryCluster = {
      id: scenario.clusterId,
      title: scenario.title,
      summary: scenario.summary,
      firstDetectedAt: detectedAt,
      lastUpdatedAt: detectedAt,
      observationIds: [obs.id],
      sourceIds: [scenario.source],
      claimIds: [],
      entities: scenario.entities,
      primarySourceCount: scenario.sourceTier === 't1' ? 1 : 0,
      independentSourceCount: 1,
      geographicSpread: ['National'],
      status: 'active',
    };
    const { signal } = core.upsertCluster(cluster) as { signal: { id: string } };
    clustersSeeded += 1;
    signalsCreated += 1;
    void signal;
  }

  return { observationsSeeded, clustersSeeded, signalsCreated };
}
