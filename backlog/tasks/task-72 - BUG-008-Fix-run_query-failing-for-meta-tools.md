---
id: task-72
title: "[BUG-008] Fix run_query failing for saved queries using meta-tools"
status: To Do
assignee: []
created_date: '2025-12-30'
labels:
  - bug
  - saved-queries
  - v1.0.1
  - high-priority
dependencies: []
priority: high
---

## Description

Saved queries that use meta-tools (like "search" for federated search) fail with "Tool not found" error. The run_query function uses the internal `run()` tool which only knows about data tools, not meta-tools.

## Steps to Reproduce

1. `save_query(name="fed-test", source="federated", tool="search", parameters={query:"Melbourne"})`
2. `run_query(name="fed-test")` → Error: "Tool not found: search"

## Impact

Cannot save/reuse federated search queries, only individual source queries work. This limits the usefulness of saved queries for common research patterns.

## Suggested Fix

run_query should detect when tool is a meta-tool and call it directly instead of going through run(). Options:
1. Check if tool name is in meta-tools list (search, compress, dedupe, etc.)
2. Add a `toolType` field to saved queries (data vs meta)
3. Try meta-tool dispatch first, fall back to run()

Meta-tools to support: search, compress, urls, dedupe, checkpoint, plan_search

## Acceptance Criteria

- [ ] Save and run federated search query works
- [ ] Save and run other meta-tool queries (compress, dedupe)
- [ ] Data tool queries still work unchanged
- [ ] Parameter overrides work for meta-tools
- [ ] Add unit tests for meta-tool saved queries

## Reference

- Test findings: `docs/testing/v1.0.0-test-findings.md`
- Original test task: task-64.6
