---
id: task-12
title: 'API-005: PM Transcripts Integration'
status: Done
assignee: []
created_date: '2025-12-29 02:59'
updated_date: '2025-12-29 03:18'
labels:
  - api-integration
  - phase-2
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Integrate PM Transcripts API for Prime Ministerial speeches and media releases.

URL: https://pmtranscripts.pmc.gov.au
Auth: None required
License: CC-BY 3.0 Australia
Content: 26,000+ transcripts from 1940s to present
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Review PM Transcripts website and search interface
- [x] #2 Investigate XML download API format
- [x] #3 Create src/sources/pm-transcripts/ directory structure
- [x] #4 Implement pm_transcripts_get_transcript tool
- [x] #5 Implement pm_transcripts_harvest tool
- [x] #6 Test each tool via MCP protocol
- [x] #7 Update CLAUDE.md with new tools
<!-- AC:END -->
