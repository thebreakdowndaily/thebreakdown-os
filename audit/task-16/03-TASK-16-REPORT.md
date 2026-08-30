# TASK-16 Advertising Implementation Report

- Added `ad_slot_rendered` and `ad_clicked` to `CORE_EVENTS` in `capture.ts`.
- Upgraded `AdSlot` component to support conditional AdSense script loading.
- Integrated `AdBlockDetector` and three `AdSlot` units in `StoryShell` for standard and deep reading modes.
- Added tests in `tests/monetization/advertising.test.ts`.
