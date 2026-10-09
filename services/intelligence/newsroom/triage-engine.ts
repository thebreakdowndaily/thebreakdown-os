/**
 * ─── Newsroom Signal Triage Engine ───────────────────────────────────────────
 *
 * Governing document: AGENTS.md (Platform Beta) & Phase 11 Newsroom Operating System
 *
 * Implements deterministic Signal-to-Noise Ratio (SNR) evaluation:
 *
 *         Δ Evidence Salience × Source Authority × Confidence
 *   SNR = ───────────────────────────────────────────────────
 *               Update Frequency × Cognitive Load
 *
 * Thresholds:
 *   - Critical: SNR >= 0.85  (Immediate breaking dispatch / live brief)
 *   - High:     0.65 <= SNR < 0.85 (Priority task assignment / verify primary source)
 *   - Medium:   0.40 <= SNR < 0.65 (Developing cluster / scheduled digest)
 *   - Low:      SNR < 0.40   (Contextual / noise suppressed)
 */

import type { NewsroomSignal, EditorialPriority } from '@/types/newsroom-intelligence';

export type TriageTier = 'critical' | 'high' | 'medium' | 'low';

export interface SNRParameters {
  /** Delta evidence salience [0.0 - 1.0]: magnitude of new empirical knowledge */
  evidenceSalience: number;
  /** Source authority [0.0 - 1.0]: institutional weight of the origin source */
  sourceAuthority: number;
  /** Evaluator confidence [0.0 - 1.0]: verification certainty */
  confidence: number;
  /** Update frequency factor [1.0 - 5.0]: penalizes high-cadence noisy sources */
  updateFrequency?: number;
  /** Cognitive load factor [1.0 - 5.0]: penalizes overload / unresolved ambiguities */
  cognitiveLoad?: number;
}

export interface TriageAssessment {
  signalId: string;
  snr: number;
  tier: TriageTier;
  mappedPriority: EditorialPriority;
  action: 'immediate_dispatch' | 'priority_assignment' | 'developing_digest' | 'noise_suppressed';
  suppressNotification: boolean;
  suppressionReason?: string;
  suggestedCadenceHours: number;
  formulaDetails: {
    numerator: number;
    denominator: number;
    evidenceSalience: number;
    sourceAuthority: number;
    confidence: number;
    updateFrequency: number;
    cognitiveLoad: number;
  };
  explanation: string;
}

export class NewsroomTriageEngine {
  private recentAlertWindowMs: number;
  private recentAlerts: Map<string, { timestamp: number; salience: number }> = new Map();

  constructor(recentAlertWindowMinutes = 60) {
    this.recentAlertWindowMs = recentAlertWindowMinutes * 60 * 1000;
  }

  /**
   * Computes the deterministic Signal-to-Noise Ratio (SNR).
   */
  public calculateSNR(params: SNRParameters): {
    snr: number;
    numerator: number;
    denominator: number;
    frequency: number;
    load: number;
  } {
    const salience = Math.max(0, Math.min(1, params.evidenceSalience));
    const authority = Math.max(0, Math.min(1, params.sourceAuthority));
    const confidence = Math.max(0, Math.min(1, params.confidence));
    const frequency = Math.max(1.0, params.updateFrequency ?? 1.0);
    const load = Math.max(1.0, params.cognitiveLoad ?? 1.0);

    const numerator = salience * authority * confidence;
    const denominator = frequency * load;

    const rawSnr = numerator / denominator;
    const snr = Math.max(0, Math.min(1, Number(rawSnr.toFixed(4))));

    return { snr, numerator, denominator, frequency, load };
  }

