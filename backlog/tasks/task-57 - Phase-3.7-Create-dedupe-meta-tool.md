---
id: task-57
title: 'Phase 3.7: Create dedupe meta-tool'
status: Done
assignee: []
created_date: '2025-12-30 03:37'
updated_date: '2025-12-30 05:14'
labels:
  - phase-3
  - context-compression
  - meta-tool
dependencies:
  - task-55
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `src/core/meta-tools/dedupe.ts` - tool to remove duplicate results.

**Purpose:** Remove duplicate records from a batch of results.

**Input Schema:**
```typescript
{
  records: Record<string, any>[];  // Results to deduplicate
  strategy?: 'url' | 'title' | 'both';  // Default: 'both'
  titleThreshold?: number;         // Default: 0.85
  preferSource?: string[];         // Priority order
}
```

**Output:**
```typescript
{
  status: 'deduplicated';
  unique: Record<string, any>[];
  duplicates: Array<{
    record: Record<string, any>;
    matchedWith: string;
    matchType: 'url' | 'title';
  }>;
  stats: {
    original: number;
    unique: number;
    removed: number;
    byMatchType: { url: number, title: number };
  };
}
```

**Behaviour:**
- Returns unique records with full data preserved
- Lists removed duplicates with match info
- Respects source priority for which to keep
- Reports deduplication statistics

**Dependencies:** Requires task-55 (dedupe module)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Tool registered in meta-tools registry with correct schema
- [ ] #2 Supports URL and title matching strategies
- [ ] #3 Respects source priority
- [ ] #4 Returns full records for unique items
- [ ] #5 Reports detailed duplicate information
- [ ] #6 Handles empty input gracefully
<!-- AC:END -->
