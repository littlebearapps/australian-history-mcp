---
id: task-53
title: 'Phase 3.1: Create compression types'
status: Done
assignee: []
created_date: '2025-12-30 03:36'
updated_date: '2025-12-30 05:14'
labels:
  - phase-3
  - context-compression
  - types
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `src/core/compression/types.ts` defining types for result compression.

**Purpose:** Define data structures for compressing and summarising search results.

**Types to Define:**

```typescript
// Compression levels
type CompressionLevel = 'minimal' | 'standard' | 'full';

// Compressed record structure
interface CompressedRecord {
  id: string;
  url?: string;
  source: string;
  // Level: minimal (above only)
  title?: string;           // Truncated to ~50 chars
  year?: number;
  // Level: full (all above plus)
  type?: string;
  creator?: string;
}

// Compression options
interface CompressionOptions {
  level: CompressionLevel;
  maxTitleLength?: number;   // Default: 50
  includeSource?: boolean;   // Default: true
  dedupeFirst?: boolean;     // Default: true
}

// Compression result
interface CompressionResult {
  original: {
    count: number;
    estimatedTokens: number;
  };
  compressed: {
    count: number;
    estimatedTokens: number;
    records: CompressedRecord[];
  };
  savings: {
    recordsRemoved: number;
    tokenReduction: number;
    percentageSaved: number;
  };
}

// URL extraction result
interface UrlExtractionResult {
  urls: Array<{
    url: string;
    source: string;
    title?: string;
  }>;
  count: number;
  estimatedTokens: number;
}

// Checkpoint state
interface Checkpoint {
  id: string;
  name: string;
  created: string;
  sessionId?: string;
  data: {
    records: CompressedRecord[];
    fingerprints: string[];
    coverage: Record<string, any>;
  };
}
```

**Dependencies:** None (foundation types)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All types exported from types.ts
- [ ] #2 Types support all three compression levels
- [ ] #3 Includes token estimation types
- [ ] #4 Compatible with JSON serialisation
- [ ] #5 Well-documented with JSDoc comments
<!-- AC:END -->
