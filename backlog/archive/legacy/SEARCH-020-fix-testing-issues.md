# Backlog Tasks: Fix Testing Issues from SEARCH-001 to SEARCH-019

**Created:** 2025-12-28
**Source:** Test results from `docs/test-results-SEARCH-001-019.md`
**Status:** Ready for implementation

---

## Task 1: Add 7 Missing Tools to TOOL_INDEX Registry

**Priority:** Critical
**Effort:** Small (30 min)
**Tags:** bug, registry, SEARCH-017, SEARCH-018

### Problem

7 tools exist in source code but are not discoverable via the `tools()` meta-tool because `TOOL_INDEX` in `src/core/tool-index.ts` was never updated.

### Missing Tools

| Tool Name | Source | Category | Task |
|-----------|--------|----------|------|
| `prov_get_items` | prov | get | SEARCH-017 |
| `trove_get_versions` | trove | get | SEARCH-017 |
| `nma_get_related` | nma | get | SEARCH-017 |
| `acmi_get_related` | acmi | get | SEARCH-017 |
| `pm_transcripts_search` | pm-transcripts | search | SEARCH-018 |
| `pm_transcripts_build_index` | pm-transcripts | search | SEARCH-018 |
| `pm_transcripts_index_stats` | pm-transcripts | search | SEARCH-018 |

### Root Cause

`src/core/tool-index.ts:1-788` contains static `TOOL_INDEX` array with 69 entries. Source index files correctly import tools but discovery index was never updated.

### Files to Modify

1. `src/core/tool-index.ts` - Add 7 new entries to TOOL_INDEX array

### Implementation Steps

1. Open `src/core/tool-index.ts`
2. Locate the `TOOL_INDEX` array (starts around line 15)
3. Add entry for `prov_get_items`:
   ```typescript
   {
     name: 'prov_get_items',
     source: 'prov',
     category: 'get',
     description: 'Get items within a PROV series by VPRS number',
     keywords: ['prov', 'items', 'series', 'vprs', 'records']
   },
   ```
4. Add entry for `trove_get_versions`:
   ```typescript
   {
     name: 'trove_get_versions',
     source: 'trove',
     category: 'get',
     description: 'Get all versions of a work with holdings information',
     keywords: ['trove', 'versions', 'holdings', 'work', 'editions']
   },
   ```
5. Add entry for `nma_get_related`:
   ```typescript
   {
     name: 'nma_get_related',
     source: 'nma',
     category: 'get',
     description: 'Get related objects, places, and parties from _links',
     keywords: ['nma', 'related', 'links', 'objects', 'places', 'parties']
   },
   ```
6. Add entry for `acmi_get_related`:
   ```typescript
   {
     name: 'acmi_get_related',
     source: 'acmi',
     category: 'get',
     description: 'Get related works including parts, groups, and recommendations',
     keywords: ['acmi', 'related', 'parts', 'groups', 'series', 'episodes']
   },
   ```
7. Add entry for `pm_transcripts_search`:
   ```typescript
   {
     name: 'pm_transcripts_search',
     source: 'pm-transcripts',
     category: 'search',
     description: 'Full-text search PM transcripts using FTS5 index',
     keywords: ['pm', 'transcripts', 'search', 'fts5', 'fulltext', 'speeches']
   },
   ```
8. Add entry for `pm_transcripts_build_index`:
   ```typescript
   {
     name: 'pm_transcripts_build_index',
     source: 'pm-transcripts',
     category: 'search',
     description: 'Build or update the FTS5 full-text search index',
     keywords: ['pm', 'transcripts', 'index', 'build', 'fts5']
   },
   ```
9. Add entry for `pm_transcripts_index_stats`:
   ```typescript
   {
     name: 'pm_transcripts_index_stats',
     source: 'pm-transcripts',
     category: 'search',
     description: 'Get FTS5 index statistics and PM coverage',
     keywords: ['pm', 'transcripts', 'index', 'stats', 'coverage']
   },
   ```
