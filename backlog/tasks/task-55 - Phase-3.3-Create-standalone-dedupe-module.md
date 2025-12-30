---
id: task-55
title: 'Phase 3.3: Create standalone dedupe module'
status: Done
assignee: []
created_date: '2025-12-30 03:36'
updated_date: '2025-12-30 05:14'
labels:
  - phase-3
  - context-compression
  - core-module
dependencies:
  - task-53
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `src/core/compression/dedupe.ts` for deduplicating results without session context.

**Purpose:** Remove duplicate results from a batch of records (standalone, not session-based).

**Difference from session fingerprinting:**
- Session fingerprinting tracks across multiple queries over time
- This module dedupes a single batch of results (e.g., federated search output)

**Deduplication Strategy:**

1. **URL matching** (primary)
   - Normalise URLs
   - Handle cross-source URL patterns

2. **Title similarity** (fallback)
   - Jaccard similarity on word tokens
   - Threshold: 0.85 for same-source, 0.90 for cross-source

3. **Year proximity**
   - Same title within ±2 years = likely duplicate

**Key Functions:**

```typescript
// Deduplicate a batch of records
function dedupeRecords(
  records: Record<string, any>[],
  options?: DedupeOptions
): DedupeResult;

interface DedupeOptions {
  strategy?: 'url' | 'title' | 'both';  // Default: 'both'
  titleThreshold?: number;               // Default: 0.85
  yearProximity?: number;                // Default: 2
  preferSource?: string[];               // Priority order for keeping
}

interface DedupeResult {
  unique: Record<string, any>[];
  duplicates: Array<{
    record: Record<string, any>;
    matchedWith: string;      // ID of kept record
    matchType: 'url' | 'title';
  }>;
  stats: {
    original: number;
    unique: number;
    removed: number;
    byMatchType: { url: number, title: number };
  };
}

// Compare two records for similarity
function areDuplicates(
  a: Record<string, any>, 
  b: Record<string, any>,
  options?: DedupeOptions
): { isDuplicate: boolean; matchType?: string };
```

**Source Priority:**
When duplicates found across sources, keep the one from preferred source:
- Default priority: trove > prov > nma > museums_victoria > vhd > ...

**Dependencies:** Requires task-53 (compression types)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Deduplicates by URL matching
- [ ] #2 Deduplicates by title similarity
- [ ] #3 Respects source priority for kept records
- [ ] #4 Returns detailed duplicate information
- [ ] #5 Handles cross-source duplicates
- [ ] #6 Performance acceptable for 500+ records
- [ ] #7 Includes unit tests with duplicate examples
<!-- AC:END -->
