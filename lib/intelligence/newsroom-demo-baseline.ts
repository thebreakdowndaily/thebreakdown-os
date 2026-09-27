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
  { clusterId: 'demo-economy', title: 'RBI reviews benchmark repo rate and liquidity operations', summary: 'Reserve Bank of India begins formal review of benchmark rate settings and banking system liquidity.', snippet: 'RBI MPC said it is monitoring domestic inflation dynamics and liquidity conditions ahead of its resolution.', entities: ['RBI', 'Ministry of Finance'], sourceTier: 't1', source: 'src-demo-rbi', secondsAgo: 30 },
  { clusterId: 'demo-agriculture', title: 'MGNREGA 125-day statutory transition monitored under 2025 Act', summary: 'Ministry of Rural Development oversees operational rollout of 125-day statutory employment guarantee.', snippet: 'Field agencies report initial transition metrics under the VB-G RAM G Act, 2025 (Act No. 18 of 2025).', entities: ['CACP', 'Ministry of Agriculture'], sourceTier: 't2', source: 'src-demo-cacp', secondsAgo: 300 },
  { clusterId: 'demo-judiciary', title: 'Supreme Court constitution bench hearing on institutional accountability', summary: 'A constitution bench is set to examine statutory disclosure standards and institutional audit mechanisms.', snippet: 'The CJI listed the matter before a five-judge constitution bench for detailed arguments.', entities: ['Supreme Court', 'CJI'], sourceTier: 't1', source: 'src-demo-sc', secondsAgo: 600 },
  { clusterId: 'demo-politics', title: 'Election Commission publishes verified political disclosure guidelines', summary: 'The Election Commission released updated compliance directives on campaign expenditure transparency.', snippet: 'ECI issued fresh transparency directives to registered political entities ahead of upcoming polls.', entities: ['ECI', 'Parliament'], sourceTier: 't1', source: 'src-demo-eci', secondsAgo: 900 },
  { clusterId: 'demo-defence', title: 'Ministry of Defence & BRO advance strategic northern border infrastructure', summary: 'The defence ministry has prioritised all-weather road and tunnel links along the northern frontier.', snippet: 'MoD and BRO fast-tracked construction of critical strategic links in the northern sector.', entities: ['MoD', 'Ministry of Defence'], sourceTier: 't2', source: 'src-demo-mod', secondsAgo: 1200 },
  { clusterId: 'demo-technology', title: 'MeitY notifies draft Digital Personal Data Protection implementation rules', summary: 'The ministry has released draft implementation rules under the DPDP Act for public stakeholder consultation.', snippet: 'MeitY floated draft statutory rules on data fiduciary compliance for public feedback.', entities: ['MeitY'], sourceTier: 't1', source: 'src-demo-meity', secondsAgo: 1500 },
  { clusterId: 'demo-health', title: 'ICMR & National Cancer Registry publish clinical pricing and oncology audit', summary: 'ICMR and the health ministry released updated national clinical management and essential drug pricing data.', snippet: 'ICMR published revised clinical guidelines and oncology cost transparency benchmarks.', entities: ['ICMR', 'MoHFW'], sourceTier: 't1', source: 'src-demo-icmr', secondsAgo: 1800 },
  { clusterId: 'demo-education', title: 'UGC notifies national undergraduate curriculum framework guidelines', summary: 'The University Grants Commission issued operational guidelines for university curriculum modernisation.', snippet: 'UGC notified institutions regarding multidisciplinary undergraduate curriculum implementation.', entities: ['UGC', 'Ministry of Education'], sourceTier: 't2', source: 'src-demo-ugc', secondsAgo: 2400 },
  { clusterId: 'demo-foreign', title: 'MEA confirms bilateral summit preparations on strategic corridors', summary: 'Foreign ministry confirms advance delegation meetings for bilateral trade and strategic autonomy consultations.', snippet: 'MEA said preparatory talks have commenced regarding bilateral trade and regional connectivity.', entities: ['MEA', 'Ministry of External Affairs'], sourceTier: 't1', source: 'src-demo-mea', secondsAgo: 3000 },
  { clusterId: 'demo-climate', title: 'Namami Gange real-time river quality sensor telemetry audit published', summary: 'CPCB and National Mission for Clean Ganga released updated treatment plant operational metrics.', snippet: 'NMCG published live effluent sensor compliance records across major river monitoring nodes.', entities: ['IMD', 'MoES'], sourceTier: 't1', source: 'src-demo-imd', secondsAgo: 3600 },
  { clusterId: 'demo-telecom', title: 'TRAI releases tariff transparency and spectrum allocation recommendations', summary: 'Telecom regulator published binding recommendations on digital consumer tariff disclosures.', snippet: 'TRAI recommended comprehensive disclosure rules for mobile and broadband tariff offerings.', entities: ['TRAI', 'DoT'], sourceTier: 't2', source: 'src-demo-trai', secondsAgo: 4200 },
  { clusterId: 'demo-labour', title: 'EPFO updates statutory wage ceiling and higher pension calculations', summary: 'The retirement fund body issued updated administrative circulars on social security wage thresholds.', snippet: 'EPFO notified revised operational procedures regarding higher pension entitlement calculations.', entities: ['EPFO', 'Ministry of Labour'], sourceTier: 't2', source: 'src-demo-epfo', secondsAgo: 4800 },
  { clusterId: 'demo-science', title: 'ISRO schedules launch window for next orbital scientific mission', summary: 'The space agency confirmed launch preparations for its upcoming Earth observation satellite mission.', snippet: 'ISRO scheduled the next satellite launch window following successful pre-flight checkouts.', entities: ['ISRO'], sourceTier: 't1', source: 'src-demo-isro', secondsAgo: 5400 },
  { clusterId: 'demo-business', title: 'NCLT & MCA issue directives on beneficial ownership transparency', summary: 'Corporate affairs authorities strengthened resolution framework and corporate disclosure norms.', snippet: 'NCLT admitted an insolvency resolution petition while requiring complete ownership disclosures.', entities: ['NCLT', 'SEBI'], sourceTier: 't2', source: 'src-demo-nclt', secondsAgo: 6000 },
  { clusterId: 'demo-consumer', title: 'CCPA directs probe into deceptive digital marketing practices', summary: 'Consumer protection authority issued notices over unsubstantiated product performance claims.', snippet: 'CCPA initiated an inquiry into dark pattern violations across digital retail platforms.', entities: ['CCPA', 'Ministry of Consumer Affairs'], sourceTier: 't2', source: 'src-demo-ccpa', secondsAgo: 6600 },
  { clusterId: 'demo-transport', title: 'DGCA issues revised operational safety guidance for regional carriers', summary: 'The civil aviation directorate released updated flight safety and maintenance oversight directives.', snippet: 'DGCA issued operational safety bulletins for regional air connectivity operations.', entities: ['DGCA', 'Air India'], sourceTier: 't1', source: 'src-demo-dgca', secondsAgo: 7200 },
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
