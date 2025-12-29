---
id: task-25
title: 'SEARCH-011: NMA Filter Expansion'
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
Expand NMA search filters from 4 to 8 parameters.

**New Parameters Added:**
- medium - Material filter (e.g., "Wood", "Paper", "Metal")
- spatial - Place/location filter (e.g., "Victoria", "Queensland")
- year - Year filter (temporal)
- creator - Creator/maker name

**API Research Findings:**
- Tested NMA data.nma.gov.au API
- Supported: medium, spatial, temporal (year), creator
- NOT supported: subject, place (use spatial instead), party

**Files Modified:**
- src/sources/nma/types.ts
- src/sources/nma/client.ts
- src/sources/nma/tools/search-objects.ts
- src/core/source-router.ts
- docs/quickrefs/nma-api.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 At least 4 new filter parameters added
- [x] #2 All filters work correctly with API
- [x] #3 Filters can be combined
- [x] #4 Federated search maps to new parameters
- [x] #5 Documentation updated
- [x] #6 No breaking changes to existing behavior
<!-- AC:END -->
