---
id: task-36.1
title: TEST-003.1 - Test trove_search with all parameters
status: Done
assignee: []
created_date: '2025-12-29 04:46'
updated_date: '2025-12-29 05:04'
labels:
  - testing
  - trove
  - search
dependencies: []
parent_task_id: task-36
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test the trove_search tool comprehensively, including all existing and new v0.8.0 parameters.

**Test Categories:**
1. Basic search (query only)
2. Category filtering (newspaper, gazette, magazine, image, book, etc.)
3. Date filtering (dateFrom, dateTo, decade, year, month)
4. State filtering (vic, nsw, qld, etc.)
5. Sorting (relevance, dateasc, datedesc)
6. NUC/contributor filtering
7. NEW: illustrationTypes (Photo, Cartoon, Map, etc.)
8. NEW: wordCount (<100 Words, 100-1000 Words, 1000+ Words)
9. NEW: articleCategory (Article, Advertising, Family Notices, etc.)
10. NEW: User content (includeTags, includeComments, hasTags, hasComments)
11. NEW: Rights filtering (Free, Out of Copyright, Creative Commons)
12. NEW: Content availability (fullTextAvailable, hasThumbnail)
13. NEW: Collection filtering (series, journalTitle)
14. Faceted search (includeFacets, facetFields including partnerNuc)
15. Holdings and links (includeHoldings, includeLinks)
16. Error handling (empty query, invalid dates, invalid params)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Basic search returns results
- [x] #2 All category filters work correctly
- [x] #3 Date filtering (dateFrom, dateTo, decade) works
- [x] #4 NEW: year/month filtering works with decade
- [x] #5 State filtering maps abbreviations correctly
- [x] #6 All sort options return correctly ordered results
- [x] #7 NUC filtering returns contributor-specific results
- [x] #8 NEW: illustrationTypes filter works
- [x] #9 NEW: wordCount filter works
- [x] #10 NEW: articleCategory filter works
- [x] #11 NEW: includeTags/includeComments returns user content
- [x] #12 NEW: hasTags/hasComments filters work
- [x] #13 NEW: rights filter works
- [x] #14 NEW: fullTextAvailable/hasThumbnail filters work
- [x] #15 NEW: series filter works
- [x] #16 NEW: journalTitle filter works
- [x] #17 Faceted search returns partnerNuc facet
- [x] #18 Error cases handled gracefully
<!-- AC:END -->
