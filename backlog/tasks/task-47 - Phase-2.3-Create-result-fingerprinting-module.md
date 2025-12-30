---
id: task-47
title: 'Phase 2.3: Create result fingerprinting module'
status: Done
assignee: []
created_date: '2025-12-30 03:35'
updated_date: '2025-12-30 04:51'
labels:
  - phase-2
  - session-management
  - deduplication
dependencies:
  - task-46
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create `src/core/sessions/fingerprint.ts` for detecting duplicate results across searches.

**Purpose:** Prevent the same record from appearing multiple times in session results.

**Fingerprinting Strategy:**

1. **URL matching** (primary)
   - Normalise URLs (lowercase, remove trailing slashes, sort query params)
   - Handle source-specific URL patterns (e.g., Trove work IDs)

2. **Title similarity** (fallback)
   - Tokenise title into words
   - Calculate Jaccard similarity coefficient
   - Threshold: 0.85 for same-source, 0.90 for cross-source

3. **ID matching** (when available)
   - Source + ID combination (e.g., "trove:12345")

**Key Functions:**

```typescript
// Generate fingerprint from result
function generateFingerprint(result: Record<string, any>, source: string): ResultFingerprint;

// Check if result is duplicate
function isDuplicate(
  result: Record<string, any>, 
  source: string, 
  existingFingerprints: ResultFingerprint[]
): { isDuplicate: boolean; matchedId?: string; matchType?: 'url' | 'title' | 'id' };

// Normalise URL for comparison
function normaliseUrl(url: string): string;

// Calculate title similarity
function titleSimilarity(title1: string, title2: string): number;

// Hash title for storage
function hashTitle(title: string): string;
```

**Edge Cases:**
- Missing URL (use title + source + date)
- Missing title (use URL or ID only)
- Cross-source duplicates (same item in Trove and NMA)

**Dependencies:** Requires task-46 (session types)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Fingerprint generation is deterministic
- [ ] #2 URL normalisation handles common variations
- [ ] #3 Title similarity correctly identifies near-duplicates
- [ ] #4 Cross-source duplicates are detected
- [ ] #5 Handles missing fields gracefully
- [ ] #6 Performance is acceptable for 1000+ fingerprints
- [ ] #7 Includes unit tests with real record examples
<!-- AC:END -->
