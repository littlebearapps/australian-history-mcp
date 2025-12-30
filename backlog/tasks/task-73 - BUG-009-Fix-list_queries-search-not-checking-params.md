---
id: task-73
title: "[BUG-009] Fix list_queries search not checking query parameters"
status: To Do
assignee: []
created_date: '2025-12-30'
labels:
  - bug
  - saved-queries
  - v1.0.1
  - low-priority
dependencies: []
priority: low
---

## Description

`list_queries(search="flood")` returns 0 results even though a saved query has "Melbourne flood" in its parameters. The search only checks name and description fields.

## Steps to Reproduce

1. `save_query(name="test", source="trove", tool="trove_search", parameters={query:"Melbourne flood"})`
2. `list_queries(search="flood")` → returns 0 results
3. Expected: Should find the query based on parameter content

## Impact

Users can't search for queries by their search terms, only by name/description

## Suggested Fix

Extend search to also check stringified parameters:
1. JSON.stringify the parameters object
2. Search within that string for the search term
3. Consider case-insensitive matching

## Acceptance Criteria

- [ ] Search finds queries by parameter content
- [ ] Existing name/description search still works
- [ ] Case-insensitive matching
- [ ] Add unit tests for parameter search

## Reference

- Test findings: `docs/testing/v1.0.0-test-findings.md`
- Original test task: task-64.6
