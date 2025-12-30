---
id: task-52
title: 'Phase 2.12: Integrate auto-logging in search and run meta-tools'
status: Done
assignee: []
created_date: '2025-12-30 03:35'
updated_date: '2025-12-30 04:51'
labels:
  - phase-2
  - session-management
  - integration
dependencies:
  - task-47
  - task-48
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Modify `src/core/meta-tools/search.ts` and `src/core/meta-tools/run.ts` to automatically log queries when a session is active.

**Purpose:** Seamless query tracking without requiring explicit logging calls.

**Changes to search.ts:**

```typescript
// After executing search
if (activeSession) {
  const queryLog: SessionQuery = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    tool: 'search',
    source: sources.join(','),
    query: args.query,
    filters: { type: args.type, limit: args.limit, ... },
    resultCount: results.totalResults,
    uniqueCount: deduplicatedCount,
    duplicateCount: results.totalResults - deduplicatedCount,
    duration: endTime - startTime
  };
  await logQuery(activeSession.id, queryLog);
  await updateCoverage(activeSession.id, ...);
  
  // Add fingerprints for new results
  for (const result of results.records) {
    const fp = generateFingerprint(result, result.source);
    if (!await hasFingerprint(activeSession.id, fp)) {
      await addFingerprint(activeSession.id, fp);
    }
  }
}
```

**Changes to run.ts:**
- Similar pattern for individual tool runs
- Extract source from tool name (e.g., 'trove_search' → 'trove')

**Behaviour:**
- Check for active session at start of execution
- Log query details after execution completes
- Track timing for performance stats
- Deduplicate results in real-time

**Dependencies:** Requires task-47, task-48 (store and fingerprint)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 search.ts logs queries when session active
- [ ] #2 run.ts logs queries when session active
- [ ] #3 Query timing is accurate
- [ ] #4 Fingerprints are generated for all results
- [ ] #5 Duplicates are detected in real-time
- [ ] #6 Coverage is updated for each source searched
- [ ] #7 No logging when no session active
- [ ] #8 Performance impact is minimal (<50ms overhead)
<!-- AC:END -->
