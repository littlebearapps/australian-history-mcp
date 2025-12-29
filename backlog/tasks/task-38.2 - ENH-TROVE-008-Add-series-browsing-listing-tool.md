---
id: task-38.2
title: ENH-TROVE-008 - Add series browsing/listing tool
status: Done
assignee: []
created_date: '2025-12-29 05:11'
updated_date: '2025-12-29 05:51'
labels:
  - trove
  - enhancement
  - new-tool
dependencies: []
parent_task_id: task-38
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Priority:** Low | **Effort:** Medium

**Issue:** No way to browse or list available series (collection groups)

**Enhancement:**
Add `trove_list_series` tool to browse series by keyword or category.

**Implementation:**
1. Create new tool list-series.ts
2. Use series search/browse API endpoint
3. Return series metadata (title, description, item count)

**Note:** Research needed to confirm Trove API supports series listing.

**Files:**
- `src/sources/trove/tools/list-series.ts` - New tool (if API supports)
- `src/sources/trove/index.ts` - Register tool
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Research confirms API capability (or documents limitation)
- [ ] #2 If API supports: trove_list_series tool implemented
- [ ] #3 If API doesn't support: task closed with documentation note
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
**Closed - Not Feasible**: Trove API does not have a dedicated series/collection browsing endpoint. Documented workarounds in docs/quickrefs/trove-api.md Known Quirks #5.
<!-- SECTION:NOTES:END -->
