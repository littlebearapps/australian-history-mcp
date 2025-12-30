---
id: task-51
title: 'Phase 2.9: Create session_list meta-tool'
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
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `src/core/meta-tools/session-list.ts` - tool to list all research sessions.

**Purpose:** Browse and filter all research sessions.

**Input Schema:**
```typescript
{
  status?: SessionStatus;        // Filter by status
  topic?: string;                // Search in topic text
  limit?: number;                // Default: 10
  includeArchived?: boolean;     // Default: false
}
```

**Output:**
```typescript
{
  sessions: Array<{
    id: string;
    name: string;
    topic: string;
    status: SessionStatus;
    created: string;
    updated: string;
    stats: { queries: number, results: number };
  }>;
  total: number;
  hasMore: boolean;
}
```

**Behaviour:**
- Lists sessions sorted by updated date (newest first)
- Filters by status and topic search
- Excludes archived by default
- Pagination support

**Dependencies:** Requires task-46, task-47 (types and store)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Tool registered in meta-tools registry with correct schema
- [ ] #2 Returns sessions sorted by updated date
- [ ] #3 Filters by status correctly
- [ ] #4 Topic search is case-insensitive
- [ ] #5 Excludes archived by default
- [ ] #6 Respects limit parameter
- [ ] #7 Returns accurate total count
<!-- AC:END -->
