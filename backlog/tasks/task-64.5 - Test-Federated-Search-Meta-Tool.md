---
id: task-64.5
title: Test Federated Search Meta-Tool
status: To Do
assignee: []
created_date: '2025-12-30 06:03'
labels:
  - testing
  - v1.0.0
  - federated-search
dependencies: []
parent_task_id: task-64
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test the federated search meta-tool across multiple sources.

## Test Cases

### Auto Source Selection
- [ ] `search(query="Melbourne photos 1920s")` - should auto-select image sources
- [ ] `search(query="railway documents")` - should select PROV, Trove
- [ ] `search(query="platypus")` - should include ALA
- [ ] `search(query="heritage buildings")` - should include VHD
- [ ] Verify sourcesSearched in response

### Explicit Source Selection
- [ ] `search(query="railway", sources=["prov"])` - single source
- [ ] `search(query="railway", sources=["prov", "trove"])` - two sources
- [ ] `search(query="test", sources=["prov", "trove", "nma", "museumsvic"])` - four sources
- [ ] Verify only specified sources queried

### Content Type Filter
- [ ] `search(query="Melbourne", type="image")` - images only
- [ ] `search(query="Melbourne", type="newspaper")` - newspapers only
- [ ] `search(query="Melbourne", type="document")` - documents only

### Other Options
- [ ] `search(query="test", limit=3)` - with limit
- [ ] `search(query="Melbourne", dateFrom="1920", dateTo="1930")` - date range
- [ ] `search(query="Melbourne", state="vic")` - state filter

### Response Verification
- [ ] Verify totalResults count
- [ ] Verify results grouped by source
- [ ] Verify _timing info present
- [ ] Verify errors array for failed sources (if any)

### Error Handling
- [ ] `search(query="")` - empty query should error
- [ ] `search(query="test", sources=["invalid"])` - invalid source
- [ ] Verify partial failures don't break entire search
<!-- SECTION:DESCRIPTION:END -->
