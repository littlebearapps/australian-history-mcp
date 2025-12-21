# API-007: Australian War Memorial (AWM) Integration

**Priority:** Medium
**Phase:** 3 (Needs Investigation)
**Status:** Not Started
**Estimated Tools:** 4-5

---

## Overview

Investigate and potentially integrate the Australian War Memorial collection API to provide access to Australia's premier military history collection.

**URL:** https://www.awm.gov.au
**Auth Required:** Unknown - needs investigation
**Content:** Extensive WWI/WWII records, photographs, unit diaries, Roll of Honour

---

## Documentation & Resources

| Resource | URL |
|----------|-----|
| Website | https://www.awm.gov.au |
| Collection Search | https://www.awm.gov.au/collection |
| Roll of Honour | https://www.awm.gov.au/commemoration/honour-roll |
| Research Centre | https://www.awm.gov.au/research |
| Unit War Diaries | https://www.awm.gov.au/collection/records/awm4 |
| Photographs | https://www.awm.gov.au/collection/photographs |
| data.gov.au AWM | https://data.gov.au/organization/australian-war-memorial |

---

## Content Available

- Roll of Honour (names of fallen service members)
- Unit war diaries
- Photographs (millions of images)
- Artworks and memorial objects
- Official histories
- Service records (some via NAA)

---

## Subtasks

### 1. Research & Investigation
- [ ] Explore AWM website at https://www.awm.gov.au
- [ ] **Investigate: Collection search API** - Check network requests for underlying API
- [ ] **Investigate: Roll of Honour API** - Test https://www.awm.gov.au/commemoration/honour-roll
- [ ] **Investigate: AWM4 Unit Diaries** - Check digitised diary access
- [ ] **Investigate: Photograph collection** - Check image API access
- [ ] **Investigate: data.gov.au datasets** - Search for AWM datasets
- [ ] **Investigate: Trove integration** - Check if AWM content indexed in Trove
- [ ] Check if collection search has underlying API
- [ ] Look for developer resources or data exports
- [ ] Document findings and feasibility
- [ ] Create `docs/quickrefs/awm-api.md` reference document

### 2. Evaluate Access Options
- [ ] Direct API (if exists)
- [ ] Web scraping (with permission considerations)
- [ ] Trove integration (if records indexed)
- [ ] Data dumps (if available)
- [ ] Make go/no-go decision

### 3. Create Source Module (if viable)
- [ ] Create `src/sources/awm/` directory
- [ ] Create types, client, and index files
- [ ] Handle auth if required

### 4. Implement Core Tools (if viable)
- [ ] **awm_search** - Search AWM collections
- [ ] **awm_roll_of_honour** - Search fallen service members
- [ ] **awm_photographs** - Search photograph collection
- [ ] **awm_unit_diaries** - Search unit war diaries
- [ ] **awm_harvest** - Bulk download records

### 5. Testing
- [ ] Test each tool manually
- [ ] Verify data quality
- [ ] Document limitations

### 6. Integration
- [ ] Register tools in `src/index.ts`
- [ ] Update documentation
- [ ] Build and verify

---

## Investigation Questions

1. Does AWM have a public API for collection access?
2. Is authentication required?
3. Are there rate limits or usage restrictions?
4. Is data available via other channels (Trove, data.gov.au)?
5. Are there legal/ethical considerations for war records?

---

## Example Queries (Tentative)

```
# Search Roll of Honour
awm_roll_of_honour: surname="Smith", war="WWI"

# Find unit diaries
awm_unit_diaries: unit="1st Battalion", year="1916"

# Search photographs
awm_photographs: query="Gallipoli"
```

---

## Notes

- Highly valuable historical resource
- API access unclear - needs investigation
- Some records may overlap with NAA
- Ethical considerations for personal records
- May be blocked if no official API (like NAA was)
