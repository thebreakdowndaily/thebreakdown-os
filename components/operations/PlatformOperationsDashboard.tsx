'use client';

import React, { useEffect, useState } from 'react';
import type { OperationsProjection } from '@/types/operations';

// ── Styles ────────────────────────────────────────────────────────────────

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

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: 'var(--spacing-3)',
};

const moduleStyle: React.CSSProperties = {
  ...sectionStyle,
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-3)',
};

const badgeStyle = (status: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: 'var(--spacing-1) var(--spacing-2)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-weight-semibold)',
  backgroundColor:
    status === 'healthy' ? 'var(--color-success)'
    : status === 'degraded' ? 'var(--color-warning)'
    : 'var(--color-error)',
  color: 'var(--color-bg-primary)',
  width: 'fit-content',
});

const vitalRatingStyle = (rating: string): React.CSSProperties => ({
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-weight-semibold)',
  color:
    rating === 'good' ? 'var(--color-success)'
    : rating === 'needs-improvement' ? 'var(--color-warning)'
    : 'var(--color-error)',
});

// ── Metric Card ───────────────────────────────────────────────────────────

function MetricCard({ value, label, source }: { value: string; label: string; source?: string }) {
  return (
    <div style={sectionStyle}>
      <div style={valueStyle}>{value}</div>
      <div style={{ ...labelStyle, marginTop: 'var(--spacing-1)' }}>{label}</div>
      {source && (
        <div style={{ ...labelStyle, marginTop: 'var(--spacing-1)', fontStyle: 'italic' }}>
          {source}
        </div>
      )}
    </div>
  );
}

// ── Module Components ─────────────────────────────────────────────────────

function PlatformInformationModule({ data }: { data: OperationsProjection['platformInformation'] }) {
  return (
    <section style={moduleStyle} aria-labelledby="ops-platform-info">
      <h3 id="ops-platform-info" style={headingStyle}>Platform Information</h3>
      <div style={gridStyle}>
        <MetricCard value={data.version} label="Version" />
        <MetricCard value={data.buildId} label="Build ID" />
        <MetricCard value={data.environment} label="Environment" />
        <MetricCard value={new Date(data.generatedAt).toLocaleTimeString()} label="Generated" />
      </div>
    </section>
  );
}

