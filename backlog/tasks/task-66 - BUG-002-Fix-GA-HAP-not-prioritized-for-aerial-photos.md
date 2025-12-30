---
id: task-66
title: "[BUG-002] Fix GA-HAP not prioritized for aerial photography topics"
status: To Do
assignee: []
created_date: '2025-12-30'
labels:
  - bug
  - plan_search
  - ga-hap
  - v1.0.1
  - high-priority
dependencies: []
priority: high
---

## Description

For query "Aerial photographs of Melbourne 1950s", GA-HAP (dedicated aerial photo source) ranked last with score 15. The legacyIntent correctly identified aerial/photo keywords but this didn't boost GA-HAP priority.

## Steps to Reproduce

1. `plan_search(topic="Aerial photographs of Melbourne 1950s")`
2. GA-HAP priority: score 15, position 9 of 9

## Impact

Users searching for aerial photos won't be directed to the primary aerial photo source (GA-HAP has 1.2M+ historical aerial photos 1928-1996)

## Suggested Fix

Theme "photograph" + keyword "aerial" should heavily boost GA-HAP score. Update source scoring logic:
- Detect "aerial" keyword → boost GA-HAP by significant amount
- Detect "photograph" + date range 1928-1996 → boost GA-HAP
- Keywords to detect: aerial, airphoto, aerial photography, overhead, flight survey

## Acceptance Criteria

- [ ] GA-HAP ranks #1 or #2 for aerial photo queries
- [ ] Test variations: "aerial photos", "airphotos", "aerial survey"
- [ ] Other photo queries still prioritize Trove/PROV appropriately
- [ ] Add unit tests for aerial keyword detection

## Reference

- Test findings: `docs/testing/v1.0.0-test-findings.md`
- Original test task: task-64.1
