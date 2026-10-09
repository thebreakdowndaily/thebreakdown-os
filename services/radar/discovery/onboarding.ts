/**
 * ─── Source Onboarding Pipeline & Experiment Engine ───────────────────────────
 *
 * Governing document: AGENTS.md (Platform Beta)
 * Phase 6: Global Sensor Deployment & Real-World Benchmarking
 *
 * Tracks the complete source acquisition and activation timeline:
 *   candidate_created_at → validated_at → approved_at → activated_at → first_success_at → first_event_at
 *
 * Measures:
 *   - time_to_source_activation (minutes)
 *   - time_to_first_observation (minutes)
 *   - time_to_first_event (minutes)
 *
 * Classifies onboarding rejections per the Phase 6 taxonomy.
 */

export type OnboardingRejectionReason =
  | 'INVALID_SOURCE'
  | 'WRONG_GEOGRAPHY'
  | 'DUPLICATE'
  | 'MIRROR'
  | 'UNREACHABLE'
  | 'UNSUPPORTED_FORMAT'
  | 'LOW_VALUE'
  | 'SECURITY_REJECTED'
  | 'EDITOR_REJECTED';

export interface OnboardingTimeline {
  candidateCreatedAt: string;
  validatedAt?: string;
  approvedAt?: string;
  activatedAt?: string;
  firstSuccessAt?: string;
  firstEventAt?: string;
}

export interface OnboardingRecord {
  candidateId: string;
  sourceUrl: string;
  organizationName: string;
  geography: string;
  beat: string;
  timeline: OnboardingTimeline;
  status: 'PENDING_APPROVAL' | 'ACTIVATED' | 'REJECTED';
  rejectionReason?: OnboardingRejectionReason;
  firstFetchSuccess: boolean;
  eventsYielded: number;
}

export interface OnboardingExperimentReport {
  totalCandidatesSampled: number;
  totalValidated: number;
  totalApproved: number;
  totalActivated: number;
  totalRejected: number;
  validationAccuracy: number; // 0.0 - 1.0
  activationSuccessRate: number; // 0.0 - 1.0
  firstFetchSuccessRate: number; // 0.0 - 1.0
  meanTimeToActivationMinutes: number | null;
  meanTimeToFirstObservationMinutes: number | null;
  meanTimeToFirstEventMinutes: number | null;
  failureBreakdown: Record<OnboardingRejectionReason, number>;
}

export class SourceOnboardingEngine {
  /**
   * Computes lifecycle latencies for a completed onboarding timeline.
   */
  public calculateLatencies(timeline: OnboardingTimeline): {
    timeToActivationMinutes: number | null;
    timeToFirstObservationMinutes: number | null;
    timeToFirstEventMinutes: number | null;
  } {
    const createdMs = new Date(timeline.candidateCreatedAt).getTime();
    const activatedMs = timeline.activatedAt ? new Date(timeline.activatedAt).getTime() : null;
    const successMs = timeline.firstSuccessAt ? new Date(timeline.firstSuccessAt).getTime() : null;
    const eventMs = timeline.firstEventAt ? new Date(timeline.firstEventAt).getTime() : null;

    const timeToActivationMinutes =
      activatedMs && activatedMs >= createdMs
        ? Math.round((activatedMs - createdMs) / (1000 * 60))
        : null;

    const timeToFirstObservationMinutes =
      successMs && activatedMs && successMs >= activatedMs
        ? Math.round((successMs - activatedMs) / (1000 * 60))
        : null;

    const timeToFirstEventMinutes =
      eventMs && successMs && eventMs >= successMs
        ? Math.round((eventMs - successMs) / (1000 * 60))
        : null;

    return {
      timeToActivationMinutes,
      timeToFirstObservationMinutes,
      timeToFirstEventMinutes,
    };
  }

  /**
   * Evaluates an empirical onboarding experiment across a cohort of candidate sources.
   */
  public evaluateExperiment(records: OnboardingRecord[]): OnboardingExperimentReport {
    const totalCandidatesSampled = records.length;
    const totalValidated = records.filter((r) => r.timeline.validatedAt).length;
    const totalApproved = records.filter((r) => r.timeline.approvedAt).length;
    const totalActivated = records.filter((r) => r.status === 'ACTIVATED').length;
    const totalRejected = records.filter((r) => r.status === 'REJECTED').length;

    const activationTimes: number[] = [];
    const observationTimes: number[] = [];
    const eventTimes: number[] = [];

    const failureBreakdown: Record<OnboardingRejectionReason, number> = {
      INVALID_SOURCE: 0,
      WRONG_GEOGRAPHY: 0,
      DUPLICATE: 0,
      MIRROR: 0,
      UNREACHABLE: 0,
      UNSUPPORTED_FORMAT: 0,
      LOW_VALUE: 0,
      SECURITY_REJECTED: 0,
      EDITOR_REJECTED: 0,
    };

    let firstFetchSuccessCount = 0;

    for (const rec of records) {
      if (rec.rejectionReason && failureBreakdown[rec.rejectionReason] !== undefined) {
        failureBreakdown[rec.rejectionReason]++;
      }

      if (rec.firstFetchSuccess) {
        firstFetchSuccessCount++;
      }

      const l = this.calculateLatencies(rec.timeline);
      if (l.timeToActivationMinutes !== null) activationTimes.push(l.timeToActivationMinutes);
      if (l.timeToFirstObservationMinutes !== null) observationTimes.push(l.timeToFirstObservationMinutes);
      if (l.timeToFirstEventMinutes !== null) eventTimes.push(l.timeToFirstEventMinutes);
    }

    const mean = (arr: number[]) => (arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null);

    return {
      totalCandidatesSampled,
      totalValidated,
      totalApproved,
      totalActivated,
      totalRejected,
      validationAccuracy: totalCandidatesSampled > 0 ? Math.round((totalValidated / totalCandidatesSampled) * 100) / 100 : 0,
      activationSuccessRate: totalApproved > 0 ? Math.round((totalActivated / totalApproved) * 100) / 100 : 0,
      firstFetchSuccessRate: totalActivated > 0 ? Math.round((firstFetchSuccessCount / totalActivated) * 100) / 100 : 0,
      meanTimeToActivationMinutes: mean(activationTimes),
      meanTimeToFirstObservationMinutes: mean(observationTimes),
      meanTimeToFirstEventMinutes: mean(eventTimes),
      failureBreakdown,
    };
  }
}
