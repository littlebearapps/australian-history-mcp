---
id: task-11
title: 'API-004: ACMI Integration'
status: Done
assignee: []
created_date: '2025-12-29 02:58'
updated_date: '2025-12-29 03:18'
labels:
  - api-integration
  - phase-2
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Integrate the ACMI API for screen culture (films, TV, video games).

API Base: https://api.acmi.net.au
Auth: None required
Content: ~45,000 works
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Review ACMI API documentation
- [x] #2 Explore GitHub repository
- [x] #3 Investigate /works endpoint
- [x] #4 Create src/sources/acmi/ directory structure
- [x] #5 Implement acmi_search_works tool
- [x] #6 Implement acmi_get_work tool
- [x] #7 Implement acmi_harvest tool
- [x] #8 Test each tool via MCP protocol
- [x] #9 Update CLAUDE.md with new tools
<!-- AC:END -->
