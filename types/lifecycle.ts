// ── Platform Operations & Lifecycle Management Specification (Phase 20A) ────
// Immutable Lifecycle domain interfaces.

export type RolloutState = 'PLANNED' | 'VALIDATING' | 'CANARY' | 'BLUE_GREEN' | 'PROMOTING' | 'COMPLETED' | 'ROLLING_BACK' | 'FAILED';
export type SLOCategory = 'AVAILABILITY' | 'LATENCY' | 'ERROR_RATE' | 'FRESHNESS' | 'WEBHOOK_DELIVERY' | 'API_SUCCESS';

export interface DeploymentRolloutPlan {
  planId: string;
  releaseId: string;
  strategy: 'CANARY' | 'BLUE_GREEN' | 'PROGRESSIVE';
  steps: readonly string[];
  targetEnvironment: string;
  createdTime: string;
}

export interface DeploymentRollout {
  rolloutId: string;
  planId: string;
  releaseId: string;
  state: RolloutState;
  canaryTrafficPercent: number;
  canaryErrorRate: number;
  promotedTime?: string;
}

export interface ConfigurationDrift {
  variableName: string;
  desiredValue: string;
  appliedValue: string;
  observedRuntimeValue: string;
  hasDrift: boolean;
}

export interface SLOBudget {
  sloId: string;
  category: SLOCategory;
  targetPercent: number;
  currentPercent: number;
  errorBudgetRemainingPercent: number;
  burnRate: number;
  status: 'HEALTHY' | 'WARNING' | 'EXHAUSTED';
}

export interface DisasterRecoveryCheck {
  checkId: string;
  backupId: string;
  backupAgeHours: number;
  backupIntegrityPassed: boolean;
  restoreValidationPassed: boolean;
  failoverReadinessPassed: boolean;
  lastVerifiedTime: string;
}

export interface ReleaseTrain {
  trainId: string;
  releaseVersion: string;
  plannedWindow: string;
  participatingComponents: readonly string[];
  requiredApprovals: readonly string[];
  outcome: 'SCHEDULED' | 'IN_PROGRESS' | 'SUCCESSFUL' | 'ROLLED_BACK';
}

export interface PlatformOperationsProjection {
  projectionId: string;
  projectionVersion: number;
  platformVersion: string;
  generatedAt: string;
  activeRollouts: readonly DeploymentRollout[];
  configurationDrifts: readonly ConfigurationDrift[];
  sloBudgets: readonly SLOBudget[];
  disasterRecoveryChecks: readonly DisasterRecoveryCheck[];
  releaseTrains: readonly ReleaseTrain[];
}
