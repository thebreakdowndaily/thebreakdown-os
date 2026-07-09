# RULES.md

# THE BREAKDOWN OS

Engineering Rules & Repository Contract

Version: 1.0

Status: Mandatory

---

# PURPOSE

These rules exist to preserve the long-term integrity of The Breakdown OS.

Every engineer, contributor, and AI agent must follow these rules.

When these rules conflict with convenience, these rules take priority.

---

# RULE 1 — PRESERVE ARCHITECTURE

Never redesign the platform without explicit approval.

Preserve:

- Service Layer
- Repository Pattern
- Canonical Types
- Knowledge Graph
- Event Bus
- Plugin Analytics
- View Models
- Next.js App Router

Never create parallel architectures.

Always extend existing systems.

---

# RULE 2 — SINGLE SOURCE OF TRUTH

There must only be one source of truth.

Examples:

✓ types/canonical.ts

✓ services/

✓ Event Bus

Never duplicate:

- Types
- Services
- Utilities
- Hooks
- Constants
- Data Models

If duplication is discovered,

remove the duplicate.

---

# RULE 3 — DATABASE SAFETY

Never:

- modify schema
- rename tables
- rename columns
- drop indexes
- delete migrations

without approval.

Every database change requires:

- migration
- rollback
- documentation

---

# RULE 4 — PUBLIC API STABILITY

Never break:

REST API

Route structure

Exported interfaces

Public hooks

Component contracts

If breaking changes are unavoidable:

- document
- version
- provide migration path

---

# RULE 5 — COMPONENT SIZE

Target:

<250 lines

Warning:

300+

Mandatory Refactor:

500+

Epic Required:

1000+

Prefer composition.

Never build monolithic components.

---

# RULE 6 — TYPESCRIPT

Strict Mode only.

Never use:

any

ts-ignore

eslint-disable

unless approved.

Always reuse canonical types.

Never redefine interfaces.

---

# RULE 7 — SERVICES

Business logic belongs in services.

React components should primarily:

- render UI
- manage presentation
- delegate business logic

Never embed complex domain logic inside UI components.

---

# RULE 8 — ACCESSIBILITY

Accessibility is mandatory.

Every feature must support:

Keyboard navigation

Screen readers

Focus management

ARIA

Semantic HTML

Color contrast

SVG accessibility

WCAG AA minimum

Never remove accessibility features.

---

# RULE 9 — PERFORMANCE

Optimize after measuring.

Prefer:

Server Components

Streaming

Suspense

Dynamic Imports

Code Splitting

next/image

Caching

Avoid premature optimization.

Every optimization should include measurements.

---

# RULE 10 — DESIGN SYSTEM

Never duplicate:

Buttons

Cards

Badges

Containers

Typography

Spacing

Colors

Reuse existing design primitives.

---

# RULE 11 — ANALYTICS

Never call providers directly.

All analytics must flow through:

PluginAnalyticsService

Providers must be plugins.

---

# RULE 12 — SECURITY

Never expose:

Secrets

API Keys

Tokens

Passwords

Environment variables

Database credentials

Never weaken authentication.

Never bypass authorization.

Always validate input.

---

# RULE 13 — SEO

Never reduce SEO quality.

Every page should preserve:

Metadata

Canonical URLs

Open Graph

Twitter Cards

Structured Data

Internal Linking

---

# RULE 14 — TESTING

Every change must pass:

npm run lint

npm run typecheck

npm run build

Run tests whenever applicable.

Never merge failing builds.

---

# RULE 15 — DOCUMENTATION

If architecture changes:

Update:

README

ARCHITECTURE.md

ADR

RFC

PROJECT_CONTEXT.md

Never leave documentation outdated.

---

# RULE 16 — REFACTORING

Always prefer:

Incremental

Measured

Reversible

Small pull requests

One module at a time

Never perform repository-wide rewrites.

---

# RULE 17 — FILE DELETION

Before deleting any file:

Verify:

✓ No static imports

✓ No dynamic imports

✓ No barrel exports

✓ No tests

✓ No documentation references

✓ No roadmap dependencies

Create a dependency report.

Only then delete.

---

# RULE 18 — GIT WORKFLOW

Never commit directly to:

main

