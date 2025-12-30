---
id: task-74
title: "[BUG-010] Fix export fields parameter ignored"
status: To Do
assignee: []
created_date: '2025-12-30'
labels:
  - bug
  - export
  - v1.0.1
  - low-priority
dependencies: []
priority: low
---

## Description

The `fields` parameter in export() is ignored. When specifying `fields=["id", "title", "url"]`, all fields are returned instead of just the requested fields.

## Steps to Reproduce

1. `export(records=[{id:"...", title:"...", description:"...", series:"...", url:"...", source:"..."}], format="json", fields=["id", "title", "url"])`
2. Output contains all 6 fields instead of just the 3 requested

## Impact

Cannot limit exported fields to reduce output size. Users may receive unnecessary data.

## Suggested Fix

Implement field filtering in export function before generating output:
1. If `fields` parameter is provided and non-empty
2. Map each record to only include specified fields
3. Apply before format conversion (CSV, JSON, Markdown)

## Acceptance Criteria

- [ ] JSON export respects fields parameter
- [ ] CSV export respects fields parameter (column headers too)
- [ ] Markdown export respects fields parameter
- [ ] download-script export (may not need field filtering)
- [ ] Empty/null fields param returns all fields (current behavior)
- [ ] Add unit tests for field filtering

## Reference

- Test findings: `docs/testing/v1.0.0-test-findings.md`
- Original test task: task-64.7
