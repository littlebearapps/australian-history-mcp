# API-009: AusStage Integration

**Priority:** Medium
**Phase:** 3 (Needs Investigation)
**Status:** Not Started
**Estimated Tools:** 4

---

## Overview

Investigate and potentially integrate the AusStage API to provide access to Australia's comprehensive live performance database.

**URL:** https://www.ausstage.edu.au
**Auth Required:** Unknown - needs investigation
**Content:** 250,000+ records of live performances from 1789-present

---

## Documentation & Resources

| Resource | URL |
|----------|-----|
| Website | https://www.ausstage.edu.au |
| Search Interface | https://www.ausstage.edu.au/pages/browse/ |
| About AusStage | https://www.ausstage.edu.au/pages/about/ |
| API Documentation | https://www.ausstage.edu.au/pages/learn/about/api/ (if exists) |
| Flinders University | https://www.flinders.edu.au (host institution) |
| GLAM Workbench | https://glam-workbench.net/ausstage/ (check if exists) |

---

## Content Available

- Theatre productions
- Dance performances
- Music events
- Opera and musical theatre
- Circus and physical theatre
- Venues
- Contributors (performers, directors, designers)
- Organisations

---

## Subtasks

### 1. Research & Investigation
- [ ] Explore AusStage website at https://www.ausstage.edu.au
- [ ] **Investigate: Search API** - Check network requests for underlying API
- [ ] **Investigate: Event detail endpoint** - Document event retrieval
- [ ] **Investigate: Contributor endpoint** - Document performer/director access
- [ ] **Investigate: Venue endpoint** - Document venue data access
- [ ] **Investigate: Organisation endpoint** - Document organisation data
- [ ] **Investigate: Date range queries** - Test historical filtering
- [ ] Check for developer/researcher access
- [ ] Look for academic API access (university project)
- [ ] Check if data exports available
- [ ] Document authentication requirements
- [ ] Create `docs/quickrefs/ausstage-api.md` reference document

### 2. Evaluate Access Options
- [ ] Public API (if exists)
- [ ] Academic/research access
- [ ] Data exports
- [ ] Make go/no-go decision

### 3. Create Source Module (if viable)
- [ ] Create `src/sources/ausstage/` directory
- [ ] Create types, client, and index files
- [ ] Handle auth if required

### 4. Implement Core Tools (if viable)
- [ ] **ausstage_events** - Search performances and events
- [ ] **ausstage_contributors** - Search performers, directors, etc.
- [ ] **ausstage_venues** - Search venues
- [ ] **ausstage_harvest** - Bulk download records

### 5. Testing
- [ ] Test each tool manually
- [ ] Test date range searches
- [ ] Test venue/location searches
- [ ] Verify data quality

### 6. Integration
- [ ] Register tools in `src/index.ts`
- [ ] Update documentation
- [ ] Build and verify

---

## Investigation Questions

1. Does AusStage have a public API?
2. Is this restricted to academic/research use?
3. What registration or authentication is required?
4. Are there bulk data exports available?
5. What are the usage terms?

---

## Example Queries (Tentative)

```
# Search for performances of a play
ausstage_events: query="Waiting for Godot", type="theatre"

# Find performances at a venue
ausstage_events: venue="Her Majesty's Theatre"

# Search for a performer
ausstage_contributors: name="Cate Blanchett"
```

---

## Notes

- Unique performing arts history database
- Academic project (Flinders University) - may have access restrictions
- Coverage from 1789 onwards
- May require academic/researcher registration