10. Update comment at top of array from "69 tools" to "76 tools"
11. Run `npm run build`
12. Test with `tools(source="prov")`, `tools(source="pm-transcripts")`, etc.

### Acceptance Criteria

- [ ] `tools(source="prov")` returns 6 tools (was 5)
- [ ] `tools(source="trove")` returns 15 tools (was 14)
- [ ] `tools(source="nma")` returns 11 tools (was 10)
- [ ] `tools(source="acmi")` returns 9 tools (was 8)
- [ ] `tools(source="pm-transcripts")` returns 5 tools (was 2)
- [ ] `schema(tool="prov_get_items")` returns valid inputSchema
- [ ] `schema(tool="pm_transcripts_search")` returns valid inputSchema
- [ ] `run(tool="prov_get_items", args={seriesId:"VPRS 515"})` executes successfully
- [ ] `run(tool="pm_transcripts_index_stats", args={})` executes successfully

---

## Task 2: Investigate PROV Sorting Implementation

**Priority:** Medium
**Effort:** Medium (2-4 hours)
**Tags:** bug, sorting, SEARCH-009, prov

### Problem

PROV `sortby` parameter (`date_asc`, `date_desc`) has no effect on result ordering. Same results returned regardless of sort option.

### Evidence

```
# Test 1: date_asc
prov_search(query="railway", sortby="date_asc", limit=3)
→ First result: "Victorian Railways Reso's, Photographic..."

# Test 2: date_desc
prov_search(query="railway", sortby="date_desc", limit=3)
→ First result: "Victorian Railways Reso's, Photographic..." (SAME)
```

### Investigation Steps

1. **Check PROV API documentation**
   - Review https://prov.vic.gov.au/developer for sort parameter support
   - Document supported sort fields and syntax

2. **Check client implementation**
   - Open `src/sources/prov/client.ts`
   - Find where `sortby` parameter is processed
   - Verify it's being passed to the Solr API correctly
   - Check Solr sort syntax (e.g., `sort=date_created asc`)

3. **Test direct API call**
   - Use curl to test PROV Solr API with sort parameter
   - Example: `curl "https://prov.vic.gov.au/api/search?q=railway&sort=date_created+asc"`
   - Compare results with `sort=date_created+desc`

4. **Check available sort fields**
   - PROV uses Solr - check which fields are sortable
   - Common candidates: `date_created`, `date_modified`, `title`

5. **Document findings**
   - If API doesn't support sorting: Update docs to remove sort option
   - If API supports sorting: Fix client implementation

### Files to Investigate

- `src/sources/prov/client.ts` - API client
- `src/sources/prov/tools/search.ts` - Search tool implementation
- `docs/quickrefs/prov-api.md` - API documentation

### Acceptance Criteria

- [ ] Root cause identified and documented
- [ ] If fixable: `prov_search(sortby="date_asc")` returns oldest records first
- [ ] If fixable: `prov_search(sortby="date_desc")` returns newest records first
- [ ] If not fixable: Remove sortby parameter from prov_search tool
- [ ] Documentation updated to reflect actual behavior

---

## Task 3: Investigate Museums Victoria Sorting Implementation

**Priority:** Medium
**Effort:** Medium (2-4 hours)
**Tags:** bug, sorting, SEARCH-009, museumsvic

### Problem

Museums Victoria `sortby` parameter (`date`, `alphabetical`, `random`) has no effect on result ordering. Same item appears first regardless of sort option.

### Evidence

```
# Test 1: sortby="date"
museumsvic_search(query="gold rush", sortby="date", limit=2)
→ First result: "Diary - David Yuile..."

# Test 2: sortby="random"
museumsvic_search(query="gold rush", sortby="random", limit=2)
→ First result: "Diary - David Yuile..." (SAME - should be random!)
```

### Investigation Steps

1. **Check Museums Victoria API documentation**
   - Review https://collections.museumsvictoria.com.au/developers
   - Find sort parameter syntax and supported values

2. **Check client implementation**
   - Open `src/sources/museums-victoria/client.ts`
   - Find where `sortby` is processed
   - Check if parameter name matches API expectation (e.g., `sort` vs `sortby` vs `order`)

