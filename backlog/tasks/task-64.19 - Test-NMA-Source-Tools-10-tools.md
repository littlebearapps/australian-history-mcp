---
id: task-64.19
title: Test NMA Source Tools (10 tools)
status: To Do
assignee: []
created_date: '2025-12-30 06:07'
labels:
  - testing
  - v1.0.0
  - nma
dependencies: []
parent_task_id: task-64
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test all 10 NMA (National Museum of Australia) tools via run().

## Test Cases

### nma_search_objects
- [ ] `run(tool="nma_search_objects", args={query:"boomerang"})` - basic search
- [ ] `run(tool="nma_search_objects", args={query:"gold rush"})` - historical topic

### nma_get_object, nma_search_places, nma_get_place
### nma_search_parties, nma_get_party, nma_search_media
### nma_get_media, nma_harvest, nma_get_related

See full test cases in task description.
<!-- SECTION:DESCRIPTION:END -->
