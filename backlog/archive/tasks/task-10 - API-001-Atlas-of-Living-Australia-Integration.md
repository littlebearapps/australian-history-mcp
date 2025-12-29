---
id: task-10
title: 'API-001: Atlas of Living Australia Integration'
status: Done
assignee: []
created_date: '2025-12-29 02:58'
updated_date: '2025-12-29 03:18'
labels:
  - api-integration
  - phase-1
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Integrate the Atlas of Living Australia (ALA) API for biodiversity data.

API Base: https://api.ala.org.au
Auth: None required
Content: 100M+ species occurrence records, 153,000+ species
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Read ALA API documentation at https://docs.ala.org.au
- [x] #2 Investigate /species/search endpoint
- [x] #3 Investigate /occurrences/search endpoint
- [x] #4 Create src/sources/ala/ directory structure
- [x] #5 Implement ala_species_search tool
- [x] #6 Implement ala_occurrence_search tool
- [x] #7 Implement ala_get_species tool
- [x] #8 Implement ala_harvest tool
- [x] #9 Test each tool via MCP protocol
- [x] #10 Update CLAUDE.md with new tools
<!-- AC:END -->
