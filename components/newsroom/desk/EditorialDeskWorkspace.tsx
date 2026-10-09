'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type {
  NewsroomDeskItem,
  NewsroomDeskSummary,
  NewsroomDeskFilter,
} from '@/services/intelligence/newsroom/desk-service';
import type { QueueSection, EditorialPriority, SignalLifecycleState } from '@/types/newsroom-intelligence';
import type { IntelRole } from '@/features/auth/roles';
import { DeskSummaryHeader } from './DeskSummaryHeader';
import { QueueTabBar } from './QueueTabBar';
import { DeskSignalCard } from './DeskSignalCard';
import { ItemDossierView } from './ItemDossierView';
import { ActionControlDock } from './ActionControlDock';

export interface EditorialDeskWorkspaceProps {
  initialSummary?: NewsroomDeskSummary | null;
  initialItems?: NewsroomDeskItem[];
  initialSections?: Record<QueueSection, number>;
  initialTotal?: number;
  userRole?: string;
  userName?: string;
  apiEndpoint?: string;
  className?: string;
}

const DEFAULT_SECTIONS_COUNT: Record<QueueSection, number> = {
  BREAKING_P0: 0,
  P1_IMPORTANT: 0,
  DEVELOPING: 0,
  NEEDS_VERIFICATION: 0,
  CONTRADICTIONS: 0,
  COVERAGE_GAPS: 0,
  RESOLVED: 0,
};

/**
 * ─── EditorialDeskWorkspace (Phase 4A Wave 4) ──────────────────────────────
 *
 * Integrated Mission Control & Editorial Desk Workspace.
 * Unifies Wave 1 (SummaryHeader, QueueTabBar, SignalCards),
 * Wave 2 (Dossier, Lineage, Latency, SourceHealth, Audit),
 * and Wave 3 (ActionControlDock, Confirmation & Concurrency Modals).
 *
 * Governing Document: .planning/PHASE-4A-EDITORIAL-DESK-UI-SPEC.md §4, §5, §15
 * Accessibility: WCAG AA/AAA compliant (landmarks, keyboard shortcuts, focus).
 */
