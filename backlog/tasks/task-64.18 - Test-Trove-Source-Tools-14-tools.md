---
id: task-64.18
title: Test Trove Source Tools (14 tools)
status: To Do
assignee: []
created_date: '2025-12-30 06:07'
labels:
  - testing
  - v1.0.0
  - trove
dependencies: []
parent_task_id: task-64
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test all 14 Trove (National Library of Australia) tools via run().

## Test Cases

### trove_search
- [ ] `run(tool="trove_search", args={query:"Melbourne flood"})` - basic search
- [ ] `run(tool="trove_search", args={query:"Melbourne", category:"newspaper"})` - newspapers
- [ ] `run(tool="trove_search", args={query:"gold rush", category:"image"})` - images
- [ ] `run(tool="trove_search", args={query:"Melbourne", dateFrom:"1930", dateTo:"1939"})` - date range
- [ ] `run(tool="trove_search", args={query:"Melbourne", state:"vic"})` - state filter
- [ ] `run(tool="trove_search", args={query:"bushrangers", creator:"Lawson"})` - with creator
- [ ] `run(tool="trove_search", args={query:"Melbourne", sortby:"dateasc"})` - sort by date
- [ ] `run(tool="trove_search", args={query:"Melbourne", nuc:"VSL"})` - NUC filter

### trove_harvest, trove_newspaper_article, trove_list_titles, trove_title_details
### trove_get_contributor, trove_list_contributors, trove_list_magazine_titles
### trove_get_magazine_title, trove_get_work, trove_get_person
### trove_get_list, trove_search_people, trove_get_versions

See full test cases in task description.
<!-- SECTION:DESCRIPTION:END -->
