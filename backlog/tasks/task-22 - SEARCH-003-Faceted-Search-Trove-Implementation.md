---
id: task-22
title: 'SEARCH-003: Faceted Search - Trove Implementation'
status: Done
assignee: []
created_date: '2025-12-29 03:03'
updated_date: '2025-12-29 03:03'
labels:
  - search
  - phase-1
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement native faceted search for Trove (most-used source).

**Trove Facets Available:**
- decade - Publication decade (1900s, 1910s, etc.)
- year - Specific years
- state - Australian state/territory
- format - Content format
- category - Trove zone (newspaper, book, etc.)
- nuc - Contributing library (NUC code)

**Files Modified:**
- src/sources/trove/tools/search.ts - Added includeFacets, facetFields, facetLimit parameters
- src/sources/trove/client.ts - Added facet request params to API call
- src/sources/trove/types.ts - Added TroveFacet, TroveFacetValue types

**Dependencies:** SEARCH-002 (Facet Infrastructure)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 includeFacets parameter added to trove_search
- [x] #2 facetFields parameter allows selecting specific facets
- [x] #3 Native API facets returned correctly
- [x] #4 Facet response matches common FacetsResponse format
- [x] #5 No breaking changes to existing search
<!-- AC:END -->
