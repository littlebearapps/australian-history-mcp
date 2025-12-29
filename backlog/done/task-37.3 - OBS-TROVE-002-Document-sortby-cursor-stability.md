---
id: task-37.3
title: OBS-TROVE-002 - Document sortby cursor stability
status: Done
assignee: []
created_date: '2025-12-29 05:10'
updated_date: '2025-12-29 05:28'
labels:
  - trove
  - observation
  - documentation
dependencies: []
parent_task_id: task-37
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Severity:** Low

**Observation:** sortby=dateasc may have cursor stability issues with pagination

**Issue:**
During harvest testing with `sortby=dateasc`, pagination cursor may become unstable when:
1. New records are added to Trove during harvest
2. Records are modified during harvest

This is expected Solr cursor behaviour but should be documented.

**Documentation Needed:**
- Note that dateasc/datedesc sorting may have pagination edge cases
- Recommend using `relevance` sort for most reliable pagination
- Document workaround: smaller batch sizes, retry logic

**Files:**
- `docs/quickrefs/trove-api.md` - Add sortby stability note
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 trove-api.md documents cursor stability considerations
- [x] #2 Recommendations for reliable pagination added
- [x] #3 Known quirks section updated
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
**Documentation (2025-12-29):**

- Added 'Known Quirks' section to docs/quickrefs/trove-api.md

- Documented cursor stability issues with dateasc/datedesc sorting during bulk harvests

- Added recommendation: Use `bulkHarvest=true` for most reliable pagination (sorts by identifier instead of date)

- Noted that cursor may become unstable when records are added/modified during harvest

- This is expected Solr cursor behaviour, now properly documented

**Verification (2025-12-29):**

- Re-verified against official Trove API v3 technical guide
- Tested via MCP: sortby=dateasc returns oldest first (1830, 1830, 1831 dates)
- Tested via MCP: bulkHarvest=true returns by ID (different order, stable cursor)
- Cursor formats differ: sortby uses `AoIIPA...`, bulkHarvest uses `*,AoIIPL...`
- Documentation in trove-api.md lines 401-407 is accurate
<!-- SECTION:NOTES:END -->
