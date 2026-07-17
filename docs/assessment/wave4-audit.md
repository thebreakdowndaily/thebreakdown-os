# Wave 4 — Institutional Polish — Day 1  

## Audit: Visual Consistency Issues

### 1. Badge Variants Across Surfaces

**Homepage vs Knowledge Library vs StoryShell**

| Surface | Badge Variant Usage | Visual Inconsistency |
|---------|-------------------|----------------------|
| Homepage (`/`) | Evidence (green), Breaking (amber), Topic (gray) | Amber badge has `animate-pulse` (missing elsewhere) |
| Collection Landing (`/series/[slug]`) | Primary trust score (emerald), Evidence (blue), Documents (purple) | Different wrapper classes, inconsistent spacing |
| Volume Page (`/series/[slug]/volume/[slug]`) | Status: emerald/blue/gray, freshness: amber/red | Missing status badge variations |
| Entity Detail (`/entity/[slug]`) | Confidence score (amber), tags (gray) | Different color contrast, sizing mismatch |

**Details:**
- **Homepage** uses `animate-pulse` on amber badge, causing visual flicker
- **Collection Landing** mixes card-based trust scores with evidence type badges
- **Entity** uses wider `px-3 py-2.5` vs other surfaces using `px-2.5 py-1.5`

**Impact:** Inconsistent visual hierarchy and breaking trust in platform polish

### 2. Button Components

**Primary Variants:**
- Gold accent (`#D4A843`) across most surfaces
- Green accent (`#22C55E`) limited to specific instances
- Inconsistent hover effects: some use `-translate-y-0.5`, some use `-translate-y-1`

**State Management:**
- Some buttons have 2px border radius, others have rounded-lg (18px)
- One site uses `active:translate-y-0`, others don't
- Spacing inconsistent: `px-5 py-3` (smaller) vs `px-6 py-3` (larger)

### 3. Card Components

**Visual Variations:**
- Default: `bg-[#151515]` (very dark gray)
- Recommendation surfaces: `bg-gray-900` (lighter)
- Sidebar sections: `bg-neutral-900` (neutral tone)
- Hover lifts inconsistent: `-translate-y-0` to `-translate-y-1`

**Effects:**
- Some have `animate-accent-pulse`, others don't
- Some have box shadows (`box-shadow`), others don't
- Inconsistent border styling

### 4. Heading Typography

**H1 Levels:**
- **Homepage:** `text-5xl sm:text-6xl` (largest)
- **StoryShell:** `text-4xl md:text-5xl` (medium)
- **Knowledge Library Title:** `text-3xl sm:text-4xl` (smallest)

**Level 2:**
- **Homepage:** N/A
- **StoryShell:** `text-4xl md:text-5xl`
- **Knowledge Library:** `text-3xl sm:text-4xl`

**Color:**
- All surfaces: `text-[#F5F5F5]` (light gray)
- Status badges: inconsistent colors despite same purpose

### 5. Empty/Loading States

**Inconsistent Patterns:**
- **Homepage:** No integrated loading strategy
- **Knowledge Library:** Skeleton loading present
- **Investigation:** No loading states
- **Search:** Placeholder text differs across inputs
- **Error States:** Different colors and messaging

**Impact:** High cognitive load for users moving between surfaces

### 6. Color Application

**Problem:**
- Gold `#D4A843` used everywhere inconsistently
- Green `#22C55E` only in specific contexts
- Blue `#3B82F6` and Emerald `#10B981` for status badges
- Red `#EF4444` only for errors, inconsistent with brand

**Confusion:**
- Status badges use different border widths
- Evidence levels mixed visually
- Trust scores blend with regular text badges

## Files to Review

### Component Library Issues

| Component | Issue | File |
|-----------|-------|------|
| Badge | `animate-pulse` flicker, inconsistent sizing | `components/ui/Badge.tsx` |
| Button | Inconsistent variants, hover effects | `components/ui/Button.tsx` |
| Card | Different backgrounds, shadows, hover animations | `components/ui/Card.tsx` |
| Heading | Different sizes across surface types | `components/ui/Heading.tsx` |

### Surface Consistency Issues

| Surface | Visual Issue | Current State |
|---------|---------------|---------------|
| Homepage | Mixed badge states, inconsistent spacing | Inconsistent trust bar alignment |
| Search Page | Different CTA button sizes | Blue vs green variants |
| Entity Detail | Badge colors inconsistent with evidence | Green/gray mix |
| Knowledge Library | Container padding varies 4px | Narrow vs wide layouts |

## Critical Priority List

1. **Badge Consistency** (HIGH) - Evidence and status badges across the platform don't align
2. **Button Sizing** (MEDIUM) - CTA button sizes vary 10px across pages
3. **Card Visual** (MEDIUM) - Inconsistent backgrounds and effects
4. **Heading Hierarchy** (LOW) - Size variations cause confusion
5. **Empty States** (MEDIUM) - Different patterns across surfaces

## Immediate Action Items

### Day 1 - Badge Standardization
1. Remove `animate-pulse` from homepage badge (visual flicker)
2. Standardize badge wrapper (`px-2.5 py-0.5` vs `px-2.5 py-1.5`)
3. Merge evidence and status badge types where appropriate

### Day 2 - Button Unification
1. Standardize button padding: `px-6 py-3` across all primary CTAs
2. Create one hover state pattern: `-translate-y-0.5`
3. Use consistent border radius (rounded-lg = 12px)

### Day 3 - Card Consistency
1. Standardize card backgrounds
2. Remove inconsistent shadow effects
3. Create single hover animation class

## Week-After Goals

### Interactive Consistency
- Hover states: `-translate-y-0.5` for all buttons
- Focus states: consistent ring colors
- Transitions: 200ms duration across all

### Empty/Loading States
- Standardize Skeleton component
- Create uniform error message patterns
- Implement loading skeleton for homepage

### Visual Hierarchy
- Heading size scales by level (H1-H3)
- Colors consistent across all badge types
- Evidence levels have distinct but coordinated colors

## Impact Assessment

**Current:** High visual inconsistency, affecting user trust and perception
**After Fix:** Cohesive institutional appearance, reduced cognitive load
**Risk:** High spread of changes, need careful testing

## Recommend Next Steps

1. **Badge Audit** - Runs within 2 hours, minimal risk
2. **Button Standardization** - 4 hours, impact on key interactions
3. **Card Redesign** - 8 hours, most ongoing effort
4. **Skeleton Loading** - 2 hours, improve perceived performance

## Documentation Requirements

All changes must be documented in:
- AGENTS.md (wave implementation notes)
- Formal documentation commit messages

## Quick Wins

1. Remove animation from homepage amber badge
2. Standardize `px-6 py-3` across all primary CTAs
3. Implement consistent heading hierarchy
4. Create uniform Skeleton component

## Risk Mitigation

**Breaking Changes:** Low - Buttons and badges don't affect core functionality
**Performance:** Minimal - No new dependencies
**Testing:** High - Need to validate across all surfaces