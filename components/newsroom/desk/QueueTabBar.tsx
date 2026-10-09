'use client';

import React, { useRef } from 'react';
import type { QueueSection } from '@/types/newsroom-intelligence';

export interface QueueTabBarProps {
  activeSection: QueueSection;
  sectionCounts: Record<QueueSection, number>;
  onSelectSection: (section: QueueSection) => void;
  className?: string;
}

interface TabDefinition {
  key: QueueSection;
  label: string;
  icon: string;
  badgeTone: 'critical' | 'important' | 'warning' | 'neutral' | 'success';
}

const CANONICAL_TABS: TabDefinition[] = [
  { key: 'BREAKING_P0', label: 'Breaking / P0', icon: '!', badgeTone: 'critical' },
  { key: 'P1_IMPORTANT', label: 'P1 — Important', icon: '◆', badgeTone: 'important' },
  { key: 'DEVELOPING', label: 'Developing', icon: '▲', badgeTone: 'neutral' },
  { key: 'NEEDS_VERIFICATION', label: 'Needs Verification', icon: '✓?', badgeTone: 'warning' },
  { key: 'CONTRADICTIONS', label: 'Contradictions', icon: '⚡', badgeTone: 'warning' },
  { key: 'COVERAGE_GAPS', label: 'Coverage Gaps', icon: '◫', badgeTone: 'neutral' },
  { key: 'RESOLVED', label: 'Resolved', icon: '✓', badgeTone: 'success' },
];

/**
 * ─── QueueTabBar (Phase 4A Wave 1) ──────────────────────────────────────────
 *
 * Presentational navigation tab bar across the 7 canonical operational queues.
 * Strictly consumes counts and selection from parent without computing state.
 *
 * Governing Document: .planning/PHASE-4A-EDITORIAL-DESK-UI-SPEC.md §4
 * Accessibility: WCAG AA/AAA compliant (role="tablist", Arrow navigation, Focus).
 */
export function QueueTabBar({
  activeSection,
  sectionCounts,
  onSelectSection,
  className = '',
}: QueueTabBarProps) {
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let targetIndex = -1;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      targetIndex = (currentIndex + 1) % CANONICAL_TABS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      targetIndex = (currentIndex - 1 + CANONICAL_TABS.length) % CANONICAL_TABS.length;
    } else if (e.key === 'Home') {
      targetIndex = 0;
    } else if (e.key === 'End') {
      targetIndex = CANONICAL_TABS.length - 1;
    }

    if (targetIndex !== -1) {
      e.preventDefault();
      const targetTab = CANONICAL_TABS[targetIndex];
      onSelectSection(targetTab.key);

      // Focus the newly active tab button
      const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      if (buttons && buttons[targetIndex]) {
        buttons[targetIndex].focus();
      }
    }
  };

  const getBadgeStyle = (tone: TabDefinition['badgeTone'], isSelected: boolean) => {
    if (isSelected) {
      return {
        background: '#ffffff',
        color: 'var(--color-brand-900)',
      };
    }
    switch (tone) {
      case 'critical':
        return { background: '#fee2e2', color: '#991b1b' };
      case 'important':
        return { background: '#ffedd5', color: '#9a3412' };
      case 'warning':
        return { background: '#fef9c3', color: '#854d0e' };
      case 'success':
        return { background: '#ecfdf5', color: '#065f46' };
      case 'neutral':
      default:
        return { background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' };
    }
  };

  return (
    <nav
      className={`queue-tab-bar-nav ${className}`}
      aria-label="Editorial queue sections navigation"
      style={{
        marginBottom: 'var(--spacing-4)',
        borderBottom: '1px solid var(--color-border-default)',
      }}
    >
      <div
        ref={tabListRef}
        role="tablist"
        aria-label="Newsroom Queue Sections"
        style={{
          display: 'flex',
          gap: 'var(--spacing-2)',
          overflowX: 'auto',
          paddingBottom: 'var(--spacing-2)',
          scrollbarWidth: 'thin',
        }}
      >
        {CANONICAL_TABS.map((tab, idx) => {
          const isSelected = activeSection === tab.key;
          const count = sectionCounts[tab.key] ?? 0;
          const badgeStyle = getBadgeStyle(tab.badgeTone, isSelected);

          return (
            <button
              key={tab.key}
              role="tab"
              id={`queue-tab-${tab.key}`}
              aria-selected={isSelected}
              aria-controls={`queue-panel-${tab.key}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onSelectSection(tab.key)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: isSelected ? 700 : 500,
                color: isSelected ? '#ffffff' : 'var(--color-text-secondary)',
                background: isSelected ? 'var(--color-brand-600)' : 'transparent',
                border: isSelected ? '1px solid var(--color-brand-600)' : '1px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                outline: 'none',
              }}
              onFocus={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--color-border-default)';
                }
              }}
              onBlur={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              <span aria-hidden="true" style={{ fontSize: '11px', opacity: 0.9 }}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '20px',
                  height: '20px',
                  padding: '0 6px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  lineHeight: 1,
                  ...badgeStyle,
                }}
              >
                <span className="sr-only">{`, ${count} items`}</span>
                <span aria-hidden="true">{count}</span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
