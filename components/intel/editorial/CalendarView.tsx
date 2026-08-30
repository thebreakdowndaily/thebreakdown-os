'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { EditorialScheduleEntry, WeeklyPlan } from '@/types/editorial-calendar';
import {
  getWeeklyPlanAction,
  validateStoryAction,
  publishNowAction,
  cancelScheduleAction,
  runPublishDueAction,
  getAllScheduledEntriesAction,
} from '@/app/intel/editorial/actions';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function formatDateShort(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatDateFull(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  planned: { bg: 'var(--color-bg-secondary)', text: 'var(--color-text-muted)', border: 'var(--color-border-subtle)' },
  in_progress: { bg: 'color-mix(in srgb, var(--color-brand-400) 15%, transparent)', text: 'var(--color-brand-400)', border: 'var(--color-brand-400)' },
  ready: { bg: 'color-mix(in srgb, var(--color-amber-400) 15%, transparent)', text: 'var(--color-amber-400)', border: 'var(--color-amber-400)' },
  validated: { bg: 'color-mix(in srgb, #22c55e 15%, transparent)', text: '#22c55e', border: '#22c55e' },
  published: { bg: 'color-mix(in srgb, #22c55e 25%, transparent)', text: '#22c55e', border: '#22c55e' },
  blocked: { bg: 'color-mix(in srgb, var(--color-error) 15%, transparent)', text: 'var(--color-error)', border: 'var(--color-error)' },
  skipped: { bg: 'var(--color-bg-secondary)', text: 'var(--color-text-muted)', border: 'var(--color-border-subtle)' },
  rescheduled: { bg: 'var(--color-bg-secondary)', text: 'var(--color-text-muted)', border: 'var(--color-border-subtle)' },
};

const PRIORITY_LABELS: Record<number, string> = {
  10: 'Critical',
  9: 'Very High',
  8: 'High',
  7: 'Medium-High',
  6: 'Medium',
  5: 'Standard',
  4: 'Low-Medium',
  3: 'Low',
  2: 'Very Low',
  1: 'Minimal',
};

// ─── Component ───────────────────────────────────────────────────────────────

export function CalendarView() {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [allEntries, setAllEntries] = useState<EditorialScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getWeeklyPlanAction(weekStart);
    if (result.success && result.plan) {
      setPlan(result.plan);
    } else {
      setError(result.error || 'Failed to load plan');
    }
    const allResult = await getAllScheduledEntriesAction();
    if (allResult.success && allResult.entries) {
      setAllEntries(allResult.entries);
    }
    setLoading(false);
  }, [weekStart]);

  useEffect(() => { loadPlan(); }, [loadPlan]);

  function navigateWeek(delta: number) {
    const d = new Date(weekStart + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + delta * 7);
    setWeekStart(d.toISOString().split('T')[0]);
  }

  async function handleAction(action: string, storyId: string, scheduleId?: string) {
    setActionLoading(`${action}-${storyId}`);
    try {
      let result;
      switch (action) {
        case 'validate':
          result = await validateStoryAction(storyId, scheduleId);
          break;
        case 'publish':
          result = await publishNowAction(storyId, scheduleId);
          break;
        case 'cancel':
          result = await cancelScheduleAction(scheduleId!);
          break;
      }
      if (result && !result.success) {
        setError(result.error || 'Action failed');
      }
      await loadPlan();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRunPublishDue() {
    setActionLoading('publish-due');
    try {
      const result = await runPublishDueAction();
      if (result.success && result.results) {
        const published = result.results.filter(r => r.passed).length;
        const blocked = result.results.filter(r => !r.passed).length;
        if (blocked > 0) {
          setError(`${blocked} story/ies blocked by publication gate`);
        }
      }
      await loadPlan();
    } finally {
      setActionLoading(null);
    }
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-8)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Editorial Calendar
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--spacing-1)' }}>
            Weekly story plan with publication gates. Every scheduled story must pass validation before publishing.
          </p>
        </div>
        <button
          onClick={handleRunPublishDue}
          disabled={actionLoading === 'publish-due'}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid var(--color-border-default)',
            background: actionLoading === 'publish-due' ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: actionLoading === 'publish-due' ? 'not-allowed' : 'pointer',
          }}
        >
          {actionLoading === 'publish-due' ? 'Checking...' : 'Publish Due Stories'}
        </button>
      </div>

      {/* Week Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-6)', padding: '12px 16px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
        <button onClick={() => navigateWeek(-1)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border-default)', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', cursor: 'pointer', fontSize: '13px' }}>
          ← Previous
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {formatDateFull(weekStart)} — {formatDateFull(plan?.weekEnd || '')}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
            {plan?.totalEntries || 0} stories planned · {plan?.publishedCount || 0} published · {plan?.blockedCount || 0} blocked · {plan?.pendingCount || 0} pending
          </div>
        </div>
        <button onClick={() => navigateWeek(1)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border-default)', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', cursor: 'pointer', fontSize: '13px' }}>
          Next →
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'color-mix(in srgb, var(--color-error) 10%, transparent)', border: '1px solid var(--color-error)', color: 'var(--color-error)', fontSize: '13px', marginBottom: 'var(--spacing-4)' }}>
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 12, background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', textDecoration: 'underline' }}>Dismiss</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ padding: 'var(--spacing-8)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
          Loading editorial calendar...
        </div>
      )}

      {/* Calendar Grid */}
      {!loading && plan && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--spacing-3)' }}>
          {plan.slots.map((slot) => {
            const isToday = slot.date === today;
            const isPast = slot.date < today;
            const colors = slot.entry ? STATUS_COLORS[slot.entry.status] || STATUS_COLORS.planned : STATUS_COLORS.planned;

            return (
              <div
                key={slot.date}
                style={{
                  padding: 'var(--spacing-4)',
                  borderRadius: 'var(--radius-lg)',
                  border: `1px solid ${isToday ? 'var(--color-amber-500)' : 'var(--color-border-default)'}`,
                  background: isToday ? 'color-mix(in srgb, var(--color-amber-500) 5%, var(--color-bg-secondary))' : 'var(--color-bg-secondary)',
                  opacity: isPast && !slot.entry ? 0.5 : 1,
                  minHeight: 220,
                }}
              >
                {/* Day Header */}
                <div style={{ marginBottom: 'var(--spacing-3)' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    {slot.dayName}
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: isToday ? 'var(--color-amber-500)' : 'var(--color-text-primary)' }}>
                    {formatDateShort(slot.date)}
                  </div>
                </div>

                {/* Story Card */}
                {slot.entry ? (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    background: colors.bg,
                  }}>
                    {/* Status Badge */}
                    <div style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                      color: colors.text,
                      background: colors.bg,
                      marginBottom: 6,
                    }}>
                      {slot.entry.status.replace('_', ' ')}
                    </div>

                    {/* Title */}
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.3,
                      marginBottom: 4,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {slot.entry.category === 'explainer' ? '📘' :
                       slot.entry.category === 'analysis' ? '📊' :
                       slot.entry.category === 'briefing' ? '📋' :
                       slot.entry.category === 'investigation' ? '🔍' : '📄'}{' '}
                      Story #{slot.entry.storyId.slice(0, 8)}
                    </div>

                    {/* Priority */}
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                      Priority: {PRIORITY_LABELS[slot.entry.priority] || slot.entry.priority}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {slot.entry.status === 'planned' && (
                        <button
                          onClick={() => handleAction('validate', slot.entry!.storyId, slot.entry!.id)}
                          disabled={actionLoading === `validate-${slot.entry.storyId}`}
                          style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--color-border-default)', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', cursor: 'pointer' }}
                        >
                          Validate
                        </button>
                      )}
                      {slot.entry.status === 'validated' && (
                        <button
                          onClick={() => handleAction('publish', slot.entry!.storyId, slot.entry!.id)}
                          disabled={actionLoading === `publish-${slot.entry.storyId}`}
                          style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '4px', border: '1px solid #22c55e', background: 'color-mix(in srgb, #22c55e 10%, transparent)', color: '#22c55e', cursor: 'pointer' }}
                        >
                          Publish
                        </button>
                      )}
                      {['planned', 'in_progress', 'ready'].includes(slot.entry.status) && (
                        <button
                          onClick={() => handleAction('cancel', slot.entry!.storyId, slot.entry!.id)}
                          disabled={actionLoading === `cancel-${slot.entry.storyId}`}
                          style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--color-border-default)', background: 'var(--color-bg-primary)', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                        >
                          Skip
                        </button>
                      )}
                    </div>

                    {/* Block Reason */}
                    {slot.entry.blockReason && (
                      <div style={{ fontSize: '10px', color: 'var(--color-error)', marginTop: 6, lineHeight: 1.3 }}>
                        Blocked: {slot.entry.blockReason.slice(0, 80)}{slot.entry.blockReason.length > 80 ? '...' : ''}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px dashed var(--color-border-subtle)',
                    textAlign: 'center',
                    color: 'var(--color-text-muted)',
                    fontSize: '11px',
                  }}>
                    No story planned
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Activity */}
      {!loading && allEntries.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-8)' }}>
          <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-4)' }}>
            Recent Schedule Activity
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            {allEntries.slice(0, 10).map((entry) => {
              const colors = STATUS_COLORS[entry.status] || STATUS_COLORS.planned;
              return (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border-default)',
                    background: 'var(--color-bg-secondary)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: colors.text,
                      background: colors.bg,
                    }}>
                      {entry.status}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-primary)' }}>
                      {entry.category} · Slot {entry.slotPosition}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      {formatDateFull(entry.slotDate)}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Story #{entry.storyId.slice(0, 8)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
