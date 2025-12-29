---
id: task-28
title: 'SEARCH-014: VHD Filter Expansion'
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
Expand VHD search filters to leverage existing reference data tools.

**New Parameters Added:**
- theme - Heritage theme (from vhd_list_themes)
- heritageAuthority - Authority type (e.g., "Heritage Victoria")
- hasImages - Filter places with photographs

**API Quirks Documented:**
- VHD uses HAL+JSON with _embedded structure
- Images returned as dictionary keyed by ID, not array
- API uses rpp (records per page) not limit
- Lookup embedded keys differ from endpoint paths

**Files Modified:**
- src/sources/vhd/types.ts
- src/sources/vhd/client.ts
- src/sources/vhd/tools/search-places.ts
- src/core/source-router.ts
- docs/quickrefs/vhd-api.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Theme filtering works
- [x] #2 At least 2 additional filters added (theme, heritageAuthority, hasImages)
- [x] #3 Filters work with existing parameters
- [x] #4 Documentation shows list -> search workflow
- [x] #5 No breaking changes
<!-- AC:END -->
