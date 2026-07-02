'use client';

import React, { useEffect, useState } from 'react';
import type { AggregateStoryAnalytics, ImprovementReport } from '@/utils/analytics';

// ── Types ──────────────────────────────────────────────────────────────────

interface AnalyticsSummary {
  totalEvents: number;
  uniqueStories: number;
  stories: string[];
  eventTypeCounts: Record<string, number>;
  oldestEvent: string;
  newestEvent: string;
}

interface StoryAnalyticsResponse {
  slug: string;
  analytics: AggregateStoryAnalytics | null;
  improvementReport: ImprovementReport | null;
  totalEvents: number;
}

// ── Number Formatter ───────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function fmtPct(n: number): string {
  return (n * 100).toFixed(0) + '%';
}

function fmtTime(ms: number): string {
  if (ms >= 60_000) return (ms / 60_000).toFixed(1) + 'm';
  if (ms >= 1_000) return (ms / 1_000).toFixed(0) + 's';
  return ms + 'ms';
}

// ── Styles ─────────────────────────────────────────────────────────────────

const sectionStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-bg-secondary)',
  border: '1px solid var(--color-border-default)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--spacing-5)',
};

const headingStyle: React.CSSProperties = {
  fontSize: 'var(--text-sm)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--color-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 'var(--spacing-3)',
};

const valueStyle: React.CSSProperties = {
  fontSize: 'var(--text-2xl)',
  fontWeight: 'var(--font-weight-bold)',
  color: 'var(--color-text-primary)',
};

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-muted)',
};

// ── Metric Card ────────────────────────────────────────────────────────────

function MetricCard({ value, label, trend }: { value: string; label: string; trend?: { dir: 'up' | 'down' | 'neutral'; pct: string } }) {
  return (
    <div style={sectionStyle}>
      <div style={valueStyle}>{value}</div>
      <div style={{ ...labelStyle, marginTop: 'var(--spacing-1)' }}>{label}</div>
      {trend && (
        <div style={{
          fontSize: 'var(--text-xs)',
          marginTop: 'var(--spacing-1)',
          color: trend.dir === 'up' ? 'var(--color-success)' : trend.dir === 'down' ? 'var(--color-error)' : 'var(--color-text-muted)',
        }}>
          {trend.dir === 'up' ? '▲' : trend.dir === 'down' ? '▼' : '◆'} {trend.pct}
        </div>
      )}
    </div>
  );
}

// ── Section Engagement Bar ─────────────────────────────────────────────────

function SectionEngagementBar({ sectionId, engagement }: {
  sectionId: string;
  engagement: { avgTime: number; totalEntries: number; dropoffRate: number };
}) {
  const barWidth = Math.max(4, (1 - engagement.dropoffRate) * 100);
  const isLow = engagement.dropoffRate > 0.12;
  const isGood = engagement.dropoffRate < 0.05 && engagement.avgTime > 30000;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--spacing-3)',
      padding: 'var(--spacing-2) 0',
      borderBottom: '1px solid var(--color-border-subtle)',
    }}>
      {/* Section label */}
      <div style={{
        width: '140px',
        flexShrink: 0,
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-primary)',
        fontWeight: isLow ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
      }}>
        {sectionId.replace(/-/g, ' ')}
        {isLow && <span style={{ color: 'var(--color-error)', marginLeft: 'var(--spacing-1)' }}>⚠</span>}
        {isGood && <span style={{ color: 'var(--color-success)', marginLeft: 'var(--spacing-1)' }}>✓</span>}
      </div>

      {/* Engagement bar */}
      <div style={{
        flex: 1,
        height: '20px',
        backgroundColor: 'var(--color-bg-tertiary)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          width: `${barWidth}%`,
          height: '100%',
          backgroundColor: isLow ? 'var(--color-error)' : isGood ? 'var(--color-success)' : 'var(--color-brand-400)',
          borderRadius: 'var(--radius-sm)',
          opacity: 0.7,
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Stats */}
      <div style={{ width: '100px', textAlign: 'right', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
        <div>{fmtTime(engagement.avgTime)} avg</div>
        <div>{engagement.totalEntries} entries</div>
      </div>
    </div>
  );
}

// ── Improvement Recommendation Card ────────────────────────────────────────

function RecommendationCard({ rec }: { rec: ImprovementReport['recommendations'][0] }) {
  const priorityColors: Record<string, { bg: string; text: string }> = {
    high: { bg: 'var(--color-error)', text: 'white' },
    medium: { bg: 'var(--color-warning)', text: 'var(--color-bg-primary)' },
    low: { bg: 'var(--color-bg-tertiary)', text: 'var(--color-text-secondary)' },
  };

  const pc = priorityColors[rec.priority] || priorityColors.low;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--spacing-3)',
      padding: 'var(--spacing-3)',
      backgroundColor: 'var(--color-bg-tertiary)',
      borderRadius: 'var(--radius-md)',
      borderLeft: `3px solid ${pc.bg}`,
    }}>
      <div style={{
        padding: '2px 6px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: pc.bg,
        color: pc.text,
        fontSize: '10px',
        fontWeight: 'var(--font-weight-bold)',
        textTransform: 'uppercase',
        flexShrink: 0,
      }}>
        {rec.priority}
      </div>
      <div>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
          {rec.action.replace(/_/g, ' ')} — {rec.target}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
          {rec.reason}
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────

