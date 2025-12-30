---
id: task-65
title: "[BUG-001] Fix Melbourne location resolving to NSW instead of VIC"
status: To Do
assignee: []
created_date: '2025-12-30'
labels:
  - bug
  - plan_search
  - v1.0.1
  - high-priority
dependencies: []
priority: high
---

## Description

When parsing location "Melbourne", the plan_search tool consistently matches to a small NSW placename instead of Melbourne, Victoria. This affects state filters, source recommendations, and search strategies.

## Steps to Reproduce

1. `plan_search(topic="History of Melbourne 1920s")`
2. Observe location parsing shows Melbourne → NSW

## Affected Tests

Tests 2, 3, 4, 6, 7, 8 in task-64.1 all showed Melbourne → NSW

## Impact

All Melbourne-focused research gets incorrect state filters (NSW instead of VIC)

## Suggested Fix

Prioritise major cities/capitals over minor placenames. Melbourne, VIC should rank higher than Melbourne, NSW in GHAP lookup. Consider:
- Population weighting
- Capital city priority list (Melbourne, Sydney, Brisbane, Perth, Adelaide, Hobart, Darwin, Canberra)
- Historical significance ranking

## Acceptance Criteria

- [ ] Melbourne resolves to VIC by default
- [ ] Other major cities resolve correctly (Sydney→NSW, Brisbane→QLD, etc.)
- [ ] Minor placenames still work when unambiguous
- [ ] Add unit tests for location resolution

## Reference

- Test findings: `docs/testing/v1.0.0-test-findings.md`
- Original test task: task-64.1