Workflow:

Issue

↓

Branch

↓

Implementation

↓

Merge Request

↓

CI

↓

Review

↓

Merge

Small commits.

Logical commits.

One concern per PR.

---

# RULE 19 — REVIEW CHECKLIST

Every Merge Request must include:

Objective

Files Changed

Architecture Impact

Performance Impact

Accessibility Impact

Security Impact

SEO Impact

Documentation Updated

Rollback Strategy

Verification Results

---

# RULE 20 — AI BEHAVIOR

AI must:

Read before writing.

Understand before changing.

Plan before implementing.

Never guess.

If uncertain:

STOP

Ask for clarification.

Do not invent architecture.

Do not invent APIs.

Do not invent requirements.

---

# RULE 21 — QUALITY GATES

Code cannot be considered complete until:

✓ Build passes

✓ TypeScript passes

✓ ESLint passes

✓ Tests pass

✓ Accessibility preserved

✓ Performance maintained or improved

✓ Documentation updated

✓ ADR updated (if architecture changed)

---

# RULE 22 — LONG-TERM THINKING

Every engineering decision should answer:

Will this still make sense in 2045?

Does this reduce technical debt?

Does this improve maintainability?

Does this preserve trust?

Does this make future development easier?

If the answer is "No",

do not implement it.

# RULE 23 — HEAVY CLIENT-SIDE LIBRARIES

Heavy client-side libraries must never be imported directly into pages or layouts.

They must be isolated behind wrapper components and loaded dynamically unless there is a measured reason not to.

Examples:
- D3
- Three.js
- Globe.gl
- MapLibre
- Monaco Editor
- Mermaid

---

# RULE 24 — CLIENT COMPONENT BOUNDARIES

Never import Services, View Models, Repositories, or Data Layer modules into Client Components.

Client Components receive only serializable props.

All business logic and data preparation must execute in Server Components or Services.

---

# RULE 25 — COMPONENT REFACTORING LIMITS

Never refactor more than two major components in one sprint.

Each component refactor must:
- preserve API
- preserve behaviour
- pass independently
- be revertible independently

---

# RULE 26 — EDITOR COMPONENTS

Editor components must not directly implement:

- autosave timers
- drag/drop engines
- preview rendering
- serialization

These concerns should be isolated into dedicated hooks or components.

This prevents future regressions.

---
---
# RULE 27 — MEANINGFUL VISUALS

Every major page must contain at least one meaningful visual.

Visuals must explain. Never decorate.

Acceptable visuals:

- Hero image
- Chart
- Map
- Timeline
- Knowledge graph
- Diagram
- Data table

Not acceptable:

- Abstract gradients
- Animated blobs
- Decorative patterns
- Placeholder images

If a visual cannot be sourced:

Render an explicit empty state.

Never substitute decoration for content.

Never ship a major page that is purely text.

---

# RULE 28 — ANIMATION BUDGET

Animations must be minimal and purposeful.

## Permitted durations

- 150ms — interaction (hover color, focus ring, border)
- 200ms — layout (transform, size)
- 300ms — image zoom on hover (maximum)

Use CSS tokens:

- `--duration-interaction: 150ms`
- `--duration-transition:  200ms`
- `--duration-image-zoom:  300ms`

## Permitted animation types

- Fade in/out
- Slide up (8px — content reveal)
- Elevation on hover (box-shadow + 1px translateY)
- Subtle image zoom on hover (max scale 1.03)
- Shimmer (skeleton loading only)
- Spin (loading indicator only)

## Prohibited

- Floating blobs
- Constant movement (infinite non-loading animations)
- Heavy parallax
- Ambient gradient drift
- Particles
- Pulsing glows on UI elements

## Keyframe source of truth

All permitted keyframes live in `styles/globals.css`.

No keyframe may be added without updating this rule.

## Reduced motion

`prefers-reduced-motion: reduce` is always respected.

All animations collapse to 0.01ms in reduced-motion environments.

---

# FINAL PRINCIPLE

The Breakdown OS is a long-term knowledge platform.

Optimize for:

- Simplicity
- Longevity
- Reliability
- Trust
- Maintainability
- Scalability

Never optimize for short-term convenience at the expense of long-term quality.