interface AnalyticsDashboardProps {
  /** Default story slug to show analytics for */
  defaultStory?: string;
  /** All available story slugs */
  storySlugs?: string[];
}

export default function AnalyticsDashboard({ defaultStory, storySlugs }: AnalyticsDashboardProps) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [selectedSlug, setSelectedSlug] = useState(defaultStory || '');
  const [storyData, setStoryData] = useState<StoryAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch summary on mount
  useEffect(() => {
    fetch('/api/analytics?aggregate=false')
      .then((r) => r.json())
      .then((data) => {
        setSummary(data.summary);
        if (!selectedSlug && data.summary?.stories?.length > 0) {
          setSelectedSlug(data.summary.stories[0]);
        }
      })
      .catch(() => setError('Failed to load analytics summary'))
      .finally(() => setLoading(false));
  }, []);

  // Fetch per-story analytics when selected
  useEffect(() => {
    if (!selectedSlug) return;
    setLoading(true);

    fetch(`/api/analytics/story/${selectedSlug}`)
      .then((r) => r.json())
      .then((data) => {
        setStoryData(data);
        setError(null);
      })
      .catch(() => setError('Failed to load story analytics'))
      .finally(() => setLoading(false));
  }, [selectedSlug]);

  const analytics = storyData?.analytics;
  const improvement = storyData?.improvementReport;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-3)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>
            Analytics Dashboard
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Learning-centered metrics — measuring comprehension, not clicks
          </p>
        </div>

        {/* Story selector */}
        <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
          <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            Story:
          </label>
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            style={{
              padding: 'var(--spacing-1) var(--spacing-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-default)',
              backgroundColor: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-sm)',
            }}
          >
            {(storySlugs || summary?.stories || []).map((slug) => (
              <option key={slug} value={slug}>{slug}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overall summary row */}
      {summary && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 'var(--spacing-3)',
        }}>
          <MetricCard value={fmt(summary.totalEvents)} label="Total Events" />
          <MetricCard value={fmt(summary.uniqueStories)} label="Stories Tracked" />
          <MetricCard
            value={fmt(summary.eventTypeCounts['section_view'] || 0)}
            label="Section Views"
          />
          <MetricCard
            value={fmt(summary.eventTypeCounts['scroll'] || 0)}
            label="Scroll Events"
          />
          <MetricCard
            value={fmt((summary.eventTypeCounts['chart_interaction'] || 0) + (summary.eventTypeCounts['timeline_interaction'] || 0))}
            label="Visual Interactions"
          />
          <MetricCard
            value={fmt(summary.eventTypeCounts['share'] || 0)}
            label="Shares"
          />
        </div>
      )}

      {/* Loading / Error */}
      {loading && !analytics && (
        <div style={{ padding: 'var(--spacing-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading analytics...
        </div>
      )}

      {error && (
        <div style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-error-bg)', borderRadius: 'var(--radius-md)', color: 'var(--color-error)' }}>
          {error}
        </div>
      )}

      {/* Per-story analytics */}
      {analytics && (
        <>
          {/* Learning Effectiveness Score */}
          <div style={{
            ...sectionStyle,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-6)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 'var(--text-4xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: analytics.learningEffectivenessScore >= 70 ? 'var(--color-success)' :
                       analytics.learningEffectivenessScore >= 50 ? 'var(--color-warning)' : 'var(--color-error)',
              }}>
                {analytics.learningEffectivenessScore}
              </div>
              <div style={labelStyle}>LES</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={labelStyle}>Learning Effectiveness Score</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-1)' }}>
                {analytics.learningEffectivenessScore >= 70 ? 'Strong performance — readers are learning from this story' :
                 analytics.learningEffectivenessScore >= 50 ? 'Moderate — consider improvements to boost engagement' :
                 'Low — readers are not engaging deeply with this content'}
              </div>
            </div>
          </div>

          {/* Key Metrics Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'var(--spacing-3)',
          }}>
            <MetricCard
              value={fmtPct(analytics.avgScrollCompletion)}
              label="Avg Scroll Completion"
              trend={{ dir: analytics.avgScrollCompletion >= 0.7 ? 'up' : 'down', pct: `${Math.round(analytics.avgScrollCompletion * 100)}%` }}
            />
            <MetricCard
              value={fmtTime(analytics.avgTimeOnPage)}
              label="Avg Time on Page"
            />
            <MetricCard
              value={fmt(analytics.chartInteractions)}
              label="Chart Interactions"
            />
            <MetricCard
              value={fmt(analytics.timelineInteractions)}
              label="Timeline Interactions"
            />
            <MetricCard
              value={fmt(analytics.faqExpansions)}
              label="FAQ Expansions"
            />
            <MetricCard
              value={fmtPct(analytics.returnVisitorRate)}
              label="Return Visit Rate"
              trend={{ dir: analytics.returnVisitorRate >= 0.2 ? 'up' : 'down', pct: `${Math.round(analytics.returnVisitorRate * 100)}%` }}
            />
            <MetricCard value={fmt(analytics.totalReaders)} label="Total Readers" />
            <MetricCard
              value={fmt(Object.values(analytics.sharesPerMedium).reduce((a, b) => a + b, 0))}
              label="Total Shares"
            />
          </div>

          {/* Section Engagement */}
          <div style={sectionStyle}>
            <div style={headingStyle}>Section Engagement</div>
            <div style={labelStyle}>
              Tracking how long readers spend on each section and where they drop off.
              {' '}⚠ = high dropoff (&gt;12%), ✓ = strong engagement
            </div>
            <div style={{ marginTop: 'var(--spacing-3)' }}>
              {Object.entries(analytics.sectionEngagement)
                .sort(([, a], [, b]) => b.totalEntries - a.totalEntries)
                .map(([sectionId, engagement]) => (
                  <SectionEngagementBar
                    key={sectionId}
                    sectionId={sectionId}
                    engagement={engagement}
                  />
                ))}
            </div>
            {Object.keys(analytics.sectionEngagement).length === 0 && (
              <div style={{ padding: 'var(--spacing-4)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                No section tracking data yet
              </div>
            )}
          </div>

          {/* Dropoff Points */}
          {analytics.highDropoffPoints.length > 0 && (
            <div style={sectionStyle}>
              <div style={headingStyle}>Dropoff Points</div>
              <div style={labelStyle}>Scroll depths where &gt;10% of readers leave:</div>
              <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-3)', flexWrap: 'wrap' }}>
                {analytics.highDropoffPoints.map((point, i) => (
                  <div key={i} style={{
                    padding: 'var(--spacing-2) var(--spacing-3)',
                    backgroundColor: 'var(--color-error-bg)',
                    color: 'var(--color-error)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                  }}>
                    {Math.round(point * 100)}% depth
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shares Breakdown */}
          <div style={sectionStyle}>
            <div style={headingStyle}>Shares by Medium</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 'var(--spacing-3)',
              marginTop: 'var(--spacing-3)',
            }}>
              {Object.entries(analytics.sharesPerMedium).map(([medium, count]) => (
                <div key={medium} style={{ textAlign: 'center' }}>
                  <div style={valueStyle}>{count}</div>
                  <div style={labelStyle}>{medium.replace('_', ' ')}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Improvement Report */}
      {improvement && (
        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-4)' }}>
            <div style={headingStyle}>Story Improvement Report</div>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              backgroundColor: 'var(--color-bg-tertiary)',
              padding: 'var(--spacing-1) var(--spacing-2)',
              borderRadius: 'var(--radius-sm)',
            }}>
              Score: {improvement.score}/100
            </div>
          </div>

          {/* Strengths */}
          {improvement.strengths.length > 0 && (
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-success)', marginBottom: 'var(--spacing-2)' }}>
                ✓ Strengths
              </div>
              {improvement.strengths.map((s, i) => (
                <div key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', padding: 'var(--spacing-1) 0' }}>
                  {s}
                </div>
              ))}
            </div>
          )}

          {/* Weaknesses */}
          {improvement.weaknesses.length > 0 && (
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-error)', marginBottom: 'var(--spacing-2)' }}>
                ✗ Areas to Improve
              </div>
              {improvement.weaknesses.map((w, i) => (
                <div key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', padding: 'var(--spacing-1) 0' }}>
                  {w}
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {improvement.recommendations.length > 0 && (
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-brand-400)', marginBottom: 'var(--spacing-2)' }}>
                ⟳ Recommended Actions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                {improvement.recommendations.map((rec, i) => (
                  <RecommendationCard key={i} rec={rec} />
                ))}
              </div>
            </div>
          )}

          {improvement.recommendations.length === 0 && improvement.strengths.length === 0 && (
            <div style={{ padding: 'var(--spacing-4)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              Not enough data for improvement report — need at least 10 reader sessions
            </div>
          )}
        </div>
      )}

      {!analytics && !loading && !error && (
        <div style={{ padding: 'var(--spacing-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Select a story to view analytics. Data appears after readers start engaging.
        </div>
      )}
    </div>
  );
}
