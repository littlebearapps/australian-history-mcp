---
id: task-38.3
title: ENH-TROVE-006 - Add limit to trove_list_contributors
status: Done
assignee: []
created_date: '2025-12-29 05:11'
updated_date: '2025-12-29 05:56'
labels:
  - trove
  - enhancement
  - pagination
dependencies: []
parent_task_id: task-38
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Priority:** Low | **Effort:** Low

**Issue:** `trove_list_contributors` returns all 1500+ contributors with no limit option

**Enhancement:**
Add `limit` parameter to control number of results returned.

**Implementation:**
1. Add `limit` param to list-contributors.ts
2. Default to reasonable limit (100)
3. Update schema description

**Files:**
- `src/sources/trove/tools/list-contributors.ts` - Add limit param
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 limit parameter added to trove_list_contributors
- [x] #2 Default limit of 100
- [x] #3 Works with query filter
<!-- AC:END -->
