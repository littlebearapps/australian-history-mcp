---
id: task-48
title: 'Phase 2.6: Create session_status meta-tool'
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
  - task-49
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `src/core/meta-tools/session-status.ts` - tool to check current session progress.

**Purpose:** Get current progress, coverage gaps, and statistics for the active session.

**Input Schema:**
```typescript
{
  id?: string;            // Optional: specific session ID (defaults to active session)
  detail?: 'quick' | 'full';  // Default: 'quick'
}
```

**Output (quick):**
```typescript
{
  session: { id, name, topic, status },
  progress: "5/8 searches completed",
  results: { unique: 47, duplicates: 12 },
  coverage: {
    searched: ["prov", "trove", "vhd"],
    pending: ["nma", "ga_hap"],
    failed: []
  },
  lastActivity: "2 minutes ago"
}
```

**Output (full):** Full report from summary.ts

**Behaviour:**
- Returns quick status by default (token-efficient)
- Full detail includes complete search log and findings
- Returns error if no active session and no ID provided

**Dependencies:** Requires task-46, task-47, task-49 (types, store, summary)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Tool registered in meta-tools registry with correct schema
- [ ] #2 Returns quick status by default
- [ ] #3 Full detail includes complete session data
- [ ] #4 Returns error if no active session
- [ ] #5 Coverage correctly reflects searched vs pending sources
- [ ] #6 Last activity time is accurate
- [ ] #7 Token-efficient output for quick status
<!-- AC:END -->
