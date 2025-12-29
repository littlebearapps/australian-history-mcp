---
id: task-21
title: 'SEARCH-002: Faceted Search - Core Infrastructure'
status: Done
assignee: []
created_date: '2025-12-29 03:01'
labels:
  - search
  - infrastructure
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create shared infrastructure for faceted search across all sources.

**Completed:** 2025-12-28

Files created: src/core/facets/types.ts, aggregator.ts, index.ts
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Create FacetValue, Facet, FacetFieldConfig interfaces
- [ ] #2 Implement countFacets() utility
- [ ] #3 Implement simpleFacetConfig() helper
- [ ] #4 Implement countByDecade() for date faceting
- [ ] #5 Export all types and utilities
- [ ] #6 Test with at least one source
<!-- AC:END -->