function PlatformHealthModule({ data }: { data: OperationsProjection['platformHealth'] }) {
  return (
    <section style={moduleStyle} aria-labelledby="ops-platform-health">
      <h3 id="ops-platform-health" style={headingStyle}>Platform Health</h3>
      <div style={{ ...gridStyle, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        <MetricCard value={data.uptime} label="Uptime" />
        <MetricCard value={String(data.routesHealthy) + '/' + data.routesTotal} label="Routes" />
        <MetricCard value={String(data.activeAlerts)} label="Active Alerts" />
        <MetricCard value={String(data.criticalAlerts)} label="Critical Alerts" />
      </div>
      <div style={{ marginTop: 'var(--spacing-3)' }}>
        <div style={labelStyle}>Services</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-2)' }}>
          {data.services.map(s => (
            <span key={s.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-1)' }}>
              <span style={badgeStyle(s.status)}>{s.status}</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{s.name}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function PublicationAnalyticsModule({ data }: { data: OperationsProjection['publicationAnalytics'] }) {
  return (
    <section style={moduleStyle} aria-labelledby="ops-publication">
      <h3 id="ops-publication" style={headingStyle}>Publication Analytics</h3>
      <div style={gridStyle}>
        <MetricCard value={String(data.publishedStories)} label="Stories" />
        <MetricCard value={String(data.publishedTopics)} label="Topics" />
        <MetricCard value={String(data.publishedEntities)} label="Entities" />
        <MetricCard value={String(data.publishedInvestigations)} label="Investigations" />
        <MetricCard value={String(data.publishedFixes)} label="Fixes" />
        <MetricCard value={String(data.searchQueryCount)} label="Search Queries" />
      </div>
      {data.popularObjects.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-3)' }}>
          <div style={labelStyle}>Popular Objects</div>
          <ol style={{ marginTop: 'var(--spacing-2)', paddingLeft: 'var(--spacing-5)' }}>
            {data.popularObjects.map((obj, i) => (
              <li key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-1)' }}>
                {obj.title} <span style={labelStyle}>({obj.type}, {obj.views} views)</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

function SearchObservabilityModule({ data }: { data: OperationsProjection['searchObservability'] }) {
  return (
    <section style={moduleStyle} aria-labelledby="ops-search">
      <h3 id="ops-search" style={headingStyle}>Search Observability</h3>
      <div style={gridStyle}>
        <MetricCard value={String(data.totalQueries)} label="Total Queries" />
        <MetricCard value={data.medianLatencyMs + 'ms'} label="Median Latency" source="estimated" />
        <MetricCard value={data.p95LatencyMs + 'ms'} label="P95 Latency" source="estimated" />
        <MetricCard value={(data.zeroResultRate * 100).toFixed(0) + '%'} label="Zero-Result Rate" />
      </div>
      {data.topTerms.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-3)' }}>
          <div style={labelStyle}>Top Search Terms</div>
          <ol style={{ marginTop: 'var(--spacing-2)', paddingLeft: 'var(--spacing-5)' }}>
            {data.topTerms.slice(0, 5).map((t, i) => (
              <li key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                &ldquo;{t.query}&rdquo; <span style={labelStyle}>({t.count})</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

function AccessibilityMetricsModule({ data }: { data: OperationsProjection['accessibilityMetrics'] }) {
  return (
    <section style={moduleStyle} aria-labelledby="ops-accessibility">
      <h3 id="ops-accessibility" style={headingStyle}>Accessibility Metrics</h3>
      <div style={gridStyle}>
        <MetricCard value={data.wcagCompliance} label="WCAG Compliance" />
        <MetricCard value={data.keyboardNavigation} label="Keyboard Navigation" />
        <MetricCard value={(data.ariaLandmarkCoverage * 100).toFixed(0) + '%'} label="ARIA Landmark Coverage" />
        <MetricCard value={data.colorContrastVerified ? 'Yes' : 'No'} label="Color Contrast Verified" />
        <MetricCard value={data.readerModeAccessible ? 'Yes' : 'No'} label="Reader Mode Accessible" />
      </div>
    </section>
  );
}

function PerformanceMetricsModule({ data }: { data: OperationsProjection['performanceMetrics'] }) {
  const vitals = [
    { name: 'LCP', ...data.largestContentfulPaint },
    { name: 'INP', ...data.interactionToNextPaint },
    { name: 'CLS', ...data.cumulativeLayoutShift },
  ];
  return (
    <section style={moduleStyle} aria-labelledby="ops-performance">
      <h3 id="ops-performance" style={headingStyle}>Performance Metrics</h3>
      <div style={gridStyle}>
        {vitals.map(v => (
          <div key={v.name} style={sectionStyle}>
            <div style={valueStyle}>{v.value}{v.unit}</div>
            <div style={{ ...labelStyle, marginTop: 'var(--spacing-1)' }}>{v.name}</div>
            <div style={vitalRatingStyle(v.rating)}>{v.rating}</div>
            <div style={{ ...labelStyle, fontStyle: 'italic' }}>{v.source}</div>
          </div>
        ))}
        <MetricCard value={data.staticGenerationTimeMs + 'ms'} label="Static Gen Time" source="estimated" />
        <MetricCard value={(data.cacheHitRatio * 100).toFixed(0) + '%'} label="Cache Hit Ratio" source="estimated" />
      </div>
    </section>
  );
}

function ReliabilityMetricsModule({ data }: { data: OperationsProjection['reliabilityMetrics'] }) {
  return (
    <section style={moduleStyle} aria-labelledby="ops-reliability">
      <h3 id="ops-reliability" style={headingStyle}>Reliability Metrics</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--spacing-4)' }}>
        {/* Availability */}
        <div style={sectionStyle}>
          <div style={{ ...labelStyle, marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-semibold)' }}>Availability</div>
          <MetricCard value={data.availability.routesHealthy + '/' + data.availability.routesTotal} label="Routes Healthy" />
        </div>
        {/* Integrity */}
        <div style={sectionStyle}>
          <div style={{ ...labelStyle, marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-semibold)' }}>Integrity</div>
          <MetricCard value={String(data.integrity.brokenLinks)} label="Broken Links" />
          <div style={{ marginTop: 'var(--spacing-2)' }}>
            <MetricCard value={String(data.integrity.metadataFailures)} label="Metadata Failures" />
          </div>
        </div>
        {/* Failures */}
        <div style={sectionStyle}>
          <div style={{ ...labelStyle, marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-semibold)' }}>Failures</div>
          <MetricCard value={String(data.failures.runtimeExceptions)} label="Runtime Exceptions" />
          <div style={{ marginTop: 'var(--spacing-2)' }}>
            <MetricCard value={String(data.failures.searchFailures)} label="Search Failures" />
          </div>
          <div style={{ marginTop: 'var(--spacing-2)' }}>
            <MetricCard value={String(data.failures.citationExportFailures)} label="Citation Export Failures" />
          </div>
        </div>
        {/* Event Bus */}
        <div style={sectionStyle}>
          <div style={{ ...labelStyle, marginBottom: 'var(--spacing-2)', fontWeight: 'var(--font-weight-semibold)' }}>Event Bus</div>
          <MetricCard value={String(data.eventBus.published)} label="Published" />
          <div style={{ marginTop: 'var(--spacing-2)' }}>
            <MetricCard value={String(data.eventBus.consumed)} label="Consumed" />
          </div>
          <div style={{ marginTop: 'var(--spacing-2)' }}>
            <MetricCard value={(data.eventBus.queueUtilisation * 100).toFixed(0) + '%'} label="Queue Utilisation" />
          </div>
          <div style={{ marginTop: 'var(--spacing-2)' }}>
            <MetricCard value={data.eventBus.oldestEventAge} label="Oldest Event" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────

interface PlatformOperationsDashboardProps {
  projection: OperationsProjection;
}

export default function PlatformOperationsDashboard({ projection }: PlatformOperationsDashboardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ padding: 'var(--spacing-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Loading operations dashboard...
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-6)',
        padding: 'var(--spacing-6) 0',
      }}
      role="region"
      aria-label="Platform Operations Dashboard"
    >
      <PlatformInformationModule data={projection.platformInformation} />
      <PlatformHealthModule data={projection.platformHealth} />
      <PublicationAnalyticsModule data={projection.publicationAnalytics} />
      <SearchObservabilityModule data={projection.searchObservability} />
      <AccessibilityMetricsModule data={projection.accessibilityMetrics} />
      <PerformanceMetricsModule data={projection.performanceMetrics} />
      <ReliabilityMetricsModule data={projection.reliabilityMetrics} />

      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 'var(--spacing-4)' }}>
        Projection v{projection.version} &middot; Generated {new Date(projection.generatedAt).toLocaleString()} &middot; Build {projection.buildId}
      </div>
    </div>
  );
}
