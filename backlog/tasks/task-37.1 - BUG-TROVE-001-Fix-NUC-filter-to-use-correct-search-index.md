---
id: task-37.1
title: BUG-TROVE-001 - Fix NUC filter to use correct search index
status: Done
assignee: []
created_date: '2025-12-29 05:10'
updated_date: '2025-12-29 05:28'
labels:
  - trove
  - bug
  - nuc
dependencies: []
parent_task_id: task-37
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Severity:** Medium

**Issue:** NUC filter returns 0 results for valid NUC codes like "NAA" (National Archives Australia)

**Root Cause (from Trove API v3 docs):**
Trove has TWO NUC mechanisms:
1. `nuc:CODE` - search index for **holdings** (which libraries have copies)
2. `l-partnerNuc` - facet for **contributors** (partner organisations)

Current code uses `l-partnerNuc` facet (client.ts:167-169) but NAA may not be a partnerNuc contributor.

**Steps to Reproduce:**
1. `trove_search(query="immigration", category="newspaper", nuc="NAA")`
2. Returns 0 results

**Expected:** Results from National Archives Australia collection
**Actual:** 0 results

**Fix Approach:**
Use `nuc:CODE` search index in query string instead of `l-partnerNuc` facet.
Note: Colons in NUC codes need escaping (e.g., `nuc:QU\:NET`)

**Files:**
- `src/sources/trove/client.ts:167-169` - Change from facet to query index
- `docs/quickrefs/trove-partners.md` - Update NUC documentation
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 NUC filter uses nuc:CODE search index instead of l-partnerNuc facet
- [x] #2 Colons in NUC codes are properly escaped
- [ ] #3 trove_search with nuc='NAA' returns results
- [x] #4 trove_search with nuc='VSL' returns State Library Victoria results
- [ ] #5 Documentation updated in trove-partners.md
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
**Implementation (2025-12-29):**

- Changed NUC filter from `l-partnerNuc` facet to `nuc:CODE` search index in query string

- Added colon escaping: `params.nuc.replace(/:/g, '\\:')`

- Added code comment noting NUC only works for: magazine, image, research, book, diary, music (NOT newspaper)

- Test: `trove_search(query="photograph", category="image", nuc="VSL")` → 193,796 SLV results ✓

- Files: `src/sources/trove/client.ts` lines 154-161
<!-- SECTION:NOTES:END -->