3. **Test direct API call**
   - Use curl to test API with sort parameter
   - Example: `curl "https://collections.museumsvictoria.com.au/api/search?query=gold&sort=date"`
   - Test with different sort values

4. **Check API response headers**
   - Some APIs indicate sort in response headers or metadata
   - May help confirm if sort is being applied

5. **Document findings**

### Files to Investigate

- `src/sources/museums-victoria/client.ts` - API client
- `src/sources/museums-victoria/tools/search.ts` - Search tool
- `docs/quickrefs/museums-victoria-api.md` - API documentation

### Acceptance Criteria

- [ ] Root cause identified and documented
- [ ] If fixable: `museumsvic_search(sortby="date")` returns date-sorted results
- [ ] If fixable: `museumsvic_search(sortby="random")` returns different results each call
- [ ] If not fixable: Remove or clarify sortby parameter documentation

---

## Task 4: Investigate GA HAP Sorting Implementation

**Priority:** Medium
**Effort:** Medium (2-4 hours)
**Tags:** bug, sorting, SEARCH-009, ga-hap

### Problem

GA HAP `sortby` parameter (`year_asc`, `year_desc`) has no effect on result ordering. Same results returned regardless of sort option.

### Evidence

```
# Test 1: sortby="year_asc"
ga_hap_search(state="VIC", sortby="year_asc", limit=3)
→ Results: 1948, 1965, 1954 (not ascending)

# Test 2: sortby="year_desc"
ga_hap_search(state="VIC", sortby="year_desc", limit=3)
→ Results: 1948, 1965, 1954 (SAME - should be descending)
```

### Investigation Steps

1. **Check GA HAP ArcGIS API documentation**
   - GA HAP uses ArcGIS REST API
   - Find `orderByFields` parameter syntax
   - Check if `YEAR` field is sortable

2. **Check client implementation**
   - Open `src/sources/ga-hap/client.ts`
   - Find where `sortby` is mapped to ArcGIS `orderByFields`
   - Verify parameter format (e.g., `YEAR ASC` vs `YEAR asc`)

3. **Test direct API call**
   - Use curl to test ArcGIS API with orderByFields
   - Example: `curl "https://services1.arcgis.com/.../query?where=STATE_ID=2&orderByFields=YEAR+ASC"`

4. **Check if field is indexed**
   - Some ArcGIS fields may not support sorting
   - May need to sort client-side as fallback

5. **Document findings**

### Files to Investigate

- `src/sources/ga-hap/client.ts` - API client
- `src/sources/ga-hap/tools/search.ts` - Search tool
- `docs/quickrefs/ga-hap-api.md` - API documentation

### Acceptance Criteria

- [ ] Root cause identified and documented
- [ ] If fixable: `ga_hap_search(sortby="year_asc")` returns oldest photos first
- [ ] If fixable: `ga_hap_search(sortby="year_desc")` returns newest photos first
- [ ] If not fixable: Implement client-side sorting or remove parameter

---

## Task 5: Investigate ALA Sorting Implementation

**Priority:** Low
**Effort:** Small (1-2 hours)
**Tags:** bug, sorting, SEARCH-009, ala

### Problem

ALA sorting was not fully tested during SEARCH-009 testing. Need to verify if `sortby` parameter works correctly.

### Investigation Steps

1. **Test ALA sorting**
   - `ala_search_occurrences(query="koala", sortby="date", limit=5)`
   - Verify results are ordered by date

2. **Check ALA biocache API docs**
   - Find supported sort parameters
   - Check field names (may be `eventDate` not `date`)

3. **Check client implementation**
   - Open `src/sources/ala/client.ts`
   - Verify sortby mapping

4. **Document findings**

### Files to Investigate

- `src/sources/ala/client.ts` - API client
- `src/sources/ala/tools/search-occurrences.ts` - Search tool
- `docs/quickrefs/ala-api.md` - API documentation

### Acceptance Criteria

