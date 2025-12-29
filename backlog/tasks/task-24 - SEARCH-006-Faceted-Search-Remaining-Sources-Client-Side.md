---
id: task-24
title: 'SEARCH-006: Faceted Search - Remaining Sources (Client-Side)'
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
Implement client-side facet counting for 6 sources without native facet support.

**Sources Updated:**
- Museums Victoria (museumsvic_search): recordType, category, imageLicence
- NMA (nma_search_objects): type, collection
- VHD (vhd_search_places): municipality, architecturalStyle, period, heritageAuthority
- ACMI (acmi_search_works): type, productionPlace, decade
- GHAP (ghap_search): state, lga, featureType, source
- GA HAP (ga_hap_search): state, filmType, decade

**Special Handling:**
- ACMI & GA HAP: Use countByDecade() for decade facets from year fields
- VHD: Maps HAL+JSON embedded keys (e.g., local_government_authority)
- GHAP: Counts from GeoJSON feature properties

**Dependencies:** SEARCH-002 (Facet Infrastructure)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 All 6 sources have includeFacets parameter
- [x] #2 Client-side facet counting works correctly
- [x] #3 Decade facets handled specially for ACMI and GA HAP
- [x] #4 Facet response matches common format
- [x] #5 No breaking changes to existing search
- [x] #6 Build compiles without errors
<!-- AC:END -->
