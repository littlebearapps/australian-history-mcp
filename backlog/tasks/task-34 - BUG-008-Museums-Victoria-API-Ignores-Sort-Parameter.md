---
id: task-34
title: 'BUG-008: Museums Victoria API Ignores Sort Parameter'
status: Done
assignee: []
created_date: '2025-12-29 04:02'
updated_date: '2025-12-29 04:12'
labels:
  - bug
  - api-limitation
  - museums-victoria
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Issue**: Museums Victoria API accepts sort parameter but ignores it completely.

**Root Cause**: API limitation - the backend doesn't implement sorting despite accepting the parameter.

**Current Behavior**:
- `sortby: 'alphabetical'` → Returns results in same order as no sort
- `sortby: 'date_desc'` → Returns results in same order as no sort
- `sortby: 'random'` → Returns results in same order as no sort

**Evidence**:
Verified via direct curl calls with `sort=title` parameter - results are identical with or without sort param.

**Options**:
1. Remove sorting options from museumsvic_search (breaking change)
2. Keep as-is with documentation (current approach)
3. Contact Museums Victoria about API sorting support
4. Implement client-side sorting (increases token usage)

**Documented**: CLAUDE.md Known Quirks section
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Consider contacting Museums Victoria about API sorting
- [ ] #2 Evaluate client-side sorting as fallback option
- [ ] #3 Update museumsvic_search schema description if sorting is removed
- [ ] #4 Update docs/quickrefs/museums-victoria-api.md with sorting limitations
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Complete (2025-12-29)

### Root Cause

The implementation was using **invalid sort parameter values**:

- `datemodified` instead of `date`

- `displaytitle` which is not a valid sort field at all

### Official API Sort Values (from https://collections.museumsvictoria.com.au/developers)

- `quality` - record quality based on fields/images

- `relevance` - search relevance (only with query param)

- `date` - date record was last modified (always descending)

- `random` - random order

Note: "Regardless of the value used the direction of the order is always descending."

### Fix Applied

Updated `src/sources/museums-victoria/types.ts`:

- Changed `MVSortOption` to `'relevance' | 'quality' | 'date' | 'random'`

- Fixed `MV_SORT_MAPPINGS` to use correct API values: `date` not `datemodified`

- Removed `alphabetical` option (not supported by API)

- Updated CLAUDE.md Known Quirks section

### Verification

Tested via direct curl and MCP tools - `date` sort now correctly returns results sorted by dateModified (descending)
<!-- SECTION:NOTES:END -->