- [ ] ALA sorting tested and verified
- [ ] If broken: Fix implementation or document limitation
- [ ] If working: Mark as verified in test results

---

## Task 6: Fix VHD hasImages Facet Data Type

**Priority:** Low
**Effort:** Small (1-2 hours)
**Tags:** bug, facets, SEARCH-005, vhd

### Problem

When requesting `hasImages` facet on VHD, the response includes image IDs instead of boolean bucket counts.

### Evidence

**Expected:**
```json
{ "hasImages": { "true": 500, "false": 100 } }
```

**Actual:**
```json
{ "hasImages": { "127820": 1, "127843": 1, "127887": 1, ... } }
```

### Root Cause

VHD API returns image ID facets when `hasImages` field is used. The API doesn't aggregate to boolean counts.

### Solution Options

1. **Option A: Client-side aggregation**
   - Count non-null image IDs as "true"
   - Count nulls as "false"
   - Transform response before returning

2. **Option B: Use different facet field**
   - Check if VHD has a boolean `has_images` field
   - Or use `image_count > 0` as filter

3. **Option C: Document limitation**
   - Update docs to explain hasImages facet behavior
   - Recommend alternative approach

### Investigation Steps

1. Check VHD API response structure for images field
2. Determine if boolean aggregation is possible
3. Implement chosen solution
4. Test with `vhd_search_places(includeFacets=true, facetFields=["hasImages"])`

### Files to Modify

- `src/sources/vhd/client.ts` - Add facet transformation
- `docs/quickrefs/vhd-api.md` - Update documentation

### Acceptance Criteria

- [ ] `hasImages` facet returns boolean counts OR
- [ ] Documentation updated with actual behavior and workaround

---

## Task 7: Document ALA Collector Filter Format

**Priority:** Low
**Effort:** Small (30 min)
**Tags:** documentation, SEARCH-015, ala

### Problem

ALA `collector` filter returned 0 results for "Mueller" even though Mueller specimens exist in ALA. The filter may require exact format.

### Evidence

```
ala_search_occurrences(collector="Mueller", limit=5)
→ 0 results

# But Mueller specimens definitely exist in ALA
```

### Investigation Steps

1. **Check ALA biocache API docs**
   - Find collector field format
   - Check if case-sensitive
   - Check if partial match supported

2. **Test different formats**
   - `collector="Mueller"`
   - `collector="von Mueller"`
   - `collector="Mueller, F."`
   - `collector="Ferdinand von Mueller"`

3. **Check actual collector values in ALA**
   - Search ALA website for Mueller specimens
   - Note exact collector string format used

4. **Update documentation**
   - Add examples of valid collector formats
   - Note any limitations

### Files to Modify

- `docs/quickrefs/ala-api.md` - Add collector format examples
- `CLAUDE.md` - Add to Known Quirks section

### Acceptance Criteria

- [ ] Valid collector format documented with examples
- [ ] At least one working example that returns results
- [ ] Documentation updated

---

## Task 8: Improve Federated Spatial Search Precision Documentation

**Priority:** Low
**Effort:** Small (30 min)
**Tags:** documentation, SEARCH-016, spatial

### Problem

Point+radius spatial queries are converted to bounding boxes internally. Some results may appear slightly outside the specified radius due to box geometry.

### Evidence

When searching with `lat=-37.81, lon=144.96, radiusKm=25`:
- Bounding box is calculated as square containing the circle
- Corner distance from center is ~35km (sqrt(2) * 25)
- Results in corners are outside the 25km radius

### Solution

Document this behavior clearly so users understand:
1. Radius is approximate due to bounding box conversion
2. Results may include records up to ~41% further than specified radius
3. For precise radius filtering, post-process results with Haversine distance

### Files to Modify

- `docs/quickrefs/spatial-queries.md` - Add precision notes
- `CLAUDE.md` - Update Known Quirks section

### Acceptance Criteria

- [ ] Documentation explains bounding box conversion
- [ ] Users understand radius is approximate
- [ ] Workaround documented for precise filtering

---

