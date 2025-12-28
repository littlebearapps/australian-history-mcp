# SEARCH-015: ALA Filter Expansion

**Priority:** P2
**Phase:** 2 - Federated & Filter Expansion
**Status:** Not Started
**Estimated Effort:** 0.5 days
**Dependencies:** None

---

## Overview

Expand ALA (Atlas of Living Australia) occurrence search filters for advanced research use cases.

**Current Parameters (11):**
- `query` - Text search
- `scientificName`, `vernacularName` - Species names
- `kingdom`, `family`, `genus` - Taxonomy
- `stateProvince` - State/territory
- `startYear`, `endYear` - Year range
- `hasImages`, `spatiallyValid` - Boolean filters
- `limit` - Max results

**Target Parameters (15+):**
- All current parameters, plus:
- `basisOfRecord` - Record type (specimen, observation, etc.)
- `coordinateUncertainty` - Spatial precision filtering
- `occurrenceStatus` - Present vs possibly extinct
- `dataResourceName` - Contributing dataset
- `collector` - Collector/observer name

---

## Files to Modify

| File | Change |
|------|--------|
| `src/sources/ala/tools/search-occurrences.ts` | Add new parameters |
| `src/sources/ala/client.ts` | Support new biocache params |
| `src/sources/ala/types.ts` | Update input types |
| `docs/quickrefs/ala-api.md` | Document new filters |

---

## Subtasks

### 1. Research ALA Biocache Filters
- [ ] Review biocache-ws documentation for filter parameters
- [ ] Test basisOfRecord filtering:
  - `PRESERVED_SPECIMEN`
  - `HUMAN_OBSERVATION`
  - `MACHINE_OBSERVATION`
  - `FOSSIL_SPECIMEN`
  - `LIVING_SPECIMEN`
- [ ] Test coordinateUncertaintyInMeters filtering
- [ ] Test occurrenceStatus filtering
- [ ] Test dataResourceName filtering
- [ ] Test collector filtering

### 2. Update Types
- [ ] Expand `ALASearchInput`:
  ```typescript
  interface ALASearchInput {
    // Existing params
    query?: string;
    scientificName?: string;
    vernacularName?: string;
    kingdom?: string;
    family?: string;
    genus?: string;
    stateProvince?: string;
    startYear?: number;
    endYear?: number;
    hasImages?: boolean;
    spatiallyValid?: boolean;

    // New filters
    basisOfRecord?: 'PRESERVED_SPECIMEN' | 'HUMAN_OBSERVATION' |
                    'MACHINE_OBSERVATION' | 'FOSSIL_SPECIMEN' | 'LIVING_SPECIMEN';
    coordinateUncertaintyMax?: number;  // Max uncertainty in meters
    occurrenceStatus?: 'present' | 'absent';
    dataResourceName?: string;   // Contributing dataset name
    collector?: string;          // Collector name

    limit?: number;
    offset?: number;
  }
  ```

### 3. Update Client
- [ ] Modify `searchOccurrences()` in `client.ts`
- [ ] Add basisOfRecord to FQ (filter query):
  ```typescript
  if (basisOfRecord) {
    params.append('fq', `basisOfRecord:${basisOfRecord}`);
  }
  ```
- [ ] Add coordinate uncertainty filtering
- [ ] Add occurrence status filtering
- [ ] Add data resource filtering
- [ ] Add collector filtering

### 4. Historical Specimen Use Case
- [ ] Highlight `basisOfRecord: PRESERVED_SPECIMEN` for historical research
- [ ] Specimens often have collection dates from 1800s-1900s
- [ ] Add example for historical specimen search

### 5. Update Search Tool
- [ ] Add new parameters to tool schema
- [ ] Add descriptions with biocache field names
- [ ] Add examples for different use cases

### 6. Testing
- [ ] Test basisOfRecord filtering (specimens vs observations)
- [ ] Test coordinate uncertainty filtering
- [ ] Test filter combinations
- [ ] Verify results match filter criteria
- [ ] Test with federated search

### 7. Documentation
- [ ] Update `docs/quickrefs/ala-api.md` with new filters
- [ ] Add historical specimen search examples
- [ ] Document basisOfRecord values and meanings

---

## Example Queries

```
# Find historical museum specimens only
ala_search_occurrences: scientificName="Thylacinus cynocephalus", basisOfRecord="PRESERVED_SPECIMEN"

# Find precise location records only (< 100m uncertainty)
ala_search_occurrences: genus="Eucalyptus", stateProvince="Victoria", coordinateUncertaintyMax=100

# Find fossil specimens
ala_search_occurrences: basisOfRecord="FOSSIL_SPECIMEN", stateProvince="Victoria"

# Find records from specific dataset
ala_search_occurrences: scientificName="Platypus", dataResourceName="Museums Victoria"

# Find historical collector's specimens
ala_search_occurrences: collector="Mueller", startYear=1850, endYear=1900
```

---

## Basis of Record Reference

| Value | Description | Historical Relevance |
|-------|-------------|---------------------|
| PRESERVED_SPECIMEN | Museum/herbarium specimen | High - often historical |
| HUMAN_OBSERVATION | Direct human observation | Mixed - citizen science |
| MACHINE_OBSERVATION | Camera trap, sensor | Recent only |
| FOSSIL_SPECIMEN | Fossil record | Ancient history |
| LIVING_SPECIMEN | Zoo, garden specimen | Mixed |

---

## Acceptance Criteria

- [ ] basisOfRecord filtering works
- [ ] Coordinate uncertainty filtering works
- [ ] At least 3 additional filters added
- [ ] Historical specimen search documented
- [ ] Documentation updated

---

## Notes

- basisOfRecord is key for historical research
- Museum specimens often have 19th-century collection dates
- Coordinate uncertainty helps with precise location research
- ALA aggregates from many sources - dataResourceName helps filter
- Collector name matching may need partial/fuzzy matching
