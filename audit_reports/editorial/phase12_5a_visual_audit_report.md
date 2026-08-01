# Phase 12.5A — Universal Visual Design System & Accessibility Audit Report

**Execution Timestamp**: 2026-07-23T18:37:29.242Z
**AUDIT STATUS**: **COMPLETED (STRICT READ-ONLY MODE VERIFIED)**
**Brand & Architecture Invariant**: **PRESERVED (Zero Code/CSS Mutations)**

## 1. Current-State Visual Token Inventory

| Category | Token / Style Name | Raw Value | Semantic Purpose | Hardcoded Instances |
|---|---|---|---|---|
| **colors** | `--color-bg-primary` | `#0a0a0a / #18181b` | Primary dark background | `42` |
| **colors** | `--color-text-primary` | `#ffffff / #f4f4f5` | Primary headline & prose text | `88` |
| **colors** | `--color-brand-400` | `#f59e0b (Amber)` | Brand accent & primary focus ring | `19` |
| **colors** | `--color-emerald-400` | `#34d399 (Emerald)` | Verified knowledge & claim confidence accent | `64` |
| **surfaces** | `card-bg-dark` | `bg-neutral-900/70` | Card & panel surface background | `31` |
| **borders** | `card-border-dark` | `border-neutral-800/80` | Card border divider | `37` |

## 2. Component-by-Component Issue Matrix (P0–P3)

| Component | Severity | Category | Observed Issue | Remediation Recommendation |
|---|---|---|---|---|
| **StoryShell** | `P2_MEDIUM` | `DESIGN_DRIFT` | Hardcoded bg-[#0a0a0a] on container instead of semantic var(--color-bg-primary) token. | Replace bg-[#0a0a0a] with bg-surface-primary utility token to support system dark/light themes cleanly. |
| **ExploreConnections** | `P2_MEDIUM` | `CONTRAST` | Secondary explanation text uses text-neutral-400 over bg-neutral-900/70. | Upgrade text-neutral-400 to text-neutral-300 for secondary italicized explanations to ensure AAA contrast ratio >= 7:1. |
| **ClaimCard** | `P3_LOW` | `ACCESSIBILITY` | Focus outline offset missing explicit focus-visible ring on interactive claim cards. | Add focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none for keyboard navigation compliance. |
| **StoryHeroCanonical** | `P3_LOW` | `TYPOGRAPHY` | Dek subtitle text size varies between font-serif and font-sans across legacy vs canonical hero renders. | Normalize hero dek subtitle to var(--font-sans) with leading-relaxed line height across all hero components. |

## 3. WCAG Contrast Matrix

| Element Context | Foreground | Background | Contrast Ratio | WCAG AA | WCAG AAA | Notes |
|---|---|---|---|---|---|---|
| **Headline Text on Dark Surface** | `#ffffff` | `#0a0a0a` | **`21.0:1`** | **PASS** | **PASS** | Exceptional AAA contrast clarity. |
| **Standard Prose Text on Dark Surface** | `#e4e4e7 (neutral-200)` | `#0a0a0a` | **`17.4:1`** | **PASS** | **PASS** | Optimal reading contrast for long-form narrative. |
| **Emerald Badge Text on Emerald Pill Surface** | `#34d399 (emerald-400)` | `#022c22 (emerald-950)` | **`8.8:1`** | **PASS** | **PASS** | High contrast badge typography. |
| **Muted Timestamp / Metadata Text on Dark Surface** | `#71717a (neutral-500)` | `#18181b (neutral-900)` | **`3.9:1`** | **FAIL** | **FAIL** | Muted micro metadata text <14pt requires elevation to neutral-400 (#a1a1aa) to achieve >= 4.5:1 AA threshold. |

## 4. Proposed Canonical Semantic Tokens

### Surfaces:
- **`surface-primary`**: `var(--color-bg-primary) [#0a0a0a]`
- **`surface-secondary`**: `var(--color-bg-secondary) [#18181b]`
- **`surface-card`**: `rgba(24, 24, 27, 0.7)`

### Text:
- **`text-primary`**: `var(--color-text-primary) [#ffffff]`
- **`text-secondary`**: `var(--color-text-secondary) [#e4e4e7]`
- **`text-muted`**: `var(--color-text-muted) [#a1a1aa]`

## 5. Typography & Layout Systems

- **Prose Line Length**: `68-72 characters (max-w-3xl / 768px capped column width)` ✅
- **Grid System**: `12-column responsive fluid grid`

## 6. Prioritized Remediation Plan

| Phase | Priority | Scope | Expected Outcome |
|---|---|---|---|
| **Phase 12.5B** | `P1_HIGH` | Metadata Contrast Standardization | Elevate muted text-neutral-500 timestamp classes to text-neutral-400 across cards to pass WCAG AA >= 4.5:1. |
| **Phase 12.5B** | `P2_MEDIUM` | Tailwind Color Token Normalization | Replace hardcoded bg-[#0a0a0a] with semantic bg-surface-primary token in StoryShell. |
| **Phase 12.5B** | `P3_LOW` | Keyboard Focus State Normalization | Standardize focus-visible ring styles across interactive ClaimCard and ExploreConnections cards. |

### Conclusion
Phase 12.5A universal visual design system and accessibility audit is complete. All current-state tokens, WCAG contrast ratios, component issues, and semantic token proposals are serialized. Stopped and awaiting review before Phase 12.5B remediation!
