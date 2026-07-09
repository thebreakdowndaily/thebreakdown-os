# Testing Guide

## Philosophy
Tests must ensure that the contract of the application (0 errors, 207 generated pages) remains uncompromised. Tests are separated into functional tests and End-to-End (E2E) validations.

## Running Tests
- `npm run test` — Runs core domain logic and page view-model tests.
- `npm run test:dataset` — Runs dataset-specific tests.
- `npm run test:dataset:e2e` — Runs comprehensive dataset E2E tests.
- `npm run test:all` — Validates the entire suite.

## Guidelines
- **Unit Tests**: Focus on View-Models, Services, and Utilities. Component tests should verify prop rendering.
- **Mocking**: Rely on `utils/cms-store.ts` for in-memory seed data. Do not duplicate mock data within individual test files.
- **Fail Fast**: Stop immediately if a test verification fails during a phase.
