# TEST-001: Comprehensive MCP Testing - Australian History MCP v0.7.0

**Priority:** Critical
**Phase:** Post-Release Testing
**Status:** Not Started
**Estimated Duration:** 4-6 hours
**Total Subtasks:** 90

---

## Overview

Comprehensive testing of all 75 tools (69 data tools + 6 meta-tools) via proper MCP protocol (not curl/JSON-RPC). Tests must document all errors, bugs, blockers, and unexpected behaviour.

**Version Under Test:** 0.7.0
**Key Updates:** Federated search meta-tool, dynamic tool loading
**Testing Method:** Direct MCP tool invocation via Claude Code

---

## Testing Requirements

- Use proper MCP protocol (not curl/JSON-RPC directly)
- Document all errors with:
  - Tool name
  - Input parameters
  - Error message
  - Expected vs actual behaviour
  - Severity (blocker/major/minor)
- Log timing for performance baseline
- Verify response format matches documentation

---

## Phase 1: Meta-Tools Testing (6 tools)

### 1.1 tools Meta-Tool
- [ ] Test `tools()` - list all 69 data tools
- [ ] Test `tools(query="newspaper")` - keyword search
- [ ] Test `tools(source="prov")` - filter by source
- [ ] Test `tools(category="harvest")` - filter by category
- [ ] Test `tools(source="trove", category="get")` - combined filters
- [ ] Test `tools(query="nonexistent")` - empty results handling

### 1.2 schema Meta-Tool
- [ ] Test `schema(tool="prov_search")` - valid tool
- [ ] Test `schema(tool="trove_search")` - complex schema
- [ ] Test `schema(tool="invalid_tool")` - error handling
- [ ] Verify caching hint returned

### 1.3 run Meta-Tool
- [ ] Test `run(tool="prov_search", args={query:"railway"})` - basic execution
- [ ] Test `run(tool="invalid", args={})` - unknown tool error
- [ ] Test `run(tool="trove_search", args={})` - missing required params
- [ ] Test `run(tool="prov_search", args={limit:5})` - optional params

### 1.4 search Meta-Tool (NEW - Federated Search)
- [ ] Test `search(query="Melbourne 1920s")` - auto-select sources
- [ ] Test `search(query="heritage building")` - keyword routing to VHD
- [ ] Test `search(query="newspaper article")` - keyword routing to Trove
- [ ] Test `search(query="species wildlife")` - keyword routing to ALA
- [ ] Test `search(query="test", sources=["prov","nma"])` - explicit sources
- [ ] Test `search(query="test", type="image")` - content type filter
- [ ] Test `search(query="flood", dateFrom="1900", dateTo="1950")` - date filter
- [ ] Test `search(query="test", state="vic")` - state filter
- [ ] Test `search(query="")` - empty query validation
- [ ] Test Trove skip when TROVE_API_KEY missing
- [ ] Verify parallel execution timing
- [ ] Verify error aggregation from partial failures

### 1.5 open Meta-Tool
- [ ] Test `open(url="https://prov.vic.gov.au")` - valid URL
- [ ] Test `open(url="invalid")` - invalid URL handling

### 1.6 export Meta-Tool
- [ ] Test `export(records=[...], format="csv")` - CSV export
- [ ] Test `export(records=[...], format="json")` - JSON export
- [ ] Test `export(records=[...], format="markdown")` - Markdown export
- [ ] Test `export(records=[...], format="download-script")` - script generation
- [ ] Test with path parameter for file save

---

## Phase 2: PROV Tools (5 tools)

- [ ] Test `prov_search(query="railway", limit=5)` - basic search
- [ ] Test `prov_search(query="council", digitisedOnly=true)` - digitised filter
- [ ] Test `prov_search(query="immigration", category="photograph")` - category filter
- [ ] Test `prov_get_images(manifestUrl="...")` - IIIF extraction
- [ ] Test `prov_harvest(query="railway", maxRecords=10)` - pagination
- [ ] Test `prov_get_agency(vaNumber=123)` - agency lookup
- [ ] Test `prov_get_series(vprsNumber=3183)` - series lookup

---

## Phase 3: Trove Tools (13 tools) - REQUIRES API KEY

### 3.1 Search & Harvest
- [ ] Test `trove_search(query="Melbourne", category="newspaper")` - newspaper search
- [ ] Test `trove_search(query="gold", dateFrom="1850", dateTo="1860")` - date filter
- [ ] Test `trove_search(query="test", state="vic")` - state filter
- [ ] Test `trove_search(query="test", sortby="dateasc")` - sort oldest first
- [ ] Test `trove_search(query="test", sortby="datedesc")` - sort newest first
- [ ] Test `trove_search(query="test", nuc="VSL")` - NUC filter (State Library Victoria)
- [ ] Test `trove_harvest(query="flood", maxRecords=20)` - pagination

