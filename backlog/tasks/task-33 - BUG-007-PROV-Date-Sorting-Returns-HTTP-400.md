---
id: task-33
title: 'BUG-007: PROV Date Sorting Returns HTTP 400'
status: Done
assignee: []
created_date: '2025-12-29 04:02'
updated_date: '2025-12-29 04:08'
labels:
  - bug
  - api-limitation
  - prov
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Issue**: PROV date sorting (`date_asc`, `date_desc`) returns HTTP 400 error.

**Root Cause**: PROV Solr instance doesn't have `start_dt` field indexed for sorting. Only `title` sorting works.

**Current Behavior**:
- `sortby: 'title'` → Works correctly
- `sortby: 'date_asc'` → HTTP 400 error
- `sortby: 'date_desc'` → HTTP 400 error

**Evidence**:
```
sort=start_dt+asc returns HTTP 400
sort=title+asc returns 200 OK
```

**Options**:
1. Remove date sorting from PROV (breaking change)
2. Keep as-is with documentation (current approach)
3. Contact PROV to request `start_dt` sorting support
4. Find alternative sortable date field in PROV Solr schema

**Documented**: CLAUDE.md Known Quirks section
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Investigate if alternative date fields are sortable in PROV Solr
- [ ] #2 Consider contacting PROV about adding start_dt sorting
- [ ] #3 Update prov_search schema description if date sorting is removed
- [ ] #4 Update docs/quickrefs/prov-api.md with sorting limitations
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Complete (2025-12-29)

### Root Cause

PROV's Solr uses **SpatialField type** for `start_dt` and `end_dt` fields. Solr does not support sorting on SpatialField types, returning HTTP 400 with message: "Sorting not supported on SpatialField: start_dt"

### Fix Applied

Removed `date_asc` and `date_desc` from PROV sort options since they can never work:

- Updated `src/sources/prov/types.ts`: Changed `PROVSortOption` type and `PROV_SORT_OPTIONS` array to only include `relevance` and `title`

- Added comment explaining the SpatialField limitation

- Updated `CLAUDE.md` Known Quirks section with accurate documentation

### Verification

Tested via `echo '{...schema request...}' | node dist/index.js` - confirmed schema now shows `enum: ["relevance", "title"]`
<!-- SECTION:NOTES:END -->
