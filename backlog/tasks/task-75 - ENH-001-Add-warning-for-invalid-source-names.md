---
id: task-75
title: "[ENH-001] Add warning for invalid source names in federated search"
status: To Do
assignee: []
created_date: '2025-12-30'
labels:
  - enhancement
  - federated-search
  - v1.0.1
  - medium-priority
dependencies: []
priority: medium
---

## Description

When an invalid source name is passed to `search(sources=["invalid_source"])`, the tool silently falls back to auto-selecting sources based on query keywords instead of warning/erroring about the invalid source name.

## Steps to Reproduce

1. Call `search(query="test", sources=["invalid_source"])`
2. Observe: Returns results from auto-selected sources (prov, trove, nma, etc.)
3. Expected: Error or warning about "invalid_source" not being a valid source

## Impact

Users may not realize their source filter is being ignored, leading to unexpected results

## Suggested Fix

Validate source names against known sources and return error for invalid entries.

Valid sources: `prov`, `trove`, `museumsvic`, `ala`, `nma`, `vhd`, `acmi`, `ghap`, `ga-hap`, `pm-transcripts`

Options:
1. **Strict**: Error if any invalid source provided
2. **Warn**: Include warning in response but continue with valid sources
3. **Warn + filter**: Log warning and use only the valid sources from the list

## Acceptance Criteria

- [ ] Invalid source names trigger warning or error
- [ ] Valid sources list is documented in error message
- [ ] Partial valid list works (e.g., ["prov", "invalid"] uses just prov)
- [ ] Add unit tests for source validation

## Reference

- Test findings: `docs/testing/v1.0.0-test-findings.md`
- Original test task: task-64.5
