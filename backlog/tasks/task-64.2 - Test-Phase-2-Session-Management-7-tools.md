---
id: task-64.2
title: 'Test Phase 2: Session Management (7 tools)'
status: To Do
assignee: []
created_date: '2025-12-30 06:02'
labels:
  - testing
  - v1.0.0
  - sessions
dependencies: []
parent_task_id: task-64
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Test all 7 session management meta-tools.

## Test Sequence

### 2.1 session_start
- [ ] `session_start(name="test-session-1", topic="Melbourne Railways")` - basic start
- [ ] Verify returns session object with id, name, topic, status="active"
- [ ] Try duplicate name - should error
- [ ] Try starting second session while one active - should error
- [ ] Test with planId option

### 2.2 session_status
- [ ] `session_status()` - quick status (default)
- [ ] `session_status(detail="full")` - full detail with queries
- [ ] Verify queryCount, totalResults, sourcesSearched

### 2.3 session_note
- [ ] `session_note(note="Test finding")` - add note
- [ ] Verify note appears in session_status(detail="full")

### 2.4 session_list
- [ ] `session_list()` - list all
- [ ] `session_list(status="active")` - filter by status
- [ ] `session_list(limit=5)` - pagination

### 2.5 session_export
- [ ] `session_export(format="json")` - JSON export
- [ ] `session_export(format="markdown")` - Markdown export
- [ ] `session_export(format="csv")` - CSV export
- [ ] Verify exports contain session data, queries, notes

### 2.6 session_end
- [ ] `session_end()` - end as completed (default)
- [ ] Verify returns totalQueries, totalResults
- [ ] `session_end(status="archived")` - end as archived

### 2.7 session_resume
- [ ] Start new session, end as "paused"
- [ ] `session_resume(id="session-xxx")` - resume by ID
- [ ] `session_resume(id="test-session-name")` - resume by name
- [ ] Try resuming completed session - should error
<!-- SECTION:DESCRIPTION:END -->
