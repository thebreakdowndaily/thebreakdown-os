/**
 * ─── Benchmark 100: Global Event Corpus (Evidence-Grade) ─────────────────────
 *
 * Governing document: AGENTS.md (Platform Beta)
 * Phase 8: Evidence-Grade Scale-Up & Independent Benchmarking
 *
 * Total Corpus: N = 100 Pre-Registered Real-World Events:
 *   - India (IN): 40 events (MP State, Bhopal, Rewa, Jabalpur, Indore, Gwalior, etc.)
 *   - United States (US): 25 events (Federal WH/CISA/EPA, California/LA, New York, Texas)
 *   - United Kingdom (GB): 20 events (Cabinet Office, Met Police, TfL, Manchester)
 *   - Germany (DE): 15 events (Bundesregierung, BSI, Bayern/Munich, Berlin, Hamburg)
 */

import type { RealWorldEvent } from '../real-world-events';
import { INDIA_100_EVENTS } from './in-events';
import { USA_100_EVENTS } from './us-events';
import { UK_100_EVENTS } from './gb-events';
import { GERMANY_100_EVENTS } from './de-events';

export const BENCHMARK_100_CORPUS: RealWorldEvent[] = [
  ...INDIA_100_EVENTS,
  ...USA_100_EVENTS,
  ...UK_100_EVENTS,
  ...GERMANY_100_EVENTS,
];

export { INDIA_100_EVENTS, USA_100_EVENTS, UK_100_EVENTS, GERMANY_100_EVENTS };
