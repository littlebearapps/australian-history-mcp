---
id: task-54
title: 'Phase 3.2: Create compressor module'
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
Create `src/core/compression/compressor.ts` for reducing result verbosity.

**Purpose:** Reduce token usage by extracting only essential fields from search results.

**Compression Levels:**

| Level | Fields Included | Token Estimate |
|-------|-----------------|----------------|
| minimal | id, url, source | ~20 per record |
| standard | + title (truncated), year | ~50 per record |
| full | + type, creator | ~80 per record |

**Key Functions:**

```typescript
// Compress a single record
function compressRecord(
  record: Record<string, any>, 
  source: string, 
  level: CompressionLevel
): CompressedRecord;

// Compress multiple records
function compressRecords(
  records: Record<string, any>[], 
  options: CompressionOptions
): CompressionResult;

// Estimate tokens for a record/array
function estimateTokens(data: any): number;

// Truncate title intelligently (at word boundary)
function truncateTitle(title: string, maxLength: number): string;

// Extract year from various date formats
function extractYear(record: Record<string, any>): number | undefined;
```

**Token Estimation:**
- Use simple heuristic: ~4 characters per token for English text
- Account for JSON structure overhead
- Provide before/after comparison

**Example:**
```
Before (1 record): ~200 tokens
{
  "id": "12345",
  "title": "North Melbourne Football Club Annual Report 1920",
  "description": "Annual report including financial statements...",
  "url": "https://trove.nla.gov.au/work/12345",
  ...10 more fields
}

After compress(level="standard"): ~50 tokens
{
  "id": "12345",
  "title": "NMFC Annual Report 1920",
  "url": "https://trove.nla.gov.au/work/12345",
  "source": "trove",
  "year": 1920
}
```

**Dependencies:** Requires task-53 (compression types)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Supports all three compression levels
- [ ] #2 Title truncation preserves word boundaries
- [ ] #3 Year extraction handles multiple date formats
- [ ] #4 Token estimation is reasonably accurate (±20%)
- [ ] #5 Handles missing fields gracefully
- [ ] #6 Returns accurate savings statistics
- [ ] #7 Includes unit tests with real record examples
<!-- AC:END -->
