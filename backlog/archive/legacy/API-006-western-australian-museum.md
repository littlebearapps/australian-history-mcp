# API-006: Western Australian Museum Integration

**Priority:** Medium
**Phase:** 3 (Needs Investigation)
**Status:** Not Started
**Estimated Tools:** 4

---

## Overview

Integrate the Western Australian Museum API via data.wa.gov.au to provide access to WA's museum collections, including significant shipwreck data.

**Primary URL:** data.wa.gov.au (CKAN-based)
**Auth Required:** None (via data.wa.gov.au)
**Content:** 4.5M+ historical objects, 200 shipwreck sites

---

## Documentation & Resources

| Resource | URL |
|----------|-----|
| WA Museum Website | https://museum.wa.gov.au |
| WA Museum Collections | https://museum.wa.gov.au/explore/collections |
| data.wa.gov.au Portal | https://data.wa.gov.au |
| WA Museum on data.wa | https://data.wa.gov.au/organization/western-australian-museum |
| Maritime Archaeology | https://museum.wa.gov.au/explore/maritime-archaeology-db |
| Shipwrecks Database | https://museum.wa.gov.au/maritime-archaeology-db/shipwrecks |

---

## Content Available

- Maritime archaeology and shipwrecks
- Natural history collections
- Indigenous cultures collection
- Social history objects
- WA state history

---

## Subtasks

### 1. Research & Investigation
- [ ] Explore WA Museum website at https://museum.wa.gov.au
- [ ] Search data.wa.gov.au for WA Museum datasets
- [ ] **Investigate: data.wa.gov.au museum datasets** - List available datasets
- [ ] **Investigate: Maritime archaeology database** - Check if API exists at https://museum.wa.gov.au/maritime-archaeology-db
- [ ] **Investigate: Shipwrecks endpoint** - Document shipwreck data access
- [ ] **Investigate: Collections search** - Check underlying API
- [ ] **Investigate: CKAN API** - Test data.wa.gov.au CKAN endpoints
- [ ] Identify if direct API exists at museum website
- [ ] Document available datasets and their formats
- [ ] Assess data quality and completeness
- [ ] Determine best access method (CKAN API vs direct)
- [ ] Create `docs/quickrefs/wa-museum-api.md` reference document

### 2. Evaluate Integration Approach
- [ ] Compare with existing data.gov.au integration
- [ ] Decide: Extend datagovau source vs new source
- [ ] Document decision and rationale

### 3. Create Source Module (if needed)
- [ ] Create `src/sources/wa-museum/` directory (if separate)
- [ ] Create types, client, and index files
- [ ] Handle CKAN API format

### 4. Implement Core Tools
- [ ] **wa_museum_search** - Search WA Museum collections
- [ ] **wa_museum_shipwrecks** - Search maritime archaeology
- [ ] **wa_museum_get_object** - Get object details
- [ ] **wa_museum_harvest** - Bulk download records

### 5. Testing
- [ ] Test each tool manually via MCP protocol
- [ ] Test shipwreck-specific searches
- [ ] Verify data quality and formatting
- [ ] Document example queries in quickref

### 6. Integration
- [ ] Register tools in `src/index.ts`
- [ ] Update documentation
- [ ] Build and verify

---

## Investigation Questions

1. Does WA Museum have a direct API, or only via data.wa.gov.au?
2. What datasets are available and how complete are they?
3. Are shipwreck records accessible via API?
4. Should this be a separate source or extension of data.gov.au?

---

## Example Queries (Tentative)

```
# Search WA Museum shipwrecks
wa_museum_shipwrecks: query="Batavia"

# Search natural history
wa_museum_search: collection="natural history"
```

---

## Notes

- Significant shipwreck collection (complements VHD)
- May use same CKAN API as data.gov.au
- Requires investigation before implementation
- Consider WA-specific features (remote region coverage)
