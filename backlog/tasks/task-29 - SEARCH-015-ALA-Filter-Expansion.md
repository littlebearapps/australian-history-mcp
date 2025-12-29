---
id: task-29
title: 'SEARCH-015: ALA Filter Expansion'
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
Expand ALA occurrence search filters for advanced research use cases.

**New Parameters Added:**
- basisOfRecord - Record type (PRESERVED_SPECIMEN, HUMAN_OBSERVATION, etc.)
- coordinateUncertaintyMax - Maximum coordinate uncertainty in metres
- occurrenceStatus - Occurrence status (present, absent)
- dataResourceName - Contributing dataset name
- collector - Collector/observer name

**Historical Specimen Use Case:**
- basisOfRecord: "PRESERVED_SPECIMEN" is key for historical research
- Museum specimens often have collection dates from 1800s-1900s
- Combined with startYear/endYear filters for historical queries

**Files Modified:**
- src/sources/ala/tools/search-occurrences.ts
- src/core/source-router.ts
- docs/quickrefs/ala-api.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 basisOfRecord filtering works
- [x] #2 Coordinate uncertainty filtering works
- [x] #3 At least 3 additional filters added (5 added)
- [x] #4 Historical specimen search documented
- [x] #5 Federated search mapping updated
- [x] #6 Documentation updated
<!-- AC:END -->
