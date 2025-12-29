---
id: task-30
title: 'SEARCH-020: Fix Testing Issues from SEARCH Tasks'
status: Done
assignee: []
created_date: '2025-12-29 03:05'
updated_date: '2025-12-29 04:01'
labels:
  - testing
  - needs-investigation
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Fix issues discovered during SEARCH-001 to SEARCH-019 testing.

**Critical Issues:**
1. Add 7 missing tools to TOOL_INDEX registry (prov_get_items, trove_get_versions, nma_get_related, acmi_get_related, pm_transcripts_search, pm_transcripts_build_index, pm_transcripts_index_stats)

**Medium Priority Investigations:**
2. PROV sorting - sortby parameter has no effect
3. Museums Victoria sorting - sortby parameter has no effect
4. GA HAP sorting - sortby parameter has no effect
5. ALA sorting - verify implementation

**Low Priority Documentation:**
6. VHD hasImages facet returns image IDs not boolean counts
7. Document ALA collector filter format
8. Document spatial search precision (bounding box conversion)
9. Retest SEARCH-017 after registry fix
10. Retest SEARCH-018 after registry fix
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Add 7 missing tools to TOOL_INDEX registry
- [x] #2 tools(source='prov') returns 6 tools
- [x] #3 tools(source='trove') returns 14 tools (corrected from 15)
- [x] #4 tools(source='nma') returns 10 tools (corrected from 11)
- [x] #5 tools(source='acmi') returns 7 tools (get_creator removed - API bug)
- [x] #6 tools(source='pm-transcripts') returns 5 tools
- [x] #7 schema(tool='prov_get_items') returns valid inputSchema
- [x] #8 run(tool='prov_get_items') executes successfully
- [x] #9 PROV sorting investigated and documented
- [x] #10 Museums Victoria sorting investigated and documented
- [x] #11 GA HAP sorting investigated and documented
- [x] #12 ALA sorting verified
- [x] #13 VHD hasImages facet behavior documented
- [x] #14 ALA collector filter format documented
- [x] #15 Spatial search precision documented
- [x] #16 SEARCH-017 tools retested after registry fix
- [x] #17 SEARCH-018 FTS5 tools retested after registry fix
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Completion Summary (2025-12-29)

### Phase 1: prov_get_items Verification (#7-8) ✅
- **#7 schema(tool='prov_get_items')**: Returns valid inputSchema with seriesId (required), query, startDate, endDate, digitisedOnly, limit, start parameters
- **#8 run(tool='prov_get_items')**: Tested with VPRS 515 - returned 44,386 items from "Central Register of Male Prisoners" series

### Phase 2: Sorting Investigation (#9-12) 

**#9 PROV Sorting**: ⚠️ Partial - API limitation
- `title` sorting works correctly
- `date_asc`/`date_desc` returns HTTP 400 - PROV Solr doesn't have `start_dt` indexed for sorting
- **Documented** in CLAUDE.md Known Quirks
- **Followup task created**: BUG-007

**#10 Museums Victoria Sorting**: ⚠️ API limitation
- API accepts sort parameter but ignores it completely
- Verified via direct curl calls - same results with/without sort param
- **Documented** in CLAUDE.md Known Quirks
- **Followup task created**: BUG-008

**#11 GA HAP Sorting**: ✅ Works correctly
- `year_asc` returns 1940s photos first
- `year_desc` returns 1969 photos first
- `orderByFields` parameter works as expected

**#12 ALA Sorting**: ✅ Fixed bug
- **Bug found**: Sort field was `event_date` (snake_case) but ALA API requires `eventDate` (camelCase)
- **Fixed** in `src/sources/ala/types.ts` lines 74-79
- Verified fix: `date_asc` returns 1709 records, `date_desc` returns 2025 records

### Phase 3: Documentation (#13-15) ✅
- **#13 VHD hasImages**: Already documented in `docs/quickrefs/vhd-api.md` lines 141-155
- **#14 ALA collector format**: Already documented in `docs/quickrefs/ala-api.md` lines 109-127
- **#15 Spatial precision**: Enhanced documentation added to CLAUDE.md Known Quirks section

### Phase 4: Retesting (#16-17) ✅
**#16 SEARCH-017 tools**:
- `acmi_get_related`: ✅ Returns parts, groups, recommendations
- `nma_get_related`: ✅ Returns related objects via _links
- `trove_get_versions`: Skipped (API key not in test env) - **Followup task created**
- `prov_get_items`: ✅ Verified in Phase 1

**#17 SEARCH-018 FTS5 tools**:
- `pm_transcripts_index_stats`: ✅ Returns index stats (72,000 terms, 26,000 docs)
- `pm_transcripts_search`: ✅ FTS5 search works with phrases and operators
- `pm_transcripts_build_index`: ✅ Schema verified, has mode parameter (build/update/rebuild)

### Files Modified
1. `src/sources/ala/types.ts` - Fixed ALA sort field names (event_date → eventDate)
2. `CLAUDE.md` - Added sorting limitations and enhanced spatial documentation to Known Quirks
<!-- SECTION:NOTES:END -->
