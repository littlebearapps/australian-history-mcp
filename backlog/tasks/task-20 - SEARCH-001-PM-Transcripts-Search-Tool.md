---
id: task-20
title: 'SEARCH-001: PM Transcripts Search Tool'
status: Done
assignee: []
created_date: '2025-12-29 03:01'
labels:
  - search
  - wont-fix
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
PM Transcripts search functionality - NOT IMPLEMENTABLE.

The PM Transcripts API does not support search functionality.
- No search endpoint exists (only lookup by ID)
- Sitemap is now a background job, not accessible

WORKAROUND: Use pm_transcripts_harvest with PM/date filters
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Investigate PM Transcripts API for search endpoints
- [ ] #2 Document API limitations
- [ ] #3 Update CLAUDE.md Known Quirks section
- [ ] #4 Provide workaround documentation for users
<!-- AC:END -->
