// ── Platform Integration & Production Readiness Specification (Phase 19A) ────
// Immutable Integration domain interfaces.

export type ReadinessStatus = 'NOT_READY' | 'CONDITIONALLY_READY' | 'READY' | 'CERTIFIED';

export interface WorkflowScenario {
  scenarioId: string;
  name: string;
  preconditions: readonly string[];
  steps: readonly string[];
  expectedEvents: readonly string[];
  successCriteria: string;
}

export interface CrossSubsystemWorkflowResult {
  scenarioId: string;
  name: string;
  passed: boolean;
  durationMs: number;
  logs: readonly string[];
  executedAt: string;
}

export interface SubsystemContract {
  provider: string;
  expectedProjection: string;
  failureBehaviour: 'DEGRADE_GRACEFULLY' | 'CIRCUIT_BREAK' | 'FALLBACK_PROJECTION';
  compatibilityVersion: string;
  verified: boolean;
}

export interface OperationalRunbookStep {
  stepId: string;
  instruction: string;
  expectedOutcome: string;
  passed: boolean;
}

export interface OperationalRunbook {
  id: string;
  title: string;
  category: 'DEPLOYMENT' | 'INCIDENT_RESPONSE' | 'RECOVERY_ROLLBACK' | 'CONFIGURATION_AUDIT';
  prerequisites: readonly string[];
  steps: readonly OperationalRunbookStep[];
  rollbackProcedure: string;
  verifiedAt: string;
}

export interface ProductionAuditCheck {
  checkId: string;
  title: string;
  category: 'LOAD' | 'SECURITY' | 'INFRASTRUCTURE' | 'GOVERNANCE';
  passed: boolean;
  observation: string;
}

export interface ReleaseGovernanceContract {
  architectureRelease: string; // e.g. "AR-13A.0"
  platformVersion: string; // e.g. "v1.0.0"
  schemaVersion: string; // e.g. "v1.0"
  migrationVersion: string;
  compatibilityVersion: string;
  approvedForRelease: boolean;
}

export interface ProductionCertificationDecision {
  certified: boolean;
  status: ReadinessStatus;
  decisionBy: string;
  decidedAt: string;
  rationale: string;
}

export interface PlatformReadinessProjection {
  projectionId: string;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  readinessStatus: ReadinessStatus;
  certification: ProductionCertificationDecision;
  governance: ReleaseGovernanceContract;
  subsystemContracts: readonly SubsystemContract[];
  workflowResults: readonly CrossSubsystemWorkflowResult[];
  runbooks: readonly OperationalRunbook[];
  auditChecks: readonly ProductionAuditCheck[];
}
