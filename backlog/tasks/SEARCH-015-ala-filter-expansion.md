# SEARCH-015: ALA Filter Expansion

**Priority:** P2
**Phase:** 2 - Federated & Filter Expansion
**Status:** ✅ Done
**Estimated Effort:** 0.5 days
**Completed:** 2025-12-28
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

**Implemented Parameters (16):**
- All current parameters, plus:
- `basisOfRecord` - Record type (PRESERVED_SPECIMEN, HUMAN_OBSERVATION, etc.)
- `coordinateUncertaintyMax` - Maximum coordinate uncertainty in metres
- `occurrenceStatus` - Occurrence status (present, absent)
- `dataResourceName` - Contributing dataset name
- `collector` - Collector/observer name

---

## Completion Notes

### Implementation Details
- Updated `src/sources/ala/tools/search-occurrences.ts` with new parameters
- Added ALA_BASIS_OF_RECORD enum with 5 values
- Updated execute function to pass new params to client
- Updated `src/core/source-router.ts` for federated search mapping
- Updated `docs/quickrefs/ala-api.md` with historical research examples

### Historical Specimen Use Case
- `basisOfRecord: "PRESERVED_SPECIMEN"` is key for historical research
- Museum specimens often have collection dates from 1800s-1900s
- Combined with `startYear`/`endYear` filters for historical queries

---

## Files Modified

| File | Change |
|------|--------|
| `src/sources/ala/tools/search-occurrences.ts` | Added 5 new parameters to schema and execute |
| `src/core/source-router.ts` | Added basisOfRecord and collector passthrough |
| `docs/quickrefs/ala-api.md` | Added historical research examples |

---

## Subtasks

### 1. Research ALA Biocache Filters
- [x] Review biocache-ws documentation for filter parameters
- [x] Test basisOfRecord filtering:
  - `PRESERVED_SPECIMEN` - Works
  - `HUMAN_OBSERVATION` - Works
  - `MACHINE_OBSERVATION` - Works
  - `FOSSIL_SPECIMEN` - Works
  - `LIVING_SPECIMEN` - Works
- [x] Test coordinateUncertaintyInMeters filtering - Works
- [x] Test occurrenceStatus filtering - Works
- [x] Test dataResourceName filtering - Works
- [x] Test collector filtering - Works

### 2. Update Types
- [x] Added ALA_BASIS_OF_RECORD enum
- [x] Updated input type with new parameters

### 3. Update Search Tool
- [x] Added basisOfRecord with enum validation
- [x] Added coordinateUncertaintyMax parameter
- [x] Added occurrenceStatus parameter
- [x] Added dataResourceName parameter
- [x] Added collector parameter
- [x] Added parameter descriptions

### 4. Update Federated Search Mapping
- [x] Added basisOfRecord passthrough
- [x] Added collector passthrough

### 5. Testing
- [x] Tested basisOfRecord filtering
- [x] Tested filter combinations
- [x] Verified results match filter criteria
- [x] Build succeeded

### 6. Documentation
- [x] Updated `docs/quickrefs/ala-api.md` with new filters
- [x] Added historical specimen search examples
- [x] Documented basisOfRecord values and meanings

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

- [x] basisOfRecord filtering works
- [x] Coordinate uncertainty filtering works
- [x] At least 3 additional filters added (5 added: basisOfRecord, coordinateUncertaintyMax, occurrenceStatus, dataResourceName, collector)
- [x] Historical specimen search documented
- [x] Federated search mapping updated
- [x] Documentation updated

---

## Notes

- basisOfRecord is key for historical research
- Museum specimens often have 19th-century collection dates
- Coordinate uncertainty helps with precise location research
- ALA aggregates from many sources - dataResourceName helps filter
- Collector name uses biocache FQ (filter query) syntax
