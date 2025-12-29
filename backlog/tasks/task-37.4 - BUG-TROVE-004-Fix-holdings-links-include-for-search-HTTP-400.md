---
id: task-37.4
title: BUG-TROVE-004 - Fix holdings/links include for search (HTTP 400)
status: Done
assignee: []
created_date: '2025-12-29 05:10'
updated_date: '2025-12-29 05:28'
labels:
  - trove
  - bug
  - api-error
dependencies: []
parent_task_id: task-37
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Severity:** High

**Issue:** `includeHoldings=true` + `includeLinks=true` in search returns HTTP 400 error

**Root Cause (from Trove API v3 docs):**
`holdings` and `links` include options are ONLY valid for:
- Individual work/version records (`/work/{id}`)
- NOT for search results

Current code (client.ts:238-243) passes these to search API incorrectly.

**Steps to Reproduce:**
1. `trove_search(query="Melbourne", category="book", includeHoldings=true, includeLinks=true)`
2. Returns HTTP 400 error

**Expected:** Parameters ignored for search OR clear error message
**Actual:** HTTP 400 from Trove API

**Fix Approach:**
- Remove holdings/links from search includes
- Only pass these parameters in `trove_get_work` and `trove_get_versions`
- Consider: deprecate these params from search or add validation with warning

**Files:**
- `src/sources/trove/client.ts:238-243` - Remove from search includes
- `src/sources/trove/tools/search.ts` - Add validation warning
- `src/sources/trove/types.ts` - Update schema descriptions
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 trove_search with includeHoldings/includeLinks no longer causes HTTP 400
- [x] #2 Parameters either ignored silently or warning returned
- [ ] #3 trove_get_work still supports holdings/links correctly
- [x] #4 Schema descriptions updated to clarify parameter scope
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
**Implementation (2025-12-29):**

- Removed `includeHoldings` and `includeLinks` from search API includes in client.ts

- These params are only valid for individual work records (/work/{id}), not search results

- Added documentation comment in types.ts explaining the limitation

- Added to 'Known Quirks' section in trove-api.md

- Test: `trove_search(query="Melbourne", category="book", includeHoldings=true)` → 785,965 results (was HTTP 400) ✓

- Files: `src/sources/trove/client.ts` lines 238-243, `src/sources/trove/types.ts` lines 157-160
<!-- SECTION:NOTES:END -->