  /**
   * Maps a NewsroomSignal into an actionable TriageAssessment with anti-fatigue filtering.
   */
  public triageSignal(
    signal: NewsroomSignal,
    options?: {
      sourceAuthorityOverride?: number;
      updateCadencePerHour?: number;
      pendingAlertCount?: number;
      currentTimeMs?: number;
    }
  ): TriageAssessment {
    const now = options?.currentTimeMs ?? Date.now();

    // 1. Derive parameters from signal metrics
    const evidenceSalience = signal.scores.evidenceStrength / 100;
    const confidence = signal.scores.confidence / 100;

    // Source authority weighting based on primary source count and reliability score
    let sourceAuthority = options?.sourceAuthorityOverride ?? (signal.scores.sourceReliability / 100);
    if (signal.primarySourceCount > 0) {
      sourceAuthority = Math.max(sourceAuthority, 0.95);
    }

    // Dynamic frequency penalty (sources broadcasting > 5 updates/hr increase denominator)
    const cadence = options?.updateCadencePerHour ?? 1;
    const updateFrequency = 1.0 + Math.max(0, (cadence - 1) * 0.15);

    // Dynamic cognitive load (unresolved contradictions or pending queue depth)
    const contradictionPenalty = signal.contradictionIds.length * 0.25;
    const queuePenalty = Math.min(1.0, (options?.pendingAlertCount ?? 0) * 0.05);
    const cognitiveLoad = 1.0 + contradictionPenalty + queuePenalty;

    // 2. Compute SNR
    const { snr, numerator, denominator, frequency, load } = this.calculateSNR({
      evidenceSalience,
      sourceAuthority,
      confidence,
      updateFrequency,
      cognitiveLoad,
    });

    // 3. Classify tier
    let tier: TriageTier;
    let mappedPriority: EditorialPriority;
    let action: TriageAssessment['action'];
    let suggestedCadenceHours: number;

    if (snr >= 0.85) {
      tier = 'critical';
      mappedPriority = 'P0';
      action = 'immediate_dispatch';
      suggestedCadenceHours = 0.5; // Every 30 mins
    } else if (snr >= 0.65) {
      tier = 'high';
      mappedPriority = 'P1';
      action = 'priority_assignment';
      suggestedCadenceHours = 2.0; // Every 2 hours
    } else if (snr >= 0.40) {
      tier = 'medium';
      mappedPriority = 'P2';
      action = 'developing_digest';
      suggestedCadenceHours = 6.0; // Every 6 hours
    } else {
      tier = 'low';
      mappedPriority = 'P3';
      action = 'noise_suppressed';
      suggestedCadenceHours = 24.0; // Daily digest
    }

    // 4. Anti-fatigue noise suppression logic
    let suppressNotification = false;
    let suppressionReason: string | undefined;

    const clusterKey = signal.clusterId || signal.id;
    const priorAlert = this.recentAlerts.get(clusterKey);

    if (priorAlert && now - priorAlert.timestamp < this.recentAlertWindowMs) {
      const salienceDelta = evidenceSalience - priorAlert.salience;
      // If an alert was fired recently and there's no major jump in evidence salience, suppress
      if (salienceDelta < 0.25 && tier !== 'critical') {
        suppressNotification = true;
        suppressionReason = `Noise suppression: Alert already dispatched within window (${Math.round(
          (now - priorAlert.timestamp) / 60000
        )}m ago) and salience delta (${salienceDelta.toFixed(2)}) < threshold (0.25).`;
      }
    }

    if (tier === 'low') {
      suppressNotification = true;
      suppressionReason = suppressionReason || 'SNR below minimum reporting threshold (0.40); routed to background digest.';
    }

    // If not suppressed, record alert for anti-fatigue tracking
    if (!suppressNotification) {
      this.recentAlerts.set(clusterKey, { timestamp: now, salience: evidenceSalience });
    }

    const explanation = `SNR=${snr.toFixed(3)} [Tier: ${tier.toUpperCase()}] — Salience=${evidenceSalience.toFixed(
      2
    )}, Authority=${sourceAuthority.toFixed(2)}, Conf=${confidence.toFixed(2)} | Freq=${frequency.toFixed(
      2
    )}, Load=${load.toFixed(2)}`;

    return {
      signalId: signal.id,
      snr,
      tier,
      mappedPriority,
      action,
      suppressNotification,
      suppressionReason,
      suggestedCadenceHours,
      formulaDetails: {
        numerator,
        denominator,
        evidenceSalience,
        sourceAuthority,
        confidence,
        updateFrequency: frequency,
        cognitiveLoad: load,
      },
      explanation,
    };
  }

  /**
   * Resets alert history (useful for testing or cache flushes).
   */
  public resetHistory(): void {
    this.recentAlerts.clear();
  }
}

export const globalTriageEngine = new NewsroomTriageEngine();
