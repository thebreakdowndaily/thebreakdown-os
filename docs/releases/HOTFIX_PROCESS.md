# Hotfix Release Process

Follow these steps if a production critical issue is identified post-launch that warrants a hotfix.

## 1. Branching Policy
- Branch out from the current release tag:
  ```bash
  git checkout -b hotfix/issue-description [v1.0.0]
  ```

## 2. Implementation & Test Scope
- Implement only the direct fix for the reported issue.
- Do not combine updates, configuration refactoring, or packages.
- Run targeted tests for the affected component, and verify `npm run test:all` succeeds.

## 3. Deployment & Release Tagging
- Merge back to the main release branch following code review.
- Tag the patch release:
  ```bash
  git tag -a v1.0.1 -m "Hotfix for [issue]"
  ```
- Deploy to staging and trigger the `POST_DEPLOY_CHECKLIST.md` before promoting to production.
