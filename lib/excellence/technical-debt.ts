// ── Technical Debt & Dependency Intelligence (Phase 22A WP3) ───────────────────

import { TechnicalDebtEntry } from '../../types/excellence';

export class TechnicalDebtIntelligenceEngine {
  private static debtItems: TechnicalDebtEntry[] = [
    {
      debtId: 'debt-telemetry-sample-rate',
      title: 'Telemetry Sample Rate Configuration Drift Waiver',
      category: 'OPERATIONAL',
      severity: 'LOW',
      impact: '0.8 sample rate active during load test waiver window.',
      remediationEffortDays: 1,
      ownership: 'TelemetryTeam',
    },
    {
      debtId: 'debt-legacy-type-alias',
      title: 'Legacy API Version Alias Consolidation',
      category: 'ARCHITECTURAL',
      severity: 'LOW',
      impact: 'v0.9 API version deprecated with planned 180-day sunset date.',
      remediationEffortDays: 2,
      ownership: 'ExtensibilityTeam',
    },
  ];

  public static listTechnicalDebt(): readonly TechnicalDebtEntry[] {
    return Object.freeze(this.debtItems.map((d) => Object.freeze({ ...d })));
  }
}
