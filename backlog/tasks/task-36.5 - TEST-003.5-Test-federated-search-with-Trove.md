---
id: task-36.5
title: TEST-003.5 - Test federated search with Trove
status: Done
assignee: []
created_date: '2025-12-29 04:46'
updated_date: '2025-12-29 05:04'
labels:
  - testing
  - trove
  - federated
dependencies: []
parent_task_id: task-36
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test the federated search meta-tool with Trove as a source, both auto-selected and explicitly specified.

**Test Scenarios:**
1. Auto-selection: Query keywords that should include Trove (e.g., "newspaper", "1920s article")
2. Explicit selection: sources=["trove"] with various queries
3. Multi-source: sources=["trove", "prov"] parallel execution
4. Trove-specific filters via federated search
5. Error handling when Trove fails but other sources succeed
6. Response attribution (source field in results)
7. Timing data (_timing field)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Federated search auto-selects Trove for newspaper queries
- [x] #2 Explicit sources=["trove"] works correctly
- [x] #3 Multi-source search returns Trove results alongside others
- [x] #4 Results include source attribution
- [x] #5 Timing data available in response
- [x] #6 Error from Trove doesn't fail entire search
- [x] #7 Date filtering works in federated mode
<!-- AC:END -->
