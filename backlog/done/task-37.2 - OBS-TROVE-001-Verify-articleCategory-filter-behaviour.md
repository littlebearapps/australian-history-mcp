---
id: task-37.2
title: OBS-TROVE-001 - Verify articleCategory filter behaviour
status: Done
assignee: []
created_date: '2025-12-29 05:10'
updated_date: '2025-12-29 05:28'
labels:
  - trove
  - observation
  - research
dependencies: []
parent_task_id: task-37
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Severity:** Low

**Observation:** articleCategory filter behaviour unclear from testing

**Issue:**
During testing, `articleCategory` filter returned results but it's unclear if:
1. Filter is working correctly per API docs
2. Results are actually filtered by article category
3. Some categories may not have data

**Investigation Needed:**
- Review Trove API v3 documentation for articleCategory
- Test with known article categories (Article, Advertising, Family Notices)
- Verify results are correctly filtered

**Files:**
- `docs/quickrefs/trove-api.md` - Document findings
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 articleCategory filter behaviour documented
- [x] #2 Test results documented for each category type
- [x] #3 Any issues added as separate bug tasks if found (none needed - behaviour is expected API quirk, not a bug)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
**Investigation (2025-12-29):**

- Tested articleCategory filter with 'Article', 'Advertising', 'Family Notices'

- Filter IS working: Without filter = 23M results, with l-category=Advertising = 8.4M (matches facet count)

- API Quirk discovered: Individual record `category` field may still show 'Article' even when filtered to 'Advertising'

- This is Trove API behaviour - the filter works correctly for limiting results, but returned category field doesn't always reflect classification

- Added documentation to docs/quickrefs/trove-api.md in Article Categories section

- Created new 'Known Quirks' section documenting this and other issues

**Verification (2025-12-29):**

- Re-verified against official Trove API v3 technical guide
- Tested via MCP: Without filter = 34,318,429 results, with articleCategory="Advertising" = 8,768,104 (exact match to facet count)
- Confirmed API quirk: Records show `category: "Article"` even when filtered to "Advertising"
- Documentation in trove-api.md lines 386-388 is accurate
<!-- SECTION:NOTES:END -->
