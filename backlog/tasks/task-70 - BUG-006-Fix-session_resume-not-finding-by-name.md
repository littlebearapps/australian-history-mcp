---
id: task-70
title: "[BUG-006] Fix session_resume not finding sessions by name"
status: To Do
assignee: []
created_date: '2025-12-30'
labels:
  - bug
  - sessions
  - v1.0.1
  - medium-priority
dependencies: []
priority: medium
---

## Description

`session_resume(id="session-name")` returns "Session not found" error even though the session exists. Only works with full UUID.

## Steps to Reproduce

1. Create session: `session_start(name="test-session", topic="Test")`
2. End session: `session_end(status="archived")`
3. List sessions: `session_list(includeArchived=true)` → shows session exists
4. Resume by name: `session_resume(id="test-session")` → "Session not found"
5. Resume by UUID: `session_resume(id="00a242cf-...")` → "Cannot resume archived session" (correct error)

## Impact

Users must track UUIDs instead of using memorable session names, making session management harder

## Suggested Fix

session_resume should look up sessions by both name and UUID:
1. First try to match `id` as UUID
2. If not found, try to match `id` as session name
3. Return appropriate error if neither matches

## Acceptance Criteria

- [ ] session_resume works with session name
- [ ] session_resume still works with UUID
- [ ] Clear error messages for "not found" vs "cannot resume archived"
- [ ] Add unit tests for name-based lookup

## Reference

- Test findings: `docs/testing/v1.0.0-test-findings.md`
- Original test task: task-64.2
