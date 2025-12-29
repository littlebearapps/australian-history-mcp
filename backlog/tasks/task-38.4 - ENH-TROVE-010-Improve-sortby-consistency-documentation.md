---
id: task-38.4
title: ENH-TROVE-010 - Improve sortby consistency documentation
status: Done
assignee: []
created_date: '2025-12-29 05:11'
updated_date: '2025-12-29 05:47'
labels:
  - trove
  - enhancement
  - documentation
dependencies: []
parent_task_id: task-38
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Priority:** Low | **Effort:** Low

**Issue:** sortby parameter behaviour not fully documented, especially for pagination

**Enhancement:**
Document sortby behaviour, limitations, and best practices.

**Documentation to Add:**
- Available sort options per category
- Cursor stability with different sort options
- Recommendations for harvest operations
- Known edge cases

**Files:**
- `docs/quickrefs/trove-api.md` - Expand sortby documentation
- `CLAUDE.md` - Add Known Quirks section note
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 trove-api.md documents all sortby options
- [x] #2 Pagination/cursor stability noted
- [x] #3 Best practices for harvest operations documented
- [x] #4 Known Quirks updated in CLAUDE.md
<!-- AC:END -->
