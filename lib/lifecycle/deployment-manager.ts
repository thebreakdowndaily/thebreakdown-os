// ── Deployment Lifecycle Manager & State Machine (Phase 20A Recommendation 2) ───

import { DeploymentRollout, DeploymentRolloutPlan, RolloutState } from '../../types/lifecycle';
import { DeploymentPlanner } from './deployment-planner';

export class DeploymentLifecycleManager {
  private activeRollouts = new Map<string, DeploymentRollout>();

  constructor() {
    // Initial default rollout
    const defaultPlan = DeploymentPlanner.createRolloutPlan('rel-v1.0.0', 'CANARY');
    this.executePlan(defaultPlan);
  }

  public executePlan(plan: DeploymentRolloutPlan): DeploymentRollout {
    const rollout: DeploymentRollout = Object.freeze({
      rolloutId: `roll-${Date.now()}`,
      planId: plan.planId,
      releaseId: plan.releaseId,
      state: 'CANARY' as RolloutState,
      canaryTrafficPercent: 10,
      canaryErrorRate: 0.001,
      promotedTime: new Date().toISOString(),
    });
    this.activeRollouts.set(rollout.rolloutId, rollout);
    return rollout;
  }

  public transitionState(rolloutId: string, newState: RolloutState): DeploymentRollout {
    const existing = this.activeRollouts.get(rolloutId);
    if (!existing) throw new Error(`Rollout not found: ${rolloutId}`);

    const updated: DeploymentRollout = Object.freeze({
      ...existing,
      state: newState,
      promotedTime: newState === 'COMPLETED' ? new Date().toISOString() : existing.promotedTime,
    });
    this.activeRollouts.set(rolloutId, updated);
    return updated;
  }

  public triggerAutomatedRollback(rolloutId: string): DeploymentRollout {
    return this.transitionState(rolloutId, 'ROLLING_BACK');
  }

  public getActiveRollouts(): readonly DeploymentRollout[] {
    return Object.freeze(Array.from(this.activeRollouts.values()));
  }
}
