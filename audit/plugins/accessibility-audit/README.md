# Accessibility Audit Plugin (`accessibility-audit`)

## Overview
This plugin verifies the presence of automated accessibility (a11y) testing tools and linting rules within the repository. It ensures that the project is configured to catch accessibility violations early in the development lifecycle.

## Capabilities
- **Linting Checks**: Verifies that standard accessibility linting plugins (e.g., `eslint-plugin-jsx-a11y`) are configured in `package.json`.
- **Automation Checks**: Verifies that automated runtime testing tools (e.g., `@axe-core/react`, `axe-core`, or `cypress-axe`) are present in `package.json`.
- **Styling Checks**: Verifies that the project leverages modern CSS tools (e.g., `tailwindcss`) for consistent theming and focus management.

## Integration
This plugin emits a standardized `score` representing a11y readiness. It runs entirely on static configuration files (i.e., `package.json`) and does not execute browser tests itself.

### Policy Rules
Refer to `policy.json` for specific package names and threshold severities.
