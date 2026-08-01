// ── Platform Governance, Audit & Compliance Specification (Phase 20B) ────────
// Immutable Governance domain interfaces.

export type GovernancePolicyCategory = 'SECURITY' | 'OPERATIONS' | 'DEPLOYMENT' | 'EDITORIAL';
export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'EXEMPT';

export interface GovernancePolicy {
  policyId: string;
  category: GovernancePolicyCategory;
  name: string;
  version: string;
  enforced: boolean;
  evaluationRule: string;
}

export interface CorrelatedAuditEvent {
  eventId: string;
  correlationId: string;
  sourceSubsystem: string;
  action: string;
  actor: string;
  timestamp: string;
  details: Record<string, unknown>;
}

export interface ComplianceControlCheck {
  controlId: string;
  framework: string; // e.g. "PLATFORM-STRICT" or "SOC2-SIM"
  title: string;
  status: ComplianceStatus;
  evidenceSummary: string;
  lastAuditedTime: string;
}

export interface ExceptionWaiver {
  waiverId: string;
  riskId: string;
  approvedBy: string;
  expirationDate: string;
  justification: string;
}

export interface OperationalRiskEntry {
  riskId: string;
  title: string;
  category: string;
  severity: RiskSeverity;
  score: number; // 0 to 100
  mitigationStatus: 'MITIGATED' | 'ACCEPTED_WITH_WAIVER' | 'UNMITIGATED';
  activeWaiver?: ExceptionWaiver;
}

export interface PlatformGovernanceProjection {
  projectionId: string;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  overallPosture: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
  policies: readonly GovernancePolicy[];
  recentCorrelatedAudits: readonly CorrelatedAuditEvent[];
  complianceChecks: readonly ComplianceControlCheck[];
  riskEntries: readonly OperationalRiskEntry[];
  activeWaivers: readonly ExceptionWaiver[];
}
