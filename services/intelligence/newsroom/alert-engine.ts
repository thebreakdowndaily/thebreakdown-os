/**
 * ─── Alert Engine (Newsroom Intelligence OS) ─────────────────────────────────
 *
 * Core rule:
 * Generates deduplicated, idempotent IntelligenceAlerts from meaningful
 * state transitions.
 * Idempotency Key: signalId:triggerReason:version
 */

import {
  NewsroomSignal,
  IntelligenceAlert,
  AlertTriggerReason,
  AlertDeliveryChannel,
} from '@/types/newsroom-intelligence';
import { beatRoutingService } from './beat-routing-service';

export class AlertEngine {
  private alerts: Map<string, IntelligenceAlert> = new Map();
  private shadowMode = true; // Shadow mode default
  private phase1InternalAlertingActive = false; // Phase 1 restricted internal alerting toggle
  private killSwitchEngaged = false; // Immediate administrative kill switch

  public setShadowMode(active: boolean): void {
    this.shadowMode = active;
  }

  public isShadowMode(): boolean {
    return this.shadowMode;
  }

  public activatePhase1InternalAlerting(authorized: boolean): boolean {
    if (!authorized) return false;
    this.phase1InternalAlertingActive = true;
    this.killSwitchEngaged = false;
    return true;
  }

  public engageKillSwitch(): void {
    this.killSwitchEngaged = true;
    this.phase1InternalAlertingActive = false;
  }

  public isPhase1Active(): boolean {
    if (this.isPhase2Active()) return false;
    return this.phase1InternalAlertingActive && !this.killSwitchEngaged;
  }

  public isPhase2Active(): boolean {
    return beatRoutingService.isPhase2Active() && !this.killSwitchEngaged;
  }

  /**
   * Evaluates signal transitions and emits alerts if thresholds are met.
   */
  public evaluateSignalForAlert(
    signal: NewsroomSignal,
    previousSignal?: NewsroomSignal,
    hasMajorContradiction = false,
    now: Date = new Date()
  ): IntelligenceAlert | null {
    let triggerReason: AlertTriggerReason | null = null;
    let message = '';

    if (!previousSignal) {
      if (signal.priority === 'P0' || signal.priority === 'P1') {
        triggerReason = 'first_detection';
        message = `First detection of ${signal.priority} signal: "${signal.title}". ${signal.explanation.whyItMatters}`;
      }
    } else {
      // Check for priority escalation (e.g. P2 -> P1 or P1 -> P0)
      const priorityRanks = { P0: 4, P1: 3, P2: 2, P3: 1 };
      if (priorityRanks[signal.priority] > priorityRanks[previousSignal.priority]) {
        triggerReason = 'priority_escalation';
        message = `Signal escalated from ${previousSignal.priority} to ${signal.priority}: "${signal.title}".`;
      } else if (
        previousSignal.primarySourceCount === 0 &&
        signal.primarySourceCount > 0
      ) {
        triggerReason = 'primary_confirmation';
        message = `Primary official source emerged for: "${signal.title}".`;
      } else if (hasMajorContradiction && previousSignal.contradictionIds.length === 0) {
        triggerReason = 'major_contradiction';
        message = `Major claim contradiction detected for: "${signal.title}".`;
      } else if (
        previousSignal.lifecycleState !== 'resolved' &&
        signal.lifecycleState === 'resolved'
      ) {
        triggerReason = 'resolution';
        message = `Signal marked resolved: "${signal.title}".`;
      }
    }

    if (!triggerReason) {
      return null;
    }

    const idempotencyKey = `${signal.id}:${triggerReason}:${signal.version}`;

    // Idempotency check: Return existing alert if already generated
    if (this.alerts.has(idempotencyKey)) {
      return this.alerts.get(idempotencyKey)!;
    }

    const alertId = `alt-${signal.id}-${Date.now()}`;
    let delivery: AlertDeliveryChannel | undefined = undefined;
    let shadowMode = true;

    if (this.isPhase2Active()) {
      const beatDeliveries = beatRoutingService.routeAlert(signal, alertId, now);
      delivery = {
        channelType: 'beat_desk_channel',
        deliveryTimestamp: now.toISOString(),
        deliveredBy: 'Newsroom Intelligence Phase 2 Beat Dispatcher',
        beatDeliveries,
      };
      shadowMode = false;
    } else if (this.isPhase1Active()) {
      delivery = {
        channelType: 'internal_editorial_channel',
        recipientRoles: ['managing_editor', 'fact_checker'],
        deliveryTimestamp: now.toISOString(),
        deliveredBy: 'Newsroom Intelligence Phase 1 Dispatcher',
      };
      shadowMode = false;
    }

    const alert: IntelligenceAlert = {
      id: alertId,
      idempotencyKey,
      signalId: signal.id,
      clusterId: signal.clusterId,
      triggerReason,
      priority: signal.priority,
      title: `${signal.priority} Alert — ${triggerReason.replace('_', ' ').toUpperCase()}`,
      message,
      triggeredAt: now.toISOString(),
      acknowledged: false,
      shadowMode,
      delivery,
    };

    this.alerts.set(idempotencyKey, alert);
    return alert;
  }

