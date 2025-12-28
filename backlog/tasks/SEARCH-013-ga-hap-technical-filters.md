# SEARCH-013: GA HAP Technical Filters

**Priority:** P2
**Phase:** 2 - Federated & Filter Expansion
**Status:** ✅ Done
**Estimated Effort:** 1 day
**Completed:** 2025-12-28
**Dependencies:** None

---

## Overview

Add technical/specialized filters to GA HAP (Geoscience Australia Historical Aerial Photography) for professional/research users.

**Current Parameters (6):**
- `state` - Australian state
- `yearFrom` / `yearTo` - Year range
- `scannedOnly` - Scanned photos only
- `bbox` - Bounding box
- `filmNumber` - Film identifier

**Implemented Parameters (10):**
- All current parameters, plus:
- `filmType` - Film type (bw, colour, bw-infrared, colour-infrared, infrared)
- `camera` - Camera model (partial match)
- `scaleMin` - Minimum scale denominator
- `scaleMax` - Maximum scale denominator

---

## Completion Notes

### API Research Findings
- Queried ArcGIS feature layer for field metadata
- **FILM_TYPE** is a coded value domain:
  - "0" = Unknown
  - "1" = Black/White (~967,000 records)
  - "2" = Colour (~127,000 records)
  - "3" = Black/White Infrared (~26,000 records)
  - "4" = Colour Infrared (rare)
  - "5" = Infrared (rare)
  - "6" = Other
- **AVE_SCALE** is an integer (scale denominator)
- **CAMERA** is free-text string (e.g., "Wild RC9", "Williamson F24")
- **AVE_HEIGHT** and **FOCAL_LENG** are strings with units ("12000 ft", "5 in") - not ideal for filtering

### Implementation Details
- Updated `src/sources/ga-hap/types.ts` with film type codes mapping and new params
- Updated `src/sources/ga-hap/client.ts` buildWhereClause() for new filters
- Updated `src/sources/ga-hap/tools/search.ts` with schema and facets
- Updated `docs/quickrefs/ga-hap-api.md` with filter reference tables

### Key Decisions
- Film type uses user-friendly values (bw, colour) mapped to API codes
- Response shows human-readable film type names ("Black/White" not "1")
- Camera filter uses LIKE for partial matching
- Height/focal length filters not implemented (strings with units)
- Added camera facet for faceted search

---

## Files Modified

| File | Change |
|------|--------|
| `src/sources/ga-hap/types.ts` | Added FILM_TYPE_CODES, FILM_TYPE_NAMES, GAHAPFilmType |
| `src/sources/ga-hap/client.ts` | Extended buildWhereClause(), film type translation in parsePhoto() |
| `src/sources/ga-hap/tools/search.ts` | Added filmType, camera, scaleMin, scaleMax to schema |
| `docs/quickrefs/ga-hap-api.md` | Added film type mapping, scale reference, camera examples |
| `CLAUDE.md` | Added new GA HAP use cases |

---

## Subtasks

### 1. Research ArcGIS Fields
- [x] Query ArcGIS feature layer for available fields
- [x] Document field names and types:
  - FILM_TYPE (string) - Coded values 0-6
  - CAMERA (string) - Free text camera model
  - AVE_SCALE (number) - Scale denominator
  - AVE_HEIGHT (string) - Height with units
  - FOCAL_LENG (string) - Focal length with units
- [x] Test which fields are filterable via WHERE clause
- [x] Note valid values for enum fields

### 2. Update Types
- [x] Created FILM_TYPE_CODES and FILM_TYPE_NAMES mappings
- [x] Created GAHAPFilmType type with user-friendly values
- [x] Expanded GAHAPSearchParams with filmType, camera, scaleMin, scaleMax

### 3. Update Client WHERE Clause Builder
- [x] Added filmType filter with code mapping
- [x] Added camera filter with LIKE partial matching
- [x] Added scaleMin/scaleMax filters
- [x] Updated parsePhoto to translate film type codes to names

### 4. Update Search Tool
- [x] Added new parameters to tool schema
- [x] Added camera facet for faceted search
- [x] Added camera and height to response

### 5. Testing
- [x] Tested film type filtering (FILM_TYPE='2' for colour)
- [x] Tested scale range filtering (AVE_SCALE>=10000 AND AVE_SCALE<=25000)
- [x] Tested camera partial matching (CAMERA LIKE '%Wild%')
- [x] All API queries returned expected results

### 6. Documentation
- [x] Updated `docs/quickrefs/ga-hap-api.md` with:
  - Film type code mapping table
  - Scale reference table
  - Common camera types
  - Filter examples
- [x] Added new use cases to CLAUDE.md

---

## Example Queries

```
# Find colour aerial photos in Victoria
ga_hap_search: state="VIC", filmType="colour"

# Find detailed (large-scale) photos
ga_hap_search: scaleMin=5000, scaleMax=15000

# Find Wild camera photos from 1960s
ga_hap_search: camera="Wild", yearFrom=1960, yearTo=1969

# Find B&W infrared in NSW
ga_hap_search: state="NSW", filmType="bw-infrared"

# Combined technical query
ga_hap_search: state="VIC", yearFrom=1950, yearTo=1960, filmType="bw", scaleMax=25000
```

---

## Scale Reference

| Scale | Denominator | Use Case |
|-------|-------------|----------|
| 1:5,000 | 5000 | Very detailed urban/site surveys |
| 1:10,000 | 10000 | Detailed urban mapping |
| 1:25,000 | 25000 | Topographic mapping |
| 1:50,000 | 50000 | Regional mapping |
| 1:80,000 | 80000 | Wide-area coverage |
| 1:100,000 | 100000 | Broad regional surveys |

**Note:** Lower denominator = more detail (larger scale). Higher denominator = less detail (smaller scale).

---

## Film Type Reference

| Code | Type | Tool Value | Record Count |
|------|------|------------|--------------|
| 0 | Unknown | `unknown` | varies |
| 1 | Black/White | `bw` | ~967,000 |
| 2 | Colour | `colour` | ~127,000 |
| 3 | Black/White Infrared | `bw-infrared` | ~26,000 |
| 4 | Colour Infrared | `colour-infrared` | rare |
| 5 | Infrared | `infrared` | rare |
| 6 | Other | `other` | varies |

---

## Common Camera Types

| Camera | Description |
|--------|-------------|
| Wild RC9 | Swiss precision mapping camera |
| Williamson F24 | British reconnaissance camera |
| Zeiss RMK | German aerial survey camera |
| Fairchild | American aerial camera |

---

## Acceptance Criteria

- [x] Film type filtering works (bw, colour, infrared variants)
- [x] Scale range filtering works
- [x] Camera partial matching works
- [x] WHERE clause syntax is valid ArcGIS SQL
- [x] Documentation includes technical filter examples
- [x] No breaking changes to existing search

---

## Notes

- ArcGIS REST API uses SQL-like WHERE clause
- Film type uses coded values (0-6) - mapped to user-friendly names
- Scale filtering works on integer AVE_SCALE field
- Height and focal length are strings with units - not implemented as filters
- Camera types vary - partial LIKE matching works well
- Response now shows human-readable film type names
