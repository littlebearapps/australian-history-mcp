---
id: task-69
title: "[BUG-005] Fix searchPlan inconsistently empty for some topics"
status: To Do
assignee: []
created_date: '2025-12-30'
labels:
  - bug
  - plan_search
  - v1.0.1
  - low-priority
dependencies: []
priority: low
---

## Description

The `searchPlan` array in plan_search output is sometimes empty (Tests 1, 3, 4, 6) while populated for others (Tests 2, 5, 7, 8). No clear pattern for when it's populated.

## Impact

Users don't always get step-by-step search guidance from plan_search

## Investigation Needed

1. Identify conditions that trigger searchPlan generation
2. Determine if this is by design or a bug
3. Check if certain query types bypass searchPlan generation

## Suggested Fix

Ensure searchPlan is consistently generated for all topics. If certain topics don't need a plan, document why.

## Acceptance Criteria

- [ ] Investigate root cause of inconsistent searchPlan
- [ ] Either fix to always generate, or document when it's skipped
- [ ] Add unit tests for searchPlan generation
- [ ] Update documentation if behavior is intentional

## Reference

- Test findings: `docs/testing/v1.0.0-test-findings.md`
- Original test task: task-64.1
