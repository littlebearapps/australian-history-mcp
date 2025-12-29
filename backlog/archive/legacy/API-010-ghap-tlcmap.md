# API-010: GHAP/TLCMap Integration

**Priority:** Medium
**Phase:** 3 (Needs Investigation)
**Status:** Not Started
**Estimated Tools:** 3-4

---

## Overview

Investigate and potentially integrate the Gazetteer of Historical Australian Placenames (GHAP) via TLCMap to provide access to historical and Indigenous place names.

**URL:** https://tlcmap.org
**Auth Required:** Unknown - needs investigation
**Content:** Historical placenames including Indigenous names

---

## Documentation & Resources

| Resource | URL |
|----------|-----|
| TLCMap Website | https://tlcmap.org |
| GHAP (Gazetteer) | https://ghap.tlcmap.org |
| TLCMap Documentation | https://tlcmap.org/guides/ |
| API Documentation | https://tlcmap.org/api/ (check if exists) |
| University of Newcastle | https://www.newcastle.edu.au (host institution) |
| Time Layered Cultural Map | https://tlcmap.org/about/ |

---

## Content Available

- Historical Australian place names
- Indigenous/First Nations place names
- Temporal geospatial data (places over time)
- Links to historical records by location
- Mapping and visualisation data

---

## Subtasks

### 1. Research & Investigation
- [ ] Explore TLCMap website at https://tlcmap.org
- [ ] Explore GHAP at https://ghap.tlcmap.org
- [ ] **Investigate: GHAP search API** - Check for placename search endpoint
- [ ] **Investigate: Place detail endpoint** - Document place record retrieval
- [ ] **Investigate: Spatial queries** - Check coordinate-based search
- [ ] **Investigate: Temporal queries** - Check historical period filtering
- [ ] **Investigate: Indigenous names dataset** - Check First Nations data access
- [ ] **Investigate: GeoJSON export** - Check spatial data formats
- [ ] Check authentication requirements
- [ ] Look for GeoJSON/spatial data formats
- [ ] Document findings and feasibility
- [ ] Create `docs/quickrefs/ghap-api.md` reference document

### 2. Evaluate Access Options
- [ ] Public API (if exists)
- [ ] Academic access requirements
- [ ] Data exports/downloads
- [ ] Make go/no-go decision

### 3. Create Source Module (if viable)
- [ ] Create `src/sources/ghap/` directory
- [ ] Create types, client, and index files
- [ ] Handle geospatial data formats

### 4. Implement Core Tools (if viable)
- [ ] **ghap_search** - Search historical place names
- [ ] **ghap_indigenous_names** - Search First Nations place names
- [ ] **ghap_by_location** - Find places near coordinates
- [ ] **ghap_harvest** - Bulk download place records

### 5. Testing
- [ ] Test each tool manually
- [ ] Test location-based searches
- [ ] Test historical period filtering
- [ ] Verify geospatial data handling

### 6. Integration
- [ ] Register tools in `src/index.ts`
- [ ] Update documentation
- [ ] Build and verify

---

## Investigation Questions

1. What API endpoints does TLCMap/GHAP provide?
2. Is authentication required?
3. What data formats are returned (GeoJSON, etc.)?
4. Is this suitable for personal/research use?
5. How comprehensive is the placename coverage?

---

## Example Queries (Tentative)

```
# Search for historical name of a place
ghap_search: current_name="Melbourne"

# Find Indigenous names in a region
ghap_indigenous_names: state="Victoria"

# Find historical places near coordinates
ghap_by_location: lat=-37.8136, lon=144.9631, radius=50
```

---

## Notes

- Unique geospatial historical resource
- May include culturally sensitive Indigenous data
- Part of larger TLCMap infrastructure
- Could enable location-based queries across other sources