export function EditorialDeskWorkspace({
  initialSummary = null,
  initialItems = [],
  initialSections = DEFAULT_SECTIONS_COUNT,
  initialTotal = 0,
  userRole = 'editor',
  userName = 'Editorial Operator',
  apiEndpoint = '/api/v2/newsroom/desk',
  className = '',
}: EditorialDeskWorkspaceProps) {
  // ── 1. Workspace Operational State ─────────────────────────────────────────
  const [workspaceArea, setWorkspaceArea] = useState<'inbox' | 'investigation' | 'assignments' | 'diagnostics'>('inbox');
  const [summary, setSummary] = useState<NewsroomDeskSummary | null>(initialSummary);
  const [sectionsCount, setSectionsCount] = useState<Record<QueueSection, number>>(initialSections);
  const [activeQueue, setActiveQueue] = useState<QueueSection>('BREAKING_P0');
  const [items, setItems] = useState<NewsroomDeskItem[]>(initialItems);
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(
    initialItems.length > 0 ? initialItems[0].signalId : null
  );

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterBeat, setFilterBeat] = useState<string>('all');

  // Loading & Error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ref for keyboard navigation focus
  const queueListRef = useRef<HTMLDivElement>(null);
  const actionDockTriggerRef = useRef<{ triggerVerify?: () => void }>({});

  // ── 2. Data Fetching from Authoritative M5 Endpoint ────────────────────────
  const fetchQueueItems = useCallback(
    async (section: QueueSection, priority?: string, beat?: string) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const params = new URLSearchParams();
        if (section) params.set('section', section);
        if (priority && priority !== 'all') params.set('priority', priority);
        if (beat && beat !== 'all') params.set('beat', beat);

        const res = await fetch(`${apiEndpoint}?${params.toString()}`);
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('Session unauthenticated. Please log in to access the desk.');
          }
          if (res.status === 403) {
            throw new Error('Permission denied. Desk access restricted.');
          }
          throw new Error(`Failed to load queue items (HTTP ${res.status}).`);
        }

        const data = await res.json();
        const loadedItems: NewsroomDeskItem[] = data.items || [];
        setItems(loadedItems);
        if (data.sections) {
          setSectionsCount(data.sections);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error communicating with desk service';
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [apiEndpoint]
  );

  const refreshSummary = useCallback(async () => {
    try {
      const res = await fetch(`${apiEndpoint}?summary=true`);
      if (res.ok) {
        const data = await res.json();
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch {
      // Background summary refresh failure non-fatal
    }
  }, [apiEndpoint]);

  // Handle Tab Switch
  const handleTabChange = (section: QueueSection) => {
    setActiveQueue(section);
    fetchQueueItems(section, filterPriority, filterBeat);
  };

  // Filter change handlers
  const handlePriorityFilterChange = (priority: string) => {
    setFilterPriority(priority);
    fetchQueueItems(activeQueue, priority, filterBeat);
  };

  const handleBeatFilterChange = (beat: string) => {
    setFilterBeat(beat);
    fetchQueueItems(activeQueue, filterPriority, beat);
  };

  // Manual Refresh
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchQueueItems(activeQueue, filterPriority, filterBeat),
      refreshSummary(),
    ]);
    setIsRefreshing(false);
  }, [fetchQueueItems, activeQueue, filterPriority, filterBeat, refreshSummary]);

  // ── 3. Filtered Client-Side Search (Non-Destructive) ────────────────────────
  const displayedItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        (item.sourceName && item.sourceName.toLowerCase().includes(q)) ||
        (item.beat && item.beat.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  // Currently Selected Desk Item
  const selectedItem = useMemo(() => {
    return items.find((it) => it.signalId === selectedSignalId) || null;
  }, [items, selectedSignalId]);

  // Available unique beats for filter dropdown
  const availableBeats = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.beat) set.add(it.beat);
    });
    return Array.from(set).sort();
  }, [items]);

  // ── 4. Item Selection Handler ──────────────────────────────────────────────
  const handleSelectItem = (signalId: string) => {
    setSelectedSignalId(signalId);
    setWorkspaceArea('investigation');
  };

  // ── 5. Action Execution Callback ───────────────────────────────────────────
  const handleActionSuccess = (updatedItem: NewsroomDeskItem) => {
    // Update local item in list
    setItems((prev) =>
      prev.map((it) => (it.signalId === updatedItem.signalId ? updatedItem : it))
    );
    // Keep selection on updated item
    setSelectedSignalId(updatedItem.signalId);
    // Refresh summary metrics and section counts
    refreshSummary();
  };

  // Reload single item on 409 conflict
  const handleReloadItem = async (signalId: string) => {
    try {
      const res = await fetch(`${apiEndpoint}?signalId=${encodeURIComponent(signalId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          handleActionSuccess(data.item);
          return data.item;
        }
      }
    } catch {
      // ignore
    }
    return null;
  };

  // ── 6. Keyboard Shortcuts Navigation ───────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Suppress shortcuts when focused inside text inputs, textareas, selects, or editable fields
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Suppress if any modal dialog is currently open
      if (document.querySelector('.action-modal-backdrop') || document.querySelector('.conflict-modal-backdrop')) {
        return;
      }

      // R: Reload current queue and summary (allowed even if items list is empty)
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleManualRefresh();
        return;
      }

      if (displayedItems.length === 0) return;

      const currentIndex = displayedItems.findIndex((it) => it.signalId === selectedSignalId);

      // J: Next Item
      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        const nextIndex = currentIndex < displayedItems.length - 1 ? currentIndex + 1 : 0;
        setSelectedSignalId(displayedItems[nextIndex].signalId);
      }

      // K: Previous Item
      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : displayedItems.length - 1;
        setSelectedSignalId(displayedItems[prevIndex].signalId);
      }

      // Enter: Focus Dossier / Switch to Dossier View
      if (e.key === 'Enter' && selectedItem) {
        e.preventDefault();
        setWorkspaceArea('investigation');
      }

      // Esc: Switch back to inbox
      if (e.key === 'Escape') {
        setWorkspaceArea('inbox');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayedItems, selectedSignalId, selectedItem, handleManualRefresh]);

  return (
    <div
      className={`editorial-desk-workspace ${className}`}
      style={{
        maxWidth: 1600,
        margin: '0 auto',
        padding: 'var(--spacing-4) var(--spacing-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-4)',
        minHeight: '100vh',
      }}
    >
      {/* ── Tier 1: Desk Summary Command Header ────────────────────────────── */}
      <DeskSummaryHeader
        summary={summary}
        userRole={userRole}
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        hideMetrics={workspaceArea !== 'diagnostics'}
      />

      {/* ── Tier 1.5: Workspace Navigation ────────────────────────────── */}
      <nav
        aria-label="Workspace Areas"
        style={{
          display: 'flex',
          gap: 'var(--spacing-2)',
          borderBottom: '1px solid var(--color-border-subtle)',
          paddingBottom: 'var(--spacing-3)',
        }}
      >
        {[
          { id: 'inbox', label: 'Editorial Inbox' },
          { id: 'investigation', label: 'Investigation Workspace' },
          { id: 'assignments', label: 'Assignments' },
          { id: 'diagnostics', label: 'Diagnostics' },
        ].map((area) => (
          <button
            key={area.id}
            onClick={() => setWorkspaceArea(area.id as any)}
            aria-selected={workspaceArea === area.id}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 600,
              background: workspaceArea === area.id ? 'var(--color-brand-600)' : 'transparent',
              color: workspaceArea === area.id ? '#fff' : 'var(--color-text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {area.label}
          </button>
        ))}
      </nav>

      {/* ── Tier 2: 7-Segment Queue Navigation Bar (Inbox Only) ─────────────── */}
      {workspaceArea === 'inbox' && (
        <QueueTabBar
          activeSection={activeQueue}
          onSelectSection={handleTabChange}
          sectionCounts={sectionsCount}
        />
      )}

      {/* ── Tier 2.5: Operational Filter & Search Toolbar (Inbox Only) ──────── */}
      {workspaceArea === 'inbox' && (
        <nav
          aria-label="Queue Filter Toolbar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--spacing-3)',
            padding: 'var(--spacing-3) var(--spacing-4)',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 240px', maxWidth: '400px' }}>
            <span aria-hidden="true" style={{ color: 'var(--color-text-muted)' }}>🔍</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search headline, entity, or source..."
              aria-label="Filter queue items"
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-default)',
                fontSize: 'var(--text-xs)',
              }}
            />
          </div>

          {/* Priority Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label htmlFor="filter-priority" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Priority:
            </label>
            <select
              id="filter-priority"
              value={filterPriority}
              onChange={(e) => handlePriorityFilterChange(e.target.value)}
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-default)',
                fontSize: 'var(--text-xs)',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="all">All Priorities</option>
              <option value="P0">P0 — Breaking</option>
              <option value="P1">P1 — Important</option>
              <option value="P2">P2 — Significant</option>
              <option value="P3">P3 — Watch</option>
            </select>
          </div>

          {/* Beat Filter */}
          {availableBeats.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label htmlFor="filter-beat" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Beat:
              </label>
              <select
                id="filter-beat"
                value={filterBeat}
                onChange={(e) => handleBeatFilterChange(e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-default)',
                  fontSize: 'var(--text-xs)',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="all">All Beats</option>
                {availableBeats.map((b) => (
                  <option key={b} value={b}>
                    {b.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}
        </nav>
      )}

      {/* ── Error Banner ───────────────────────────────────────────────────── */}
      {errorMessage && (
        <div
          role="alert"
          style={{
            padding: 'var(--spacing-3) var(--spacing-4)',
            backgroundColor: '#fef2f2',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
          }}
        >
          ⚠ {errorMessage}
        </div>
      )}

      {/* ── Tier 3: Operational Workspace Layout ────────────────────────────── */}
      <div
        className="desk-workspace-split"
        style={{
          display: 'grid',
          gridTemplateColumns: workspaceArea === 'inbox' ? '1fr' : 'minmax(320px, 460px) minmax(480px, 1fr)',
          gap: 'var(--spacing-6)',
          alignItems: 'start',
        }}
      >
        {/* ── Master Pane: Queue Signal Cards ──────────────────────────────── */}
        {(workspaceArea === 'inbox' || workspaceArea === 'investigation') && (
          <section
            aria-label={`Signals in ${activeQueue.replace(/_/g, ' ')}`}
            ref={queueListRef}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-3)',
            }}
          >
            {/* Header count info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 var(--spacing-1)' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {activeQueue.replace(/_/g, ' ')} Queue • {searchQuery.trim() ? `${displayedItems.length} of ${items.length} matching search` : `${displayedItems.length} signals`}
              </span>
              {isLoading && (
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  Loading signals...
                </span>
              )}
            </div>

            {/* Signal Cards List */}
            {displayedItems.length === 0 ? (
              <div
                style={{
                  padding: 'var(--spacing-8) var(--spacing-4)',
                  textAlign: 'center',
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--color-border-default)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <span aria-hidden="true" style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>
                  📭
                </span>
                <strong style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Queue is Empty
                </strong>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)' }}>
                  No signals currently active under {activeQueue.replace(/_/g, ' ')}.
                </p>
              </div>
            ) : (
              displayedItems.map((item) => (
                <DeskSignalCard
                  key={item.signalId}
                  item={item}
                  isSelected={item.signalId === selectedSignalId}
                  onClick={(selected: NewsroomDeskItem) => {
                    handleSelectItem(selected.signalId);
                    setWorkspaceArea('investigation');
                  }}
                />
              ))
            )}
          </section>
        )}

        {/* ── Detail Pane: Item Dossier & Action Control Dock ───────────────── */}
        {workspaceArea === 'investigation' && (
          <section
            aria-label="Selected Signal Dossier"
            style={{
              position: 'sticky',
              top: 'var(--spacing-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-4)',
            }}
          >
            {selectedItem ? (
              <>
                {/* Contextual Intelligence Dossier (Wave 2) */}
                <ItemDossierView
                  item={selectedItem}
                  onActionSuccess={handleActionSuccess}
                  onReloadRequested={handleReloadItem}
                />

                {/* Action Control Dock (Wave 3) */}
                <ActionControlDock
                  item={selectedItem}
                  onActionSuccess={handleActionSuccess}
                  onReloadRequested={handleReloadItem}
                />
              </>
            ) : (
              <div
                style={{
                  padding: 'var(--spacing-12) var(--spacing-6)',
                  textAlign: 'center',
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-subtle)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <span aria-hidden="true" style={{ fontSize: '36px', display: 'block', marginBottom: 'var(--spacing-2)' }}>
                  📋
                </span>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 var(--spacing-1) 0' }}>
                  No Signal Selected
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', margin: 0, maxWidth: '360px', marginInline: 'auto' }}>
                  Select an item from the queue list to inspect its evidentiary claims, upstream revisions, and latency milestones.
                </p>
              </div>
            )}
          </section>
        )}

        {/* ── Assignments Pane ────────────────────────────────────────────── */}
        {workspaceArea === 'assignments' && (
           <section style={{ gridColumn: '1 / -1' }}>
             <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--spacing-12)' }}>
               Your assignments and monitored signals will appear here.
             </p>
           </section>
        )}

        {/* ── Diagnostics Pane ────────────────────────────────────────────── */}
        {workspaceArea === 'diagnostics' && (
           <section style={{ gridColumn: '1 / -1' }}>
             <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--spacing-12)' }}>
               System diagnostics and telemetry details. Use the metrics cards above for real-time overview.
             </p>
           </section>
        )}
      </div>

      {/* ── Mobile Responsive CSS ───────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 900px) {
          .desk-workspace-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