### 3.2 Get Operations
- [ ] Test `trove_newspaper_article(articleId=...)` - full text retrieval
- [ ] Test `trove_get_work(workId=...)` - work details
- [ ] Test `trove_get_work(workId=..., include=["holdings","links"])` - with includes
- [ ] Test `trove_get_person(personId=...)` - biographical data
- [ ] Test `trove_get_list(listId=...)` - curated list

### 3.3 List Operations
- [ ] Test `trove_list_titles(state="vic")` - newspaper titles
- [ ] Test `trove_title_details(titleId=...)` - title info
- [ ] Test `trove_list_contributors()` - all contributors
- [ ] Test `trove_list_contributors(query="university")` - filter contributors
- [ ] Test `trove_get_contributor(nuc="VSL")` - contributor details
- [ ] Test `trove_list_magazine_titles()` - magazine listing
- [ ] Test `trove_get_magazine_title(titleId=...)` - magazine details

### 3.4 People Search
- [ ] Test `trove_search_people(query="Henry Lawson")` - people search

---

## Phase 4: GHAP Tools (5 tools)

- [ ] Test `ghap_search(query="Melbourne")` - basic search
- [ ] Test `ghap_search(query="creek", state="VIC")` - state filter
- [ ] Test `ghap_search(query="station", lga="Yarra")` - LGA filter
- [ ] Test `ghap_search(query="test", fuzzy=true)` - fuzzy matching
- [ ] Test `ghap_get_place(id="...")` - place details
- [ ] Test `ghap_list_layers()` - list community layers
- [ ] Test `ghap_get_layer(layerId="...")` - layer data
- [ ] Test `ghap_harvest(query="gold", maxRecords=20)` - pagination

---

## Phase 5: Museums Victoria Tools (6 tools)

- [ ] Test `museumsvic_search(query="gold rush")` - basic search
- [ ] Test `museumsvic_search(recordType="species")` - type filter
- [ ] Test `museumsvic_search(query="test", random=true)` - random sort
- [ ] Test `museumsvic_get_article(id="articles/...")` - article retrieval
- [ ] Test `museumsvic_get_item(id="items/...")` - item retrieval
- [ ] Test `museumsvic_get_species(id="species/...")` - species info
- [ ] Test `museumsvic_get_specimen(id="specimens/...")` - specimen details
- [ ] Test `museumsvic_harvest(query="insect", maxRecords=20)` - pagination

---

## Phase 6: ALA Tools (8 tools)

- [ ] Test `ala_search_occurrences(scientificName="Phascolarctos cinereus")` - koala search
- [ ] Test `ala_search_occurrences(query="kangaroo", hasImages=true)` - with images
- [ ] Test `ala_search_species(query="eucalyptus")` - species search
- [ ] Test `ala_get_species(guid="...")` - species profile
- [ ] Test `ala_search_images(query="platypus")` - image search
- [ ] Test `ala_match_name(scientificName="Eucalyptus globulus")` - name matching
- [ ] Test `ala_list_species_lists()` - list curated lists
- [ ] Test `ala_get_species_list(druid="...")` - list details
- [ ] Test `ala_harvest(scientificName="...", maxRecords=20)` - pagination

---

## Phase 7: NMA Tools (9 tools)

- [ ] Test `nma_search_objects(query="boomerang")` - object search
- [ ] Test `nma_get_object(id="...")` - object details
- [ ] Test `nma_search_places(query="Sydney")` - place search
- [ ] Test `nma_get_place(id="...")` - place details
- [ ] Test `nma_search_parties(query="artist")` - people/org search
- [ ] Test `nma_get_party(id="...")` - party details
- [ ] Test `nma_search_media(query="photograph")` - media search
- [ ] Test `nma_get_media(id="...")` - media details
- [ ] Test `nma_harvest(query="gold", maxRecords=20)` - pagination

---

## Phase 8: VHD Tools (9 tools)

- [ ] Test `vhd_search_places(query="railway station")` - place search
- [ ] Test `vhd_search_places(query="test", municipality="Melbourne")` - municipality filter
- [ ] Test `vhd_get_place(id=...)` - place details
- [ ] Test `vhd_search_shipwrecks(query="barque")` - shipwreck search
- [ ] Test `vhd_get_shipwreck(id=...)` - shipwreck details
- [ ] Test `vhd_list_municipalities()` - LGA listing
- [ ] Test `vhd_list_architectural_styles()` - styles listing
- [ ] Test `vhd_list_themes()` - themes listing
- [ ] Test `vhd_list_periods()` - periods listing
- [ ] Test `vhd_harvest(query="church", maxRecords=20)` - pagination

---

## Phase 9: ACMI Tools (7 tools)

