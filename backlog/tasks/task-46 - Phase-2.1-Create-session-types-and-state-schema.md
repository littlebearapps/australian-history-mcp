---
id: task-46
title: 'Phase 2.1: Create session types and state schema'
status: Done
assignee: []
created_date: '2025-12-30 03:35'
updated_date: '2025-12-30 04:51'
labels:
  - phase-2
  - session-management
  - types
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `src/core/sessions/types.ts` defining all TypeScript types for session management.

**Purpose:** Define the data structures for tracking research sessions.

**Types to Define:**

```typescript
// Session status
type SessionStatus = 'active' | 'paused' | 'completed' | 'archived';

// Query log entry (automatically tracked)
interface SessionQuery {
  id: string;
  timestamp: string;
  tool: string;
  source: string;
  query: string;
  filters: Record<string, any>;
  resultCount: number;
  uniqueCount: number;
  duplicateCount: number;
  duration: number;  // ms
}

// Result fingerprint for deduplication
interface ResultFingerprint {
  id: string;
  source: string;
  url?: string;
  titleHash: string;
  firstSeen: string;
  queryId: string;
}

// Source coverage tracking
interface SourceCoverage {
  source: string;
  status: 'searched' | 'not_searched' | 'failed' | 'partial';
  queriesExecuted: number;
  resultsFound: number;
  lastSearched?: string;
  errors?: string[];
}

// Main session state
interface Session {
  id: string;
  name: string;
  topic: string;
  status: SessionStatus;
  created: string;
  updated: string;
  planPath?: string;          // Link to plan.md
  queries: SessionQuery[];
  fingerprints: ResultFingerprint[];
  coverage: SourceCoverage[];
  notes: string[];
  stats: {
    totalQueries: number;
    totalResults: number;
    uniqueResults: number;
    duplicatesRemoved: number;
    sourcesSearched: number;
  };
}

// Session store state (multiple sessions)
interface SessionStore {
  version: number;
  activeSession?: string;    // ID of current session
  sessions: Session[];
}
```

**Dependencies:** None (foundation types)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All types exported from types.ts
- [ ] #2 Types are well-documented with JSDoc comments
- [ ] #3 Includes type guards for runtime validation
- [ ] #4 Compatible with JSON serialisation
- [ ] #5 Timestamps use ISO 8601 format
<!-- AC:END -->
