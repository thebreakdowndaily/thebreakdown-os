# REVIEW_CHECKLIST.md

# THE BREAKDOWN OS

Engineering Review Checklist

Version: 1.0

Status: Mandatory

---

# PURPOSE

Every Pull Request, refactor, feature, bug fix, and AI-generated change must satisfy this checklist before it can be merged.

If any mandatory item fails, the work is NOT complete.

---

# 1. BUILD QUALITY

## TypeScript

- [ ] No TypeScript errors
- [ ] No unsafe `any`
- [ ] No unnecessary type assertions
- [ ] Canonical types reused
- [ ] Strict mode preserved

Verification

```bash
npm run typecheck
```

PASS REQUIRED

---

## ESLint

- [ ] 0 ESLint errors
- [ ] No new warnings
- [ ] No unnecessary eslint-disable
- [ ] Imports organized
- [ ] No unused variables
- [ ] No dead imports

Verification

```bash
npm run lint
```

PASS REQUIRED

---

## Build

- [ ] Production build succeeds
- [ ] No build warnings
- [ ] No hydration errors
- [ ] Static generation succeeds
- [ ] Route generation succeeds

Verification

```bash
npm run build
```

PASS REQUIRED

---

# 2. TESTING

## Unit Tests

- [ ] Existing tests pass
- [ ] New functionality tested
- [ ] No broken snapshots

Verification

```bash
npm test
```

PASS REQUIRED

---

## Integration Tests

- [ ] APIs verified
- [ ] Services verified
- [ ] User flows verified

---

## End-to-End

Verify:

- [ ] Homepage
- [ ] Story page
- [ ] Topic page
- [ ] Entity page
- [ ] Search
- [ ] CMS (if modified)
- [ ] Authentication (if modified)

---

# 3. ACCESSIBILITY

Every feature must preserve or improve accessibility.

## Keyboard

- [ ] Tab navigation works
- [ ] Focus order correct
- [ ] Visible focus ring
- [ ] Escape closes dialogs
- [ ] Enter/Space activates controls

---

## Screen Readers

- [ ] aria-label
- [ ] aria-labelledby
- [ ] aria-describedby
- [ ] alt text
- [ ] Semantic HTML

---

## SVG

- [ ] Accessible role
- [ ] Accessible title
- [ ] Keyboard support

---

## Color

- [ ] Contrast meets WCAG AA
- [ ] No color-only communication

---

# 4. PERFORMANCE

## Core

- [ ] No unnecessary rerenders
- [ ] No unnecessary Client Components
- [ ] Dynamic imports used appropriately
- [ ] Images optimized
- [ ] Bundle impact reviewed

---

## Images

- [ ] next/image used where appropriate
- [ ] Responsive sizing
- [ ] Lazy loading
- [ ] Correct object-fit

---

## Bundle

- [ ] Bundle size unchanged or improved
- [ ] Large libraries justified
- [ ] Bundle analysis reviewed (`npm run analyze`)

Optional verification

```bash
npm run analyze
```

---

# 5. RESPONSIVE DESIGN

Verify:

Desktop

- [ ] 1920px
- [ ] 1440px

Laptop

- [ ] 1280px

Tablet

- [ ] 1024px
- [ ] 768px

Mobile

- [ ] 430px
- [ ] 390px
- [ ] 375px
- [ ] 360px
- [ ] 320px

No overflow.

No layout shifts.

No clipped content.

---

# 6. SEO

Verify:

- [ ] Title
- [ ] Description
- [ ] Canonical URL
- [ ] Open Graph
- [ ] Twitter Card
- [ ] Structured Data
- [ ] Sitemap unaffected
- [ ] Internal links valid

---

# 7. SECURITY

- [ ] No secrets committed
- [ ] No exposed environment variables
- [ ] Authorization preserved
- [ ] Input validated
- [ ] No XSS risks introduced
- [ ] No unsafe HTML rendering

---

# 8. ARCHITECTURE

Verify

- [ ] Service Layer preserved
- [ ] Repository Pattern preserved
- [ ] Canonical Types reused
- [ ] Plugin Analytics preserved
- [ ] Event Bus unchanged
- [ ] Public APIs unchanged
- [ ] No duplicate systems created
- [ ] 0 Server Component Violations


---

# 9. CODE QUALITY

- [ ] Component size appropriate
- [ ] Functions understandable
- [ ] Naming consistent
- [ ] No duplicated code
- [ ] No dead code
- [ ] Comments only where necessary

---

# 10. DOCUMENTATION

If applicable

- [ ] README updated
- [ ] ARCHITECTURE updated
- [ ] PROJECT_CONTEXT updated
- [ ] ADR added
- [ ] RFC updated

---

# 11. USER EXPERIENCE

Verify

- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] Success feedback
- [ ] Animations appropriate
- [ ] Keyboard shortcuts preserved

---

# 12. CONSOLE

Developer Console

- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] No hydration warnings
- [ ] No failed network requests
- [ ] No unnecessary console.log

---

# 13. GIT REVIEW

- [ ] Logical commits
- [ ] Small PR
- [ ] Clear commit message
- [ ] Rollback possible
- [ ] No unrelated changes

---

# 14. ENGINEERING REPORT

Every implementation must include

- [ ] Summary
- [ ] Files changed
- [ ] Architecture impact
- [ ] Performance impact
- [ ] Accessibility impact
- [ ] Security impact
- [ ] SEO impact
- [ ] Verification results
- [ ] Future recommendations

---

# DEFINITION OF DONE

Work is complete only when:

✅ TypeScript passes

✅ ESLint passes

✅ Tests pass

✅ Build passes

✅ Accessibility preserved

✅ Performance maintained or improved

✅ Responsive layout verified

✅ SEO preserved

✅ No console errors

✅ Documentation updated

✅ Architecture preserved

Only then is the work ready for review and merge.

---

# FINAL RULE

Never merge code because it "works."

Merge code because it is:

- Correct
- Maintainable
- Accessible
- Performant
- Secure
- Documented
- Verified

The Breakdown OS should become better after every merge.
