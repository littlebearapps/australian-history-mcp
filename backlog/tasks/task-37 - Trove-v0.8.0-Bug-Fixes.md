---
id: task-37
title: Trove v0.8.0 Bug Fixes
status: To Do
assignee: []
created_date: '2025-12-29 05:09'
labels:
  - trove
  - bugs
  - v0.8.0
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Parent task for all bugs and issues discovered during Trove v0.8.0 testing.

**Root Cause Analysis (from Trove API v3 docs):**

| Bug ID | Issue | Root Cause | Fix Approach |
|--------|-------|------------|--------------|
| BUG-TROVE-001 | NUC filter returns 0 results | Two NUC mechanisms: `nuc:CODE` search index vs `l-partnerNuc` facet. Code uses wrong mechanism. | Use `nuc:CODE` in query string |
| BUG-TROVE-002 | fullTextAvailable + hasThumbnail = 0 | `imageInd` only applies to non-newspaper categories | Document limitation |
| BUG-TROVE-003 | partnerNuc facet not returned | `partnerNuc` facet only valid for specific categories | Add category validation |
| BUG-TROVE-004 | includeHoldings + includeLinks HTTP 400 | `holdings`/`links` include only valid for work records, not search | Remove from search |

**Key Files:**
- `src/sources/trove/client.ts` - Main client with API logic
- `src/sources/trove/types.ts` - Type definitions
- `docs/quickrefs/trove-api.md` - API documentation

**Reference:** doc-1 (Trove v0.8.0 Testing - Bugs and Issues)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All 4 bugs fixed and verified
- [ ] #2 All 2 observations documented or verified
- [ ] #3 Unit tests pass
- [ ] #4 Manual testing confirms fixes
<!-- AC:END -->
