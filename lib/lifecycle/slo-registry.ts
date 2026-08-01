// ── Service Level Objective (SLO) Registry (Phase 20A Recommendation 4) ───────

import { SLOBudget, SLOCategory } from '../../types/lifecycle';

export const SYSTEM_SLOS: SLOBudget[] = [
  {
    sloId: 'slo-availability',
    category: 'AVAILABILITY' as SLOCategory,
    targetPercent: 99.9,
    currentPercent: 99.95,
    errorBudgetRemainingPercent: 80.0,
    burnRate: 0.2,
    status: 'HEALTHY',
  },
  {
    sloId: 'slo-latency',
    category: 'LATENCY' as SLOCategory,
    targetPercent: 95.0,
    currentPercent: 98.2,
    errorBudgetRemainingPercent: 92.0,
    burnRate: 0.1,
    status: 'HEALTHY',
  },
  {
    sloId: 'slo-error-rate',
    category: 'ERROR_RATE' as SLOCategory,
    targetPercent: 99.5,
    currentPercent: 99.8,
    errorBudgetRemainingPercent: 88.0,
    burnRate: 0.15,
    status: 'HEALTHY',
  },
  {
    sloId: 'slo-content-freshness',
    category: 'FRESHNESS' as SLOCategory,
    targetPercent: 99.0,
    currentPercent: 99.5,
    errorBudgetRemainingPercent: 90.0,
    burnRate: 0.1,
    status: 'HEALTHY',
  },
  {
    sloId: 'slo-webhook-delivery',
    category: 'WEBHOOK_DELIVERY' as SLOCategory,
    targetPercent: 99.8,
    currentPercent: 99.9,
    errorBudgetRemainingPercent: 95.0,
    burnRate: 0.05,
    status: 'HEALTHY',
  },
  {
    sloId: 'slo-api-success',
    category: 'API_SUCCESS' as SLOCategory,
    targetPercent: 99.9,
    currentPercent: 99.98,
    errorBudgetRemainingPercent: 96.0,
    burnRate: 0.04,
    status: 'HEALTHY',
  },
];

export class SLORegistryService {
  public static listSLOBudgets(): readonly SLOBudget[] {
    return Object.freeze(SYSTEM_SLOS.map((s) => Object.freeze({ ...s })));
  }
}
