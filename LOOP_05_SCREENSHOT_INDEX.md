# THE BREAKDOWN — LOOP 05 SCREENSHOT INDEX

**Domain:** `https://thebreakdown.in`  
**Production Deployment ID:** `dpl_9Ea1SSMkmLzaG8KfCjAUDT2pwN28`  
**Release Commit:** `40fa1ee`  
**Date:** 2026-09-27  
**Engine:** Playwright Chromium (Headless)  
**Surface Under Test:** Flagship Investigation (`/story/accountability-in-india`)  

---

## 1. Multi-Viewport Reader Journey Forensic Matrix

| Viewport | Resolution | Step 1: First Screen | Step 2: TOC Interaction | Step 3: Middle Story Reading | Step 4: Sources Appendix | Step 5: Related & Footer | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Mobile 375** | 375×812 | `flagship-step1-first-screen-mobile-375.png` | `flagship-step2-toc-mobile-375.png` | `flagship-step3-middle-story-mobile-375.png` | `flagship-step4-sources-appendix-mobile-375.png` | `flagship-step5-related-footer-mobile-375.png` | **200 OK** |
| **Mobile 390** | 390×844 | `flagship-step1-first-screen-mobile-390.png` | `flagship-step2-toc-mobile-390.png` | `flagship-step3-middle-story-mobile-390.png` | `flagship-step4-sources-appendix-mobile-390.png` | `flagship-step5-related-footer-mobile-390.png` | **200 OK** |
| **Mobile 412** | 412×915 | `flagship-step1-first-screen-mobile-412.png` | `flagship-step2-toc-mobile-412.png` | `flagship-step3-middle-story-mobile-412.png` | `flagship-step4-sources-appendix-mobile-412.png` | `flagship-step5-related-footer-mobile-412.png` | **200 OK** |
| **Tablet 768** | 768×1024 | `flagship-step1-first-screen-tablet-768.png` | `flagship-step2-toc-tablet-768.png` | `flagship-step3-middle-story-tablet-768.png` | `flagship-step4-sources-appendix-tablet-768.png` | `flagship-step5-related-footer-tablet-768.png` | **200 OK** |
| **Desktop 1280** | 1280×800 | `flagship-step1-first-screen-desktop-1280.png` | `flagship-step2-toc-desktop-1280.png` | `flagship-step3-middle-story-desktop-1280.png` | `flagship-step4-sources-appendix-desktop-1280.png` | `flagship-step5-related-footer-desktop-1280.png` | **200 OK** |
| **Desktop 1440** | 1440×900 | `flagship-step1-first-screen-desktop-1440.png` | `flagship-step2-toc-desktop-1440.png` | `flagship-step3-middle-story-desktop-1440.png` | `flagship-step4-sources-appendix-desktop-1440.png` | `flagship-step5-related-footer-desktop-1440.png` | **200 OK** |

Total Captured Forensics: **30 images** (all 200 OK, zero render anomalies, cataloged in `screenshots/loop-05/manifest.json`).

---

## 2. Forensic Observations by Journey Stage

### Stage 1: First Screen Orientation
- **Mobile (375/390/412px):** Hero image scales cleanly without letterboxing or horizontal overflow. The headline ("When Something Goes Wrong, Who Actually Answers?") and dek render in high-contrast typography. The reading mode selector ("Quick Brief", "Standard", "Deep Research") sits directly above the narrative.
- **Desktop (1280/1440px):** Two-column layout establishes immediate orientation: left sticky rail presents table of contents and reading metadata; center column presents editorial prose capped at optimal reading line length (65–75 characters).

### Stage 2: Table of Contents & In-Page Navigation
- **Mobile (`lg:hidden`):** The new collapsible "On This Page" drawer allows one-handed expansion. Tapping any act or the Sources link scrolls immediately to that section.
- **Desktop (`hidden lg:block`):** Sticky `StoryOrientationRail` highlights the active section in real-time using `IntersectionObserver`. Dead `#orientation` anchors have been completely removed (ISSUE-006 resolved).

### Stage 3: Narrative Flow & Progress Feedback
- The sticky reading progress bar tracks scroll depth smoothly at `top-[4rem]`, just below the site header.
- Act headings (e.g. Act I: The Ariyalur Doctrine, Act II: The Machinery of Diffusion) visually anchor historical and statutory shifts.

### Stage 4: Evidence & Sources Appendix
- The Claims Ledger displays verified findings with clear confidence badges.
- Every source displays verified publisher attribution ("Government of India", "Supreme Court of India", "Comptroller & Auditor General") with primary record tier badges.
- Fixed the runtime error caused by sources with `name` fields instead of `title` (ISSUE-008 resolved).

### Stage 5: Related Stories & Continuity
- "Continue Exploring" provides contextually relevant, non-circular recommendations (e.g. Electoral Bonds, MGNREGA Reform, DPDP Bill) without dead ends.
