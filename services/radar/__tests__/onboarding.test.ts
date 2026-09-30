import { describe, it, expect } from 'vitest';
import { SourceOnboardingEngine, OnboardingRecord } from '../discovery/onboarding';

describe('SourceOnboardingEngine', () => {
  const engine = new SourceOnboardingEngine();

  it('calculates lifecycle onboarding latencies correctly', () => {
    const timeline = {
      candidateCreatedAt: '2026-03-01T10:00:00Z',
      validatedAt: '2026-03-01T10:05:00Z',
      approvedAt: '2026-03-01T10:30:00Z',
      activatedAt: '2026-03-01T10:30:00Z', // 30 mins to activation
      firstSuccessAt: '2026-03-01T10:45:00Z', // 15 mins to first obs
      firstEventAt: '2026-03-01T11:15:00Z', // 30 mins to first event
    };

    const latencies = engine.calculateLatencies(timeline);
    expect(latencies.timeToActivationMinutes).toBe(30);
    expect(latencies.timeToFirstObservationMinutes).toBe(15);
    expect(latencies.timeToFirstEventMinutes).toBe(30);
  });

  it('evaluates onboarding experiment cohort and classifies rejections', () => {
    const sampleCohort: OnboardingRecord[] = [
      {
        candidateId: 'cand_1',
        sourceUrl: 'https://bhopal.nic.in/feed',
        organizationName: 'Bhopal Admin',
        geography: 'Bhopal',
        beat: 'government',
        timeline: {
          candidateCreatedAt: '2026-03-01T10:00:00Z',
          validatedAt: '2026-03-01T10:02:00Z',
          approvedAt: '2026-03-01T10:15:00Z',
          activatedAt: '2026-03-01T10:15:00Z',
          firstSuccessAt: '2026-03-01T10:20:00Z',
        },
        status: 'ACTIVATED',
        firstFetchSuccess: true,
        eventsYielded: 2,
      },
      {
        candidateId: 'cand_2',
        sourceUrl: 'https://fake-mirror.com/feed',
        organizationName: 'Fake Mirror',
        geography: 'Bhopal',
        beat: 'government',
        timeline: {
          candidateCreatedAt: '2026-03-01T11:00:00Z',
          validatedAt: '2026-03-01T11:05:00Z',
        },
        status: 'REJECTED',
        rejectionReason: 'MIRROR',
        firstFetchSuccess: false,
        eventsYielded: 0,
      },
      {
        candidateId: 'cand_3',
        sourceUrl: 'https://ssrf-attempt.internal/feed',
        organizationName: 'Hostile SSRF',
        geography: 'Unknown',
        beat: 'government',
        timeline: {
          candidateCreatedAt: '2026-03-01T12:00:00Z',
        },
        status: 'REJECTED',
        rejectionReason: 'SECURITY_REJECTED',
        firstFetchSuccess: false,
        eventsYielded: 0,
      },
    ];

    const report = engine.evaluateExperiment(sampleCohort);
    expect(report.totalCandidatesSampled).toBe(3);
    expect(report.totalActivated).toBe(1);
    expect(report.totalRejected).toBe(2);
    expect(report.firstFetchSuccessRate).toBe(1.0);
    expect(report.failureBreakdown.MIRROR).toBe(1);
    expect(report.failureBreakdown.SECURITY_REJECTED).toBe(1);
  });
});
