---
id: task-32
title: 'TEST-001-issues: Bug Tracking for v0.7.0 Testing'
status: Done
assignee: []
created_date: '2025-12-29 03:06'
updated_date: '2025-12-29 03:06'
labels:
  - testing
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Issues found and fixed during TEST-001 comprehensive testing.

**Issues Found:**
1. trove_search allows empty query (missing validation) - FIXED
2. NMA federated search returns count but empty records - FIXED
3. prov_get_images returns HTTP 406 error - FIXED
4. ghap_search returns HTML instead of JSON - FIXED
5. acmi_get_creator returns "not found" for valid IDs - FIXED
6. trove_search accepts invalid date formats - FIXED

**Summary:**
- Total Tools Tested: 75/75
- Tools Passing: 70
- Tools with Issues: 5
- Blockers: 0
- Major Issues: 3
- Minor Issues: 3

**All 6 bugs fixed and committed to branch.**
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 BUG-001 prov_get_images HTTP 406 fixed
- [x] #2 BUG-002 ghap_search HTML response fixed
- [x] #3 BUG-003 acmi_get_creator not found fixed
- [x] #4 BUG-004 trove_search empty query validation added
- [x] #5 BUG-005 trove_search date format validation added
- [x] #6 BUG-006 NMA federated empty records fixed
- [x] #7 All fixes compiled successfully
- [x] #8 Fixes ready for verification
<!-- AC:END -->
