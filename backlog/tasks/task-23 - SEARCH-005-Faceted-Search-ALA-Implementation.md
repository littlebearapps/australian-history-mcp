---
id: task-23
title: 'SEARCH-005: Faceted Search - ALA Implementation'
status: Done
assignee: []
created_date: '2025-12-29 03:03'
updated_date: '2025-12-29 03:03'
labels:
  - search
  - phase-1
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement native faceted search for ALA biocache API.

**ALA Facets Available:**
- kingdom - Taxonomic kingdom (Animalia, Plantae, etc.)
- stateProvince - Australian state/territory
- basisOfRecord - Record type (specimen, observation, etc.)
- year - Observation year
- dataResourceName - Contributing dataset

**Files Modified:**
- src/sources/ala/tools/search-occurrences.ts - Added includeFacets, facetFields, facetLimit parameters
- src/sources/ala/client.ts - Added facet request params (facets=*, flimit=*)
- src/sources/ala/types.ts - Added ALAFacet, ALAFacetValue types

**Dependencies:** SEARCH-002 (Facet Infrastructure)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 includeFacets parameter added to ala_search_occurrences
- [x] #2 Native API facets (facets param) correctly used
- [x] #3 ALA facet response format parsed correctly
- [x] #4 Facet response matches common format
- [x] #5 No breaking changes to existing search
<!-- AC:END -->
