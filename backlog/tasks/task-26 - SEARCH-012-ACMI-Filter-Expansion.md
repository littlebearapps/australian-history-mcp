---
id: task-26
title: 'SEARCH-012: ACMI Filter Expansion'
status: Done
assignee: []
created_date: '2025-12-29 03:05'
updated_date: '2025-12-29 03:05'
labels:
  - search
  - phase-2
  - api-integration
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Expand ACMI search filters from 4 to 6 parameters.

**New Parameters Added:**
- field - Limit search to specific field (title, description)
- size - Results per page (up to 50)

**API Limitations Discovered:**
- No yearFrom/yearTo range support - only single year
- No direct creator/filmmaker filtering
- No genre filtering
- No language or country filtering
- Workaround: Include creator/filmmaker names in the query string

**Files Modified:**
- src/sources/acmi/types.ts
- src/sources/acmi/client.ts
- src/sources/acmi/tools/search-works.ts
- docs/quickrefs/acmi-api.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 At least 2 new filter parameters added (field, size)
- [x] #2 Backwards compatible with existing parameters
- [x] #3 API limitations documented
- [x] #4 Workarounds documented
- [x] #5 No breaking changes
<!-- AC:END -->