- [ ] Test `acmi_search_works(query="Mad Max")` - film search
- [ ] Test `acmi_search_works(query="test", type="Film")` - type filter
- [ ] Test `acmi_get_work(id=...)` - work details
- [ ] Test `acmi_list_creators()` - creator listing
- [ ] Test `acmi_get_creator(id=...)` - creator details
- [ ] Test `acmi_list_constellations()` - constellation listing
- [ ] Test `acmi_get_constellation(id=...)` - constellation details
- [ ] Test `acmi_harvest(query="documentary", maxRecords=20)` - pagination

---

## Phase 10: PM Transcripts Tools (2 tools)

- [ ] Test `pm_transcripts_get_transcript(id=12345)` - transcript retrieval
- [ ] Test `pm_transcripts_get_transcript(id=1)` - first transcript
- [ ] Test `pm_transcripts_harvest(startFrom=1, maxRecords=5)` - early transcripts
- [ ] Test `pm_transcripts_harvest(startFrom=5000, maxRecords=5)` - Hawke era
- [ ] Verify PDF URL generation

---

## Phase 11: IIIF Tools (2 tools)

- [ ] Test `iiif_get_manifest(manifestUrl="https://rosetta.slv.vic.gov.au/...")` - SLV manifest
- [ ] Test `iiif_get_manifest` with Presentation API v2 manifest
- [ ] Test `iiif_get_manifest` with Presentation API v3 manifest
- [ ] Test `iiif_get_image_url(imageServiceUrl="...", size="max")` - full size
- [ ] Test `iiif_get_image_url(imageServiceUrl="...", size="!1024,1024")` - constrained
- [ ] Test `iiif_get_image_url(imageServiceUrl="...", format="png")` - format option

---

## Phase 12: GA HAP Tools (3 tools)

- [ ] Test `ga_hap_search(state="VIC", yearFrom=1950, yearTo=1960)` - state/year search
- [ ] Test `ga_hap_search(bbox="144.9,-37.9,145.1,-37.7")` - bounding box
- [ ] Test `ga_hap_search(scannedOnly=true)` - scanned filter
- [ ] Test `ga_hap_get_photo(objectId=...)` - by ID
- [ ] Test `ga_hap_get_photo(filmNumber="...", run="...", frame="...")` - by film/run/frame
- [ ] Test `ga_hap_harvest(state="VIC", maxRecords=20)` - pagination
- [ ] Verify coordinate conversion (Web Mercator to WGS84)
- [ ] Verify URL extraction from HTML anchor tags

---

## Phase 13: Federated Search Scenarios

- [ ] Heritage keywords route to VHD (`"heritage building Victorian"`)
- [ ] Newspaper keywords route to Trove (`"newspaper article gazette"`)
- [ ] Species keywords route to ALA (`"wildlife species fauna"`)
- [ ] Film keywords route to ACMI (`"film movie cinema"`)
- [ ] Archive keywords route to PROV (`"government archives colonial"`)
- [ ] General query routes to PROV + Trove + NMA + Museums Vic
- [ ] Explicit sources override auto-select
- [ ] Content type filter restricts source selection
- [ ] Date range passed correctly to each source
- [ ] State filter mapped correctly per source API
- [ ] Partial failure (one source errors, others succeed)
- [ ] All sources timeout gracefully

---

## Phase 14: Edge Cases & Error Handling

- [ ] Invalid tool name via `run(tool="fake_tool")`
- [ ] Missing required parameters
- [ ] Empty query strings
- [ ] Very long query strings (>500 chars)
- [ ] Special characters in queries
- [ ] Invalid date formats
- [ ] Invalid state codes
- [ ] Non-existent record IDs
- [ ] Malformed URLs for IIIF/PROV manifests
- [ ] API timeout simulation (if possible)
- [ ] Rate limit behaviour documentation

---

## Results Documentation Template

For each issue found, document:

```markdown
### Issue: [Tool Name] - [Brief Description]

**Severity:** blocker | major | minor
**Tool:** tool_name
**Input:** { ... }
**Expected:** Description of expected behaviour
**Actual:** Description of actual behaviour
**Error Message:** (if any)
**Timing:** XXX ms
**Notes:** Additional context
```

---

## Testing Log

| Date | Phase | Tools Tested | Issues Found | Notes |
|------|-------|--------------|--------------|-------|
| | | | | |

---

## Summary Statistics (Fill After Testing)

- **Total Tools Tested:** /75
- **Passed:**
- **Failed:**
- **Blockers:**
- **Major Issues:**
- **Minor Issues:**
- **Average Response Time:**

---

## Notes

- Trove tools require TROVE_API_KEY environment variable
- Some IDs for "get" operations depend on prior search results
- PM Transcripts harvest can be slow due to sequential scanning
- GA HAP RUN/FRAME are strings not integers
- VHD uses HAL+JSON format with `_embedded` structure
