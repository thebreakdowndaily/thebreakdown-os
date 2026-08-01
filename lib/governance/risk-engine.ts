// ── Operational Risk & Exception Waiver Engine (Phase 20B WP5) ─────────────────

import { OperationalRiskEntry, ExceptionWaiver } from '../../types/governance';

export class OperationalRiskRegister {
  private static risks: OperationalRiskEntry[] = [
    {
      riskId: 'risk-telemetry-sample',
      title: 'Telemetry Sample Rate Drift Warning',
      category: 'OPERATIONS',
      severity: 'LOW',
      score: 15,
      mitigationStatus: 'ACCEPTED_WITH_WAIVER',
      activeWaiver: {
        waiverId: 'waiv-telemetry-01',
        riskId: 'risk-telemetry-sample',
        approvedBy: 'CTO',
        expirationDate: '2026-12-31',
        justification: 'Approved 0.8 sample rate during high-volume telemetry load testing.',
      },
    },
    {
      riskId: 'risk-cache-memory-peak',
      title: 'Peak Cache Memory Utilization',
      category: 'PERFORMANCE',
      severity: 'LOW',
      score: 10,
      mitigationStatus: 'MITIGATED',
    },
  ];

  public static listRiskEntries(): readonly OperationalRiskEntry[] {
    return Object.freeze(this.risks.map((r) => Object.freeze({ ...r })));
  }

  public static getActiveWaivers(): readonly ExceptionWaiver[] {
    const waivers: ExceptionWaiver[] = [];
    for (const r of this.risks) {
      if (r.activeWaiver) waivers.push(r.activeWaiver);
    }
    return Object.freeze(waivers.map((w) => Object.freeze({ ...w })));
  }
}