  public getAlerts(unacknowledgedOnly = false): IntelligenceAlert[] {
    const list = Array.from(this.alerts.values()).sort(
      (a, b) =>
        new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
    );
    if (unacknowledgedOnly) {
      return list.filter((a) => !a.acknowledged);
    }
    return list;
  }

  public acknowledgeAlert(
    alertId: string,
    actorId: string,
    now: Date = new Date()
  ): boolean {
    const alert = Array.from(this.alerts.values()).find((a) => a.id === alertId);
    if (!alert) return false;

    // Track user alert action telemetry
    beatRoutingService.recordUserAlertAction(actorId, 'ALERT_ACK');

    let updated = false;

    if (alert.delivery?.channelType === 'beat_desk_channel' && alert.delivery.beatDeliveries) {
      const target = alert.delivery.beatDeliveries.find(d => d.recipientId === actorId);
      if (target) {
        if (target.deliveryStatus === 'acknowledged') {
          // Stale acknowledgement / conflict handling: do not modify, return false or true to show status
          return false;
        }
        target.deliveryStatus = 'acknowledged';
        target.acknowledgedAt = now.toISOString();
        target.acknowledgedBy = actorId;
        updated = true;
      }
    }

    if (!alert.acknowledged) {
      alert.acknowledged = true;
      alert.acknowledgedAt = now.toISOString();
      alert.acknowledgedBy = actorId;
      updated = true;
    }

    return updated;
  }

  public clear(): void {
    this.alerts.clear();
    this.shadowMode = true;
    this.phase1InternalAlertingActive = false;
    this.killSwitchEngaged = false;
  }

  /**
   * Durable snapshot of alert state + engine flags (Operating Standard §21).
   * In-memory alert state is NOT the authoritative copy — it is a projection
   * that must be reconstructible from the persisted snapshot.
   */
  public snapshotAlerts(): IntelligenceAlert[] {
    return Array.from(this.alerts.values());
  }

  public snapshotEngine(): { shadowMode: boolean; phase1InternalAlertingActive: boolean; killSwitchEngaged: boolean } {
    return {
      shadowMode: this.shadowMode,
      phase1InternalAlertingActive: this.phase1InternalAlertingActive,
      killSwitchEngaged: this.killSwitchEngaged,
    };
  }

  public restore(alerts: IntelligenceAlert[], engine: { shadowMode: boolean; phase1InternalAlertingActive: boolean; killSwitchEngaged: boolean }): void {
    this.alerts.clear();
    for (const alert of alerts) {
      this.alerts.set(alert.idempotencyKey, alert);
    }
    this.shadowMode = engine.shadowMode;
    this.phase1InternalAlertingActive = engine.phase1InternalAlertingActive;
    this.killSwitchEngaged = engine.killSwitchEngaged;
  }
}
