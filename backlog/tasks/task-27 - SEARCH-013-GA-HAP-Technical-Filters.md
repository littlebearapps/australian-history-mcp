---
id: task-27
title: 'SEARCH-013: GA HAP Technical Filters'
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
Add technical/specialized filters to GA HAP for professional/research users.

**New Parameters Added:**
- filmType - Film type (bw, colour, bw-infrared, colour-infrared, infrared)
- camera - Camera model (partial match)
- scaleMin - Minimum scale denominator
- scaleMax - Maximum scale denominator

**Key Decisions:**
- Film type uses user-friendly values mapped to API codes
- Response shows human-readable film type names
- Camera filter uses LIKE for partial matching
- Height/focal length filters not implemented (strings with units)

**Files Modified:**
- src/sources/ga-hap/types.ts
- src/sources/ga-hap/client.ts
- src/sources/ga-hap/tools/search.ts
- docs/quickrefs/ga-hap-api.md
- CLAUDE.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Film type filtering works (bw, colour, infrared variants)
- [x] #2 Scale range filtering works
- [x] #3 Camera partial matching works
- [x] #4 WHERE clause syntax is valid ArcGIS SQL
- [x] #5 Documentation includes technical filter examples
- [x] #6 No breaking changes to existing search
<!-- AC:END -->
