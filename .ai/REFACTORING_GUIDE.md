# REFACTORING_GUIDE.md

# THE BREAKDOWN OS

Refactoring Guide

Version: 1.0

Status: Mandatory

---

# PURPOSE

The purpose of refactoring is to improve engineering quality while preserving product behaviour.

Refactoring is NOT feature development.

Refactoring is NOT architecture redesign.

Refactoring is NOT rewriting working code.

Every refactor should reduce technical debt while preserving functionality.

---

# REFACTORING PHILOSOPHY

Always prefer:

- Small improvements
- Incremental changes
- Measurable improvements
- Easy rollback
- Clear commits

Never perform repository-wide rewrites.

One module at a time.

---

# BEFORE WRITING CODE

Every refactoring session must begin by:

1. Reading

- AGENTS.md
- PROJECT_CONTEXT.md
- RULES.md
- ARCHITECTURE.md

2. Understanding the module

3. Producing an implementation plan

4. Waiting for approval

Do not immediately start modifying files.

---

# REFACTORING ORDER

Always follow this priority.

Priority 1

Dead Code

↓

Priority 2

Duplicate Code

↓

Priority 3

Large Components

↓

Priority 4

Accessibility

↓

Priority 5

Performance

↓

Priority 6

Developer Experience

↓

Priority 7

Architecture Improvements (approval required)

---

# ALLOWED REFACTORING

You MAY

✓ Split components

✓ Split services

✓ Split utility files

✓ Reduce duplication

✓ Rename private variables

✓ Improve readability

✓ Improve TypeScript

✓ Improve accessibility

✓ Improve performance

✓ Remove dead code

✓ Remove unused imports

✓ Remove unused dependencies

✓ Simplify complex functions

✓ Extract reusable components

✓ Extract reusable hooks

✓ Improve documentation

✓ Improve tests

✓ Improve error handling

✓ Improve logging

✓ Improve folder organization (inside existing architecture)

---

# NOT ALLOWED

You MUST NOT

✗ Rewrite architecture

✗ Replace Service Layer

✗ Replace Repository Pattern

✗ Replace Canonical Types

✗ Replace Event Bus

✗ Replace Plugin Analytics

✗ Replace Knowledge Graph

✗ Replace Supabase

✗ Replace Next.js App Router

✗ Replace routing

✗ Rewrite authentication

✗ Change database schema

✗ Change public APIs

✗ Break backward compatibility

✗ Delete migrations

✗ Introduce duplicate systems

✗ Create new top-level folders without approval

---

# COMPONENT REFACTORING

Target

<250 lines

Warning

300+

Mandatory Refactor

500+

Epic

1000+

Prefer

Composition

↓

Small Components

↓

Reusable Primitives

Avoid

God Components

Massive render functions

Deep prop drilling

---

# TYPESCRIPT

Prefer

Canonical Types

Interfaces

Discriminated Unions

Generics

Avoid

any

ts-ignore

eslint-disable

Type duplication

---

# REACT

Prefer

Server Components

Small Client Components

Composition

Reusable Hooks

Context only when justified

Avoid

Massive Context Providers

Business Logic in UI

Large Effects

Nested callbacks

---

# SERVICES

Business logic belongs in Services.

Components should:

Render

Delegate

Display

Never calculate complex domain rules.

---

# ACCESSIBILITY

Every refactor must preserve or improve:

Keyboard Navigation

Focus Management

ARIA

Semantic HTML

SVG Accessibility

Color Contrast

Heading Hierarchy

Screen Reader Support

WCAG AA minimum

---

# PERFORMANCE

Measure first.

Then optimize.

Prefer

Code Splitting

Dynamic Imports

next/image

Streaming

Suspense

Caching

Do not optimize without evidence.

---

# FILE DELETION

Before deleting ANY file verify:

✓ No static imports

✓ No dynamic imports

✓ No barrel exports

✓ No tests

✓ No documentation references

✓ No roadmap references

Generate a dependency report.

Only then delete.

---

# DUPLICATE CODE

When duplicate code is found:

1. Find canonical implementation

2. Verify behaviour

3. Migrate references

4. Delete duplicate

Never keep parallel implementations.

---

# LARGE COMPONENTS

When a component exceeds 500 lines:

Identify responsibilities.

Split by responsibility.

Example

ChartRenderer

↓

Registry

↓

Renderer

↓

Accessibility

↓

Interaction

↓

Theme

↓

Utilities

Never split only by line count.

Split by responsibility.

---

# SERVICES

Never move Service logic into Components.

Never move Component logic into Services.

Maintain separation.

---

# DOCUMENTATION

Every architectural refactor requires:

README update

Architecture update

ADR update

Refactoring summary

---

# GIT STRATEGY

Every refactor:

Feature Branch

↓

Small Commits

↓

Merge Request

↓

CI

↓

Review

↓

Merge

Never refactor directly on main.

---

# VERIFICATION

Every refactor must pass

npm run lint

npm run typecheck

npm run build

Run tests where applicable.

If any check fails:

STOP

Fix before continuing.

---

# ENGINEERING REPORT

Every completed refactor must include:

Summary

Objective

Files Changed

Architecture Impact

Performance Impact

Accessibility Impact

Security Impact

SEO Impact

Developer Experience Impact

Documentation Updated

Verification Results

Future Recommendations

---

# SUCCESS CRITERIA

A refactor is successful only if:

✓ Behaviour unchanged

✓ Code simpler

✓ Technical debt reduced

✓ Performance maintained or improved

✓ Accessibility maintained or improved

✓ Documentation updated

✓ Easier future development

---

# DECISION FRAMEWORK

Before every change ask:

Does this reduce complexity?

Does this preserve architecture?

Does this improve maintainability?

Does this reduce technical debt?

Does this make future development easier?

Can this be rolled back?

If the answer is NO,

do not implement.

---

# FINAL PRINCIPLE

The Breakdown OS is intended to last decades.

Refactoring should increase engineering quality without introducing unnecessary risk.

Every change should leave the codebase cleaner, simpler, and easier to understand than it was before.
