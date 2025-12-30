---
id: task-64.6
title: Test Saved Queries (4 tools)
status: To Do
assignee: []
created_date: '2025-12-30 06:03'
labels:
  - testing
  - v1.0.0
  - saved-queries
dependencies: []
parent_task_id: task-64
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test the saved query management meta-tools.

## Test Cases

### save_query
- [ ] `save_query(name="test-query-1", source="prov", tool="prov_search", parameters={query:"railway"})`
- [ ] `save_query(name="test-query-2", source="trove", tool="trove_search", parameters={query:"Melbourne flood", dateFrom:"1930"}, tags=["floods", "research"])`
- [ ] `save_query(name="federated-test", source="federated", tool="search", parameters={query:"Melbourne", sources:["prov","trove"]})`
- [ ] Try duplicate name - should error
- [ ] Try invalid name format - should error (spaces, special chars)
- [ ] Verify description field is optional

### list_queries
- [ ] `list_queries()` - list all
- [ ] `list_queries(source="prov")` - filter by source
- [ ] `list_queries(source="trove")` - filter by source
- [ ] `list_queries(tag="research")` - filter by tag
- [ ] `list_queries(search="flood")` - search in names/descriptions
- [ ] `list_queries(sortBy="lastUsed", sortOrder="desc")` - sorting
- [ ] `list_queries(limit=2)` - pagination

### run_query
- [ ] `run_query(name="test-query-1")` - execute saved query
- [ ] `run_query(name="test-query-2", overrides={limit:5})` - with overrides
- [ ] Verify useCount increments after execution
- [ ] Verify lastUsed timestamp updates
- [ ] Try non-existent query - should error

### delete_query
- [ ] `delete_query(name="test-query-1")` - delete query
- [ ] Verify query no longer in list_queries
- [ ] Try deleting non-existent query - should error gracefully
<!-- SECTION:DESCRIPTION:END -->
