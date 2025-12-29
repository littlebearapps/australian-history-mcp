---
id: task-36.3
title: TEST-003.7 - Document bugs and issues found
status: Done
assignee: []
created_date: '2025-12-29 04:46'
updated_date: '2025-12-29 05:02'
labels:
  - testing
  - trove
  - bugs
  - documentation
dependencies: []
parent_task_id: task-36
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Consolidate all bugs, errors, and issues discovered during Trove testing into a structured document for investigation and fixing.

**Documentation Structure:**
For each issue, document:
1. Issue ID (e.g., BUG-TROVE-001)
2. Severity (Critical, High, Medium, Low)
3. Tool affected
4. Description of the issue
5. Steps to reproduce
6. Expected behaviour
7. Actual behaviour
8. Error messages (if any)
9. Suggested fix (if obvious)

**Categories:**
- API errors (4xx, 5xx responses)
- Parameter handling issues
- Response parsing errors
- Type mismatches
- Edge cases not handled
- Documentation inaccuracies
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 All issues assigned unique IDs
- [x] #2 All issues have severity ratings
- [x] #3 All issues have reproduction steps
- [x] #4 All issues describe expected vs actual behaviour
- [x] #5 Issues categorised by type
- [x] #6 Critical/High issues flagged for immediate attention
- [x] #7 Document saved to backlog/tasks/ or docs/
<!-- AC:END -->
