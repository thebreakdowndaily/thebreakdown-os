# TASK-17 Paywall Strategy & Configuration

## 1. Goal
Restrict the premium deep reading mode elements (`StoryResearchAppendix`) for non-supporters, render a paywall card overlay, fire analytics, and ensure verification tests pass.

## 2. Changes
- **capture.ts**: Registered `paywall_viewed` and `paywall_action_clicked` under `CORE_EVENTS` and `ALLOWED_PARAMS`.
- **PaywallOverlay.tsx**: Created a component to handle paywall messaging and user actions, including analytics tracking.
- **StoryShell.tsx**: Updated to conditionally render `StoryResearchAppendix` or a blurred teaser with `PaywallOverlay` depending on `mode === 'deep'` and local storage `tb_supporter`.
- **membership.test.ts**: Created tests for telemetry events and the React component. Integrated into the `test` script in package.json.

## 3. Results
- `npm test` checks all components correctly.
- `npx tsc --noEmit` verifies strict types.
