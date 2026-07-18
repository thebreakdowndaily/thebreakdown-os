# Scoring Model

## Overview
This document outlines the scoring algorithms and metrics models utilized by the Audit-as-Code framework (v1.0.0). Scoring is foundational to enforcing quality gates and enabling historical trend analysis for The Breakdown platform.

## Standardized Plugin Scoring
To provide cross-plugin correlation and a consistent reporting interface, all domain plugins map their assessments to a `0-100` score.

Every plugin returns:
- `score` (0-100): The composite readiness or compliance score.
- `coverage` (0-100): The percentage of the target surface area effectively analysed by the plugin.
- `findings`: A list of specific infractions (`critical`, `high`, `medium`, `low`, `informational`).

### Severity Thresholds
The final score of a plugin is typically determined by deductions based on finding severity:
- **Critical**: Heavily penalized, usually forces the plugin state into `FAILED`.
- **High**: Moderate penalty.
- **Medium**: Minor penalty.
- **Low/Informational**: No direct penalty, tracked purely for metric trendlines.

*(Note: Specific point deductions are defined in each plugin's `policy.json`)*

## Platform Health Score (PHS)
The aggregator computes a top-level **Platform Health Score (PHS)** that acts as the single executive metric representing the repository's compliance state.

In Version 1.0, the `platformHealthScore` is an **unweighted arithmetic mean** of the `score` from all non-mock plugins that completed execution.

### Weighted PHS
To ensure backward compatibility for future roadmap enhancements, the framework also reports a `weightedPlatformHealthScore`. In v1.0, this value is identical to the unweighted PHS. In v2.0, this will transition to a configuration-driven weighting system (e.g. prioritizing Security at 1.5x, Architecture at 1.0x).

## Plugin Coverage
While `score` denotes *compliance*, `coverage` denotes *visibility*. 
- A plugin that encounters unknown architectures or missing configurations may skip checks, resulting in lower coverage.
- High scores paired with low coverage usually indicate a misconfiguration in the audit targeting, requiring intervention.
