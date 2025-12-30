---
id: task-49
title: 'Phase 2.5: Create session_start meta-tool'
status: Done
assignee: []
created_date: '2025-12-30 03:35'
updated_date: '2025-12-30 04:51'
labels:
  - phase-2
  - session-management
  - meta-tool
dependencies:
  - task-46
  - task-47
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `src/core/meta-tools/session-start.ts` - tool to begin a research session.

**Purpose:** Start a named research session that tracks all subsequent queries.

**Input Schema:**
```typescript
{
  name: string;           // "arden-street-1920s" (alphanumeric, hyphens, underscores)
  topic: string;          // "History of Arden Street Oval in the 1920s"
  planPath?: string;      // Link to existing plan.md
}
```

**Output:**
```typescript
{
  status: 'created';
  session: {
    id: string;
    name: string;
    topic: string;
    created: string;
  };
  message: string;        // "Session 'arden-street-1920s' started. All queries will be tracked."
}
```

**Behaviour:**
- Creates new session in store
- Sets as active session
- Initialises empty coverage for all sources
- Returns error if session name already exists
- Returns error if another session is active (must end first)

**Dependencies:** Requires task-46, task-47 (types and store)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Tool registered in meta-tools registry with correct schema
- [ ] #2 Creates session with unique ID
- [ ] #3 Sets session as active
- [ ] #4 Validates name format (alphanumeric, hyphens, underscores)
- [ ] #5 Returns error if name already exists
- [ ] #6 Returns error if another session is active
- [ ] #7 Stores session in persistent store
<!-- AC:END -->