## Task 9: Retest SEARCH-017 After Registry Fix

**Priority:** High (after Task 1)
**Effort:** Small (1 hour)
**Tags:** testing, SEARCH-017, retest
**Depends On:** Task 1

### Description

After Task 1 is complete, retest all 4 SEARCH-017 related records tools.

### Test Cases

1. **prov_get_items**
   ```
   run(tool="prov_get_items", args={seriesId: "VPRS 515", limit: 5})
   ```
   - Expected: Returns items within the series
   - Verify: Each item has seriesId, itemId, title

2. **trove_get_versions**
   ```
   run(tool="trove_get_versions", args={workId: "5727891"})
   ```
   - Expected: Returns all versions/editions of the work
   - Verify: Each version has format, holdings info

3. **nma_get_related**
   ```
   # First get an object with _links
   run(tool="nma_get_object", args={id: "some-object-id"})
   # Then get related
   run(tool="nma_get_related", args={objectId: "some-object-id"})
   ```
   - Expected: Returns related objects, places, parties
   - Verify: Links resolved correctly

4. **acmi_get_related**
   ```
   # First get a work (e.g., TV series with episodes)
   run(tool="acmi_get_work", args={id: "some-work-id"})
   # Then get related
   run(tool="acmi_get_related", args={workId: "some-work-id"})
   ```
   - Expected: Returns parts (episodes), groups (series)
   - Verify: Relationships correctly identified

### Acceptance Criteria

- [ ] All 4 tools discoverable via `tools()`
- [ ] All 4 tools return valid data
- [ ] Update test results document with PASS status

---

## Task 10: Retest SEARCH-018 After Registry Fix

**Priority:** High (after Task 1)
**Effort:** Medium (2 hours)
**Tags:** testing, SEARCH-018, retest, fts5
**Depends On:** Task 1

### Description

After Task 1 is complete, retest all 3 SEARCH-018 FTS5 tools.

### Test Cases

1. **pm_transcripts_index_stats**
   ```
   run(tool="pm_transcripts_index_stats", args={})
   ```
   - Expected: Returns index status (may be "not built" initially)
   - Verify: Shows PM coverage, document count, index size

2. **pm_transcripts_build_index** (quick test only)
   ```
   run(tool="pm_transcripts_build_index", args={mode: "update", maxRecords: 100})
   ```
   - Expected: Builds/updates index incrementally
   - Note: Full build takes ~43 minutes, use mode="update" for quick test

3. **pm_transcripts_search** (after index exists)
   ```
   run(tool="pm_transcripts_search", args={query: "climate change", limit: 5})
   ```
   - Expected: Returns matching transcripts ranked by relevance
   - Verify: FTS5 operators work ("phrase match", OR, NOT)

### Acceptance Criteria

- [ ] All 3 tools discoverable via `tools()`
- [ ] index_stats returns valid status
- [ ] build_index creates/updates index without error
- [ ] search returns relevant results with FTS5 ranking
- [ ] Update test results document with PASS status

---

## Summary

| Task | Priority | Effort | Status |
|------|----------|--------|--------|
| 1. Add missing tools to registry | Critical | Small | Ready |
| 2. Investigate PROV sorting | Medium | Medium | Ready |
| 3. Investigate Museums Vic sorting | Medium | Medium | Ready |
| 4. Investigate GA HAP sorting | Medium | Medium | Ready |
| 5. Investigate ALA sorting | Low | Small | Ready |
| 6. Fix VHD hasImages facet | Low | Small | Ready |
| 7. Document ALA collector format | Low | Small | Ready |
| 8. Document spatial precision | Low | Small | Ready |
| 9. Retest SEARCH-017 | High | Small | Blocked by Task 1 |
| 10. Retest SEARCH-018 | High | Medium | Blocked by Task 1 |

**Recommended Order:**
1. Task 1 (critical, unblocks Task 9 & 10)
2. Task 9 & 10 (verify fixes work)
3. Tasks 2-5 (sorting investigations - can be parallel)
4. Tasks 6-8 (documentation improvements)
